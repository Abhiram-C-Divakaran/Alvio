import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../server/migrations';
import { registerSubmissions } from '../server/submissions';
import {
  createPaizaProvider,
  evaluateSubmission,
  ExecutionProviderError,
  generateExecutionWrapper,
  type ExecutionProvider,
  type ProviderExecutionRequest,
  type ProviderExecutionResponse,
  type SubmissionProblem,
} from '../server/submissionRunner';
import { safeErrors } from '../server/security';

const TEST_PROBLEM: SubmissionProblem = {
  id: 'add-two-numbers-test',
  title: 'Add Two Numbers',
  signature: {
    name: 'add',
    params: [
      { name: 'a', type: 'integer' },
      { name: 'b', type: 'integer' },
    ],
    returns: 'integer',
  },
  testCases: [
    { input: [1, 2], expected: 3 },
    { input: [10, 20], expected: 30 },
    { input: [-5, 5], expected: 0 },
  ],
};

const MATRIX_PROBLEM: SubmissionProblem = {
  id: 'matrix-test',
  title: 'Matrix Sum',
  signature: {
    name: 'matrixSum',
    params: [{ name: 'grid', type: 'integer[][]' }],
    returns: 'integer[][]',
  },
  testCases: [{ input: [[[1, 2], [3, 4]]], expected: [[1, 2], [3, 4]] }],
};

function extractMarker(sourceCode: string): string {
  const match = sourceCode.match(/__ALVIO_RES_[a-f0-9]+__:/);
  assert.ok(match, 'Runner wrapper must embed a unique per-run result marker');
  return match[0];
}

let db: DatabaseSync;
let server: Server;
let origin: string;
let mockProviderImpl: ExecutionProvider;
const SIGNED_IN_USER_ID = 1;
const VALID_TOKEN = 'test-valid-token';

function createAuthMiddleware(required: boolean): express.RequestHandler {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (header === undefined) {
      if (required) {
        res.status(401).json({ error: 'Please sign in again.', code: 'UNAUTHORIZED' });
        return;
      }
      next();
      return;
    }
    if (header === `Bearer ${VALID_TOKEN}`) {
      req.userId = SIGNED_IN_USER_ID;
      next();
      return;
    }
    res.status(401).json({ error: 'Please sign in again.', code: 'UNAUTHORIZED' });
  };
}

async function apiPost(path: string, body: unknown, token?: string) {
  return fetch(`${origin}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token !== undefined ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function apiGet(path: string, token?: string) {
  return fetch(`${origin}${path}`, {
    headers: token !== undefined ? { Authorization: `Bearer ${token}` } : {},
  });
}

before(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || randomBytes(48).toString('hex');
  db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);

  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(
    SIGNED_IN_USER_ID,
    'student@example.test',
    'unused-hash',
    'Student One'
  );

  const insertProblem = db.prepare(`
    INSERT INTO problems (id, title, topic, difficulty, description, examples, constraints, signature, starterCode, testCases)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProblem.run(
    TEST_PROBLEM.id,
    TEST_PROBLEM.title,
    'Math',
    'Easy',
    'Return a + b.',
    JSON.stringify([{ input: 'a = 1, b = 2', output: '3' }]),
    JSON.stringify(['-1000 <= a, b <= 1000']),
    JSON.stringify(TEST_PROBLEM.signature),
    JSON.stringify({ javascript: 'function add(a, b) {}' }),
    JSON.stringify(TEST_PROBLEM.testCases)
  );
  insertProblem.run(
    MATRIX_PROBLEM.id,
    MATRIX_PROBLEM.title,
    'Matrix',
    'Medium',
    'Return grid.',
    JSON.stringify([{ input: 'grid = [[1,2],[3,4]]', output: '[[1,2],[3,4]]' }]),
    JSON.stringify(['1 <= grid.length <= 10']),
    JSON.stringify(MATRIX_PROBLEM.signature),
    JSON.stringify({ javascript: 'function matrixSum(grid) {}' }),
    JSON.stringify(MATRIX_PROBLEM.testCases)
  );

  const app = express();
  app.use(express.json({ limit: '512kb' }));
  registerSubmissions(app, {
    db,
    provider: (req) => mockProviderImpl(req),
    timeoutMs: 2000,
    rateLimitMax: 100,
    authOptional: createAuthMiddleware(false),
    authRequired: createAuthMiddleware(true),
  });
  app.use(safeErrors);

  server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address() as { port: number };
  origin = `http://127.0.0.1:${addr.port}`;
});

