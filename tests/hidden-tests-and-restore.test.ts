import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../server/migrations';
import { registerSubmissions } from '../server/submissions';
import { createIsolatedJudgeProvider, resolveExecutionProvider } from '../server/submissionRunner';
import { backupDatabase, restoreDatabase } from '../server/backupDb';
import { createRedisRestRateLimitStore, rateLimit, safeErrors } from '../server/security';

let tempDir: string;

before(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'alvio-hidden-restore-'));
});

after(async () => {
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
});

test('hidden test cases run server-side, redact secret inputs/outputs on failure, and pass when genuinely solved', async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || randomBytes(48).toString('hex');
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);

  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)').run(
    'hidden@example.test',
    'hash',
    'Hidden Test Student'
  );
  db.prepare(
    `INSERT INTO problems (id, title, difficulty, description, examples, constraints, signature, starterCode, testCases)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    'double-val',
    'Double Value',
    'Easy',
    'Return n * 2.',
    '[]',
    '[]',
    JSON.stringify({ name: 'doubleVal', params: [{ name: 'n', type: 'integer' }], returns: 'integer' }),
    '{}',
    JSON.stringify([{ input: [2], expected: 4 }])
  );
  // Insert a server-only hidden test case with a secret sentinel input
  db.prepare('INSERT INTO problem_hidden_tests (problem_id, input_json, expected_json) VALUES (?, ?, ?)').run(
    'double-val',
    JSON.stringify([424242]),
    JSON.stringify(848484)
  );

  let mode: 'fail-hidden' | 'pass-all' = 'fail-hidden';
  let capturedSource = '';

  const app = express();
  app.use(express.json({ limit: '512kb' }));
  registerSubmissions(app, {
    db,
    rateLimitMax: 50,
    authOptional: (req, _res, next) => { req.userId = 1; next(); },
    authRequired: (req, _res, next) => { req.userId = 1; next(); },
    provider: async ({ sourceCode }) => {
      capturedSource = sourceCode;
      const marker = sourceCode.match(/__ALVIO_RES_[a-f0-9]+__:/)?.[0] || '';
      if (mode === 'fail-hidden') {
        return {
          status: 'completed',
          result: 'success',
          exit_code: 0,
          stdout: `${marker}${JSON.stringify({
            status: 'Failed',
            passedCount: 1,
            message: 'Test Case 2 Failed.\nInput: [424242]\nExpected: 848484\nOutput: 4',
            failedTestCase: { index: 2, input: [424242], expected: 848484, actual: 4 },
            stdout: [],
            executionTimeMs: 3,
          })}`,
        };
      }
      return {
        status: 'completed',
        result: 'success',
        exit_code: 0,
        stdout: `${marker}${JSON.stringify({
          status: 'Passed',
          passedCount: 2,
          message: 'All passed.',
          stdout: [],
          executionTimeMs: 3,
        })}`,
      };
    },
  });
  app.use(safeErrors);

  const srv: Server = createServer(app);
  await new Promise<void>((r) => srv.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${(srv.address() as any).port}`;

  try {
    // Hard-coded solution fails on the hidden test case; secret values MUST be redacted
    mode = 'fail-hidden';
    const failRes = await fetch(`${origin}/api/problems/double-val/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'function doubleVal() { return 4; }', language: 'javascript' }),
    });
    assert.equal(failRes.status, 200);
    const failBody = await failRes.json();
    assert.equal(failBody.status, 'Failed');
    assert.equal(failBody.executionStatus, 'wrong_answer');
    assert.equal(failBody.visibleCount, 1);
    assert.equal(failBody.hiddenCount, 1);
    assert.equal(failBody.totalCount, 2);
    assert.equal(failBody.passedCount, 1);
    assert.match(capturedSource, /424242/, 'Hidden case must be evaluated in the runner');
    assert.doesNotMatch(failBody.message, /424242|848484/, 'Hidden test input/expected must NEVER leak in message');
    assert.deepEqual(failBody.failedTestCase, { index: 2, hidden: true });

    // Genuine solution passes both visible and hidden cases
    mode = 'pass-all';
    const passRes = await fetch(`${origin}/api/problems/double-val/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'function doubleVal(n) { return n * 2; }', language: 'javascript' }),
    });
    assert.equal(passRes.status, 200);
    const passBody = await passRes.json();
    assert.equal(passBody.status, 'Passed');
    assert.equal(passBody.executionStatus, 'accepted');
    assert.equal(passBody.passedCount, 2);
    assert.equal(passBody.totalCount, 2);
    assert.equal(passBody.xpAwarded, 25);
  } finally {
    await new Promise<void>((r) => srv.close(() => r()));
    db.close();
  }
});

