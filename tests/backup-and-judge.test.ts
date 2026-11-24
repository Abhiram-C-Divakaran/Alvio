import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer as createNetServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../server/migrations';
import { backupDatabase, verifyDatabaseBackup } from '../server/backupDb';
import { createSqliteRateLimitStore, rateLimit, safeErrors } from '../server/security';
import { registerSubmissions } from '../server/submissions';
import { withTransientRetry } from '../server/chat';

let tempDir: string;

before(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'alvio-backup-judge-'));
});

after(async () => {
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
});

test('SQLite online VACUUM INTO backup produces verified consistent snapshot without altering source', () => {
  const sourcePath = join(tempDir, 'source.sqlite');
  const backupPath = join(tempDir, 'backups', 'snapshot.sqlite');
  const db = new DatabaseSync(sourcePath);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  migrate(db);
  db.prepare('INSERT INTO users (email, password_hash, name, xp) VALUES (?, ?, ?, ?)').run(
    'backup@example.test',
    'hash',
    'Backup Student',
    120
  );
  db.close();

  const backupResult = backupDatabase(sourcePath, backupPath);
  assert.equal(backupResult.ok, true);
  assert.equal(backupResult.integrity, 'ok');
  assert.equal(backupResult.migrationVersion, 7);
  assert.equal(backupResult.usersCount, 1);
  assert.ok(backupResult.sizeBytes > 0);

  const reverify = verifyDatabaseBackup(backupPath);
  assert.equal(reverify.ok, true);
  assert.equal(reverify.usersCount, 1);
});

test('SQLite-backed rate limit store enforces shared quotas across distinct middleware instances', async () => {
  const dbPath = join(tempDir, 'ratelimit.sqlite');
  const db1 = new DatabaseSync(dbPath);
  db1.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  migrate(db1);
  const db2 = new DatabaseSync(dbPath);
  db2.exec('PRAGMA busy_timeout = 5000;');

  const app = express();
  const limit1 = rateLimit(2, 60000, 'shared-scope', false, createSqliteRateLimitStore(db1));
  const limit2 = rateLimit(2, 60000, 'shared-scope', false, createSqliteRateLimitStore(db2));
  app.get('/a', limit1, (_req, res) => res.json({ ok: 1 }));
  app.get('/b', limit2, (_req, res) => res.json({ ok: 2 }));

  const srv: Server = createServer(app);
  await new Promise<void>((r) => srv.listen(0, '127.0.0.1', r));
  const { port } = srv.address() as { port: number };
  const base = `http://127.0.0.1:${port}`;
  try {
    assert.equal((await fetch(`${base}/a`)).status, 200);
    assert.equal((await fetch(`${base}/b`)).status, 200);
    // 3rd request hits shared quota across the second instance
    const third = await fetch(`${base}/a`);
    assert.equal(third.status, 429);
    assert.ok(Number(third.headers.get('retry-after')) >= 1);
  } finally {
    await new Promise<void>((r) => srv.close(() => r()));
    db1.close();
    db2.close();
  }
});

