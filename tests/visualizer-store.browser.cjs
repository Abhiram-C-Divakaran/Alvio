const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Abhiram/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 try {
  const p=await b.newPage();await p.goto('http://localhost:3001/profile');await p.waitForLoadState('domcontentloaded');
  const result=await p.evaluate(async()=>{
   // Use the same Vite module identity as session restore, including HMR stamps.
   const source=await (await fetch('/src/services/sessionProgress.ts')).text();
   const storeUrl=source.match(/from "([^"]*useProgressStore[^\"]*)"/)[1];
   const {default:store}=await import(storeUrl);
   const {dbService}=await import('/src/services/db.ts');
   const {restoreSessionProgress}=await import('/src/services/sessionProgress.ts');
   const old={userId:'integration-learner',topics:[{topicId:'binary-tree',topicName:'Binary Trees',status:'in-progress',completionPercent:37,timeSpentMinutes:5,quizScore:80,lastAccessed:new Date().toISOString()}],totalTimeSpentMinutes:5,overallScore:80,streak:1,badges:[],weakAreas:[],recommendedTopics:[],totalXp:100};
   store.getState().setProgress(old);await dbService.saveProgress(old);
   const realSave=dbService.saveProgress.bind(dbService);dbService.saveProgress=async()=>{throw new Error('Simulated storage outage')};
   await store.getState().saveVisualizerProgress(old.userId,{name:'BST',variant:'Binary Search Tree',totalSteps:2,step:0,seconds:10});
   await store.getState().saveVisualizerProgress(old.userId,{name:'BST',variant:'Binary Search Tree',totalSteps:2,step:1,inspected:'root'});
   const beforeRestore=structuredClone(store.getState().progress);
   await restoreSessionProgress(old.userId);
   const afterRestore=structuredClone(store.getState().progress);
   await store.getState().saveVisualizerProgress('other-account',{name:'Heap',variant:'Max Heap',totalSteps:5,step:1});
   const afterWrongOwner=structuredClone(store.getState().progress);
   dbService.saveProgress=realSave;await restoreSessionProgress(old.userId);
   const synced=await dbService.getProgress(old.userId);
   const pending=store.getState().visualizerSyncPending;
   store.getState().setProgress({...old,userId:'other-account',topics:[]});
   await store.getState().saveVisualizerProgress('other-account',{name:'Heap',variant:'Min Heap',totalSteps:5,step:2});
   return {beforeRestore,afterRestore,afterWrongOwner,synced,pending,other:store.getState().progress,stats:store.getState().stats};
  });
  assert.deepEqual(result.afterRestore,result.beforeRestore,'failed sync survives session restore');
  assert.deepEqual(result.afterWrongOwner,result.beforeRestore,'account mismatch rejected');
  assert.deepEqual(result.synced,result.beforeRestore,'pending local progress retries safely');assert.equal(result.pending,false);
  assert.equal(result.beforeRestore.topics.length,1);assert.equal(result.beforeRestore.topics[0].completionPercent,37);assert.equal(result.beforeRestore.topics[0].quizScore,80);
  assert.equal(result.beforeRestore.totalTimeSpentMinutes,5+10/60);assert.equal(result.beforeRestore.totalXp,100);
  assert.deepEqual(Object.keys(result.other.visualizerModules),['heap:Min Heap']);
  console.log('PASS actual store/IndexedDB, old profile, activity totals, preserved course/quiz/XP, sync failure/retry, account isolation.');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
