import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { validateProductionEnv } from '../server/validateEnv';
import { migrate } from '../server/migrations';
import { loadProblemCatalog, seedProblemCatalog } from '../server/problemCatalog';
import { seedHiddenTests } from '../server/seedHiddenTests';

const ROOT = process.cwd();

async function getFreePort(): Promise<number> {
  const srv = createServer();
  await new Promise<void>((resolve) => srv.listen(0, '127.0.0.1', resolve));
  const addr = srv.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  await new Promise<void>((resolve) => srv.close(() => resolve()));
  return port;
}

async function cleanupDir(dir: string): Promise<void> {
  try {
    await rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  } catch {
    // Ignore transient Windows temp-dir locks after assertions finish
  }
}

test('validateProductionEnv catches misconfigurations, passes hardened production config, and never leaks secrets', () => {
  const bad = validateProductionEnv(
    {
      NODE_ENV: 'development',
      JWT_SECRET: 'short',
      ALLOWED_ORIGINS: 'http://insecure.example.com/',
      COOKIE_SECURE: 'false',
      TRUST_PROXY: 'false',
      DATABASE_PATH: '/tmp/ephemeral.sqlite',
      RATE_LIMIT_STORE: 'redis',
      JUDGE_PROVIDER: 'isolated',
      ISOLATED_JUDGE_URL: 'http://203.0.113.10:4005',
      ISOLATED_JUDGE_TOKEN: 'too-short',
    },
    '22.11.0'
  );
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /Node\.js 24\+/.test(e)));
  assert.ok(bad.errors.some((e) => /NODE_ENV/.test(e)));
  assert.ok(bad.errors.some((e) => /JWT_SECRET/.test(e)));
  assert.ok(bad.errors.some((e) => /https:\/\//.test(e)));
  assert.ok(bad.errors.some((e) => /COOKIE_SECURE/.test(e)));
  assert.ok(bad.errors.some((e) => /TRUST_PROXY/.test(e)));
  assert.ok(bad.errors.some((e) => /ephemeral/.test(e)));
  assert.ok(bad.errors.some((e) => /REDIS_REST_URL/.test(e)));
  assert.ok(bad.errors.some((e) => /appears public over plain HTTP/.test(e)));
  assert.ok(bad.errors.some((e) => /ISOLATED_JUDGE_TOKEN/.test(e)));

  const secretJwt = randomBytes(48).toString('hex');
  const secretJudge = randomBytes(48).toString('hex');
  const secretGroq = `groq-test-secret-${randomBytes(12).toString('hex')}`;
  const good = validateProductionEnv(
    {
      NODE_ENV: 'production',
      JWT_SECRET: secretJwt,
      ALLOWED_ORIGINS: 'https://staging.alvio.example.com',
      COOKIE_SECURE: 'true',
      TRUST_PROXY: 'true',
      DATABASE_PATH: '/var/lib/alvio/database.sqlite',
      RATE_LIMIT_STORE: 'sqlite',
      JUDGE_PROVIDER: 'isolated',
      ISOLATED_JUDGE_URL: 'http://10.0.1.20:4005',
      ISOLATED_JUDGE_TOKEN: secretJudge,
      GROQ_API_KEY: secretGroq,
      RESEND_API_KEY: 'placeholder-resend-token',
      EMAIL_FROM: 'Alvio <noreply@alvio.example.com>',
    },
    '24.13.0'
  );
  assert.equal(good.ok, true, `Expected valid config, got errors: ${good.errors.join('; ')}`);
  assert.equal(good.errors.length, 0);
  assert.equal(good.summary.aiConfigured, true);
  assert.equal(good.summary.emailRecoveryConfigured, true);

  // Secret non-leakage invariant
  const serialized = JSON.stringify(good);
  assert.equal(serialized.includes(secretJwt), false);
  assert.equal(serialized.includes(secretJudge), false);
  assert.equal(serialized.includes(secretGroq), false);
});

