const { chromium: engine } = require('playwright');
const { spawn, execFileSync } = require('node:child_process');
const { mkdtemp, rm, mkdir } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { randomBytes } = require('node:crypto');
const { createServer } = require('node:net');
let origin;
exports.testOrigin = () => origin;
exports.chromium = { async launch(options = {}) {
  const { seedProblems = false, ...browserOptions } = options;
  const directory = await mkdtemp(join(tmpdir(), 'alvio-regression-'));
  const socket = createServer(); await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port; await new Promise(resolve => socket.close(resolve)); origin = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['dist/server.cjs'], { env: { ...process.env, PORT: String(port), DATABASE_PATH: join(directory, 'test.sqlite'), JWT_SECRET: randomBytes(48).toString('hex'), NODE_ENV: 'production', ALLOWED_ORIGINS: origin, GROQ_API_KEY: '' }, stdio: 'ignore' });
  process.once('exit', () => server.kill());
  try {
    for (let i = 0; i < 100; i++) { try { await fetch(origin + '/api/auth/me'); break; } catch { if (i === 99) throw Error('Regression server failed to start'); await new Promise(resolve => setTimeout(resolve, 100)); } }
    const response = await fetch(origin + '/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Regression Student', email: 'regression@example.test', password: 'regression-password' }) });
    if (!response.ok) throw Error('Regression account creation failed');
    const session = await response.json();
    if (seedProblems) execFileSync(process.execPath, ['--import', 'tsx', '-e', "import { DatabaseSync } from 'node:sqlite'; import { loadProblemCatalog, seedProblemCatalog } from './server/problemCatalog.ts'; const db = new DatabaseSync(process.argv[1]); seedProblemCatalog(db, loadProblemCatalog()); db.close();", join(directory, 'test.sqlite')], { stdio: 'pipe' });
    await mkdir('data', { recursive: true });
    const browser = await engine.launch({ ...browserOptions, channel: undefined });
    const initialize = context => context.addInitScript(({ session, origin }) => {
      if (location.origin === origin && !localStorage.getItem('alvio-auth-storage')) localStorage.setItem('alvio-auth-storage', JSON.stringify({ state: { user: session.user, token: session.token }, version: 0 }));
    }, { session, origin });
    const newContext = browser.newContext.bind(browser), newPage = browser.newPage.bind(browser), close = browser.close.bind(browser);
    browser.newContext = async options => { const context = await newContext(options); await initialize(context); return context; };
    browser.newPage = async options => { const page = await newPage(options); await initialize(page.context()); return page; };
    browser.close = async () => { await close(); server.kill(); if (server.exitCode === null) await new Promise(resolve => server.once('exit', resolve)); await rm(directory, { recursive: true, force: true }); };
    return browser;
  } catch (error) { server.kill(); throw error; }
} };
