import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { chromium, type Browser } from 'playwright';
let server: ReturnType<typeof spawn>, browser: Browser, directory: string, origin: string;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'alvio-browser-'));
  const socket = createServer(); await new Promise<void>(r => socket.listen(0, '127.0.0.1', r));
  const port = (socket.address() as any).port; await new Promise<void>(r => socket.close(() => r())); origin = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['dist/server.cjs'], { env: { ...process.env, JWT_SECRET: randomBytes(48).toString('hex'), DATABASE_PATH: join(directory, 'test.sqlite'), PORT: String(port), NODE_ENV: 'production', ALLOWED_ORIGINS: origin, GROQ_API_KEY: '' }, stdio: 'ignore' });
  for (let i = 0; i < 100; i++) { try { await fetch(origin + '/api/auth/me'); break; } catch { if (i === 99) throw Error('Test server did not start'); await new Promise(r => setTimeout(r, 100)); } }
  const signup = await fetch(origin + '/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Browser Student', email: 'browser@example.test', password: 'browser-test-password' }) }); assert.equal(signup.status, 200);
  browser = await chromium.launch({ headless: true });
});
after(async () => { await browser?.close(); server?.kill(); if (server?.exitCode === null) await new Promise(r => server.once('exit', r)); if (directory) await rm(directory, { recursive: true, force: true }); });
test('private routes redirect with exact deep links; public routes stay public', async () => {
  const page = await browser.newPage();
  for (const target of ['/dashboard', '/profile', '/learn/heap', '/3d-visualizer?ds=Heap', '/coding?topic=Heap#editor', '/quiz']) {
    await page.goto(origin + target); await page.waitForURL('**/auth?**');
    assert.equal(new URL(page.url()).searchParams.get('next'), target);
  }
  await page.goto(origin + '/'); assert.equal(new URL(page.url()).pathname, '/');
  await page.close();
});
test('real login verifies session, restores query/hash, persists cloud, and rejects forged browser auth', async () => {
  const page = await browser.newPage(); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(origin + '/dashboard?source=auth#learning'); await page.waitForURL('**/auth?**');
  await page.getByLabel('Email', { exact: true }).fill('browser@example.test'); await page.getByLabel('Password', { exact: true }).fill('browser-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click(); await page.waitForURL('**/dashboard?source=auth#learning');
  await page.locator('.app-shell').waitFor(); await page.getByText('Progress synced', { exact: true }).waitFor();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('alvio-auth-storage')!).state);
  const cloud = await (await fetch(origin + '/api/progress', { headers: { Authorization: `Bearer ${saved.token}` } })).json(); assert.equal(cloud.progress.userId, saved.user.id);
  await page.reload(); await page.locator('.app-shell').waitFor();
  await page.route('**/api/**', route => route.abort());
  await page.reload(); await page.locator('.app-shell').waitFor();
  await page.getByText('Cloud sync is unavailable. Your progress is saved on this device.', { exact: true }).waitFor();
  await page.unroute('**/api/**');
  await page.evaluate(() => localStorage.setItem('alvio-auth-storage', JSON.stringify({ state: { user: { id: '999', name: 'Forged' }, token: 'fake', isAuthenticated: true }, version: 0 })));
  await page.reload(); await page.waitForURL('**/auth?**'); assert.equal(new URL(page.url()).searchParams.get('next'), '/dashboard?source=auth#learning');
  assert.deepEqual(errors, []); await page.close();
});

test('profile sign-out and account switch replace identity and reject an external return URL', async () => {
  const signup = await fetch(origin + '/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Second Student', email: 'second@example.test', password: 'browser-test-password' }) });
  assert.equal(signup.status, 200);
  const second = await signup.json();
  const page = await browser.newPage();
  const signIn = async (email: string) => {
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).fill('browser-test-password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.locator('.app-shell').waitFor();
  };
  await page.goto(origin + '/profile'); await page.waitForURL('**/auth?**');
  await signIn('browser@example.test');
  await page.getByRole('heading', { name: 'My Profile', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.waitForURL('**/auth?**');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('alvio-auth-storage')!).state.user), null);
  await page.goto(origin + '/auth?mode=login&next=' + encodeURIComponent('https://evil.example.com'));
  await signIn('second@example.test');
  assert.equal(new URL(page.url()).origin, origin); assert.equal(new URL(page.url()).pathname, '/dashboard');
  const identity = await page.evaluate(() => JSON.parse(localStorage.getItem('alvio-auth-storage')!).state.user);
  assert.equal(identity.id, second.user.id); assert.equal(identity.email, 'second@example.test');
  await page.goto(origin + '/coding?topic=Heap'); await page.locator('.coding-page').waitFor();
  assert.equal(new URL(page.url()).searchParams.get('topic'), 'Heap');
  await page.close();
});

test('unknown routes show friendly 404 page and Ctrl+K search handles unmatched queries cleanly', async () => {
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin + '/nonexistent-route-check');
  await page.getByRole('heading', { name: 'Page not found', exact: true }).waitFor();
  await page.getByRole('link', { name: 'Go to Dashboard', exact: true }).click();
  await page.waitForURL('**/auth?**');

  await page.getByLabel('Email', { exact: true }).fill('browser@example.test');
  await page.getByLabel('Password', { exact: true }).fill('browser-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/dashboard');
  await page.locator('.app-shell').waitFor();

  await page.keyboard.press('Control+k');
  const box = page.getByRole('combobox', { name: 'Search Alvio' });
  await box.fill('zzzz-no-matching-lesson-999');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowUp');
  const activeDesc = await box.getAttribute('aria-activedescendant');
  assert(!String(activeDesc || '').includes('NaN'), 'Search active descendant must never be NaN');
  assert.deepEqual(errors, []);
  await page.close();
});
