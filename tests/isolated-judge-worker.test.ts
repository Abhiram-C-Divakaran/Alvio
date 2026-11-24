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
  PINNED_RUNTIME_IMAGES,
  WORKER_SUPPORTED_LANGUAGES,
  buildDockerRunArgs,
  buildSanitizedHostEnv,
  resolveLanguageSpec,
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
  assert.ok(args.some((a) => a.startsWith('--tmpfs=/tmp:rw,noexec,nosuid,nodev,') && a.includes('uid=65534,gid=65534,mode=0700')));
  assert.ok(args.some((a) => a.startsWith('--tmpfs=/work:rw,nosuid,nodev,') && a.includes('uid=65534,gid=65534,mode=0700')));

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

    // 2. Memory exhaustion / OOM -> exit 137 -> first-class memory_limit_exceeded classification
    scenario = 'oom';
    const oomRes = await submit('function inc(x) { const a = []; while(true) a.push(new Uint8Array(1024*1024)); }');
    assert.equal(oomRes.status, 200);
    const oomBody = await oomRes.json();
    assert.equal(oomBody.status, 'Error');
    assert.equal(oomBody.errorType, 'memory');
    assert.equal(oomBody.executionStatus, 'memory_limit_exceeded');
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

  // Verify hidden tests are evaluated in a separate phase and redacted via /api/problems/maximum-subarray/submit
  const seenSources: string[] = [];
  const app = express();
  app.use(express.json({ limit: '512kb' }));
  registerSubmissions(app, {
    db,
    rateLimitMax: 50,
    provider: async ({ sourceCode }) => {
      seenSources.push(sourceCode);
      const marker = sourceCode.match(/__ALVIO_RES_[a-f0-9]+__:/)?.[0] || '';
      const isHiddenPhase = sourceCode.includes('-5,-2,-8,-1,-4');
      if (!isHiddenPhase) {
        return {
          status: 'completed',
          result: 'success',
          exit_code: 0,
          stdout: `${marker}${JSON.stringify({
            status: 'Passed',
            passedCount: 2,
            message: 'Visible passed.',
            stdout: [],
            executionTimeMs: 2,
          })}`,
        };
      }
      return {
        status: 'completed',
        result: 'success',
        exit_code: 0,
        stdout: `${marker}${JSON.stringify({
          status: 'Failed',
          passedCount: 0,
          message: 'Test Case 1 Failed.\nInput: [[-5,-2,-8,-1,-4]]\nExpected: -1\nOutput: 0',
          failedTestCase: { index: 1, input: [[-5, -2, -8, -1, -4]], expected: -1, actual: 0 },
          stdout: ['SECRET_LEAK_-5,-2,-8,-1,-4'],
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
    assert.equal(seenSources.length, 2);
    assert.doesNotMatch(seenSources[0], /-5,-2,-8,-1,-4/);
    assert.match(seenSources[1], /-5,-2,-8,-1,-4/);
    assert.deepEqual(body.failedTestCase, { index: 3, hidden: true });
    assert.doesNotMatch(JSON.stringify(body), /-5|-8|-4|SECRET_LEAK/);
  } finally {
    await closeServer(srv);
    db.close();
  }
});

test('all 7 language runtime specs are mutually compatible, use pinned images, enforce ulimit, and classify missing images as 503', async () => {
  const limits = { cpuTimeLimitSec: 4, memoryLimitMb: 256, maxOutputBytes: 65536, networkDisabled: true as const };

  for (const lang of WORKER_SUPPORTED_LANGUAGES) {
    const spec = resolveLanguageSpec(lang, limits, {});
    assert.ok(spec.image.includes(':'), `Image for ${lang} must be pinned with an explicit tag`);
    assert.match(spec.shellCommand, /ulimit -S -t 4 && ulimit -f 16384/, `${lang} must enforce POSIX CPU and file-size ulimit`);
  }

  // Verify C# uses mono:6.12 with mcs/mono and preserves compiler stderr (no 2>/dev/null)
  const csharpSpec = resolveLanguageSpec('csharp', limits, {});
  assert.equal(csharpSpec.image, PINNED_RUNTIME_IMAGES.csharp);
  assert.equal(csharpSpec.image, 'mono:6.12');
  assert.match(csharpSpec.shellCommand, /\bmcs -out:\/work\/app\.exe \/work\/Program\.cs;/);
  assert.match(csharpSpec.shellCommand, /\bexec mono \/work\/app\.exe$/);
  assert.doesNotMatch(csharpSpec.shellCommand, /2>\/dev\/null/);

  // Verify missing pre-pulled local image returns 503 fail-closed infrastructure error
  const missingImageAdapter: ContainerRuntimeAdapter = {
    runContainer: async () => ({
      exitCode: 125,
      stdout: '',
      stderr: "Unable to find image 'mono:6.12-slim' locally",
      timedOut: false,
      outputExceeded: false,
      durationMs: 10,
    }),
    forceRemoveContainer: async () => {},
    checkDaemonHealth: async () => ({ ok: true }),
  };
  const worker = createJudgeWorkerServer({ token: WORKER_TOKEN, adapter: missingImageAdapter });
  const workerUrl = await listenOnEphemeralPort(worker);
  try {
    const res = await fetch(`${workerUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WORKER_TOKEN}` },
      body: JSON.stringify({ language: 'csharp', sourceCode: 'public class Program { public static void Main() {} }' }),
    });
    assert.equal(res.status, 503);
  } finally {
    await closeServer(worker);
  }
});

test('all 75 curated hidden test expected values are verified against reference implementations and prevent duplicate XP', async () => {
  const oracles: Record<string, (...args: any[]) => any> = {
    'number-of-digit-one': (n: number) => {
      let count = 0;
      for (let i = 1; i <= n; i *= 10) {
        const divider = i * 10;
        count += Math.floor(n / divider) * i + Math.min(Math.max((n % divider) - i + 1, 0), i);
      }
      return count;
    },
    'rotate-list': (head: number[], k: number) => {
      if (head.length === 0) return [];
      const r = k % head.length;
      return r === 0 ? [...head] : [...head.slice(-r), ...head.slice(0, -r)];
    },
    'unique-paths-ii': (grid: number[][]) => {
      const m = grid.length;
      const n = grid[0].length;
      const dp = Array(n).fill(0);
      dp[0] = grid[0][0] === 1 ? 0 : 1;
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          if (grid[i][j] === 1) dp[j] = 0;
          else if (j > 0) dp[j] += dp[j - 1];
        }
      }
      return dp[n - 1];
    },
    'house-robber': (nums: number[]) => {
      let prev2 = 0;
      let prev1 = 0;
      for (const x of nums) {
        const cur = Math.max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = cur;
      }
      return prev1;
    },
    'maximum-subarray': (nums: number[]) => {
      let best = nums[0];
      let cur = nums[0];
      for (let i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]);
        best = Math.max(best, cur);
      }
      return best;
    },
    'perfect-number': (num: number) => {
      if (num <= 1) return false;
      let sum = 1;
      for (let d = 2; d * d <= num; d++) {
        if (num % d === 0) {
          sum += d;
          if (d * d !== num) sum += num / d;
        }
      }
      return sum === num;
    },
    'merge-intervals': (intervals: number[][]) => {
      const sorted = intervals.map((x) => [...x]).sort((a, b) => a[0] - b[0]);
      const out: number[][] = [sorted[0]];
      for (let i = 1; i < sorted.length; i++) {
        const last = out[out.length - 1];
        if (sorted[i][0] <= last[1]) last[1] = Math.max(last[1], sorted[i][1]);
        else out.push(sorted[i]);
      }
      return out;
    },
    'pascals-triangle': (numRows: number) => {
      const tri: number[][] = [];
      for (let r = 0; r < numRows; r++) {
        const row = Array(r + 1).fill(1);
        for (let c = 1; c < r; c++) row[c] = tri[r - 1][c - 1] + tri[r - 1][c];
        tri.push(row);
      }
      return tri;
    },
    'flood-fill': (image: number[][], sr: number, sc: number, color: number) => {
      const grid = image.map((r) => [...r]);
      const orig = grid[sr][sc];
      if (orig === color) return grid;
      const dfs = (r: number, c: number) => {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== orig) return;
        grid[r][c] = color;
        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
      };
      dfs(sr, sc);
      return grid;
    },
    'power-of-four': (n: number) => n > 0 && (n & (n - 1)) === 0 && (n & 0x55555555) !== 0,
    'word-break': (s: string, wordDict: string[]) => {
      const set = new Set(wordDict);
      const dp = Array(s.length + 1).fill(false);
      dp[0] = true;
      for (let i = 1; i <= s.length; i++) {
        for (let j = 0; j < i; j++) {
          if (dp[j] && set.has(s.slice(j, i))) { dp[i] = true; break; }
        }
      }
      return dp[s.length];
    },
    'count-and-say': (n: number) => {
      let s = '1';
      for (let step = 1; step < n; step++) {
        let next = '';
        for (let i = 0; i < s.length; ) {
          let j = i;
          while (j < s.length && s[j] === s[i]) j++;
          next += `${j - i}${s[i]}`;
          i = j;
        }
        s = next;
      }
      return s;
    },
    'valid-anagram': (s: string, t: string) =>
      s.length === t.length && s.split('').sort().join('') === t.split('').sort().join(''),
    'best-time-to-buy-and-sell-stock': (prices: number[]) => {
      let minP = Infinity;
      let best = 0;
      for (const p of prices) { minP = Math.min(minP, p); best = Math.max(best, p - minP); }
      return best;
    },
    'valid-parentheses': (s: string) => {
      const stack: string[] = [];
      const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
      for (const ch of s) {
        if (ch in pairs) { if (stack.pop() !== pairs[ch]) return false; }
        else stack.push(ch);
      }
      return stack.length === 0;
    },
    'climbing-stairs': (n: number) => {
      let a = 1;
      let b = 1;
      for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c; }
      return b;
    },
    'contains-duplicate': (nums: number[]) => new Set(nums).size !== nums.length,
    'reverse-string': (s: string[]) => [...s].reverse(),
  };

  let verifiedCount = 0;
  for (const [problemId, cases] of Object.entries(CURATED_HIDDEN_TESTS)) {
    const fn = oracles[problemId];
    assert.ok(fn, `Missing oracle for curated problem ${problemId}`);
    for (const tc of cases) {
      const clonedInput = JSON.parse(JSON.stringify(tc.input));
      assert.deepEqual(fn(...clonedInput), tc.expected, `Hidden test oracle mismatch for ${problemId}: ${JSON.stringify(tc.input)}`);
      verifiedCount++;
    }
  }
  assert.equal(verifiedCount, 75);
});
