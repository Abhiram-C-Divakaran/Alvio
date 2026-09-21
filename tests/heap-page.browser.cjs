const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Abhiram/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await browser.newPage({viewport:{width:1556,height:1011},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://localhost:3001/3d-visualizer?ds=Heap');await p.locator('.st-array button').first().waitFor();
assert.equal(await p.locator('.st-array button').count(),7);
await p.getByRole('button',{name:'Index 1, value 75',exact:true}).click();assert.match(await p.locator('.st-inspector').innerText(),/Parent: 90/);
await p.getByLabel('Operation value').fill('100');await p.getByRole('button',{name:'Insert',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.st-array strong')?.textContent==='100').catch(async e=>{console.log(await p.locator('body').innerText());console.log(errors);await p.screenshot({path:'data/heap-failure.png'});throw e;});assert.equal(await p.locator('.st-array button').count(),8);
await p.getByRole('button',{name:'Delete',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.st-array strong')?.textContent==='90');
await p.getByRole('button',{name:/^Min Heap Parent/}).click();await p.waitForFunction(()=>document.querySelector('.st-array strong')?.textContent==='10');
await p.getByLabel('Operation value').fill('-5');await p.getByRole('button',{name:'Insert',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.st-array strong')?.textContent==='-5');
await p.getByRole('button',{name:'Accessible data view',exact:true}).click();assert.equal(await p.locator('.st-data tbody tr').count(),8);
await p.getByRole('button',{name:'Next step',exact:true}).click();assert.match(await p.locator('.st-guide').innerText(),/Root Property/);
await p.getByRole('button',{name:'Hide guide',exact:true}).click();assert.equal(await p.locator('.st-guide').count(),0);await p.getByRole('button',{name:'Show guide',exact:true}).click();
await p.getByRole('button',{name:'View Code Implementations',exact:true}).click();
for(const lang of ['Python','JavaScript','Java','C++']){await p.getByRole('button',{name:lang,exact:true}).click();assert.match(await p.locator('pre').innerText(),/heap|Heap/);}
await p.getByRole('button',{name:'Close modal',exact:true}).click();
for(const name of ['Array','Linked List','Stack','Queue','Hash Table','Binary Tree','BST','AVL Tree','Graph','Heap']) {await p.getByLabel('Data structure', {exact:true}).selectOption(name);await p.waitForFunction(n=>document.querySelector('h1')?.textContent===`${n} Learning Module`,name);}
await p.getByRole('button',{name:'Accessible data view',exact:true}).click();
await p.waitForTimeout(1200);await p.screenshot({path:'data/heap-desktop.png',fullPage:true});
await p.setViewportSize({width:390,height:844});await p.screenshot({path:'data/heap-mobile.png',fullPage:true});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await p.getByRole('button',{name:'Info',exact:true}).click();assert(await p.locator('.st-info').isVisible());await p.getByRole('button',{name:'Visualizer',exact:true}).click();assert(await p.locator('.st-scene').isVisible());
assert.deepEqual(errors,[]);await browser.close();console.log('PASS Heap desktop/mobile, insert/delete, min/max, inspector, data view, guide, code languages, 10 modules, no browser errors.');
})().catch(e=>{console.error(e);process.exit(1)});
