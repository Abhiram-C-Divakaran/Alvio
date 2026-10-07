const assert=require('node:assert/strict');const fs=require('node:fs');
const {chromium}=require('C:/Users/Abhiram/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
  const p=await browser.newPage({viewport:{width:1400,height:1000},deviceScaleFactor:2});
  await p.addInitScript(()=>{
   window.renderSamples={draws:0,frames:[]};let currentFrame=-1;let rafTime=0;
   const nativeRAF=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=fn=>nativeRAF(t=>{rafTime=t;fn(t)});
   for(const type of [WebGLRenderingContext,WebGL2RenderingContext])for(const name of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']) {
    const original=type.prototype[name];if(!original)continue;
    type.prototype[name]=function(...args){window.renderSamples.draws++;if(currentFrame!==rafTime){currentFrame=rafTime;window.renderSamples.frames.push(rafTime)}return original.apply(this,args)};
   }
  });
  const results=[];
  for(const name of ['Array','Linked List','Stack','Queue','Hash Table','Binary Tree','BST','AVL Tree','Heap','Graph']) {
   await p.goto(`http://localhost:3001/3d-visualizer?ds=${encodeURIComponent(name)}`);await p.locator('.st-canvas canvas').waitFor();
   await p.waitForTimeout(5000);
   const before=await p.evaluate(()=>window.renderSamples.draws);await p.waitForTimeout(2000);
   const idleDraws=await p.evaluate(n=>window.renderSamples.draws-n,before);
   assert.equal(idleDraws,0,`${name} must not draw continuously while idle`);
   const canvas=p.locator('.st-canvas canvas');const bounds=await canvas.boundingBox();
   const dpr=await canvas.evaluate(c=>c.width/c.clientWidth);assert(dpr<=1.51,'DPR capped');
   await p.evaluate(()=>window.renderSamples.frames=[]);
   await p.mouse.move(bounds.x+bounds.width*.45,bounds.y+bounds.height*.5);await p.mouse.down();
   const start=Date.now();for(let i=0;i<18;i++){await p.mouse.move(bounds.x+bounds.width*(.45+i*.006),bounds.y+bounds.height*.5);await p.waitForTimeout(35)}await p.mouse.up();
   const elapsed=Date.now()-start;const frames=await p.evaluate(()=>window.renderSamples.frames.length);
   const row={name,idleDraws,dpr,interactionFrames:frames,interactionMs:elapsed,observedFps:Math.round(frames*1000/elapsed)};results.push(row);console.log(JSON.stringify(row));
  }
  // CSS-hidden mobile scene must not draw even while the guide is playing.
  await p.setViewportSize({width:390,height:844});await p.getByRole('button',{name:'Play',exact:true}).click();await p.getByRole('button',{name:'Info',exact:true}).click();await p.waitForTimeout(1800);
  const before=await p.evaluate(()=>window.renderSamples.draws);await p.waitForTimeout(2200);assert.equal(await p.evaluate(()=>window.renderSamples.draws),before);
  fs.writeFileSync('data/visualizer-performance.json',JSON.stringify({environment:'Headless Edge / SwiftShader software WebGL, 1400x1000, deviceScaleFactor 2. Not a hardware GPU benchmark.',results},null,2));
  console.log('PASS all ten idle scenes, DPR cap, mobile hidden scene; measurements in data/visualizer-performance.json');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
