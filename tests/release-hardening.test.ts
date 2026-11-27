import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../server/migrations';
import { loadProblemCatalog, seedProblemCatalog } from '../server/problemCatalog';
import { seedHiddenTests } from '../server/seedHiddenTests';
import { backupDatabase, restoreDatabase } from '../server/backupDb';
import { PINNED_RUNTIME_IMAGES } from '../judge-worker/sandbox';

const ROOT = process.cwd();

async function getFreePort(): Promise<number> {
  const srv = createServer();
  await new Promise<void>((resolve) => srv.listen(0, '127.0.0.1', resolve));
  const addr = srv.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  await new Promise<void>((resolve) => srv.close(() => resolve()));
  return port;
}

test('deployment artifacts exist, use LF-only line endings, enforce TLS/gVisor/UFW, and never expose port 4005 or secrets', () => {
  const expectedFiles = [
    'deploy/setup-judge-host.sh',
    'deploy/alvio-api.service',
    'deploy/alvio-judge-worker.service',
    'deploy/alvio-backup.service',
    'deploy/alvio-backup.timer',
    'deploy/nginx-alvio.conf',
    'deploy/health-monitor.sh',
  ];

  for (const rel of expectedFiles) {
    const raw = readFileSync(join(ROOT, rel), 'utf8');
    assert.ok(raw.length > 50, `${rel} must be non-empty`);
    assert.equal(raw.includes('\r'), false, `${rel} must use LF line endings (no CRLF) for Linux compatibility`);
    assert.doesNotMatch(raw, /gsk_[a-zA-Z0-9]{10,}|re_[a-zA-Z0-9]{10,}/, `${rel} must not contain hardcoded API keys`);
  }

  const setupScript = readFileSync(join(ROOT, 'deploy/setup-judge-host.sh'), 'utf8');
  assert.match(setupScript, /apt-get install -y runsc/);
  assert.match(setupScript, /runsc install/);
  assert.match(setupScript, /ufw deny "\$\{JUDGE_PORT\}\/tcp"/);
  for (const image of Object.values(PINNED_RUNTIME_IMAGES)) {
    assert.ok(setupScript.includes(`docker pull ${image}`), `setup-judge-host.sh must pre-pull ${image}`);
  }

  const nginx = readFileSync(join(ROOT, 'deploy/nginx-alvio.conf'), 'utf8');
  assert.match(nginx, /TLSv1\.2 TLSv1\.3/);
  assert.match(nginx, /Strict-Transport-Security/);
  assert.match(nginx, /proxy_buffering off/);
  assert.doesNotMatch(nginx, /proxy_pass[^;]*4005/, 'Nginx must NEVER proxy judge worker port 4005 publicly');

  const gitattributes = readFileSync(join(ROOT, '.gitattributes'), 'utf8');
  assert.match(gitattributes, /\*\.sh text eol=lf/);
  assert.match(gitattributes, /\*\.service text eol=lf/);
});

