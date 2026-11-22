const { chromium, testOrigin } = require('./browser-runtime.cjs');
const assert = require('node:assert/strict');
const fixture = require('./progress-fixture.cjs');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const base = testOrigin();
  const page = await browser.newPage({ viewport: { width: 1540, height: 1021 }, reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/progress');
  await page.getByRole('heading', { name: 'Progress Command Center', exact: true }).waitFor();
  // First verify clean empty state for a new account
  assert.match(await page.locator('.pg-summary').innerText(), /0\/8/);
  assert.equal(await page.locator('.pg-heat-cell.level-1,.pg-heat-cell.level-2,.pg-heat-cell.level-3,.pg-heat-cell.level-4').filter({ has: page.locator('[tabindex]') }).count(), 0);
  await page.screenshot({ path: 'data/progress-empty.png' });
  // Seed realistic analytics progress for this authenticated user via the real cloud progress API
  const auth = await page.evaluate(() => JSON.parse(localStorage.getItem('alvio-auth-storage')).state);
  const current = await page.request.get(base + '/api/progress', { headers: { Authorization: `Bearer ${auth.token}` } }).then(r => r.json());
  const seededProgress = {
    ...fixture.progress,
    userId: auth.user.id,
    topics: fixture.progress.topics.map(t => t.topicId === 'binary-tree' ? { ...t, lastAccessed: new Date(Date.now() + 60000).toISOString() } : t),
    quizHistory: fixture.progress.quizHistory.map(q => ({
      ...q,
      userId: auth.user.id,
      accuracy: Math.round((q.correct / q.total) * 100),
      seconds: 60,
      answerXp: q.correct * 10,
      bestStreak: q.correct,
      topics: [],
    })),
  };
  const putRes = await page.request.put(base + '/api/progress', {
    headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
    data: { progress: seededProgress, revision: current.revision || 0 },
  });
  assert.equal(putRes.status(), 200);
  await page.evaluate(() => {
    localStorage.removeItem('alvio-progress-storage');
    indexedDB.deleteDatabase('alvio-db');
  });
  await page.reload();
  await page.getByRole('heading', { name: 'Progress Command Center', exact: true }).waitFor();
  await page.waitForFunction(() => document.querySelector('.pg-hero-copy')?.textContent.includes('46%'));
  assert.equal(await page.locator('.app-sections').getByRole('link', { name: 'Dashboard', exact: true }).getAttribute('aria-current'), 'page');
  assert.equal(await page.getByRole('link', { name: 'Continue Learning', exact: true }).getAttribute('href'), '/learn/binary-tree');
  assert.match(await page.locator('.pg-hero-copy').innerText(), /46%/);
  assert.match(await page.locator('.pg-summary').innerText(), /2\/8/); assert.match(await page.locator('.pg-summary').innerText(), /75%/);
  assert.equal(await page.getByRole('img', { name: '46% overall learning progress' }).count(), 1);
  assert.equal(await page.locator('.pg-growth-ring path').count() > 24, true);
  assert.equal(await page.locator('.pg-heat-cell[tabindex]').count(), 30);
  assert.equal(await page.locator('.pg-week-days>div').count(), 7);
  await page.screenshot({ path: 'data/progress-desktop.png' });
  await page.getByRole('button', { name: 'View all 8 topics' }).click(); assert.equal(await page.locator('.pg-skill').count(), 8);
  await page.getByRole('button', { name: 'Show fewer topics' }).click();
  await page.getByRole('link', { name: 'Continue Learning', exact: true }).click(); await page.waitForURL('**/learn/binary-tree');
  await page.goto(base + '/progress'); await page.locator('.pg-actions a').first().click(); await page.waitForURL('**/learn/binary-tree');
  await page.goto(base + '/progress'); await page.getByRole('link', { name: 'View Curriculum', exact: true }).click(); await page.waitForURL('**/learn');
  await page.goto(base + '/progress'); await page.getByRole('link', { name: 'Open profile', exact: true }).click(); await page.waitForURL('**/profile');
  await page.goto(base + '/progress');
  for (const width of [1280, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('.pg-hero').waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert(await page.locator('.app-main').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
    await page.screenshot({ path: `data/progress-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.locator('.app-sidebar [data-nav-id=dashboard]').waitFor({ state: 'visible' });
  await page.locator('.app-drawer-close').click();
  await page.setViewportSize({ width: 1540, height: 1021 });
  await page.goto(base + '/dashboard'); await page.locator('.app-sidebar [data-nav-id=progress]').click(); await page.waitForURL('**/progress');
  await page.getByRole('button', { name: 'Notifications', exact: true }).click(); await page.getByRole('heading', { name: 'Your achievements', exact: true }).waitFor(); await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Search Alvio', exact: true }).fill('Arrays'); await page.keyboard.press('Enter'); await page.waitForURL('**/learn/array');
  assert.deepEqual(errors, []); await browser.close(); console.log('PASS: populated and empty analytics, real destinations, full topic access, responsive layouts, mobile sidebar.');
})().catch(e => { console.error(e); process.exit(1); });