test('backupDatabase and restoreDatabase recover user data cleanly after target mutation', () => {
  const livePath = join(tempDir, 'live.sqlite');
  const backupPath = join(tempDir, 'snapshots', 'good.sqlite');

  const db = new DatabaseSync(livePath);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  migrate(db);
  db.prepare('INSERT INTO users (email, password_hash, name, xp) VALUES (?, ?, ?, ?)').run(
    'restore@example.test',
    'hash',
    'Restore Student',
    350
  );
  db.close();

  const backup = backupDatabase(livePath, backupPath);
  assert.equal(backup.ok, true);
  assert.equal(backup.usersCount, 1);
  assert.equal(backup.migrationVersion, 8);

  // Simulate accidental data deletion on live DB
  const broken = new DatabaseSync(livePath);
  broken.prepare('DELETE FROM users').run();
  assert.equal((broken.prepare('SELECT COUNT(*) as c FROM users').get() as any).c, 0);
  broken.close();

  // Restore from verified snapshot
  const restored = restoreDatabase(backupPath, livePath);
  assert.equal(restored.ok, true);
  assert.equal(restored.usersCount, 1);

  const checkDb = new DatabaseSync(livePath, { readOnly: true });
  const row = checkDb.prepare('SELECT email, xp FROM users').get() as any;
  assert.equal(row.email, 'restore@example.test');
  assert.equal(row.xp, 350);
  checkDb.close();
});

test('isolated judge provider sends CPU/memory/network limits and rejects missing URL', async () => {
  assert.throws(
    () => resolveExecutionProvider({ JUDGE_PROVIDER: 'isolated', ISOLATED_JUDGE_URL: '' }),
    /ISOLATED_JUDGE_URL must be configured/
  );

  let capturedUrl = '';
  let capturedAuth = '';
  let capturedBody: any = null;

  const provider = createIsolatedJudgeProvider({
    baseUrl: 'https://judge.internal.example',
    token: 'secret-judge-token',
    limits: { cpuTimeLimitSec: 3, memoryLimitMb: 128 },
    fetchImpl: async (url, init) => {
      capturedUrl = String(url);
      capturedAuth = new Headers(init?.headers).get('Authorization') || '';
      capturedBody = JSON.parse(String(init?.body || '{}'));
      return Response.json({ status: 'completed', result: 'success', exit_code: 0, stdout: 'ok' });
    },
  });

  const result = await provider({
    language: 'python3',
    sourceCode: 'print(1)',
    timeoutMs: 5000,
  });
  assert.equal(result.status, 'completed');
  assert.equal(capturedUrl, 'https://judge.internal.example/execute');
  assert.equal(capturedAuth, 'Bearer secret-judge-token');
  assert.equal(capturedBody.limits.cpuTimeLimitSec, 3);
  assert.equal(capturedBody.limits.memoryLimitMb, 128);
  assert.equal(capturedBody.limits.networkDisabled, true);
});

test('Redis REST shared rate-limit store enforces quotas across instances', async () => {
  const counts = new Map<string, number>();
  const mockFetch: typeof fetch = async (_url, init) => {
    const cmds = JSON.parse(String(init?.body || '[]')) as string[][];
    const out: Array<{ result: number }> = [];
    for (const cmd of cmds) {
      if (cmd[0] === 'INCR') {
        const next = (counts.get(cmd[1]) || 0) + 1;
        counts.set(cmd[1], next);
        out.push({ result: next });
      } else if (cmd[0] === 'PEXPIRE') {
        out.push({ result: 1 });
      } else if (cmd[0] === 'PTTL') {
        out.push({ result: 45000 });
      }
    }
    return Response.json(out);
  };

  const storeA = createRedisRestRateLimitStore({ url: 'https://redis.example', token: 'tok', fetchImpl: mockFetch });
  const storeB = createRedisRestRateLimitStore({ url: 'https://redis.example', token: 'tok', fetchImpl: mockFetch });
  const app = express();
  app.get('/a', rateLimit(2, 60000, 'multi', false, storeA), (_req, res) => res.json({ ok: 1 }));
  app.get('/b', rateLimit(2, 60000, 'multi', false, storeB), (_req, res) => res.json({ ok: 2 }));

  const srv = createServer(app);
  await new Promise<void>((r) => srv.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${(srv.address() as any).port}`;
  try {
    assert.equal((await fetch(`${base}/a`)).status, 200);
    assert.equal((await fetch(`${base}/b`)).status, 200);
    const limited = await fetch(`${base}/a`);
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get('retry-after')) >= 1);
  } finally {
    await new Promise<void>((r) => srv.close(() => r()));
  }
});
