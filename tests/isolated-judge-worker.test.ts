import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../server/migrations';
import { loadProblemCatalog, seedProblemCatalog } from '../server/problemCatalog';
import { CURATED_HIDDEN_TESTS, seedHiddenTests } from '../server/seedHiddenTests';
import { registerSubmissions } from '../server/submissions';
import { createIsolatedJudgeProvider } from '../server/submissionRunner';
import { safeErrors } from '../server/security';
import {
  COMPILE_FAIL_SENTINEL,
  buildDockerRunArgs,
  buildSanitizedHostEnv,
  type ContainerRunInput,
  type ContainerRunOutput,
  type ContainerRuntimeAdapter,
} from '../judge-worker/sandbox';
import { createJudgeWorkerServer } from '../judge-worker/server';

const WORKER_TOKEN = 'test-isolated-judge-worker-token-32bytes-minimum-secret';

async function listenOnEphemeralPort(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('Failed to bind ephemeral port.');
  return `http://127.0.0.1:${addr.port}`;
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

test('buildDockerRunArgs enforces strict container isolation and strips host secrets', () => {
  const dirtyEnv: NodeJS.ProcessEnv = {
    PATH: '/usr/bin:/bin',
    JWT_SECRET: 'super-secret-jwt-value',
    GROQ_API_KEY: 'gsk_super_secret_key',
    ISOLATED_JUDGE_TOKEN: WORKER_TOKEN,
    DATABASE_PATH: '/var/lib/alvio/database.sqlite',
  };

  const args = buildDockerRunArgs({
    language: 'python3',
    limits: { cpuTimeLimitSec: 4, memoryLimitMb: 128, maxOutputBytes: 65536, networkDisabled: true },
    containerName: 'alvio-judge-test123',
    runtime: 'runsc',
    env: dirtyEnv,
  });

  assert.ok(args.includes('--rm'));
  assert.ok(args.includes('--network=none'));
  assert.ok(args.includes('--read-only'));
  assert.ok(args.includes('--cap-drop=ALL'));
  assert.ok(args.includes('--security-opt=no-new-privileges:true'));
  assert.ok(args.includes('--pids-limit=64'));
  assert.ok(args.includes('--memory=128m'));
  assert.ok(args.includes('--memory-swap=128m'));
  assert.ok(args.includes('--cpus=1'));
  assert.ok(args.includes('--user=65534:65534'));
  assert.ok(args.includes('--runtime=runsc'));
  assert.ok(args.some((a) => a.startsWith('--tmpfs=/tmp:rw,noexec,nosuid,nodev,')));
  assert.ok(args.some((a) => a.startsWith('--tmpfs=/work:rw,nosuid,nodev,')));

  // Never bind-mount any host filesystem path
  assert.equal(args.some((a) => a === '-v' || a === '--volume' || a.startsWith('--mount')), false);

  // Never leak host secrets into container args or docker CLI spawn env
  const joinedArgs = args.join(' ');
  assert.doesNotMatch(joinedArgs, /super-secret-jwt|gsk_super_secret|database\.sqlite/);

  const sanitized = buildSanitizedHostEnv(dirtyEnv);
  assert.equal(sanitized.PATH, '/usr/bin:/bin');
  assert.equal(sanitized.JWT_SECRET, undefined);
  assert.equal(sanitized.GROQ_API_KEY, undefined);
  assert.equal(sanitized.ISOLATED_JUDGE_TOKEN, undefined);
  assert.equal(sanitized.DATABASE_PATH, undefined);
});

test('judge worker enforces timing-safe bearer auth, validates payloads, and reports health', async () => {
  assert.throws(() => createJudgeWorkerServer({ token: 'short' }), /at least 16 characters/);

  let daemonUp = true;
  const adapter: ContainerRuntimeAdapter = {
    runContainer: async () => ({
      exitCode: 0,
      stdout: 'ok',
      stderr: '',
      timedOut: false,
      outputExceeded: false,
      durationMs: 12,
    }),
    forceRemoveContainer: async () => {},
    checkDaemonHealth: async () => (daemonUp ? { ok: true, detail: 'docker 29.8.2' } : { ok: false, detail: 'down' }),
  };

  const worker = createJudgeWorkerServer({ token: WORKER_TOKEN, adapter });
  const baseUrl = await listenOnEphemeralPort(worker);

  try {
    // Health reports 200 when Docker daemon is reachable and 503 when unavailable
    const healthy = await fetch(`${baseUrl}/health`);
    assert.equal(healthy.status, 200);
    const healthyBody = await healthy.json();
    assert.equal(healthyBody.status, 'ok');
    assert.equal(healthyBody.docker, 'ok');

    daemonUp = false;
    const degraded = await fetch(`${baseUrl}/health`);
    assert.equal(degraded.status, 503);
    const degradedBody = await degraded.json();
    assert.equal(degradedBody.docker, 'unavailable');
    daemonUp = true;

    // Missing or bad bearer token -> 401
    for (const auth of [undefined, '', 'Basic abc', 'Bearer wrong-token']) {
      const res = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(auth !== undefined ? { Authorization: auth } : {}) },
        body: JSON.stringify({ language: 'javascript', sourceCode: 'console.log(1)' }),
      });
      assert.equal(res.status, 401);
    }

    // Invalid language or NUL bytes -> 400
    const badLang = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WORKER_TOKEN}` },
      body: JSON.stringify({ language: 'bash', sourceCode: 'id' }),
    });
    assert.equal(badLang.status, 400);

    const nulCode = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WORKER_TOKEN}` },
      body: JSON.stringify({ language: 'javascript', sourceCode: 'a\0b' }),
    });
    assert.equal(nulCode.status, 400);
  } finally {
    await closeServer(worker);
  }
});