beforeEach(() => {
  db.exec('DELETE FROM user_submissions; DELETE FROM problem_stats;');
  mockProviderImpl = async ({ sourceCode }: ProviderExecutionRequest): Promise<ProviderExecutionResponse> => {
    const marker = extractMarker(sourceCode);
    return {
      status: 'completed',
      build_result: 'success',
      result: 'success',
      exit_code: 0,
      time: '0.12',
      stdout: `${marker}${JSON.stringify({ status: 'Passed', passedCount: 3, stdout: ['debug log'], executionTimeMs: 42 })}`,
    };
  };
});

after(async () => {
  await new Promise<void>((resolve) => server?.close(() => resolve()));
  db?.close();
});

test('1. Correct solution returns Passed and updates problem stats', async () => {
  const res = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  }, VALID_TOKEN);

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'Passed');
  assert.equal(body.passedCount, 3);
  assert.equal(body.totalCount, 3);
  assert.equal(body.verified, true);
  assert.equal(body.saved, true);
  assert.equal(body.executionTimeMs, 42);
  assert.deepEqual(body.stdout, ['debug log']);
  assert.deepEqual(body.stats, { accepted: 1, submissions: 1 });
});

test('2. Incorrect solution returns Failed and increments submissions without accepted', async () => {
  mockProviderImpl = async ({ sourceCode }) => {
    const marker = extractMarker(sourceCode);
    return {
      status: 'completed',
      build_result: 'success',
      result: 'success',
      exit_code: 0,
      time: '0.09',
      stdout: `${marker}${JSON.stringify({
        status: 'Failed',
        passedCount: 1,
        message: 'Test Case 2 Failed.\nInput: [10,20]\nExpected: 30\nOutput: 10',
        stdout: [],
        executionTimeMs: 18,
      })}`,
    };
  };

  const res = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'function add(a, b) { return a; }',
    language: 'javascript',
  }, VALID_TOKEN);

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'Failed');
  assert.equal(body.passedCount, 1);
  assert.equal(body.totalCount, 3);
  assert.match(body.message, /Test Case 2 Failed/);
  assert.deepEqual(body.stats, { accepted: 0, submissions: 1 });
});

test('3. Compilation error returns Error with compilation errorType', async () => {
  mockProviderImpl = async () => ({
    status: 'completed',
    build_result: 'failure',
    build_stderr: 'Main.java:3: error: ";" expected',
    result: null,
  });

  const res = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'class Solution { public int add(int a, int b) { return a + b } }',
    language: 'java',
  }, VALID_TOKEN);

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'Error');
  assert.equal(body.errorType, 'compilation');
  assert.equal(body.passedCount, 0);
  assert.equal(body.totalCount, 3);
  assert.match(body.message, /Compilation Error/);
  assert.match(body.message, /Main\.java:3/);
});

test('4. Runtime error returns Error with runtime errorType', async () => {
  mockProviderImpl = async ({ sourceCode }) => {
    const marker = extractMarker(sourceCode);
    return {
      status: 'completed',
      build_result: 'success',
      result: 'success',
      exit_code: 0,
      stdout: `${marker}${JSON.stringify({
        status: 'Error',
        errorType: 'runtime',
        message: 'ZeroDivisionError: division by zero',
        passedCount: 0,
        stdout: [],
      })}`,
    };
  };

  const res = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'def add(a, b):\n    return a / 0',
    language: 'python3',
  }, VALID_TOKEN);

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'Error');
  assert.equal(body.errorType, 'runtime');
  assert.match(body.message, /ZeroDivisionError/);
});

test('5. Execution timeout returns Error with timeout errorType', async () => {
  mockProviderImpl = async () => ({
    status: 'completed',
    build_result: 'success',
    result: 'timeout',
    exit_code: 137,
    stderr: 'Time limit exceeded',
  });

  const res = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'function add(a, b) { while (true) {} }',
    language: 'javascript',
  }, VALID_TOKEN);

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'Error');
  assert.equal(body.errorType, 'timeout');
  assert.match(body.message, /Time Limit Exceeded/i);
});

test('6. Invalid or unknown problem ID returns appropriate HTTP error', async () => {
  const notFound = await apiPost('/api/problems/does-not-exist/submit', {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  });
  assert.equal(notFound.status, 404);

  const tooLong = await apiPost(`/api/problems/${'x'.repeat(130)}/submit`, {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  });
  assert.equal(tooLong.status, 400);
});

test('7. Invalid language is rejected with 400', async () => {
  for (const language of ['ruby', 'bash', '', null, 123]) {
    const res = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
      code: 'function add(a, b) { return a + b; }',
      language,
    });
    assert.equal(res.status, 400, `Expected 400 for language ${String(language)}`);
  }
});

test('8. Missing, empty, or oversized code is rejected with 400', async () => {
  for (const code of [undefined, null, '', '   \n\t  ', 'x'.repeat(70000)]) {
    const res = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
      code,
      language: 'javascript',
    });
    assert.equal(res.status, 400);
  }
});