test('Express application code never imports child_process or vm to execute student code on the API host', () => {
  const serverFiles = [
    join(ROOT, 'server.ts'),
    ...readdirSync(join(ROOT, 'server'))
      .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
      .map((name) => join(ROOT, 'server', name)),
    ...readdirSync(join(ROOT, 'server', 'hiddenTests'))
      .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
      .map((name) => join(ROOT, 'server', 'hiddenTests', name)),
  ];

  for (const filePath of serverFiles) {
    const content = readFileSync(filePath, 'utf8');
    assert.doesNotMatch(
      content,
      /from\s+['"](?:node:)?(?:child_process|vm)['"]|require\(['"](?:node:)?(?:child_process|vm)['"]\)/,
      `Express runtime file ${filePath} must NEVER import child_process or vm`
    );
  }
});

async function cleanupDir(dir: string): Promise<void> {
  try {
    await rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  } catch {
    // Ignore transient Windows antivirus/SQLite temp-dir locks after test assertions finish
  }
}

test('SQLite Migration #9 creates read-path indexes used by EXPLAIN QUERY PLAN and full backup/restore preserves all tables', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'alvio-release-db-'));
  let db: DatabaseSync | null = null;
  let broken: DatabaseSync | null = null;
  let verifyDb: DatabaseSync | null = null;
  try {
    const livePath = join(dir, 'live.sqlite');
    const backupPath = join(dir, 'backup.sqlite');
    db = new DatabaseSync(livePath);
    db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    migrate(db);

    const catalog = loadProblemCatalog();
    seedProblemCatalog(db, catalog);
    const hidden = seedHiddenTests(db);
    assert.equal(hidden.problemsMatched, 384);
    assert.equal(hidden.inserted, 1636);

    db.prepare('INSERT INTO users (id, email, password_hash, name, xp) VALUES (1, ?, ?, ?, ?)').run(
      'release@example.test',
      'hash',
      'Release Student',
      275
    );
    db.prepare(
      'INSERT INTO learning_progress (user_id, progress_json, revision, updated_at) VALUES (1, ?, 3, CURRENT_TIMESTAMP)'
    ).run(JSON.stringify({ completedTopics: ['arrays', 'graphs'] }));
    db.prepare(
      'INSERT INTO user_submissions (user_id, problem_id, status, language, code, runtime_ms, passed_testcases, total_testcases, verified) VALUES (1, ?, ?, ?, ?, ?, ?, ?, 1)'
    ).run('maximum-subarray', 'Passed', 'javascript', 'function maxSubArray(n){return 0;}', 12, 6, 6);
    db.prepare('INSERT INTO user_activity (user_id, activity_type, points) VALUES (1, ?, ?)').run('Solved problem', 50);

    // Verify query planner actually uses the new Migration #9 indexes instead of full table scans
    const subPlan = JSON.stringify(
      db
        .prepare(
          'EXPLAIN QUERY PLAN SELECT * FROM user_submissions WHERE user_id = ? AND problem_id = ? ORDER BY created_at DESC, id DESC LIMIT 10'
        )
        .all(1, 'maximum-subarray')
    );
    assert.match(subPlan, /idx_user_submissions_user_problem_created/, `Expected index scan, got: ${subPlan}`);

    const actPlan = JSON.stringify(
      db.prepare('EXPLAIN QUERY PLAN SELECT * FROM user_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(1)
    );
    assert.match(actPlan, /idx_user_activity_user_created/, `Expected index scan, got: ${actPlan}`);
    db.close();
    db = null;

    // Online WAL-safe backup + destructive mutation + verified restore
    const backup = backupDatabase(livePath, backupPath);
    assert.equal(backup.ok, true);
    assert.equal(backup.integrity, 'ok');
    assert.equal(backup.migrationVersion, 9);
    assert.equal(backup.problemsCount, 472);
    assert.equal(backup.usersCount, 1);

    broken = new DatabaseSync(livePath);
    broken.exec('DELETE FROM user_submissions; DELETE FROM user_activity; DELETE FROM learning_progress; DELETE FROM users;');
    broken.close();
    broken = null;

    const restored = restoreDatabase(backupPath, livePath);
    assert.equal(restored.ok, true);
    assert.equal(restored.integrity, 'ok');
    assert.equal(restored.usersCount, 1);
    assert.equal(restored.problemsCount, 472);

    verifyDb = new DatabaseSync(livePath, { readOnly: true });
    assert.equal((verifyDb.prepare('SELECT COUNT(*) AS c FROM problem_hidden_tests').get() as any).c, 1636);
    assert.equal((verifyDb.prepare('SELECT COUNT(*) AS c FROM user_submissions').get() as any).c, 1);
    assert.equal((verifyDb.prepare('SELECT revision FROM learning_progress WHERE user_id = 1').get() as any).revision, 3);
    verifyDb.close();
    verifyDb = null;
  } finally {
    try { db?.close(); } catch { /* ignore */ }
    try { broken?.close(); } catch { /* ignore */ }
    try { verifyDb?.close(); } catch { /* ignore */ }
    await cleanupDir(dir);
  }
});

