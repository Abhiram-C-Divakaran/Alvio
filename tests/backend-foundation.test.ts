import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../server/migrations';
import { mergeProgress } from '../src/services/mergeProgress';
let child: ReturnType<typeof spawn>, directory: string, origin: string;
const secret = randomBytes(48).toString('hex');
let a: any, b: any;
const progress = (id: string) => ({ userId: id, topics: [], totalTimeSpentMinutes: 12, overallScore: 0, streak: 1, badges: [], weakAreas: [], recommendedTopics: [] });
async function request(path: string, token?: string, body?: unknown, method = body ? 'POST' : 'GET') {
  return fetch(origin + path, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'alvio-test-'));
  const socket = createServer(); await new Promise<void>(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = (socket.address() as any).port; await new Promise<void>(resolve => socket.close(() => resolve())); origin = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['dist/server.cjs'], { env: { ...process.env, JWT_SECRET: secret, DATABASE_PATH: join(directory, 'test.sqlite'), PORT: String(port), NODE_ENV: 'production', ALLOWED_ORIGINS: origin, GROQ_API_KEY: '' }, stdio: 'pipe' });
  let output = ''; child.stdout?.on('data', d => output += d); child.stderr?.on('data', d => output += d);
  for (let i = 0; i < 100; i++) { try { await request('/api/auth/me'); break; } catch { if (i === 99 || child.exitCode !== null) throw Error(output); await new Promise(r => setTimeout(r, 100)); } }
  a = await (await request('/api/auth/signup', undefined, { name: 'Learner A', email: 'A@example.test', password: 'test-password-123' })).json();
  b = await (await request('/api/auth/signup', undefined, { name: 'Learner B', email: 'b@example.test', password: 'test-password-123' })).json();
  assert(a.token && b.token);
});
after(async () => { child?.kill(); if (child && child.exitCode === null) await new Promise(resolve => child.once('exit', resolve)); if (directory) await rm(directory, { recursive: true, force: true }); });
test('JWT rejects missing, malformed, expired, wrong-secret and nonexistent accounts', async () => {
  const options = { issuer: 'alvio', audience: 'alvio-student', subject: a.user.id };
  for (const token of [undefined, 'malformed', jwt.sign({}, secret, { ...options, expiresIn: -1 }), jwt.sign({}, 'wrong', options), jwt.sign({}, secret, { ...options, subject: '999999' })]) assert.equal((await request('/api/auth/me', token)).status, 401);
  const me = await request('/api/auth/me', a.token); assert.equal(me.status, 200); const data = await me.json(); assert.equal(data.user.email, 'a@example.test'); assert.equal(data.user.password_hash, undefined);
});
test('startup refuses missing JWT configuration', async () => {
  const processWithoutSecret = spawn(process.execPath, ['dist/server.cjs'], { env: { ...process.env, NODE_ENV: 'production', JWT_SECRET: '', DATABASE_PATH: join(directory, 'missing-secret.sqlite'), ALLOWED_ORIGINS: origin }, stdio: 'pipe' });
  let message = ''; processWithoutSecret.stderr?.on('data', d => message += d);
  const code = await new Promise(resolve => processWithoutSecret.once('exit', resolve)); assert.notEqual(code, 0); assert.match(message, /JWT_SECRET must be configured/);
});
test('progress enforces ownership, revisions, server XP and idempotent snapshots', async () => {
  assert.equal((await request('/api/progress', a.token, { progress: progress(b.user.id), revision: 0 }, 'PUT')).status, 400);
  assert.equal((await (await request('/api/progress', b.token)).json()).progress, null);
  const local = { ...progress(a.user.id), totalXp: 999999, authoritativeXp: 999999, completedQuizIds: ['once'] };
  const save = await request('/api/progress', a.token, { progress: local, revision: 0 }, 'PUT'); assert.equal(save.status, 200);
  const data = await save.json(); assert.equal(data.progress.authoritativeXp, 0);
  assert.equal((await request('/api/progress', a.token, { progress: local, revision: 0 }, 'PUT')).status, 409);
  const again = await (await request('/api/progress', a.token, { progress: data.progress, revision: 1 }, 'PUT')).json();
  assert.deepEqual(again.progress.completedQuizIds, ['once']); assert.equal(again.progress.totalTimeSpentMinutes, 12);
  assert.equal((await (await request('/api/auth/me', a.token)).json()).user.xp, 0);
});
test('AI authentication and request size limits precede provider calls', async () => {
  for (const endpoint of ['/api/chat', '/api/visualizer', '/api/generate-trace']) assert.equal((await request(endpoint, undefined, {})).status, 401);
  assert.equal((await request('/api/chat', b.token, { messages: [{ role: 'user', content: 'Hello' }], tutorMode: 'Teach me' })).status, 500); // Passed validation; no paid provider configured.
  for (const tutorMode of ['unknown', 'toString', 42]) assert.equal((await request('/api/chat', a.token, { messages: [{ role: 'user', content: 'Hello' }], tutorMode })).status, 400);
  assert.equal((await request('/api/chat', a.token, { messages: [{ role: 'user', content: 'x'.repeat(24001) }] })).status, 400);
  assert.equal((await request('/api/chat', a.token, { messages: [{ role: 'user', content: 'x'.repeat(600000) }] })).status, 413);
  for (let i = 0; i < 26; i++) { const r = await request('/api/chat', a.token, { messages: [] }); if (i === 25) assert.equal(r.status, 429); }
});
test('production headers and restricted CORS', async () => {
  const response = await fetch(origin + '/api/auth/me', { headers: { Origin: 'https://untrusted.example' } });
  assert.equal(response.headers.get('access-control-allow-origin'), null); assert.equal(response.headers.get('x-content-type-options'), 'nosniff'); assert.match(response.headers.get('content-security-policy')!, /frame-ancestors 'none'/);
  assert.match(response.headers.get('content-security-policy')!, /connect-src[^;]*https:\/\/raw\.githubusercontent\.com/);
  assert.match(response.headers.get('content-security-policy')!, /style-src[^;]*https:\/\/cdn\.jsdelivr\.net/);
});
test('invalid progress shapes and prototype keys are rejected', async () => {
  for (const patch of [{ overallScore: 101 }, { totalTimeSpentMinutes: -1 }, { weakAreas: [{}] }, { topics: Array(201).fill({}) }, { videoLessons: { lesson: { position: -1 } } }]) {
    assert.equal((await request('/api/progress', a.token, { progress: { ...progress(a.user.id), ...patch }, revision: 2 }, 'PUT')).status, 400);
  }
  const dangerous = JSON.parse(`{"userId":"${a.user.id}","__proto__":{"polluted":true}}`);
  assert.equal((await request('/api/progress', a.token, { progress: dangerous, revision: 2 }, 'PUT')).status, 400);
});
test('login is rate limited and normalizes email', async () => {
  const valid = await request('/api/auth/login', undefined, { email: ' A@EXAMPLE.TEST ', password: 'test-password-123' }); assert.equal(valid.status, 200);
  for (let i = 0; i < 10; i++) { const response = await request('/api/auth/login', undefined, { email: 'nobody@example.test', password: 'wrong-password' }); if (i === 9) assert.equal(response.status, 429); }
});
test('migrations upgrade old users without deleting records and are repeatable', () => {
  const db = new DatabaseSync(':memory:');
  db.exec("CREATE TABLE users(id INTEGER PRIMARY KEY,email TEXT,password_hash TEXT,name TEXT,xp INTEGER,level TEXT,created_at TEXT); INSERT INTO users VALUES(1,'old@example.test','hash','Old',42,'Novice','2020-01-01')");
  migrate(db); migrate(db); assert.equal((db.prepare('SELECT COUNT(*) n FROM schema_migrations').get() as any).n, 4);
  assert.equal((db.prepare('SELECT xp,avatar_url FROM users').get() as any).xp, 42);
  db.exec("PRAGMA foreign_keys=ON; INSERT INTO learning_progress VALUES(1,'{}',1,'2026-01-01'); DELETE FROM users WHERE id=1");
  assert.equal((db.prepare('SELECT COUNT(*) n FROM learning_progress').get() as any).n, 0); db.close();
});
test('merge preserves completion, newer playback position, and only unsynced counter deltas', () => {
  const base = { ...progress('1'), totalTimeSpentMinutes: 10, updatedAt: '2026-01-01' };
  const local = { ...base, totalTimeSpentMinutes: 12, completedQuizIds: ['q'], updatedAt: '2026-01-03', videoLessons: { lesson: { position: 5, duration: 100, speed: 1, watchedSeconds: [1,2], notes: [], completed: false } } };
  const cloud = { ...base, totalTimeSpentMinutes: 13, completedQuizIds: ['q'], updatedAt: '2026-01-02', videoLessons: { lesson: { position: 40, duration: 100, speed: 1, watchedSeconds: [3], notes: [], completed: true } } };
  const merged = mergeProgress(local, cloud, base); assert.equal(merged.totalTimeSpentMinutes, 15); assert.equal(merged.videoLessons!.lesson.position, 5); assert.equal(merged.videoLessons!.lesson.completed, true); assert.deepEqual(merged.completedQuizIds, ['q']);
  assert.equal(mergeProgress(local, cloud, null).totalTimeSpentMinutes, 12); assert.throws(() => mergeProgress(local, progress('2'), null));
  assert.equal(mergeProgress(cloud, local, null).totalTimeSpentMinutes, 12);
});

test('submission verdicts cannot be supplied by the client', async () => {
  const db = new DatabaseSync(join(directory, 'test.sqlite'));
  db.prepare("INSERT INTO problems(id,title,difficulty,description,examples,constraints,signature,starterCode,testCases) VALUES(?,?,?,?,?,?,?,?,?)").run('trust-test','Trust test','Easy','Test','[]','[]','{}','{}','[]'); db.close();
  const response = await request('/api/problems/trust-test/submit', a.token, { code: 'return 1', language: 'javascript', status: 'Passed', passedTestcases: 999, totalTestcases: 999 });
  assert.equal(response.status, 202);
  const saved = await (await request('/api/problems/trust-test/submissions', a.token)).json();
  assert.equal(saved.submission.status, 'Unverified'); assert.equal(saved.submission.verified, 0); assert.equal(saved.submission.passed_testcases, null);
  const profile = await (await request('/api/profile', a.token)).json(); assert.equal(profile.solvedProblems.length, 0);
});