test('end-to-end Express -> isolated judge worker handles timeout, OOM, output flood, compile error, concurrency, and daemon failure', async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || randomBytes(48).toString('hex');
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);
  db.prepare(
    `INSERT INTO problems (id, title, difficulty, description, examples, constraints, signature, starterCode, testCases)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    'judge-security-prob',
    'Judge Security Test',
    'Easy',
    'Return x + 1.',
    '[]',
    '[]',
    JSON.stringify({ name: 'inc', params: [{ name: 'x', type: 'integer' }], returns: 'integer' }),
    '{}',
    JSON.stringify([{ input: [1], expected: 2 }])
  );

  type Scenario = 'timeout' | 'oom' | 'output-overflow' | 'compile-error' | 'daemon-down' | 'slow-concurrency';
  let scenario: Scenario = 'timeout';
  const removedContainers: string[] = [];
  let releaseSlowJob: (() => void) | null = null;
  const capturedInputs: ContainerRunInput[] = [];

  const adapter: ContainerRuntimeAdapter = {
    runContainer: async (input): Promise<ContainerRunOutput> => {
      capturedInputs.push(input);
      if (scenario === 'timeout') {
        return { exitCode: null, stdout: '', stderr: '', timedOut: true, outputExceeded: false, durationMs: 5002 };
      }
      if (scenario === 'oom') {
        return { exitCode: 137, stdout: '', stderr: 'Killed', timedOut: false, outputExceeded: false, durationMs: 310 };
      }
      if (scenario === 'output-overflow') {
        return {
          exitCode: null,
          stdout: 'A'.repeat(input.maxOutputBytes),
          stderr: '',
          timedOut: false,
          outputExceeded: true,
          durationMs: 42,
        };
      }
      if (scenario === 'compile-error') {
        return {
          exitCode: 1,
          stdout: '',
          stderr: `main.cpp:4:1: error: expected ';'\n${COMPILE_FAIL_SENTINEL}\n`,
          timedOut: false,
          outputExceeded: false,
          durationMs: 85,
        };
      }
      if (scenario === 'daemon-down') {
        return {
          exitCode: 1,
          stdout: '',
          stderr: 'failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine',
          timedOut: false,
          outputExceeded: false,
          durationMs: 12,
        };
      }
      // slow-concurrency: hold job open until released so second concurrent request hits capacity
      await new Promise<void>((resolve) => {
        releaseSlowJob = resolve;
      });
      const marker = input.stdin.match(/__ALVIO_RES_[a-f0-9]+__:/)?.[0] || '';
      return {
        exitCode: 0,
        stdout: `${marker}${JSON.stringify({ status: 'Passed', passedCount: 1, message: 'ok', stdout: [], executionTimeMs: 5 })}`,
        stderr: '',
        timedOut: false,
        outputExceeded: false,
        durationMs: 25,
      };
    },
    forceRemoveContainer: async (name) => {
      removedContainers.push(name);
    },
    checkDaemonHealth: async () => ({ ok: scenario !== 'daemon-down' }),
  };

  const worker = createJudgeWorkerServer({ token: WORKER_TOKEN, maxConcurrentJobs: 1, adapter });
  const workerUrl = await listenOnEphemeralPort(worker);

  const app = express();
  app.use(express.json({ limit: '512kb' }));
  registerSubmissions(app, {
    db,
    rateLimitMax: 100,
    provider: createIsolatedJudgeProvider({
      baseUrl: workerUrl,
      token: WORKER_TOKEN,
      limits: { cpuTimeLimitSec: 3, memoryLimitMb: 128, maxOutputBytes: 65536 },
    }),
  });
  app.use(safeErrors);

  const apiServer = createServer(app);
  const apiUrl = await listenOnEphemeralPort(apiServer);

  const submit = (code: string, language = 'javascript') =>
    fetch(`${apiUrl}/api/problems/judge-security-prob/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });

  try {
    // 1. Malicious infinite loop -> forced container removal + TLE verdict
    scenario = 'timeout';
    const tleRes = await submit('function inc(x) { while(true) {} }');
    assert.equal(tleRes.status, 200);
    const tleBody = await tleRes.json();
    assert.equal(tleBody.status, 'Error');
    assert.equal(tleBody.executionStatus, 'time_limit_exceeded');
    assert.equal(removedContainers.length, 1);

    // 2. Memory exhaustion / OOM -> exit 137 -> clean runtime error mentioning memory limit
    scenario = 'oom';
    const oomRes = await submit('function inc(x) { const a = []; while(true) a.push(new Uint8Array(1024*1024)); }');
    assert.equal(oomRes.status, 200);
    const oomBody = await oomRes.json();
    assert.equal(oomBody.status, 'Error');
    assert.equal(oomBody.executionStatus, 'runtime_error');
    assert.match(oomBody.message, /Memory Limit Exceeded/i);

    // 3. Output overflow flood -> container force-removed, bounded response, never accepted
    scenario = 'output-overflow';
    const floodRes = await submit('function inc(x) { while(true) console.log("flood"); }');
    assert.equal(floodRes.status, 200);
    const floodBody = await floodRes.json();
    assert.equal(floodBody.status, 'Error');
    assert.match(floodBody.message, /Output Limit Exceeded/i);
    assert.equal(removedContainers.length, 2);

    // 4. Compilation error in C++ -> compilation_error
    scenario = 'compile-error';
    const compileRes = await submit('class Solution { public: int inc(int x) { return x + 1 } };', 'cpp');
    assert.equal(compileRes.status, 200);
    const compileBody = await compileRes.json();
    assert.equal(compileBody.status, 'Error');
    assert.equal(compileBody.executionStatus, 'compilation_error');

    // 5. Docker daemon failure -> 503 provider_unavailable (NEVER falls back to host execution)
    scenario = 'daemon-down';
    const downRes = await submit('function inc(x) { return x + 1; }');
    assert.equal(downRes.status, 503);
    const downBody = await downRes.json();
    assert.equal(downBody.executionStatus, 'provider_unavailable');

    // 6. Concurrency saturation (maxConcurrentJobs=1) -> second request gets 503 Retry-After
    scenario = 'slow-concurrency';
    const req1Promise = fetch(`${workerUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WORKER_TOKEN}` },
      body: JSON.stringify({ language: 'javascript', sourceCode: 'console.log(1)' }),
    });
    // Wait briefly for job 1 to enter runContainer
    for (let i = 0; i < 50 && !releaseSlowJob; i++) {
      await new Promise((r) => setTimeout(r, 10));
    }
    assert.ok(releaseSlowJob, 'First job should be running inside adapter');

    const req2 = await fetch(`${workerUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WORKER_TOKEN}` },
      body: JSON.stringify({ language: 'javascript', sourceCode: 'console.log(2)' }),
    });
    assert.equal(req2.status, 503);
    assert.equal(req2.headers.get('retry-after'), '2');

    releaseSlowJob();
    const req1 = await req1Promise;
    assert.equal(req1.status, 200);

    // Verify every container invocation enforced --network=none and --memory=128m
    assert.ok(capturedInputs.length >= 5);
    for (const invocation of capturedInputs) {
      assert.ok(invocation.args.includes('--network=none'));
      assert.ok(invocation.args.includes('--read-only'));
      assert.ok(invocation.args.includes('--cap-drop=ALL'));
    }
  } finally {
    await closeServer(apiServer);
    await closeServer(worker);
    db.close();
  }
});

