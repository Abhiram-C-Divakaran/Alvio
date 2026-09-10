import { ArrowLeft, ArrowRight, Check, Clock3, RotateCcw, Trophy, X, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import type { useQuiz } from './useQuiz';
type Quiz = ReturnType<typeof useQuiz>;
const duration = (seconds: number) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

export function QuizSession({ quiz }: { quiz: Quiz }) {
  const reduced = useReducedMotion();
  const { session, question: q, result } = quiz;
  if (!session || !q || !result) return null;
  const reviewing = quiz.view === 'review';
  const answered = quiz.locked || reviewing;
  const selected = session.answers[q.id];
  const correct = selected === q.correctId;
  return <section className="quiz-focus" aria-label={reviewing ? 'Review answers' : 'Quiz session'}>
    <div className="quiz-session-top"><button className="quiz-text-button" onClick={() => quiz.setView(reviewing ? 'results' : 'setup')}><ArrowLeft size={16}/>{reviewing ? 'Back to results' : 'Save & exit'}</button><span>{reviewing ? 'ANSWER REVIEW' : session.config.mode === 'rapid' ? 'RAPID FIRE' : 'SOLO CHALLENGE'}</span></div>
    <div className="quiz-session-heading"><div><div className="quiz-eyebrow">QUIZ ARENA</div><h1>Question {session.index + 1} <span>of {session.questions.length}</span></h1></div><div className="quiz-session-metrics"><span>{result.correct} correct</span>{session.config.timed && !reviewing && <span className={`quiz-timer ${!answered && (quiz.remaining || 0) <= 5 ? 'urgent' : ''}`} role="timer" aria-label="Time remaining"><Clock3 size={18}/>{answered ? 'Answered' : `${quiz.remaining ?? 0}s`}</span>}</div></div>
    <div className="quiz-progress" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={session.questions.length} aria-valuenow={Object.keys(session.answers).length}><span style={{ width: `${Object.keys(session.answers).length / session.questions.length * 100}%` }}/></div>
    <motion.div key={q.id} className="quiz-question-card" initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18 }}>
      <div className="quiz-question-tags"><span>{q.topic}</span><span className={q.difficulty}>{q.difficulty}</span><span>{q.type}</span></div>
      <h2>{q.question}</h2>{q.codeSnippet && <pre><code>{q.codeSnippet}</code></pre>}
      <div className="quiz-answers" role="group" aria-label="Answer options">{q.options.map((option, i) => {
        const right = answered && option.id === q.correctId;
        const wrong = answered && selected === option.id && !right;
        return <button key={option.id} className={`${right ? 'correct' : ''} ${wrong ? 'incorrect' : ''}`} disabled={answered} aria-pressed={selected === option.id} onClick={() => quiz.answer(option.id)}><span className="quiz-answer-letter">{'ABCD'[i]}</span><span>{option.text}</span>{right ? <Check size={20} aria-label="Correct answer"/> : wrong ? <X size={20} aria-label="Incorrect answer"/> : null}</button>;
      })}</div>
      {answered && <div className={`quiz-feedback ${correct ? 'correct' : 'incorrect'}`} role="status"><strong>{correct ? 'Correct. Nicely solved!' : selected === null ? 'Time’s up.' : selected === undefined ? 'Not answered.' : 'Not quite.'}</strong><p>{q.explanation}</p>{!reviewing && session.config.mode === 'rapid' && <small>Moving to the next question…</small>}</div>}
    </motion.div>
    <div className="quiz-session-footer"><button className="quiz-secondary" disabled={session.index === 0} onClick={() => quiz.move(session.index - 1)}><ArrowLeft size={16}/>Previous</button><span>A–D or 1–4 to answer · ← → to navigate</span><button className="quiz-primary" onClick={quiz.next}>{session.index === session.questions.length - 1 ? reviewing ? 'Back to results' : 'Submit Quiz' : 'Next'}<ArrowRight size={16}/></button></div>
    {!answered && !reviewing && <p className="quiz-skip-hint">You can return to skipped questions. Unanswered questions count as incorrect when submitted.</p>}
  </section>;
}
export function QuizResults({ quiz }: { quiz: Quiz }) {
  const { session, result } = quiz;
  if (!session || !result) return null;
  const sorted = [...result.topics].sort((a, b) => b.accuracy - a.accuracy);
  const strongest = sorted[0], weakest = sorted[sorted.length - 1];
  return <section className="quiz-results"><span className="quiz-result-trophy"><Trophy size={34}/></span><div className="quiz-eyebrow">PRACTICE MAKES PROGRESS</div><h1>Quiz Complete</h1><p>One more step toward a sharper you.</p>
    <div className="quiz-result-score">{result.correct}<span> / {result.total}</span></div>
    <dl className="quiz-result-stats"><div><dd>{result.accuracy}%</dd><dt>Accuracy</dt></div><div><dd>{duration(result.seconds)}</dd><dt>Time</dt></div><div><dd>{session.credited ? `+${session.awardedXp}` : 'Saving…'}</dd><dt>XP earned</dt></div></dl>
    <p className="quiz-xp-note">{result.answerXp} answer XP · Includes any improvement to your topic mastery XP.</p>
    <div className="quiz-topic-results"><div><small>Strongest Topic</small><strong>{strongest.topicName}</strong><span>{strongest.accuracy}% · {strongest.correct}/{strongest.total} correct</span></div><div><small>Weakest Topic</small><strong>{weakest.topicName}</strong><span>{weakest.accuracy}% · {weakest.correct}/{weakest.total} correct</span></div></div>
    <p className="quiz-result-guidance">{result.accuracy === 100 ? 'A clean sweep. Try a harder challenge next.' : `Keep practicing ${weakest.topicName}. Your progress and recommendations have been updated.`}</p>
    <div className="quiz-result-actions"><button className="quiz-primary" disabled={!session.credited} onClick={() => quiz.start(session.config)}><RotateCcw size={17}/>Retry Quiz</button><button className="quiz-secondary" disabled={!session.credited} onClick={() => { quiz.move(0); quiz.setView('review'); }}><BookOpen size={17}/>Review Answers</button><button className="quiz-text-button" disabled={!session.credited} onClick={() => quiz.setView('setup')}>Quiz settings</button></div>
    <Link className="quiz-text-button" to="/coding"><ArrowLeft size={16}/>Back to Practice</Link>
  </section>;
}
