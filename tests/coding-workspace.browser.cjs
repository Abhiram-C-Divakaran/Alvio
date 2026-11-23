const assert = require('node:assert/strict');
const { chromium, testOrigin } = require('./browser-runtime.cjs');

(async () => {
  const b = await chromium.launch({ seedProblems: true, channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1536, height: 1024 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));

  await p.goto(testOrigin() + '/coding?problem=number-of-digit-one');
  await p.locator('.monaco-editor').waitFor();
  await p.getByRole('button', { name: 'Hints', exact: true }).first().click();
  await p.getByText('Hint 1', { exact: true }).click();
  assert(await p.getByText('Think about counting contributions digit by digit.', { exact: true }).isVisible());
  await p.getByRole('button', { name: 'Description', exact: true }).click();
  await p.getByRole('button', { name: 'Fullscreen workspace' }).click();
  assert(await p.locator('.cw-root').evaluate(e => e.classList.contains('cw-expanded')));
  await p.keyboard.press('Escape');

  const solutionCode = 'function countDigitOne(n) { return Array.from({length:n+1},(_,i)=>String(i)).join("").split("1").length-1; }';
  await p.evaluate(
    code => localStorage.setItem(`alvio-code:${JSON.parse(localStorage.getItem('alvio-auth-storage')).state.user.id}:number-of-digit-one:javascript`, code),
    solutionCode
  );
  await p.reload();
  await p.locator('.monaco-editor').waitFor();

  // Verify Run + Run Testcase
  await p.getByRole('button', { name: 'Run', exact: true }).click();
  await p.getByText('Local tests passed', { exact: true }).waitFor();
  assert(!await p.getByRole('button', { name: 'Run', exact: true }).isDisabled());
  await p.getByRole('button', { name: 'Testcase', exact: true }).click();
  await p.getByRole('button', { name: 'Run Testcase', exact: true }).click();
  await p.getByText('Passed: 1/1', { exact: true }).waitFor();

  // Verify Submit + Submission History UI (mocking only the server submission endpoint so no external Paiza network call is required)
  let capturedSubmitBody = null;
  const savedSub = {
    id: 1,
    problem_id: 'number-of-digit-one',
    status: 'Passed',
    language: 'javascript',
    code: solutionCode,
    runtime_ms: 85,
    memory_mb: null,
    passed_testcases: 4,
    total_testcases: 4,
    verified: 1,
    created_at: new Date().toISOString()
  };
  await p.route('**/api/problems/number-of-digit-one/submit', route => {
    capturedSubmitBody = route.request().postDataJSON();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'Passed',
        passedCount: 4,
        totalCount: 4,
        executionTimeMs: 85,
        message: 'All provided test cases passed.',
        stdout: [],
        errorType: null,
        verified: true,
        saved: true,
        stats: { accepted: 1, submissions: 1 },
        submission: savedSub
      })
    });
  });
  await p.route('**/api/problems/number-of-digit-one/submissions', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ submission: savedSub, submissions: [savedSub] })
    })
  );

  await p.getByRole('button', { name: 'Submit', exact: true }).click();
  await p.getByText('Passed: 4/4', { exact: true }).waitFor();
  assert.deepEqual(Object.keys(capturedSubmitBody).sort(), ['code', 'language']);
  await p.getByRole('button', { name: 'Submissions', exact: true }).click();
  await p.getByText('Test cases passed: 4/4', { exact: true }).waitFor();

  // Verify Coding AI Analysis never exposes internal secret names on provider failure
  await p.route('**/api/chat', route =>
    route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'GROQ_API_KEY missing' }) })
  );
  await p.getByRole('button', { name: 'Analysis', exact: true }).click();
  await p.getByText('AI analysis is currently unavailable. Please try again in a moment.', { exact: true }).waitFor();
  assert(!(await p.locator('body').innerText()).includes('GROQ_API_KEY'));
  await p.unroute('**/api/chat');

  // Verify Run timeout protection
  await p.evaluate(() =>
    localStorage.setItem(
      `alvio-code:${JSON.parse(localStorage.getItem('alvio-auth-storage')).state.user.id}:number-of-digit-one:javascript`,
      'function countDigitOne(n) { while(true){} }'
    )
  );
  await p.reload();
  await p.locator('.monaco-editor').waitFor();
  await p.getByRole('button', { name: 'Run', exact: true }).click();
  await p.getByText('Time Limit Exceeded (3 seconds)', { exact: false }).waitFor();

  await p.setViewportSize({ width: 390, height: 844 });
  await p.screenshot({ path: 'data/coding-mobile.png', fullPage: true });
  assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile overflow');
  assert.deepEqual(errors, []);
  await b.close();
  console.log('PASS Monaco, hints, fullscreen Escape, saved drafts, run, testcase, server submit + history, timeout and mobile overflow');
})().catch(e => {
  console.error(e);
  process.exit(1);
});