test('production server enforces HTTPS proxy HSTS/Secure cookies, fast readiness/catalog latency, and graceful SIGTERM exit', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'alvio-release-prod-'));
  const dbPath = join(dir, 'prod.sqlite');
  const port = await getFreePort();
  const origin = `http://127.0.0.1:${port}`;

  // Seed fresh disposable DB with full catalog + hidden tests before booting production bundle
  const prepDb = new DatabaseSync(dbPath);
  prepDb.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  migrate(prepDb);
  seedProblemCatalog(prepDb, loadProblemCatalog());
  seedHiddenTests(prepDb);
  prepDb.close();

  const child = spawn(process.execPath, ['dist/server.cjs'], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(port),
      DATABASE_PATH: dbPath,
      JWT_SECRET: randomBytes(48).toString('hex'),
      ALLOWED_ORIGINS: 'https://alvio.example.com',
      TRUST_PROXY: 'true',
      COOKIE_SECURE: 'true',
      RATE_LIMIT_STORE: 'sqlite',
      GROQ_API_KEY: '',
    },
    stdio: 'pipe',
  });

  let logs = '';
  child.stdout?.on('data', (d) => (logs += d.toString()));
  child.stderr?.on('data', (d) => (logs += d.toString()));

  try {
    for (let i = 0; i < 100; i++) {
      try {
        const res = await fetch(`${origin}/api/health`);
        if (res.ok) break;
      } catch {
        if (i === 99 || child.exitCode !== null) throw new Error(`Server failed to boot:\n${logs}`);
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    // Verify readiness & HTTPS reverse-proxy security headers
    const readyStart = performance.now();
    const readyRes = await fetch(`${origin}/api/ready`, {
      headers: { 'X-Forwarded-Proto': 'https' },
    });
    const readyMs = performance.now() - readyStart;
    assert.equal(readyRes.status, 200);
    assert.match(readyRes.headers.get('strict-transport-security') || '', /max-age=31536000/);
    assert.equal(readyRes.headers.get('x-content-type-options'), 'nosniff');
    const readyBody = await readyRes.json();
    assert.equal(readyBody.status, 'ready');
    assert.equal(readyBody.migrationVersion, 9);
    assert.equal(readyBody.problemsCount, 472);
    assert.ok(readyMs < 500, `/api/ready latency too high: ${readyMs}ms`);

    // Verify signup sets Secure + HttpOnly cookies behind HTTPS proxy
    const signupRes = await fetch(`${origin}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://alvio.example.com',
        'X-Forwarded-Proto': 'https',
      },
      body: JSON.stringify({
        name: 'Prod Release User',
        email: 'prod-release@example.test',
        password: 'VeryStrongPassword123!',
      }),
    });
    assert.equal(signupRes.status, 200);
    const setCookies = signupRes.headers.getSetCookie();
    const accessCookie = setCookies.find((c) => c.startsWith('alvio_access=')) || '';
    const refreshCookie = setCookies.find((c) => c.startsWith('alvio_refresh=')) || '';
    assert.match(accessCookie, /HttpOnly/i);
    assert.match(accessCookie, /Secure/i);
    assert.match(refreshCookie, /HttpOnly/i);
    assert.match(refreshCookie, /Secure/i);

    // Verify full 472-problem catalog latency stays well under 500ms and never leaks hidden tests
    const catStart = performance.now();
    const catRes = await fetch(`${origin}/api/problems`);
    const catMs = performance.now() - catStart;
    assert.equal(catRes.status, 200);
    const catBody = await catRes.json();
    assert.equal(catBody.length, 472);
    assert.ok(catMs < 500, `/api/problems latency too high: ${catMs}ms`);
    assert.doesNotMatch(JSON.stringify(catBody), /hiddenTestCases|problem_hidden_tests/i);

    // Verify GET /api/problems/:id never leaks server-only hidden test inputs across Easy/Medium/Hard
    for (const [problemId, hiddenSentinel] of [
      ['maximum-subarray', '-5,-2,-8,-1,-4'],
      ['sort-array-by-parity', '[2,4,6]'],
      ['substring-with-concatenation-of-all-words', 'barfoofoobarthefoobarman'],
    ] as const) {
      const detailRes = await fetch(`${origin}/api/problems/${problemId}`);
      assert.equal(detailRes.status, 200);
      const detailRaw = await detailRes.text();
      assert.equal(detailRaw.includes('hiddenTestCases'), false, `/api/problems/${problemId} leaked hiddenTestCases key`);
      assert.equal(detailRaw.includes(hiddenSentinel), false, `/api/problems/${problemId} leaked hidden test input`);
    }

    // Verify clean graceful SIGTERM shutdown (Windows SIGTERM terminates directly; POSIX exits 0)
    const exitCode = await new Promise<number | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), 6000);
      child.once('exit', (code) => {
        clearTimeout(timer);
        resolve(code);
      });
      child.kill('SIGTERM');
    });
    if (process.platform !== 'win32') {
      assert.equal(exitCode, 0, `Expected graceful SIGTERM exit code 0, got ${exitCode}`);
    }
  } finally {
    if (child.exitCode === null) {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 3000);
        child.once('exit', () => {
          clearTimeout(timer);
          resolve();
        });
        child.kill('SIGKILL');
      });
    }
    await cleanupDir(dir);
  }
});
