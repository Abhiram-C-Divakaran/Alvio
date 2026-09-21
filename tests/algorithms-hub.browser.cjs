const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Abhiram/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1536,height:1024}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3001/learn/algorithms');await page.locator('.al-algorithm').first().waitFor();
 assert.equal(await page.locator('.al-algorithm').count(),28);assert.equal(await page.locator('canvas').count(),0);
 assert.equal(await page.locator('.al-algorithm footer a').filter({hasText:'Open Visualizer'}).count(),26);
 await page.screenshot({path:'data/algorithms-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Sorting',exact:true}).click();assert.equal(await page.locator('.al-algorithm').count(),6);
 await page.getByLabel('Search algorithms',{exact:true}).fill('merge');assert.equal(await page.locator('.al-algorithm').count(),1);
 await page.getByRole('button',{name:'List view',exact:true}).click();assert.equal(await page.locator('.is-list .al-algorithm').count(),1);
 await page.getByRole('button',{name:'All',exact:true}).click();await page.getByLabel('Search algorithms',{exact:true}).fill('shortest path');assert.equal(await page.locator('.al-algorithm').count(),3);
 await page.getByLabel('Search algorithms',{exact:true}).fill('mst');assert.equal(await page.locator('.al-algorithm').count(),2);
 await page.getByLabel('Search algorithms',{exact:true}).fill('dp');assert.equal(await page.locator('.al-algorithm').count(),3);
 await page.getByLabel('Search algorithms',{exact:true}).fill('nothing-matches');await page.getByRole('button',{name:'Clear Filters',exact:true}).click();assert.equal(await page.locator('.al-algorithm').count(),28);
 await page.getByLabel('Sort algorithms',{exact:true}).selectOption('A–Z');assert.match(await page.locator('.al-algorithm h3').first().innerText(),/Knapsack/);
 await page.getByRole('button',{name:'Watch Overview',exact:true}).click();assert(await page.locator('dialog').isVisible());await page.keyboard.press('Escape');assert(!(await page.locator('dialog').isVisible()));
 await page.getByRole('button',{name:'Explore Backtracking',exact:true}).click();assert.match(await page.locator('dialog').innerText(),/undo/);await page.keyboard.press('Escape');
 for(const id of ['heap-sort','rabin-karp']){await page.goto(`http://localhost:3001/learn/algorithms/${id}`);await page.locator('.al-supplement pre').waitFor();assert((await page.locator('.al-supplement pre').innerText()).includes('def '));}
 await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:3001/learn/algorithms');await page.locator('.al-algorithm').first().waitFor();assert.equal(await page.locator('.al-algorithm').count(),28);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'data/algorithms-mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 await browser.close();console.log('PASS 28 cards, filtering/search, sorting, views, overview, supplemental routes, mobile overflow, no page errors');
})().catch(e=>{console.error(e);process.exit(1)});
