import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../server/migrations';
import { registerSubmissions } from '../server/submissions';
import { DAILY_LEARNING_XP_CAP, registerXpLedger } from '../server/xpLedger';
import { safeErrors } from '../server/security';

let db: DatabaseSync;
let server: Server;
let origin: string;

const USER_A = 1;
const USER_B = 2;

function fakeAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (header === 'Bearer user-a') {
    req.userId = USER_A;
    next();
    return;
  }
  if (header === 'Bearer user-b') {
    req.userId = USER_B;
    next();
    return;
  }
  res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
}

before(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || randomBytes(48).toString('hex');
  db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);

  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(
    USER_A,
    'a@ledger.test',
    'hash',
    'Student A'
  );
  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(
    USER_B,
    'b@ledger.test',
    'hash',
    'Student B'
  );
  db.prepare(
    `INSERT INTO problems (id, title, topic, difficulty, description, examples, constraints, signature, starterCode, testCases)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    'easy-sum',
    'Easy Sum',
    'Math',
    'Easy',
    'Sum two numbers.',
    '[]',
    '[]',
    JSON.stringify({ name: 'add', params: [{ name: 'a', type: 'integer' }, { name: 'b', type: 'integer' }], returns: 'integer' }),
    '{}',
    JSON.stringify([{ input: [1, 2], expected: 3 }])
  );
  db.prepare(
    `INSERT INTO problems (id, title, topic, difficulty, description, examples, constraints, signature, starterCode, testCases)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    'med-sum',
    'Medium Sum',
    'Math',
    'Medium',
    'Sum two numbers.',
    '[]',
    '[]',
    JSON.stringify({ name: 'add', params: [{ name: 'a', type: 'integer' }, { name: 'b', type: 'integer' }], returns: 'integer' }),
    '{}',
    JSON.stringify([{ input: [1, 2], expected: 3 }])
  );

  const app = express();
  app.use(express.json({ limit: '512kb' }));
  registerXpLedger(app, {
    db,
    authRequired: fakeAuth,
    rateLimitMiddleware: (_req, _res, next) => next(),
  });
  registerSubmissions(app, {
    db,
    authOptional: fakeAuth,
    authRequired: fakeAuth,
    rateLimitMax: 100,
    provider: async ({ sourceCode }) => {
      const marker = sourceCode.match(/__ALVIO_RES_[a-f0-9]+__:/)?.[0] || '';
      return {
        status: 'completed',
        result: 'success',
        exit_code: 0,
        stdout: `${marker}${JSON.stringify({ status: 'Passed', passedCount: 1, message: 'All passed.', stdout: [], executionTimeMs: 5 })}`,
      };
    },
  });
  app.use(safeErrors);

  server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address() as { port: number };
  origin = `http://127.0.0.1:${addr.port}`;
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  db.close();
});

async function post(path: string, token: string, body: unknown) {
  return fetch(`${origin}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

test('verified coding pass awards difficulty XP once and prevents duplicate solve rewards', async () => {
  const first = await post('/api/problems/easy-sum/submit', 'user-a', {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  });
  assert.equal(first.status, 200);
  const firstBody = await first.json();
  assert.equal(firstBody.status, 'Passed');
  assert.equal(firstBody.xpAwarded, 25);
  assert.equal(firstBody.totalXp, 25);

  // Re-submitting same passing problem must award 0 duplicate XP
  const second = await post('/api/problems/easy-sum/submit', 'user-a', {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  });
  assert.equal(second.status, 200);
  const secondBody = await second.json();
  assert.equal(secondBody.xpAwarded, 0);
  assert.equal(secondBody.totalXp, 25);

  // Medium problem awards 50 XP
  const medium = await post('/api/problems/med-sum/submit', 'user-a', {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  });
  const medBody = await medium.json();
  assert.equal(medBody.xpAwarded, 50);
  assert.equal(medBody.totalXp, 75);
});

test('learning events validate payloads, ignore client XP fields, deduplicate, and enforce daily cap', async () => {
  // Invalid payloads rejected with 400
  for (const invalid of [
    { type: 'lesson_completed', topicId: 'fake-topic' },
    { type: 'visualizer_completed', moduleId: 'heap', completedSteps: 1, operationsCount: 1 },
    { type: 'quiz_completed', attemptId: 'q-bad', topicId: 'array', total: 5, correct: 6 },
    { type: 'unknown_event', xp: 9999 },
  ]) {
    const res = await post('/api/learning/events', 'user-a', invalid);
    assert.equal(res.status, 400);
  }

  // Client-supplied xp/points fields are completely ignored; lesson awards fixed 20 XP once
  const lesson1 = await post('/api/learning/events', 'user-a', {
    type: 'lesson_completed',
    topicId: 'array',
    xp: 999999,
    points: 999999,
  });
  assert.equal(lesson1.status, 200);
  const l1 = await lesson1.json();
  assert.equal(l1.awarded, true);
  assert.equal(l1.pointsAwarded, 20);
  assert.equal(l1.totalXp, 95);

  // Duplicate lesson completion awards 0 XP
  const lessonDup = await post('/api/learning/events', 'user-a', {
    type: 'lesson_completed',
    topicId: 'array',
  });
  const lDup = await lessonDup.json();
  assert.equal(lDup.awarded, false);
  assert.equal(lDup.duplicate, true);
  assert.equal(lDup.pointsAwarded, 0);
  assert.equal(lDup.totalXp, 95);

  // Quiz attempts up to daily cap (150 XP/day across self-reported events)
  // User A already used 20 XP today; 3 perfect 10-question quizzes (60 XP each) should cap at 150 total daily
  const q1 = await (await post('/api/learning/events', 'user-a', { type: 'quiz_completed', attemptId: 'quiz-1', topicId: 'heap', total: 10, correct: 10 })).json();
  assert.equal(q1.pointsAwarded, 60);
  const q2 = await (await post('/api/learning/events', 'user-a', { type: 'quiz_completed', attemptId: 'quiz-2', topicId: 'graph', total: 10, correct: 10 })).json();
  assert.equal(q2.pointsAwarded, 60);
  const q3 = await (await post('/api/learning/events', 'user-a', { type: 'quiz_completed', attemptId: 'quiz-3', topicId: 'stack', total: 10, correct: 10 })).json();
  assert.equal(q3.pointsAwarded, 10); // 20 + 60 + 60 + 10 = 150 cap
  assert.equal(q3.capped, true);
  const q4 = await (await post('/api/learning/events', 'user-a', { type: 'quiz_completed', attemptId: 'quiz-4', topicId: 'queue', total: 10, correct: 10 })).json();
  assert.equal(q4.awarded, false);
  assert.equal(q4.capped, true);
  assert.equal(q4.pointsAwarded, 0);

  // Verify ledger shows exact daily cap and isolates account B
  const ledgerA = await (await fetch(`${origin}/api/xp/ledger`, { headers: { Authorization: 'Bearer user-a' } })).json();
  assert.equal(ledgerA.dailyLearningXp, DAILY_LEARNING_XP_CAP);
  assert.equal(ledgerA.xp, 75 + DAILY_LEARNING_XP_CAP);
  assert.ok(ledgerA.events.length >= 5);

  const ledgerB = await (await fetch(`${origin}/api/xp/ledger`, { headers: { Authorization: 'Bearer user-b' } })).json();
  assert.equal(ledgerB.xp, 0);
  assert.equal(ledgerB.events.length, 0);
});
