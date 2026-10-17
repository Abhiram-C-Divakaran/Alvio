import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

process.env.DATABASE_PATH = ':memory:';
process.env.JWT_SECRET = randomBytes(48).toString('hex');
const { default: db } = await import('../server/db');
const { optionalAuth, signAuthToken } = await import('../server/auth');
db.prepare('INSERT INTO users(id,email,password_hash,name) VALUES(1,?,?,?)').run('optional@example.test', 'unused', 'Test');
after(() => db.close());

function invoke(authorization?: string) {
  const req = { headers: authorization === undefined ? {} : { authorization }, userId: undefined };
  let status = 200, continued = false;
  const res = { status(code: number) { status = code; return this; }, json() { return this; } };
  optionalAuth(req as any, res as any, () => { continued = true; });
  return { status, continued, userId: req.userId };
}
test('optional auth permits absent credentials, verifies supplied credentials, and rejects malformed tokens', () => {
  assert.deepEqual(invoke(), { status: 200, continued: true, userId: undefined });
  assert.deepEqual(invoke(`Bearer ${signAuthToken(1)}`), { status: 200, continued: true, userId: 1 });
  for (const value of ['', 'Bearer malformed', 'Basic abc']) {
    assert.equal(invoke(value).status, 401);
    assert.equal(invoke(value).continued, false);
  }
});
test('deleting an account invalidates its previously valid token', () => {
  const token = `Bearer ${signAuthToken(1)}`;
  assert.equal(invoke(token).continued, true);
  db.prepare('DELETE FROM users WHERE id=1').run();
  assert.equal(invoke(token).status, 401);
  assert.equal(invoke(token).continued, false);
});