test('curated hidden test suite seeds idempotently across 18 catalog problems, matches signatures, and redacts hidden failures', async () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);

  const catalog = loadProblemCatalog();
  seedProblemCatalog(db, catalog);
  const catalogById = new Map(catalog.map((p) => [p.id, p]));

  const firstRun = seedHiddenTests(db);
  assert.equal(firstRun.problemsMatched, Object.keys(CURATED_HIDDEN_TESTS).length);
  assert.equal(firstRun.problemsSkipped, 0);
  assert.ok(firstRun.inserted >= 70, `Expected >= 70 hidden test cases, got ${firstRun.inserted}`);
  assert.equal(firstRun.alreadyPresent, 0);

  // Re-seeding must be strictly idempotent
  const secondRun = seedHiddenTests(db);
  assert.equal(secondRun.inserted, 0);
  assert.equal(secondRun.alreadyPresent, firstRun.inserted);

  // Every hidden test case must match problem signature arity and not duplicate visible cases
  for (const [problemId, hiddenCases] of Object.entries(CURATED_HIDDEN_TESTS)) {
    const problem = catalogById.get(problemId);
    assert.ok(problem, `Problem ${problemId} must exist in catalog`);
    const visibleInputs = new Set(problem.testCases.map((tc: any) => JSON.stringify(tc.input)));
    for (const hc of hiddenCases) {
      assert.equal(
        hc.input.length,
        problem.signature.params.length,
        `Hidden test arity mismatch on ${problemId}`
      );
      assert.equal(
        visibleInputs.has(JSON.stringify(hc.input)),
        false,
        `Hidden test duplicates visible input on ${problemId}: ${JSON.stringify(hc.input)}`
      );
    }
  }

  // Verify hidden tests are evaluated and redacted via /api/problems/maximum-subarray/submit
  const app = express();
  app.use(express.json({ limit: '512kb' }));
  registerSubmissions(app, {
    db,
    rateLimitMax: 50,
    provider: async ({ sourceCode }) => {
      const marker = sourceCode.match(/__ALVIO_RES_[a-f0-9]+__:/)?.[0] || '';
      // Confirm hidden negative-only edge case [-5,-2,-8,-1,-4] was included in server wrapper
      assert.match(sourceCode, /-5,-2,-8,-1,-4/);
      return {
        status: 'completed',
        result: 'success',
        exit_code: 0,
        stdout: `${marker}${JSON.stringify({
          status: 'Failed',
          passedCount: 2,
          message: 'Test Case 3 Failed.\nInput: [[-5,-2,-8,-1,-4]]\nExpected: -1\nOutput: 0',
          failedTestCase: { index: 3, input: [[-5, -2, -8, -1, -4]], expected: -1, actual: 0 },
          stdout: [],
          executionTimeMs: 4,
        })}`,
      };
    },
  });
  app.use(safeErrors);

  const srv = createServer(app);
  const origin = await listenOnEphemeralPort(srv);
  try {
    const res = await fetch(`${origin}/api/problems/maximum-subarray/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'function maxSubArray(nums) { return nums.length === 1 ? 1 : 6; }', language: 'javascript' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'Failed');
    assert.equal(body.visibleCount, 2);
    assert.equal(body.hiddenCount, 4);
    assert.equal(body.totalCount, 6);
    assert.deepEqual(body.failedTestCase, { index: 3, hidden: true });
    assert.doesNotMatch(body.message, /-5|-8|-4/);
  } finally {
    await closeServer(srv);
    db.close();
  }
});