test('Phase 6 deploy kit artifacts exist, use LF-only line endings, enforce backup 0600, monitoring, rollback, and zero secrets', () => {
  const phase6Files = [
    'deploy/api.env.example',
    'deploy/judge-worker.env.example',
    'deploy/setup-api-host.sh',
    'deploy/setup-judge-host.sh',
    'deploy/run-backup.sh',
    'deploy/alvio-api.service',
    'deploy/alvio-judge-worker.service',
    'deploy/alvio-backup.service',
    'deploy/alvio-backup.timer',
    'deploy/alvio-health-monitor.service',
    'deploy/alvio-health-monitor.timer',
    'deploy/nginx-alvio.conf',
    'deploy/health-monitor.sh',
    'deploy/validate-deployment.sh',
    'deploy/rollback-judge.sh',
  ];

  for (const rel of phase6Files) {
    const raw = readFileSync(join(ROOT, rel), 'utf8');
    assert.ok(raw.length > 40, `${rel} must be non-empty`);
    assert.equal(raw.includes('\r'), false, `${rel} must use LF line endings (no CRLF)`);
    assert.doesNotMatch(raw, /gsk_[a-zA-Z0-9]{10,}|re_[a-zA-Z0-9]{10,}/, `${rel} must never contain real API keys`);
  }

  const backupScript = readFileSync(join(ROOT, 'deploy/run-backup.sh'), 'utf8');
  assert.match(backupScript, /umask 077/);
  assert.match(backupScript, /chmod 0600/);
  assert.match(backupScript, /ALERT_WEBHOOK_URL/);

  const monitorScript = readFileSync(join(ROOT, 'deploy/health-monitor.sh'), 'utf8');
  assert.match(monitorScript, /DISK_WARN_PERCENT/);
  assert.match(monitorScript, /DB_WARN_MB/);
  assert.match(monitorScript, /CHECK_BACKUP_DIR/);
  assert.match(monitorScript, /CHECK_JOURNAL_503/);
  assert.match(monitorScript, /runtimeVerified/);

  const validateScript = readFileSync(join(ROOT, 'deploy/validate-deployment.sh'), 'utf8');
  assert.match(validateScript, /:4005\/health/);
  assert.match(validateScript, /strict-transport-security/i);

  const rollbackScript = readFileSync(join(ROOT, 'deploy/rollback-judge.sh'), 'utf8');
  assert.match(rollbackScript, /JUDGE_PROVIDER=paiza/);

  const apiEnvTemplate = readFileSync(join(ROOT, 'deploy/api.env.example'), 'utf8');
  assert.match(apiEnvTemplate, /^JUDGE_PROVIDER=paiza$/m, 'Default template must keep Paiza fallback until live gVisor passes');
});