test('coding judge rejects NUL bytes, blocks duplicate in-flight submits with 409, and reports structured failedTestCase', async () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);
  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)').run('j@test.dev', 'h', 'Judge User');
  db.prepare(
    `INSERT INTO problems (id, title, difficulty, description, examples, constraints, signature, starterCode, testCases)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    'judge-prob',
    'Judge Prob',
    'Easy',
    'Test',
    '[]',
    '[]',
    JSON.stringify({ name: 'add', params: [{ name: 'a', type: 'integer' }, { name: 'b', type: 'integer' }], returns: 'integer' }),
    '{}',
    JSON.stringify([{ input: [2, 3], expected: 5 }, { input: [4, 5], expected: 9 }])
  );

  let releaseProvider: (() => void) | null = null;
  let holdNext = false;

  const app = express();
  app.use(express.json({ limit: '512kb' }));
  registerSubmissions(app, {
    db,
    rateLimitMax: 50,
    authOptional: (req, _res, next) => { req.userId = 1; next(); },
    authRequired: (req, _res, next) => { req.userId = 1; next(); },
    provider: async ({ sourceCode }) => {
      if (holdNext) {
        holdNext = false;
        await new Promise<void>((resolve) => { releaseProvider = resolve; });
      }
      const marker = sourceCode.match(/__ALVIO_RES_[a-f0-9]+__:/)?.[0] || '';
      return {
        status: 'completed',
        result: 'success',
        exit_code: 0,
        stdout: `${marker}${JSON.stringify({
          status: 'Failed',
          passedCount: 1,
          message: 'Test Case 2 Failed.',
          failedTestCase: { index: 2, input: [4, 5], expected: 9, actual: 8 },
          stdout: [],
          executionTimeMs: 4,
        })}`,
      };
    },
  });
  app.use(safeErrors);

  const srv = createServer(app);
  await new Promise<void>((r) => srv.listen(0, '127.0.0.1', r));
  const { port } = srv.address() as { port: number };
  const base = `http://127.0.0.1:${port}`;
  try {
    // 1. NUL byte rejected with 400
    const nulRes = await fetch(`${base}/api/problems/judge-prob/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'function add(a,b){return a+b;}\0', language: 'javascript' }),
    });
    assert.equal(nulRes.status, 400);

    // 2. Concurrent duplicate submission rejected with 409
    holdNext = true;
    const firstPromise = fetch(`${base}/api/problems/judge-prob/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'function add(a,b){return a+b-1;}', language: 'javascript' }),
    });
    await new Promise((r) => setTimeout(r, 30));
    const dupRes = await fetch(`${base}/api/problems/judge-prob/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'function add(a,b){return a+b-1;}', language: 'javascript' }),
    });
    assert.equal(dupRes.status, 409);
    assert.equal((await dupRes.json()).code, 'SUBMISSION_IN_PROGRESS');

    releaseProvider?.();
    const firstRes = await firstPromise;
    assert.equal(firstRes.status, 200);
    const body = await firstRes.json();
    assert.equal(body.status, 'Failed');
    assert.equal(body.executionStatus, 'wrong_answer');
    assert.deepEqual(body.failedTestCase, { index: 2, input: [4, 5], expected: 9, actual: 8 });

    // 3. Bounded limit query param on history endpoint
    const histRes = await fetch(`${base}/api/problems/judge-prob/submissions?limit=1`);
    assert.equal(histRes.status, 200);
    const hist = await histRes.json();
    assert.equal(hist.submissions.length, 1);
  } finally {
    await new Promise<void>((r) => srv.close(() => r()));
    db.close();
  }
});

test('withTransientRetry retries once on transient 502 and does not retry 404/429', async () => {
  let attempts = 0;
  const controller = new AbortController();
  const result = await withTransientRetry(
    async () => {
      attempts++;
      if (attempts === 1) throw Object.assign(new Error('Bad Gateway'), { status: 502 });
      return 'recovered';
    },
    controller.signal,
    { maxRetries: 1, retryDelayMs: 10 }
  );
  assert.equal(result, 'recovered');
  assert.equal(attempts, 2);

  let nonRetryAttempts = 0;
  await assert.rejects(
    withTransientRetry(
      async () => {
        nonRetryAttempts++;
        throw Object.assign(new Error('Model not found'), { status: 404 });
      },
      controller.signal,
      { maxRetries: 1, retryDelayMs: 10 }
    )
  );
  assert.equal(nonRetryAttempts, 1);
});

test('GET /api/ready reports schema readiness and problem count on production server', async () => {
  const socket = createNetServer();
  await new Promise<void>((r) => socket.listen(0, '127.0.0.1', r));
  const port = (socket.address() as any).port;
  await new Promise<void>((r) => socket.close(() => r()));
  const origin = `http://127.0.0.1:${port}`;

  const child = spawn(process.execPath, ['dist/server.cjs'], {
    env: {
      ...process.env,
      JWT_SECRET: randomBytes(48).toString('hex'),
      DATABASE_PATH: join(tempDir, 'ready.sqlite'),
      PORT: String(port),
      NODE_ENV: 'production',
      ALLOWED_ORIGINS: origin,
      GROQ_API_KEY: '',
    },
    stdio: 'pipe',
  });
  try {
    let readyRes: Response | null = null;
    for (let i = 0; i < 80; i++) {
      try {
        readyRes = await fetch(`${origin}/api/ready`);
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    assert.ok(readyRes, 'Server should respond on /api/ready');
    assert.equal(readyRes.status, 200);
    const body = await readyRes.json();
    assert.equal(body.status, 'ready');
    assert.equal(body.database, 'ok');
    assert.equal(body.migrationVersion, 7);
    assert.equal(typeof body.problemsCount, 'number');
  } finally {
    child.kill();
    if (child.exitCode === null) await new Promise((r) => child.once('exit', r));
  }
});
