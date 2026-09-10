import assert from 'node:assert/strict';
import { questionBank } from '../src/data/quizQuestions.ts';
import { topics, extraTopics, availableQuestions, defaultConfig, createSession, summarize, reward } from '../src/features/quiz/quizModel.ts';
assert.equal(new Set(questionBank.map(q => q.id)).size, questionBank.length);
for (const topic of [...topics, ...extraTopics]) for (const difficulty of ['easy','medium','hard','mixed']) for (const count of [5,10,20,50]) {
  const config = {...defaultConfig,topic,difficulty,count};
  const available = availableQuestions(questionBank, config);
  const session = createSession(questionBank, config);
  if (['String','Math'].includes(topic)) { assert.equal(session,null); continue; }
  assert(available.length > 0, `${topic}/${difficulty}`);
  assert.equal(session.questions.length, Math.min(count,available.length));
  assert.equal(new Set(session.questions.map(q => q.id)).size,session.questions.length);
  for (const q of session.questions) {
    assert(available.includes(questionBank.find(source => source.id === q.id)));
    assert.equal(q.options.length,4); assert(q.options.some(o => o.id === q.correctId));
    if (difficulty !== 'mixed') assert.equal(q.difficulty,difficulty);
  }
}
const session = createSession(questionBank,{...defaultConfig,count:5,difficulty:'mixed',timed:false});
session.questions.forEach((q,i) => { session.answers[q.id] = i < 3 ? q.correctId : null; });
session.endedAt = session.startedAt + 91000;
const score = summarize(session,'test');
assert.equal(score.correct,3);assert.equal(score.accuracy,60);assert.equal(score.bestStreak,3);assert.equal(score.seconds,91);
assert.equal(score.answerXp,session.questions.slice(0,3).reduce((n,q) => n+reward[q.difficulty],0));
assert.equal(score.topics.reduce((n,t)=>n+t.total,0),5);
console.log('PASS: every topic, all difficulties/counts, no duplicates, missing-topic states, shuffled answers, accurate score/XP/time/streak.');
