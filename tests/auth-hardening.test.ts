import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';

let child: ReturnType<typeof spawn>;
let directory: string;
let origin: string;
const secret = randomBytes(48).toString('hex');

function extractCookies(response: Response): Record<string, { value: string; raw: string }> {
  const result: Record<string, { value: string; raw: string }> = {};
  const setCookies = response.headers.getSetCookie?.() || [];
  for (const raw of setCookies) {
    const first = raw.split(';')[0];
    const eq = first.indexOf('=');
    if (eq <= 0) continue;
    const name = first.slice(0, eq).trim();
    const value = decodeURIComponent(first.slice(eq + 1).trim());
    result[name] = { value, raw };
  }
  return result;
}

function cookieHeader(jar: Record<string, { value: string }>): string {
  return Object.entries(jar)
    .filter(([, entry]) => entry.value !== '')
    .map(([name, entry]) => `${name}=${encodeURIComponent(entry.value)}`)
    .join('; ');
}

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'alvio-auth-hardening-'));
  const socket = createServer();
  await new Promise<void>((resolve) => socket.listen(0, '127.0.0.1', resolve));
  const port = (socket.address() as any).port;
  await new Promise<void>((resolve) => socket.close(() => resolve()));
  origin = `http://127.0.0.1:${port}`;

  child = spawn(process.execPath, ['dist/server.cjs'], {
    env: {
      ...process.env,
      JWT_SECRET: secret,
      JWT_ACCESS_TTL: '15m',
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
      await fetch(origin + '/api/auth/me');
      break;
    } catch {
      if (i === 99 || child.exitCode !== null) throw Error(output);
      await new Promise((r) => setTimeout(r, 100));
    }
  }
});

after(async () => {
  child?.kill();
  if (child && child.exitCode === null) {
    await new Promise((resolve) => child.once('exit', resolve));
  }
  if (directory) await rm(directory, { recursive: true, force: true });
});

test('signup sets HttpOnly access/refresh cookies plus CSRF cookie and authenticates via cookie alone', async () => {
  const signup = await fetch(origin + '/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({
      name: 'Cookie Student',
      email: 'cookie@example.test',
      password: 'strong-password-123',
    }),
  });
  assert.equal(signup.status, 200);
  const cookies = extractCookies(signup);
  assert.ok(cookies.alvio_access?.value, 'alvio_access cookie must be set');
  assert.ok(cookies.alvio_refresh?.value, 'alvio_refresh cookie must be set');
  assert.ok(cookies.alvio_csrf?.value, 'alvio_csrf cookie must be set');
  assert.match(cookies.alvio_access.raw, /HttpOnly/i);
  assert.match(cookies.alvio_access.raw, /SameSite=Lax/i);
  assert.match(cookies.alvio_refresh.raw, /HttpOnly/i);
  assert.match(cookies.alvio_refresh.raw, /Path=\/api\/auth/i);
  assert.doesNotMatch(cookies.alvio_csrf.raw, /HttpOnly/i);

  const me = await fetch(origin + '/api/auth/me', {
    headers: { Cookie: cookieHeader(cookies) },
  });
  assert.equal(me.status, 200);
  const data = await me.json();
  assert.equal(data.user.email, 'cookie@example.test');
});

test('CSRF protection rejects missing token, bad token, and untrusted origin on cookie mutations, and permits valid double-submit', async () => {
  const login = await fetch(origin + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ email: 'cookie@example.test', password: 'strong-password-123' }),
  });
  assert.equal(login.status, 200);
  const cookies = extractCookies(login);
  const payload = JSON.stringify({ location: 'Kerala', university: 'Alvio U', github: '', linkedin: '', avatar_url: '' });

  // Missing CSRF header
  const missingCsrf = await fetch(origin + '/api/profile/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, Cookie: cookieHeader(cookies) },
    body: payload,
  });
  assert.equal(missingCsrf.status, 403);
  assert.equal((await missingCsrf.json()).code, 'CSRF_REJECTED');

  // Wrong CSRF header
  const wrongCsrf = await fetch(origin + '/api/profile/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
      Cookie: cookieHeader(cookies),
      'X-CSRF-Token': 'wrong-token',
    },
    body: payload,
  });
  assert.equal(wrongCsrf.status, 403);

  // Untrusted origin
  const badOrigin = await fetch(origin + '/api/profile/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://evil.example',
      Cookie: cookieHeader(cookies),
      'X-CSRF-Token': cookies.alvio_csrf.value,
    },
    body: payload,
  });
  assert.equal(badOrigin.status, 403);

  // Valid Origin + matching X-CSRF-Token
  const ok = await fetch(origin + '/api/profile/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
      Cookie: cookieHeader(cookies),
      'X-CSRF-Token': cookies.alvio_csrf.value,
    },
    body: payload,
  });
  assert.equal(ok.status, 200);
});

