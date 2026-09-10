// Deliberately varied analytics fixture, used only inside isolated browser test contexts.
const names = [['array','Arrays'],['linked-list','Linked Lists'],['stack','Stacks'],['queue','Queues'],['binary-tree','Binary Trees'],['avl-tree','AVL Trees'],['graph','Graphs'],['hash-table','Hash Tables']];
const values=[100,100,40,60,20,30,10,10];
const now=new Date();const day=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const monday=new Date(now);monday.setDate(now.getDate()-(now.getDay()+6)%7);
const prior=new Date(now.getFullYear(),now.getMonth()-1,15,12);
const dailyActivity={[day(prior)]:{minutes:120,sessions:3,completion:40}};
for(let i=0;i<=((now.getDay()+6)%7);i++){const d=new Date(monday);d.setDate(d.getDate()+i);dailyActivity[day(d)]={minutes:(i+1)*30,sessions:i+1,completion:46};}
const progress={userId:'guest',topics:names.map(([topicId,topicName],i)=>({topicId,topicName,status:i<2?'completed':i<6?'in-progress':'not-started',completionPercent:values[i],timeSpentMinutes:60,quizScore:i===0?88:i===1?76:i===4?62:null,lastAccessed:new Date(now.getTime()-(i===4?0:(i+1)*86400000)).toISOString()})),totalTimeSpentMinutes:480,overallScore:75,streak:5,badges:[{id:'first-steps',name:'First Steps',description:'Completed first topic',icon:'Award',earnedAt:now.toISOString()}],weakAreas:['binary-tree'],recommendedTopics:['graph','hash-table'],dailyActivity,totalXp:150,weeklyActivity:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=>({day,minutes:20})),quizHistory:[{id:'prior',total:10,correct:6,endedAt:prior.toISOString()},{id:'current',total:10,correct:8,endedAt:now.toISOString()}]};
const stats={coursesCompleted:2,totalCourses:8,totalXp:4410,level:3,levelName:'Scholar',nextLevelXp:6001,totalTimeSpent:480,currentStreak:5,weeklyActivity:progress.weeklyActivity};
module.exports={progress,stats};