test('9. Client sending status: "Passed" is ignored by server', async () => {
  mockProviderImpl = async ({ sourceCode }) => {
    const marker = extractMarker(sourceCode);
    return {
      status: 'completed',
      build_result: 'success',
      result: 'success',
      exit_code: 0,
      stdout: `${marker}${JSON.stringify({ status: 'Failed', passedCount: 0, message: 'Test Case 1 Failed.', stdout: [] })}`,
    };
  };

  const res = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'function add(a, b) { return 0; }',
    language: 'javascript',
    status: 'Passed',
    verified: true,
  }, VALID_TOKEN);

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'Failed');
  assert.equal(body.passedCount, 0);
  assert.deepEqual(body.stats, { accepted: 0, submissions: 1 });
});

test('10. Client sending passedCount: 999 and custom testCases is ignored by server', async () => {
  let capturedSource = '';
  mockProviderImpl = async ({ sourceCode }) => {
    capturedSource = sourceCode;
    const marker = extractMarker(sourceCode);
    return {
      status: 'completed',
      build_result: 'success',
      result: 'success',
      exit_code: 0,
      stdout: `${marker}${JSON.stringify({ status: 'Failed', passedCount: 1, message: 'Wrong Answer', stdout: [] })}`,
    };
  };

  const res = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'function add(a, b) { return 3; }',
    language: 'javascript',
    passedCount: 999,
    passedTestcases: 999,
    totalTestcases: 999,
    testCases: [{ input: [1, 1], expected: 3 }],
  }, VALID_TOKEN);

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.passedCount, 1);
  assert.equal(body.totalCount, 3);
  assert.ok(capturedSource.includes('[10,20]'), 'Server must execute DB test cases, not client test cases');
});

test('11. Provider unavailable or malformed response returns clean 503 Error and never Wrong Answer', async () => {
  mockProviderImpl = async () => {
    throw new ExecutionProviderError('provider', 'Code execution service is temporarily unavailable. Please try again.');
  };

  const unavailable = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  }, VALID_TOKEN);

  assert.equal(unavailable.status, 503);
  const unavailableBody = await unavailable.json();
  assert.equal(unavailableBody.status, 'Error');
  assert.equal(unavailableBody.errorType, 'provider');
  assert.equal(unavailableBody.saved, false);
  assert.equal((db.prepare('SELECT COUNT(*) as c FROM user_submissions').get() as any).c, 0);
  assert.equal((db.prepare('SELECT COUNT(*) as c FROM problem_stats').get() as any).c, 0);

  mockProviderImpl = async () => ({ invalid: true } as any);
  const malformed = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  }, VALID_TOKEN);
  assert.equal(malformed.status, 503);
  const malformedBody = await malformed.json();
  assert.equal(malformedBody.status, 'Error');
  assert.equal(malformedBody.errorType, 'provider');
});

test('12. Guest submission returns verdict without creating a fake account or user_submissions row', async () => {
  const res = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'Passed');
  assert.equal(body.passedCount, 3);
  assert.equal(body.totalCount, 3);
  assert.equal(body.saved, false);
  assert.equal(body.submission, undefined);

  assert.equal((db.prepare('SELECT COUNT(*) as c FROM user_submissions').get() as any).c, 0);
  assert.equal((db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c, 1);

  // Invalid supplied credentials still receive 401 rather than silently becoming guest.
  const badAuth = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  }, 'invalid-token');
  assert.equal(badAuth.status, 401);
});

test('13. Signed-in submission is saved and returned by submission history', async () => {
  const submitRes = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  }, VALID_TOKEN);

  assert.equal(submitRes.status, 200);
  const submitBody = await submitRes.json();
  assert.equal(submitBody.saved, true);
  assert.ok(submitBody.submission.id);

  const historyRes = await apiGet(`/api/problems/${TEST_PROBLEM.id}/submissions`, VALID_TOKEN);
  assert.equal(historyRes.status, 200);
  const history = await historyRes.json();
  assert.equal(history.submission.status, 'Passed');
  assert.equal(history.submission.verified, 1);
  assert.equal(history.submission.passed_testcases, 3);
  assert.equal(history.submission.total_testcases, 3);
  assert.equal(history.submission.language, 'javascript');
  assert.equal(history.submissions.length, 1);
});

