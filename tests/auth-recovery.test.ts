import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../server/migrations';
import { registerAuthRecovery, type OutboundEmail } from '../server/authRecovery';
import { safeErrors } from '../server/security';

let db: DatabaseSync;
let server: Server;
let origin: string;
let sentEmails: OutboundEmail[] = [];
let unconfiguredServer: Server;
let unconfiguredOrigin: string;

before(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || randomBytes(48).toString('hex');
  db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);

  const hash = await bcrypt.hash('old-password-123', 10);
  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)').run(
    'recover@example.test',
    hash,
    'Recovery Student'
  );
  db.prepare(
    `INSERT INTO auth_sessions (id, user_id, refresh_token_hash, expires_at)
     VALUES ('sess-1', 1, 'hash1', datetime('now', '+7 days'))`
  ).run();

  const app = express();
  app.use(express.json({ limit: '512kb' }));
  registerAuthRecovery(app, {
    db,
    allowedOrigins: ['https://alvio.example'],
    authRequired: (req, _res, next) => { req.userId = 1; next(); },
    emailSender: {
      async send(msg) {
        sentEmails.push(msg);
      },
    },
  });
  app.use(safeErrors);

  server = createServer(app);
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  origin = `http://127.0.0.1:${(server.address() as any).port}`;

  // Second server with no email provider configured -> verifies explicit 503
  const appUnconfigured = express();
  appUnconfigured.use(express.json({ limit: '512kb' }));
  registerAuthRecovery(appUnconfigured, {
    db,
    emailSender: null,
    authRequired: (req, _res, next) => { req.userId = 1; next(); },
  });
  unconfiguredServer = createServer(appUnconfigured);
  await new Promise<void>((r) => unconfiguredServer.listen(0, '127.0.0.1', r));
  unconfiguredOrigin = `http://127.0.0.1:${(unconfiguredServer.address() as any).port}`;
});

after(async () => {
  await new Promise<void>((r) => server.close(() => r()));
  await new Promise<void>((r) => unconfiguredServer.close(() => r()));
  db.close();
});

test('unconfigured email provider explicitly returns 503 EMAIL_NOT_CONFIGURED instead of simulating delivery', async () => {
  const res = await fetch(`${unconfiguredOrigin}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'recover@example.test' }),
  });
  assert.equal(res.status, 503);
  assert.equal((await res.json()).code, 'EMAIL_NOT_CONFIGURED');

  const verifyRes = await fetch(`${unconfiguredOrigin}/api/auth/verify-email/request`, { method: 'POST' });
  assert.equal(verifyRes.status, 503);
  assert.equal((await verifyRes.json()).code, 'EMAIL_NOT_CONFIGURED');
});

test('password reset prevents enumeration, hashes tokens, revokes all active sessions, and enforces single-use', async () => {
  sentEmails = [];

  // Unknown email returns the exact same 200 response without sending mail
  const unknownRes = await fetch(`${origin}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nobody@example.test' }),
  });
  assert.equal(unknownRes.status, 200);
  assert.equal(sentEmails.length, 0);

  // Known email sends a single-use reset link and stores only SHA-256 hash in SQLite
  const knownRes = await fetch(`${origin}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'RECOVER@EXAMPLE.TEST' }),
  });
  assert.equal(knownRes.status, 200);
  assert.equal(sentEmails.length, 1);

  const match = sentEmails[0].text.match(/resetToken=([^\s]+)/);
  assert.ok(match, 'Reset email must contain resetToken link');
  const rawToken = decodeURIComponent(match[1]);

  const storedRow = db.prepare('SELECT token_hash FROM password_reset_tokens WHERE user_id = 1').get() as any;
  assert.ok(storedRow?.token_hash);
  assert.notEqual(storedRow.token_hash, rawToken, 'Raw reset token must never be stored in plaintext');

  // Reset password succeeds, updates bcrypt hash, increments token_version, and revokes auth_sessions
  const resetRes = await fetch(`${origin}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: rawToken, password: 'new-strong-password-456' }),
  });
  assert.equal(resetRes.status, 200);

  const updatedUser = db.prepare('SELECT password_hash, token_version FROM users WHERE id = 1').get() as any;
  assert.equal(await bcrypt.compare('new-strong-password-456', updatedUser.password_hash), true);
  assert.equal(await bcrypt.compare('old-password-123', updatedUser.password_hash), false);
  assert.equal(updatedUser.token_version, 2, 'Password reset must increment token_version');

  const session = db.prepare("SELECT revoked_at FROM auth_sessions WHERE id = 'sess-1'").get() as any;
  assert.ok(session.revoked_at, 'All active sessions must be revoked upon password reset');

  // Reusing the same reset token must fail with 400 INVALID_RESET_TOKEN
  const reuseRes = await fetch(`${origin}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: rawToken, password: 'another-password-789' }),
  });
  assert.equal(reuseRes.status, 400);
  assert.equal((await reuseRes.json()).code, 'INVALID_RESET_TOKEN');
});

test('email verification issues single-use hashed token and marks users.email_verified_at', async () => {
  sentEmails = [];
  const reqRes = await fetch(`${origin}/api/auth/verify-email/request`, { method: 'POST' });
  assert.equal(reqRes.status, 200);
  assert.equal(sentEmails.length, 1);

  const match = sentEmails[0].text.match(/verifyToken=([^\s]+)/);
  assert.ok(match, 'Verification email must contain verifyToken link');
  const rawToken = decodeURIComponent(match[1]);

  const confirmRes = await fetch(`${origin}/api/auth/verify-email/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: rawToken }),
  });
  assert.equal(confirmRes.status, 200);
  assert.equal((await confirmRes.json()).verified, true);

  const user = db.prepare('SELECT email_verified_at FROM users WHERE id = 1').get() as any;
  assert.ok(user.email_verified_at);

  // Reusing the verification token fails
  const reuse = await fetch(`${origin}/api/auth/verify-email/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: rawToken }),
  });
  assert.equal(reuse.status, 400);

  // Requesting again reports alreadyVerified without sending another email
  sentEmails = [];
  const again = await fetch(`${origin}/api/auth/verify-email/request`, { method: 'POST' });
  assert.equal(again.status, 200);
  assert.equal((await again.json()).alreadyVerified, true);
  assert.equal(sentEmails.length, 0);
});
