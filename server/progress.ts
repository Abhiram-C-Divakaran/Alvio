import type { Express } from 'express';
import db from './db';
import { requireAuth } from './auth';
import { rateLimit } from './security';
import type { LearningProgress } from '../src/types/user';
const object=(v:any)=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const number=(v:any,max=10_000_000)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max;
const bounded=(v:any,max:number)=>Array.isArray(v)&&v.length<=max;
export function validateProgress(value:any,userId:number):LearningProgress {
 const fail=()=>{throw Error('Invalid learning progress.');};
 const walk=(v:any,depth=0)=>{if(depth>12)fail();if(typeof v==='number'&&!number(v))fail();if(typeof v==='string'&&v.length>10000)fail();if(Array.isArray(v)){if(v.length>20000)fail();v.forEach(x=>walk(x,depth+1));}else if(object(v)){if(Object.keys(v).length>4000)fail();for(const [k,x] of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k)||k.length>160)fail();if(/^(completionPercent|overallScore|quizScore|accuracy|completion)$/.test(k)&&x!==null&&!number(x,100))fail();walk(x,depth+1)}}};
 if(!object(value)||String(value.userId)!==String(userId))fail();walk(value);
 const allowed=new Set(['userId','updatedAt','topics','totalTimeSpentMinutes','overallScore','streak','badges','weakAreas','recommendedTopics','totalXp','authoritativeXp','weeklyActivity','quizHistory','completedQuizIds','quizTotals','dailyActivity','visualizerModules','visualizerReducedMotion','videoLessons']);
 if(Object.keys(value).some(k=>!allowed.has(k))||!bounded(value.topics,200)||!bounded(value.badges,100)||!bounded(value.weakAreas,200)||!bounded(value.recommendedTopics,200)||!number(value.totalTimeSpentMinutes)||!number(value.overallScore,100)||!number(value.streak,100000))fail();
 const ids=new Set();for(const t of value.topics){if(!object(t)||typeof t.topicId!=='string'||t.topicId.length>100||ids.has(t.topicId)||typeof t.topicName!=='string'||t.topicName.length>200||!['not-started','in-progress','completed'].includes(t.status)||!number(t.completionPercent,100)||!number(t.timeSpentMinutes)||!(t.quizScore===null||number(t.quizScore,100))||!Number.isFinite(Date.parse(t.lastAccessed)))fail();ids.add(t.topicId)}
 if(value.updatedAt!==undefined&&(typeof value.updatedAt!=='string'||!Number.isFinite(Date.parse(value.updatedAt))))fail();
 for(const [key,max] of [['visualizerModules',100],['videoLessons',200],['dailyActivity',3660]] as const)if(value[key]!==undefined&&(!object(value[key])||Object.keys(value[key]).length>max))fail();
 for(const v of Object.values(value.visualizerModules||{}) as any[]){if(!object(v)||typeof v.moduleId!=='string'||typeof v.variant!=='string'||!Number.isInteger(v.totalSteps)||v.totalSteps<1||v.totalSteps>10000||!Number.isInteger(v.currentStep)||v.currentStep<0||v.currentStep>=v.totalSteps||!bounded(v.completedSteps,10000)||v.completedSteps.some((n:any)=>!Number.isInteger(n)||n<0||n>=v.totalSteps)||!bounded(v.exploredNodeIds,256)||!number(v.timeSpentSeconds)||typeof v.completed!=='boolean'||!object(v.operationsPerformed)||!['insert','delete','reset'].every(k=>number(v.operationsPerformed[k])))fail();}
 for(const v of Object.values(value.videoLessons||{}) as any[]){if(!object(v)||!number(v.position,86400)||!number(v.duration,86400)||!number(v.speed,4)||typeof v.completed!=='boolean'||!bounded(v.watchedSeconds,20000)||!bounded(v.notes,200))fail();}
 if(value.quizHistory!==undefined){if(!bounded(value.quizHistory,100))fail();for(const q of value.quizHistory){if(!object(q)||String(q.userId)!==String(userId)||typeof q.id!=='string'||!number(q.total,1000)||q.total<1||!number(q.correct,q.total)||!number(q.accuracy,100)||!number(q.seconds,86400))fail();}}
 if(value.completedQuizIds!==undefined&&(!bounded(value.completedQuizIds,10000)||value.completedQuizIds.some((v:any)=>typeof v!=='string'||v.length>160)))fail();
 if(value.weeklyActivity!==undefined&&(!bounded(value.weeklyActivity,7)||value.weeklyActivity.some((v:any)=>!object(v)||typeof v.day!=='string'||!number(v.minutes))))fail();
 const text=(v:any,max=160)=>typeof v==='string'&&v.length<=max;
 const date=(v:any)=>text(v,40)&&Number.isFinite(Date.parse(v));
 for(const list of [value.weakAreas,value.recommendedTopics])if(list.some((v:any)=>!text(v)))fail();
 for(const badge of value.badges)if(!object(badge)||!text(badge.id)||!text(badge.name,200)||!text(badge.description,1000)||!text(badge.icon)||!date(badge.earnedAt))fail();
 if(value.totalXp!==undefined&&!number(value.totalXp))fail();
 if(value.visualizerReducedMotion!==undefined&&typeof value.visualizerReducedMotion!=='boolean')fail();
 for(const v of Object.values(value.visualizerModules||{}) as any[])if(!date(v.lastAccessed)||!text(v.moduleId)||!text(v.variant)||v.exploredNodeIds.some((id:any)=>!text(id)))fail();
 for(const v of Object.values(value.videoLessons||{}) as any[]){
   if(v.speed<=0||v.watchedSeconds.some((n:any)=>!Number.isInteger(n)||!number(n,86400)))fail();
   for(const note of v.notes)if(!object(note)||!text(note.id)||!text(note.text,10000)||!number(note.time,86400)||!date(note.createdAt))fail();
 }
 const attempts=new Set();for(const q of value.quizHistory||[]){
   if(!text(q.id)||attempts.has(q.id)||!date(q.endedAt)||!number(q.answerXp)||!number(q.bestStreak,q.total)||!bounded(q.topics,200))fail();attempts.add(q.id);
   for(const t of q.topics)if(!object(t)||!text(t.topicId)||!text(t.topicName,200)||!number(t.total,1000)||!number(t.correct,t.total)||!number(t.accuracy,100))fail();
 }
 if(value.quizTotals!==undefined){const q=value.quizTotals;if(!object(q)||!['completed','correct','questions','bestStreak'].every(k=>number(q[k]))||!text(q.lastDay,10))fail();}
 for(const [date,v] of Object.entries(value.dailyActivity||{}) as any){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!object(v)||!number(v.minutes,1440)||!number(v.sessions,10000)||!number(v.completion,100))fail();}
 return value;
}
export function registerProgress(app:Express){
 app.get('/api/progress',requireAuth,(req,res)=>{const row=db.prepare('SELECT * FROM learning_progress WHERE user_id=?').get(req.userId) as any;res.json(row?{progress:JSON.parse(row.progress_json),revision:row.revision}:{progress:null,revision:0});});
 app.put('/api/progress',requireAuth,rateLimit(120,60000,'progress',true),(req,res)=>{
 let progress:LearningProgress;try{progress=validateProgress(req.body.progress,req.userId);if(!Number.isSafeInteger(req.body.revision)||req.body.revision<0)throw Error();}catch{return res.status(400).json({error:'Invalid learning progress.',code:'INVALID_PROGRESS'});}
 db.exec('BEGIN IMMEDIATE');try{
 const row=db.prepare('SELECT * FROM learning_progress WHERE user_id=?').get(req.userId) as any;
 if((row?.revision||0)!==req.body.revision){db.exec('ROLLBACK');return res.status(409).json({error:'Progress changed on another device.',code:'PROGRESS_CONFLICT',progress:row?JSON.parse(row.progress_json):null,revision:row?.revision||0});}
 const user=db.prepare('SELECT xp FROM users WHERE id=?').get(req.userId) as any;
 // Learning records remain self-reported. They NEVER update permanent user XP.
 const saved={...progress,userId:String(req.userId),authoritativeXp:user.xp,updatedAt:new Date().toISOString()};const revision=(row?.revision||0)+1;
 db.prepare('INSERT INTO learning_progress(user_id,progress_json,revision,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET progress_json=excluded.progress_json,revision=excluded.revision,updated_at=excluded.updated_at').run(req.userId,JSON.stringify(saved),revision,saved.updatedAt);db.exec('COMMIT');res.json({progress:saved,revision});
 }catch(e){db.exec('ROLLBACK');throw e;}
 });
}