test('14. Failed submission is accurately recorded in user_submissions', async () => {
  mockProviderImpl = async ({ sourceCode }) => {
    const marker = extractMarker(sourceCode);
    return {
      status: 'completed',
      build_result: 'success',
      result: 'success',
      exit_code: 0,
      stdout: `${marker}Failed|2`,
    };
  };

  const submitRes = await apiPost(`/api/problems/${TEST_PROBLEM.id}/submit`, {
    code: 'class Solution { public: int add(int a, int b) { return a - b; } };',
    language: 'cpp',
  }, VALID_TOKEN);

  assert.equal(submitRes.status, 200);
  const body = await submitRes.json();
  assert.equal(body.status, 'Failed');
  assert.equal(body.passedCount, 2);
  assert.equal(body.totalCount, 3);
  assert.equal(body.saved, true);

  const history = await (await apiGet(`/api/problems/${TEST_PROBLEM.id}/submissions`, VALID_TOKEN)).json();
  assert.equal(history.submission.status, 'Failed');
  assert.equal(history.submission.verified, 1);
  assert.equal(history.submission.passed_testcases, 2);
  assert.equal(history.submission.total_testcases, 3);
  assert.equal(history.submission.language, 'cpp');
});

test('Wrappers generate valid runners for all 7 languages and reject unsupported C types honestly', async () => {
  const langs = ['javascript', 'typescript', 'python', 'python3', 'cpp', 'c', 'java', 'csharp'] as const;
  for (const lang of langs) {
    const wrapped = generateExecutionWrapper(lang, '/* code */', TEST_PROBLEM, '__M__:');
    assert.ok(wrapped.sourceCode, `Expected runner code for ${lang}`);
    assert.equal(wrapped.unsupportedReason, undefined);
  }

  // Matrix types are unsupported in the C server wrapper; must return Error, never Passed.
  const cMatrix = await evaluateSubmission({
    problem: MATRIX_PROBLEM,
    code: 'int** matrixSum(int** grid) { return grid; }',
    language: 'c',
    provider: async () => {
      throw new Error('Provider should not be called for unsupported types');
    },
  });
  assert.equal(cMatrix.status, 'Error');
  assert.equal(cMatrix.errorType, 'unsupported');
  assert.equal(cMatrix.recordable, false);
});

test('Paiza provider handles create/poll, HTTP 503, malformed JSON, and timeout cleanly', async () => {
  let pollCount = 0;
  const provider = createPaizaProvider({
    baseUrl: 'http://mock-paiza.test',
    pollIntervalMs: 10,
    fetchImpl: (async (url: RequestInfo | URL) => {
      const s = String(url);
      if (s.endsWith('/runners/create')) {
        return Response.json({ id: 'runner-1', status: 'running' });
      }
      pollCount++;
      if (pollCount === 1) return Response.json({ id: 'runner-1', status: 'running' });
      return Response.json({ id: 'runner-1', status: 'completed', result: 'success', exit_code: 0, stdout: 'ok' });
    }) as typeof fetch,
  });

  const ok = await provider({ language: 'javascript', sourceCode: 'console.log(1)', timeoutMs: 500 });
  assert.equal(ok.status, 'completed');
  assert.equal(pollCount, 2);

  const downProvider = createPaizaProvider({
    baseUrl: 'http://mock-paiza.test',
    fetchImpl: (async () => Response.json({ error: 'service down' }, { status: 503 })) as typeof fetch,
  });
  await assert.rejects(
    () => downProvider({ language: 'javascript', sourceCode: '', timeoutMs: 500 }),
    (err: any) => err instanceof ExecutionProviderError && err.kind === 'provider'
  );

  const malformedProvider = createPaizaProvider({
    baseUrl: 'http://mock-paiza.test',
    fetchImpl: (async () => new Response('<html>bad gateway</html>', { status: 502 })) as typeof fetch,
  });
  await assert.rejects(
    () => malformedProvider({ language: 'javascript', sourceCode: '', timeoutMs: 500 }),
    (err: any) => err instanceof ExecutionProviderError && err.kind === 'provider'
  );

  const timeoutProvider = createPaizaProvider({
    baseUrl: 'http://mock-paiza.test',
    pollIntervalMs: 25,
    fetchImpl: (async (url: RequestInfo | URL) => {
      if (String(url).endsWith('/runners/create')) return Response.json({ id: 'runner-slow' });
      return Response.json({ id: 'runner-slow', status: 'running' });
    }) as typeof fetch,
  });
  await assert.rejects(
    () => timeoutProvider({ language: 'javascript', sourceCode: '', timeoutMs: 60 }),
    (err: any) => err instanceof ExecutionProviderError && err.kind === 'timeout'
  );
});

test('Spoofed stdout matching Passed|3 without the per-run marker is rejected', async () => {
  const result = await evaluateSubmission({
    problem: TEST_PROBLEM,
    code: 'console.log("Passed|3"); process.exit(0);',
    language: 'javascript',
    provider: async () => ({
      status: 'completed',
      build_result: 'success',
      result: 'success',
      exit_code: 0,
      stdout: 'Passed|3',
    }),
  });
  assert.equal(result.status, 'Error');
  assert.equal(result.passedCount, 0);
});