test('server-side logout revokes only the current device session while logout-all revokes all devices', async () => {
  const login1 = await fetch(origin + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, 'User-Agent': 'Device-One' },
    body: JSON.stringify({ email: 'cookie@example.test', password: 'strong-password-123' }),
  });
  const login2 = await fetch(origin + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, 'User-Agent': 'Device-Two' },
    body: JSON.stringify({ email: 'cookie@example.test', password: 'strong-password-123' }),
  });
  const s1 = await login1.json();
  const s2 = await login2.json();
  assert.ok(s1.token && s2.token);

  // Logout device 1
  const logout1 = await fetch(origin + '/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${s1.token}`, Origin: origin },
  });
  assert.equal(logout1.status, 200);
  const cleared = extractCookies(logout1);
  assert.match(cleared.alvio_access.raw, /Max-Age=0/i);

  // Device 1 token is revoked; Device 2 token still works
  const check1 = await fetch(origin + '/api/auth/me', { headers: { Authorization: `Bearer ${s1.token}` } });
  assert.equal(check1.status, 401);
  assert.equal(check1.headers.get('x-auth-expired'), null);
  assert.equal((await check1.json()).code, 'SESSION_REVOKED');

  const check2 = await fetch(origin + '/api/auth/me', { headers: { Authorization: `Bearer ${s2.token}` } });
  assert.equal(check2.status, 200);

  // Create Device 3, then call logout-all from Device 2 -> revokes both Device 2 and Device 3
  const login3 = await fetch(origin + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, 'User-Agent': 'Device-Three' },
    body: JSON.stringify({ email: 'cookie@example.test', password: 'strong-password-123' }),
  });
  const s3 = await login3.json();

  const logoutAll = await fetch(origin + '/api/auth/logout-all', {
    method: 'POST',
    headers: { Authorization: `Bearer ${s2.token}`, Origin: origin },
  });
  assert.equal(logoutAll.status, 200);

  for (const revokedToken of [s2.token, s3.token]) {
    const check = await fetch(origin + '/api/auth/me', { headers: { Authorization: `Bearer ${revokedToken}` } });
    assert.equal(check.status, 401);
    assert.equal((await check.json()).code, 'SESSION_REVOKED');
  }
});

test('refresh rotates tokens and detects replay of an already-rotated refresh token', async () => {
  const login = await fetch(origin + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ email: 'cookie@example.test', password: 'strong-password-123' }),
  });
  assert.equal(login.status, 200);
  const cookies1 = extractCookies(login);

  const refresh = await fetch(origin + '/api/auth/refresh', {
    method: 'POST',
    headers: {
      Origin: origin,
      Cookie: cookieHeader(cookies1),
      'X-CSRF-Token': cookies1.alvio_csrf.value,
    },
  });
  assert.equal(refresh.status, 200);
  const refreshedData = await refresh.json();
  const cookies2 = extractCookies(refresh);
  assert.notEqual(cookies2.alvio_refresh.value, cookies1.alvio_refresh.value);

  // New token works
  const okCheck = await fetch(origin + '/api/auth/me', {
    headers: { Authorization: `Bearer ${refreshedData.token}` },
  });
  assert.equal(okCheck.status, 200);

  // Replaying old refresh token fails AND revokes the rotated session as well
  const replay = await fetch(origin + '/api/auth/refresh', {
    method: 'POST',
    headers: {
      Origin: origin,
      Cookie: cookieHeader(cookies1),
      'X-CSRF-Token': cookies1.alvio_csrf.value,
    },
  });
  assert.equal(replay.status, 401);
  assert.equal((await replay.json()).code, 'SESSION_REVOKED');

  const afterReplay = await fetch(origin + '/api/auth/me', {
    headers: { Authorization: `Bearer ${refreshedData.token}` },
  });
  assert.equal(afterReplay.status, 401);
  assert.equal((await afterReplay.json()).code, 'SESSION_REVOKED');
});

test('expired authentic JWT signals X-Auth-Expired while forged tokens do not', async () => {
  const login = await fetch(origin + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ email: 'cookie@example.test', password: 'strong-password-123' }),
  });
  const body = await login.json();
  const decoded = jwt.decode(body.token) as any;

  // Craft an authentic signature-valid expired access token bound to the active session
  const expiredAuthentic = jwt.sign(
    { typ: 'access', ver: decoded.ver },
    secret,
    {
      subject: String(body.user.id),
      jwtid: decoded.jti,
      algorithm: 'HS256',
      issuer: 'alvio',
      audience: 'alvio-student',
      expiresIn: -5,
    }
  );
  const expiredRes = await fetch(origin + '/api/auth/me', {
    headers: { Authorization: `Bearer ${expiredAuthentic}` },
  });
  assert.equal(expiredRes.status, 401);
  assert.equal(expiredRes.headers.get('x-auth-expired'), '1');
  assert.equal((await expiredRes.json()).code, 'TOKEN_EXPIRED');

  // Forged token must NEVER emit X-Auth-Expired
  const forgedRes = await fetch(origin + '/api/auth/me', {
    headers: { Authorization: 'Bearer fake-forged-token' },
  });
  assert.equal(forgedRes.status, 401);
  assert.equal(forgedRes.headers.get('x-auth-expired'), null);
  assert.equal((await forgedRes.json()).code, 'UNAUTHORIZED');
});
