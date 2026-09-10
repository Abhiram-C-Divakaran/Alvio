const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'C:/Users/Abhiram/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  const page = await browser.newPage({viewport:{width:1512,height:847},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('alvio-quiz-v1:guest')));
  const progress=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('alvio-progress-storage')).state.progress);
  await page.goto('http://localhost:3001/quiz');
  await page.getByRole('button',{name:'Start Quiz',exact:true}).waitFor();
  assert.equal(await page.getByRole('link',{name:'Quizzes',exact:true}).getAttribute('aria-current'),'page');
  await page.screenshot({path:'data/quiz-desktop.png'});
  for(const topic of ['All','Arrays','Stacks','Binary Trees','AVL Trees','Graphs','Linked Lists','Queues','Hash Tables','Sorting','Searching','Dynamic Programming','Greedy','Recursion','String','Math']) {
    await page.getByRole('button',{name:topic,exact:true}).click();
    assert.equal((await state()).config.topic,topic);
    assert.equal(await page.getByRole('button',{name:'Start Quiz',exact:true}).isDisabled(),['String','Math'].includes(topic));
  }
  await page.getByRole('button',{name:'Arrays',exact:true}).click();
  for (const difficulty of ['Easy','Medium','Hard','Mixed']) { await page.getByRole('radio',{name:new RegExp('^'+difficulty+' ')}).check();assert.equal((await state()).config.difficulty,difficulty.toLowerCase()); }
  for(const count of [5,10,20,50]) { await page.getByRole('radio',{name:String(count),exact:true}).check();assert.equal((await state()).config.count,count); }
  await page.getByRole('radio',{name:'5',exact:true}).check();
  await page.getByRole('radio',{name:/^Medium /}).check();
  await page.getByRole('switch',{name:'Timed Mode'}).uncheck();
  await page.getByRole('button',{name:'Start Quiz',exact:true}).click();
  assert.equal(await page.getByRole('timer').count(),0);
  const initial = await state();
  for (let i=0;i<5;i++) {
    const current=(await state()).session;const q=current.questions[current.index];
    const index=q.options.findIndex(o=>i<3 ? o.id===q.correctId : o.id!==q.correctId);
    await page.keyboard.press(String(index+1));
    await page.locator('.quiz-feedback').waitFor();
    assert.equal(await page.locator('.quiz-answers button:disabled').count(),4);
    if(i===1) { await page.reload();await page.getByRole('heading',{name:'Question 2 of 5'}).waitFor();assert.equal((await state()).session.id,initial.session.id); }
    await page.getByRole('button',{name:i===4?'Submit Quiz':'Next',exact:true}).click();
  }
  await page.getByRole('button',{name:'Review Answers',exact:true}).waitFor();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('alvio-quiz-v1:guest')).session.credited);
  const completed = await progress();
  assert.equal(completed.totalXp,150);assert.equal(completed.quizTotals.completed,1);assert.equal(completed.quizTotals.correct,3);
  assert.equal(completed.topics.find(t=>t.topicId==='array').quizScore,60);assert(completed.weakAreas.includes('array'));
  await page.screenshot({path:'data/quiz-results.png'});
  await page.getByRole('button',{name:'Review Answers',exact:true}).click();
  assert.equal(await page.locator('.quiz-answers button:disabled').count(),4);
  await page.reload();await page.locator('.quiz-feedback').waitFor();assert.equal((await progress()).totalXp,150);
  await page.getByRole('button',{name:'Back to results',exact:true}).click();
  await page.getByRole('button',{name:'Quiz settings',exact:true}).click();
  assert.match(await page.locator('.quiz-stats').innerText(),/60%/);
  await page.getByRole('switch',{name:'Timed Mode'}).check();
  await page.getByRole('button',{name:'Start Quiz',exact:true}).click();
  await page.clock.install();await page.clock.fastForward(31000);
  await page.getByText('Time’s up.',{exact:true}).waitFor();assert.equal(Object.values((await state()).session.answers)[0],null);
  await page.getByRole('button',{name:'Save & exit',exact:true}).click();
  await page.getByRole('radio',{name:/^Rapid Fire /}).check();
  assert(await page.getByRole('switch',{name:'Timed Mode'}).isDisabled());
  await page.getByRole('button',{name:'Start Quiz',exact:true}).click();
  await page.clock.fastForward(16000);await page.getByText('Time’s up.',{exact:true}).waitFor();
  await page.clock.fastForward(2000);await page.getByRole('heading',{name:'Question 2 of 5'}).waitFor();
  await page.screenshot({path:'data/quiz-session.png'});
  await page.getByRole('button',{name:'Save & exit',exact:true}).click();
  for(const width of [1024,768,390,360]) {
    await page.setViewportSize({width,height:900});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const columns=await page.locator('.quiz-configuration').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
    assert.equal(columns,width<=640?1:2);
    await page.screenshot({path:`data/quiz-${width}.png`,fullPage:true});
  }
  assert.deepEqual(errors,[]);await browser.close();console.log('PASS: quiz controls, score, XP, mastery, recommendations, saved session/review, timers, Rapid Fire, responsive layouts.');
})().catch(e=>{console.error(e);process.exit(1);});
