import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../server/migrations';
import { registerSubmissions } from '../server/submissions';
import { createIsolatedJudgeProvider, type SubmissionLanguage } from '../server/submissionRunner';
import { safeErrors } from '../server/security';
import { createDockerRuntimeAdapter } from '../judge-worker/sandbox';
import { createJudgeWorkerServer } from '../judge-worker/server';

/**
 * LIVE LINUX DOCKER INTEGRATION TEST SUITE (ZERO MOCKS)
 *
 * Executes real student submissions inside real ephemeral Docker containers through:
 *   Express /api/problems/:id/submit -> createIsolatedJudgeProvider -> judge-worker -> Docker daemon
 *
 * Requires a running Linux Docker daemon with pre-pulled runtime images:
 *   node:22-alpine, python:3.12-alpine, gcc:14-bookworm, eclipse-temurin:21-jdk-alpine, mono:6.12-slim
 */

const WORKER_TOKEN = randomBytes(32).toString('hex');
const DOCKER_RUNTIME = (process.env.JUDGE_DOCKER_RUNTIME || '').trim() || undefined;

let db: DatabaseSync;
let workerServer: Server;
let workerUrl: string;
let apiServer: Server;
let apiUrl: string;

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('Failed to bind server port.');
  return `http://127.0.0.1:${addr.port}`;
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

async function submitCode(problemId: string, language: SubmissionLanguage, code: string) {
  const res = await fetch(`${apiUrl}/api/problems/${problemId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, code }),
  });
  return { status: res.status, body: await res.json() };
}

before(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || randomBytes(48).toString('hex');
  const dockerCheck = spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], { encoding: 'utf8' });
  if (dockerCheck.status !== 0) {
    throw new Error(
      `Live Docker integration suite requires a running Docker daemon. docker info failed: ${dockerCheck.stderr || dockerCheck.error?.message}`
    );
  }
  console.log(
    `[live-docker] Docker daemon v${dockerCheck.stdout.trim()} | runtime=${DOCKER_RUNTIME || 'default-runc'}`
  );

  db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);

  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)').run(
    'live-docker@example.test',
    'hash',
    'Live Docker Student'
  );
  db.prepare(
    `INSERT INTO problems (id, title, difficulty, description, examples, constraints, signature, starterCode, testCases)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    'live-add',
    'Live Add Two Numbers',
    'Easy',
    'Return a + b.',
    '[]',
    '[]',
    JSON.stringify({
      name: 'add',
      params: [
        { name: 'a', type: 'integer' },
        { name: 'b', type: 'integer' },
      ],
      returns: 'integer',
    }),
    '{}',
    JSON.stringify([
      { input: [1, 2], expected: 3 },
      { input: [10, 20], expected: 30 },
    ])
  );

  // Two server-only hidden test cases with distinct sentinels
  db.prepare('INSERT INTO problem_hidden_tests (problem_id, input_json, expected_json) VALUES (?, ?, ?)').run(
    'live-add',
    JSON.stringify([77777, 11111]),
    JSON.stringify(88888)
  );
  db.prepare('INSERT INTO problem_hidden_tests (problem_id, input_json, expected_json) VALUES (?, ?, ?)').run(
    'live-add',
    JSON.stringify([-500, 1234]),
    JSON.stringify(734)
  );

  workerServer = createJudgeWorkerServer({
    token: WORKER_TOKEN,
    maxConcurrentJobs: 4,
    adapter: createDockerRuntimeAdapter('docker'),
    dockerRuntime: DOCKER_RUNTIME,
  });
  workerUrl = await listen(workerServer);

  const app = express();
  app.use(express.json({ limit: '512kb' }));
  registerSubmissions(app, {
    db,
    rateLimitMax: 200,
    timeoutMs: 25000,
    authOptional: (req, _res, next) => {
      req.userId = 1;
      next();
    },
    authRequired: (req, _res, next) => {
      req.userId = 1;
      next();
    },
    provider: createIsolatedJudgeProvider({
      baseUrl: workerUrl,
      token: WORKER_TOKEN,
      limits: { cpuTimeLimitSec: 4, memoryLimitMb: 192, maxOutputBytes: 65536 },
    }),
  });
  app.use(safeErrors);

  apiServer = createServer(app);
  apiUrl = await listen(apiServer);
});

