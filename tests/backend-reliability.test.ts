import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

let child: ReturnType<typeof spawn>;
let directory: string;
let origin: string;
let token: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'alvio-reliability-'));
  const socket = createServer();
  await new Promise<void>((resolve) => socket.listen(0, '127.0.0.1', resolve));
  const port = (socket.address() as any).port;
  await new Promise<void>((resolve) => socket.close(() => resolve()));
  origin = `http://127.0.0.1:${port}`;

  child = spawn(process.execPath, ['dist/server.cjs'], {
    env: {
      ...process.env,
      JWT_SECRET: randomBytes(48).toString('hex'),
      DATABASE_PATH: join(directory, 'test.sqlite'),
      PORT: String(port),
      NODE_ENV: 'production',
      ALLOWED_ORIGINS: origin,
      GROQ_API_KEY: '',
    },
    stdio: 'pipe',
  });
  let output = '';
  child.stdout?.on('data', (d) => (output += d));
  child.stderr?.on('data', (d) => (output += d));
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(origin + '/api/health');
      break;
    } catch {
      if (i === 99 || child.exitCode !== null) throw Error(output);
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  const signup = await fetch(origin + '/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Reliability Student', email: 'rel@example.test', password: 'strong-password-123' }),
  });
  assert.equal(signup.status, 200);
  token = (await signup.json()).token;

  const db = new DatabaseSync(join(directory, 'test.sqlite'));
  db.prepare(
    'INSERT INTO problems(id,title,difficulty,description,examples,constraints,signature,starterCode,testCases) VALUES(?,?,?,?,?,?,?,?,?)'
  ).run('rel-prob', 'Reliability Problem', 'Easy', 'Test', '[]', '[]', '{}', '{}', '[]');
  db.close();
});

after(async () => {
  child?.kill();
  if (child && child.exitCode === null) {
    await new Promise((resolve) => child.once('exit', resolve));
  }
  if (directory) await rm(directory, { recursive: true, force: true });
});

test('GET /api/health reports database readiness without exposing secrets', async () => {
  const res = await fetch(origin + '/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-permitted-cross-domain-policies'), 'none');
  const body = await res.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.database, 'ok');
  assert.equal(typeof body.uptimeSeconds, 'number');
  assert.equal(body.JWT_SECRET, undefined);
  assert.equal(body.GROQ_API_KEY, undefined);
});

test('problem interaction and feedback return 404 for unknown problems instead of 500 FK errors', async () => {
  const interaction = await fetch(origin + '/api/problems/does-not-exist/interaction', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'like', action: 'add' }),
  });
  assert.equal(interaction.status, 404);

  const feedback = await fetch(origin + '/api/problems/does-not-exist/feedback', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ issues: ['typo'], additionalFeedback: 'Minor typo', rating: 4 }),
  });
  assert.equal(feedback.status, 404);
});

test('atomic like/dislike toggle maintains mutually exclusive interaction state', async () => {
  const addLike = await fetch(origin + '/api/problems/rel-prob/interaction', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'like', action: 'add' }),
  });
  assert.equal(addLike.status, 200);

  const addDislike = await fetch(origin + '/api/problems/rel-prob/interaction', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'dislike', action: 'add' }),
  });
  assert.equal(addDislike.status, 200);

  const stateRes = await fetch(origin + '/api/problems/rel-prob/interaction', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const state = await stateRes.json();
  assert.equal(state.liked, false);
  assert.equal(state.disliked, true);
  assert.equal(state.totalLikes, 0);
});

test('non-object JSON payloads return 400 validation errors instead of 500', async () => {
  for (const payload of ['[]', 'null']) {
    const profileRes = await fetch(origin + '/api/profile/update', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: payload,
    });
    assert.equal(profileRes.status, 400);

    const progressRes = await fetch(origin + '/api/progress', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: payload,
    });
    assert.equal(progressRes.status, 400);
  }
});