test('production server fails closed with 503 on isolated judge outage and preserves accounts/sessions across graceful restart', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'alvio-phase6-ops-'));
  const dbPath = join(dir, 'staging.sqlite');
  const jwtSecret = randomBytes(48).toString('hex');
  const judgeToken = randomBytes(48).toString('hex');
  const deadJudgePort = await getFreePort();

  const prepDb = new DatabaseSync(dbPath);
  prepDb.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  migrate(prepDb);
  seedProblemCatalog(prepDb, loadProblemCatalog());
  seedHiddenTests(prepDb);
  prepDb.close();

  const startApi = async (port: number, judgeProvider: 'isolated' | 'paiza') => {
    const child = spawn(process.execPath, ['dist/server.cjs'], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(port),
        DATABASE_PATH: dbPath,
        JWT_SECRET: jwtSecret,
        ALLOWED_ORIGINS: 'https://staging.alvio.example.com',
        TRUST_PROXY: 'true',
        COOKIE_SECURE: 'true',
        RATE_LIMIT_STORE: 'sqlite',
        JUDGE_PROVIDER: judgeProvider,
        ISOLATED_JUDGE_URL: `http://127.0.0.1:${deadJudgePort}`,
        ISOLATED_JUDGE_TOKEN: judgeToken,
        GROQ_API_KEY: '',
      },
      stdio: 'pipe',
    });
    let logs = '';
    child.stdout?.on('data', (d) => (logs += d.toString()));
    child.stderr?.on('data', (d) => (logs += d.toString()));
    const origin = `http://127.0.0.1:${port}`;
    for (let i = 0; i < 100; i++) {
      try {
        const res = await fetch(`${origin}/api/ready`);
        if (res.ok) return { child, origin, getLogs: () => logs };
      } catch {
        if (i === 99 || child.exitCode !== null) throw new Error(`API failed to boot:\n${logs}`);
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    throw new Error(`API did not become ready:\n${logs}`);
  };

  const stopApi = async (child: ReturnType<typeof spawn>) => {
    if (child.exitCode !== null) return;
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        if (child.exitCode === null) child.kill('SIGKILL');
        resolve();
      }, 5000);
      child.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
      child.kill('SIGTERM');
    });
  };

  let proc1: Awaited<ReturnType<typeof startApi>> | null = null;
  let proc2: Awaited<ReturnType<typeof startApi>> | null = null;
  try {
    const port1 = await getFreePort();
    proc1 = await startApi(port1, 'isolated');

    // Register an account under production HTTPS proxy headers
    const signupRes = await fetch(`${proc1.origin}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://staging.alvio.example.com',
        'X-Forwarded-Proto': 'https',
      },
      body: JSON.stringify({
        name: 'Staging Operator',
        email: 'staging-op@example.test',
        password: 'ProductionSafePassword123!',
      }),
    });
    assert.equal(signupRes.status, 200);
    const signupData = (await signupRes.json()) as { token: string; user: { id: number; email: string } };
    assert.ok(signupData.token);

    // Submit code while isolated judge worker is unreachable -> MUST fail closed with 503 provider_unavailable
    const submitRes = await fetch(`${proc1.origin}/api/problems/maximum-subarray/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${signupData.token}`,
      },
      body: JSON.stringify({
        code: 'function maxSubArray(nums) { return 0; }',
        language: 'javascript',
      }),
    });
    assert.equal(submitRes.status, 503);
    const submitBody = (await submitRes.json()) as { executionStatus?: string; error?: string };
    assert.equal(submitBody.executionStatus, 'provider_unavailable');

    // Verify logs never leaked JWT_SECRET or ISOLATED_JUDGE_TOKEN
    const logs1 = proc1.getLogs();
    assert.equal(logs1.includes(jwtSecret), false, 'Server logs must never contain JWT_SECRET');
    assert.equal(logs1.includes(judgeToken), false, 'Server logs must never contain ISOLATED_JUDGE_TOKEN');

    // Graceful shutdown + restart under rolled-back JUDGE_PROVIDER=paiza config
    await stopApi(proc1.child);
    proc1 = null;

    const port2 = await getFreePort();
    proc2 = await startApi(port2, 'paiza');

    // Verify existing session and account survive restart intact
    const meRes = await fetch(`${proc2.origin}/api/auth/me`, {
      headers: { Authorization: `Bearer ${signupData.token}` },
    });
    assert.equal(meRes.status, 200);
    const meBody = (await meRes.json()) as { user: { email: string } };
    assert.equal(meBody.user.email, 'staging-op@example.test');

    // Verify unconfigured email recovery still fails closed honestly with 503 EMAIL_NOT_CONFIGURED
    const emailRes = await fetch(`${proc2.origin}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://staging.alvio.example.com',
      },
      body: JSON.stringify({ email: 'staging-op@example.test' }),
    });
    assert.equal(emailRes.status, 503);
    const emailBody = (await emailRes.json()) as { code?: string };
    assert.equal(emailBody.code, 'EMAIL_NOT_CONFIGURED');
  } finally {
    if (proc1) await stopApi(proc1.child);
    if (proc2) await stopApi(proc2.child);
    await cleanupDir(dir);
  }
});