after(async () => {
  if (apiServer) await close(apiServer);
  if (workerServer) await close(workerServer);
  db?.close();
});

test('1. Live /health reports Docker daemon ok and verifies configured runtime', async () => {
  const res = await fetch(`${workerUrl}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.docker, 'ok');
  assert.equal(body.runtime, DOCKER_RUNTIME || 'default-runc');
  assert.equal(body.runtimeVerified, true);
  assert.equal(body.supportedLanguages.length, 7);
  if (DOCKER_RUNTIME) {
    assert.ok(
      Array.isArray(body.availableRuntimes) && body.availableRuntimes.includes(DOCKER_RUNTIME),
      `Configured runtime ${DOCKER_RUNTIME} must be registered in Docker: ${JSON.stringify(body.availableRuntimes)}`
    );
  }
});

const LANGUAGE_CASES: Array<{
  language: SubmissionLanguage;
  passCode: string;
  wrongCode: string;
  compileErrCode: string;
  runtimeErrCode: string;
}> = [
  {
    language: 'javascript',
    passCode: 'function add(a, b) { return a + b; }',
    wrongCode: 'function add(a, b) { return a - b; }',
    compileErrCode: 'function add(a, b) { return a + ; }',
    runtimeErrCode: 'function add(a, b) { throw new Error("js-runtime-boom"); }',
  },
  {
    language: 'typescript',
    passCode: 'function add(a: number, b: number): number { return a + b; }',
    wrongCode: 'function add(a: number, b: number): number { return 0; }',
    compileErrCode: 'function add(a: number, b: number { return a + b; }',
    runtimeErrCode: 'function add(a: number, b: number): number { throw new Error("ts-runtime-boom"); }',
  },
  {
    language: 'python3',
    passCode: 'def add(a, b):\n    return a + b\n',
    wrongCode: 'def add(a, b):\n    return a * b\n',
    compileErrCode: 'def add(a, b)\n    return a + b\n',
    runtimeErrCode: 'def add(a, b):\n    return 1 // 0\n',
  },
  {
    language: 'c',
    passCode: 'int add(int a, int b) { return a + b; }',
    wrongCode: 'int add(int a, int b) { return 0; }',
    compileErrCode: 'int add(int a, int b) { return a + ; }',
    runtimeErrCode: 'int add(int a, int b) { int *p = NULL; return *p; }',
  },
  {
    language: 'cpp',
    passCode: 'class Solution { public: int add(int a, int b) { return a + b; } };',
    wrongCode: 'class Solution { public: int add(int a, int b) { return 0; } };',
    compileErrCode: 'class Solution { public: int add(int a, int b) { return a + ; } };',
    runtimeErrCode: '#include <stdexcept>\nclass Solution { public: int add(int a, int b) { throw std::runtime_error("cpp-boom"); } };',
  },
  {
    language: 'java',
    passCode: 'class Solution { public int add(int a, int b) { return a + b; } }',
    wrongCode: 'class Solution { public int add(int a, int b) { return 0; } }',
    compileErrCode: 'class Solution { public int add(int a, int b) { return a + ; } }',
    runtimeErrCode: 'class Solution { public int add(int a, int b) { throw new RuntimeException("java-boom"); } }',
  },
  {
    language: 'csharp',
    passCode: 'public class Solution { public int add(int a, int b) { return a + b; } }',
    wrongCode: 'public class Solution { public int add(int a, int b) { return 0; } }',
    compileErrCode: 'public class Solution { public int add(int a, int b) { return a + ; } }',
    runtimeErrCode: 'public class Solution { public int add(int a, int b) { throw new Exception("cs-boom"); } }',
  },
];

for (const spec of LANGUAGE_CASES) {
  test(`2. Live Docker execution for ${spec.language}: pass, wrong answer, compile error, runtime error`, async () => {
    const pass = await submitCode('live-add', spec.language, spec.passCode);
    assert.equal(pass.status, 200, `${spec.language} pass HTTP status: ${JSON.stringify(pass.body)}`);
    assert.equal(pass.body.status, 'Passed', `${spec.language} pass body: ${JSON.stringify(pass.body)}`);
    assert.equal(pass.body.executionStatus, 'accepted');
    assert.equal(pass.body.passedCount, 4);
    assert.equal(pass.body.totalCount, 4);

    const wrong = await submitCode('live-add', spec.language, spec.wrongCode);
    assert.equal(wrong.status, 200);
    assert.equal(wrong.body.status, 'Failed', `${spec.language} wrong body: ${JSON.stringify(wrong.body)}`);
    assert.equal(wrong.body.executionStatus, 'wrong_answer');

    const compileErr = await submitCode('live-add', spec.language, spec.compileErrCode);
    assert.equal(compileErr.status, 200);
    assert.equal(compileErr.body.status, 'Error', `${spec.language} compile body: ${JSON.stringify(compileErr.body)}`);
    assert.equal(
      compileErr.body.executionStatus,
      'compilation_error',
      `${spec.language} compile classification: ${JSON.stringify(compileErr.body)}`
    );

    const runtimeErr = await submitCode('live-add', spec.language, spec.runtimeErrCode);
    assert.equal(runtimeErr.status, 200);
    assert.equal(runtimeErr.body.status, 'Error', `${spec.language} runtime body: ${JSON.stringify(runtimeErr.body)}`);
    assert.equal(
      runtimeErr.body.executionStatus,
      'runtime_error',
      `${spec.language} runtime classification: ${JSON.stringify(runtimeErr.body)}`
    );
  });
}

test('3. Live Docker hidden-test isolation blocks __filename read, stdout dump, and throw exfiltration', async () => {
  // Hardcoded visible pass + attempt to exfiltrate hidden inputs via stdout and __filename
  const cheatCode = `
    const fs = require('fs');
    function add(a, b) {
      try { console.log(fs.readFileSync(__filename, 'utf8')); } catch {}
      console.log('LEAK:', a, b);
      if (a === 1 && b === 2) return 3;
      if (a === 10 && b === 20) return 30;
      return 0;
    }
  `;
  const res = await submitCode('live-add', 'javascript', cheatCode);
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'Failed');
  assert.deepEqual(res.body.failedTestCase, { index: 3, hidden: true });
  assert.doesNotMatch(JSON.stringify(res.body), /77777|11111|88888|-500|1234/);

  // Attempt to throw hidden input in exception message during hidden phase
  const throwExfil = `
    function add(a, b) {
      if (a === 1 && b === 2) return 3;
      if (a === 10 && b === 20) return 30;
      throw new Error('EXFIL_' + a + '_' + b);
    }
  `;
  const exfilRes = await submitCode('live-add', 'javascript', throwExfil);
  assert.equal(exfilRes.status, 200);
  assert.equal(exfilRes.body.status, 'Error');
  assert.equal(exfilRes.body.message, 'Runtime Error on hidden test case.');
  assert.doesNotMatch(
    JSON.stringify({
      message: exfilRes.body.message,
      stdout: exfilRes.body.stdout,
      failedTestCase: exfilRes.body.failedTestCase,
    }),
    /77777|11111|88888|EXFIL_/
  );
  assert.doesNotMatch(JSON.stringify(exfilRes.body), /77777|11111|88888/);
});

test('4. Live Docker enforces timeout, OOM memory limit, output limit, network-none, read-only rootfs, non-root, and secret stripping', async () => {
  // 4a. Infinite loop -> timeout
  const tle = await submitCode('live-add', 'javascript', 'function add(a, b) { while (true) {} }');
  assert.equal(tle.status, 200);
  assert.equal(tle.body.status, 'Error');
  assert.equal(tle.body.executionStatus, 'time_limit_exceeded');

  // 4b. Excessive memory allocation -> memory_limit_exceeded (touch non-zero pages to beat Linux overcommit)
  const oom = await submitCode(
    'live-add',
    'python3',
    'def add(a, b):\n    chunks = []\n    for _ in range(40):\n        chunks.append(b"A" * (8 * 1024 * 1024))\n    return len(chunks)\n'
  );
  assert.equal(oom.status, 200);
  assert.equal(oom.body.status, 'Error');
  assert.equal(oom.body.executionStatus, 'memory_limit_exceeded', `OOM body: ${JSON.stringify(oom.body)}`);

  // 4c. Excessive stdout flood -> Output Limit Exceeded
  const flood = await submitCode(
    'live-add',
    'python3',
    'import sys\ndef add(a, b):\n    sys.__stdout__.write("X" * 200000)\n    sys.__stdout__.flush()\n    return a + b\n'
  );
  assert.equal(flood.status, 200);
  assert.equal(flood.body.status, 'Error');
  assert.match(flood.body.message, /Output Limit Exceeded/i);

  // 4d. Network access blocked (--network=none), read-only rootfs, non-root UID 65534, no host secrets in env
  const probeSecurity = `
import os, socket
def add(a, b):
    # 1. Verify non-root nobody user
    assert os.geteuid() == 65534, f"Expected uid 65534, got {os.geteuid()}"
    # 2. Verify host secrets are NOT present in container env
    for secret in ("JWT_SECRET", "GROQ_API_KEY", "ISOLATED_JUDGE_TOKEN", "DATABASE_PATH"):
        assert secret not in os.environ, f"Secret leaked: {secret}"
    # 3. Verify root filesystem is read-only
    try:
        with open("/alvio-escape-test", "w") as f:
            f.write("bad")
        raise AssertionError("Root filesystem was writable!")
    except OSError:
        pass
    # 4. Verify outbound network is blocked (--network=none)
    try:
        s = socket.create_connection(("1.1.1.1", 80), timeout=1)
        s.close()
        raise AssertionError("Outbound network succeeded!")
    except OSError:
        pass
    return a + b
`;
  const secRes = await submitCode('live-add', 'python3', probeSecurity);
  assert.equal(secRes.status, 200);
  assert.equal(secRes.body.status, 'Passed', `Security probe failed: ${JSON.stringify(secRes.body)}`);
});

test('5. Live Docker concurrency saturation, runtime inspection, client disconnect cancellation, worker outage, and daemon outage', async () => {
  // 5a. Concurrency saturation (maxConcurrentJobs = 1) + live HostConfig.Runtime verification
  const smallWorker = createJudgeWorkerServer({
    token: WORKER_TOKEN,
    maxConcurrentJobs: 1,
    adapter: createDockerRuntimeAdapter('docker'),
    dockerRuntime: DOCKER_RUNTIME,
  });
  const smallUrl = await listen(smallWorker);
  try {
    const req1 = fetch(`${smallUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WORKER_TOKEN}` },
      body: JSON.stringify({
        language: 'python3',
        sourceCode: 'import time; time.sleep(2.0); print("done")',
        timeoutMs: 10000,
      }),
    });
    await new Promise((r) => setTimeout(r, 400));

    // Inspect active container runtime directly via docker inspect while running
    const activeNames = spawnSync('docker', ['ps', '--filter', 'name=alvio-judge-', '--format', '{{.Names}}'], {
      encoding: 'utf8',
    })
      .stdout.trim()
      .split(/\r?\n/)
      .filter(Boolean);
    if (DOCKER_RUNTIME && activeNames.length > 0) {
      const inspectedRuntime = spawnSync(
        'docker',
        ['inspect', '--format', '{{.HostConfig.Runtime}}', activeNames[0]],
        { encoding: 'utf8' }
      ).stdout.trim();
      assert.equal(
        inspectedRuntime,
        DOCKER_RUNTIME,
        `Active container ${activeNames[0]} must actually execute under ${DOCKER_RUNTIME}, got ${inspectedRuntime}`
      );
      console.log(`[live-docker] Verified live container ${activeNames[0]} HostConfig.Runtime=${inspectedRuntime}`);
    }

    const req2 = await fetch(`${smallUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WORKER_TOKEN}` },
      body: JSON.stringify({ language: 'python3', sourceCode: 'print("second")', timeoutMs: 8000 }),
    });
    assert.equal(req2.status, 503);
    assert.equal(req2.headers.get('retry-after'), '2');
    const res1 = await req1;
    assert.equal(res1.status, 200);

    // 5b. Client disconnect cancellation immediately kills and removes the container
    const abortCtrl = new AbortController();
    const cancelledPromise = fetch(`${smallUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WORKER_TOKEN}` },
      body: JSON.stringify({
        language: 'python3',
        sourceCode: 'import time; time.sleep(15)',
        timeoutMs: 15000,
      }),
      signal: abortCtrl.signal,
    }).catch(() => null);
    await new Promise((r) => setTimeout(r, 400));
    abortCtrl.abort();
    await cancelledPromise;
    await new Promise((r) => setTimeout(r, 700));
    const healthAfterCancel = await (await fetch(`${smallUrl}/health`)).json();
    assert.equal(healthAfterCancel.activeJobs, 0, 'Worker activeJobs must return to 0 after client disconnect');
  } finally {
    await close(smallWorker);
  }

  // 5c. Worker completely unreachable -> Express returns 503 provider_unavailable (never host execution)
  const deadPortServer = createServer();
  const deadUrl = await listen(deadPortServer);
  await close(deadPortServer);
  const outageApp = express();
  outageApp.use(express.json({ limit: '512kb' }));
  registerSubmissions(outageApp, {
    db,
    rateLimitMax: 50,
    provider: createIsolatedJudgeProvider({ baseUrl: deadUrl, token: WORKER_TOKEN }),
  });
  outageApp.use(safeErrors);
  const outageApi = createServer(outageApp);
  const outageApiUrl = await listen(outageApi);
  try {
    const outageRes = await fetch(`${outageApiUrl}/api/problems/live-add/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'javascript', code: 'function add(a, b) { return a + b; }' }),
    });
    assert.equal(outageRes.status, 503);
    const outageBody = await outageRes.json();
    assert.equal(outageBody.executionStatus, 'provider_unavailable');
    assert.equal(outageBody.verified, false);
    assert.equal(outageBody.saved, false);
  } finally {
    await close(outageApi);
  }

  // 5d. Real Docker daemon outage via nonexistent DOCKER_HOST socket -> 503 fail-closed
  const brokenEnv = { ...process.env, DOCKER_HOST: 'unix:///tmp/alvio-nonexistent-docker.sock' };
  const brokenWorker = createJudgeWorkerServer({
    token: WORKER_TOKEN,
    adapter: createDockerRuntimeAdapter('docker', brokenEnv),
    env: brokenEnv,
  });
  const brokenUrl = await listen(brokenWorker);
  try {
    const health = await fetch(`${brokenUrl}/health`);
    assert.equal(health.status, 503);
    const execRes = await fetch(`${brokenUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WORKER_TOKEN}` },
      body: JSON.stringify({ language: 'javascript', sourceCode: 'console.log(1)' }),
    });
    assert.equal(execRes.status, 503);
  } finally {
    await close(brokenWorker);
  }
});

test('6. Zero orphaned alvio-judge containers remain after all live tests', () => {
  const ps = spawnSync('docker', ['ps', '-a', '--filter', 'name=alvio-judge-', '--format', '{{.Names}}'], {
    encoding: 'utf8',
  });
  assert.equal(ps.status, 0);
  assert.equal(ps.stdout.trim(), '', `Orphaned judge containers found: ${ps.stdout}`);
});
