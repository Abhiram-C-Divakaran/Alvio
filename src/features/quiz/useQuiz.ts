import { useEffect, useState } from 'react';
import { questionBank } from '../../data/quizQuestions';
import useProgressStore from '../../stores/useProgressStore';
import { restoreSessionProgress } from '../../services/sessionProgress';
import { createSession, defaultConfig, summarize, timeLimit, type QuizConfig, type QuizSessionState } from './quizModel';

type View = 'setup' | 'session' | 'results' | 'review';
interface SavedQuiz { config: QuizConfig; session: QuizSessionState | null; view: View }
export function useQuiz(userId: string, initialTopic: string | null) {
  const key = `alvio-quiz-v1:${userId}`;
  const [state, setState] = useState<SavedQuiz>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null') as SavedQuiz | null;
      if (saved?.config && (!saved.session || saved.session.questions?.length)) return saved;
    } catch { /* An unavailable browser store should not prevent a quiz. */ }
    return { config: { ...defaultConfig, ...(initialTopic ? { topic: initialTopic } : {}) }, session: null, view: 'setup' };
  });
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const progress = useProgressStore(s => s.progress);
  const ready = progress?.userId === userId;
  useEffect(() => {
    if (!ready) restoreSessionProgress(userId).catch(() => setError('Could not load your learning profile. Reload to try again.'));
  }, [ready, userId]);
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { setError('Browser storage is full or unavailable. Keep this tab open to retain your session.'); }
  }, [key, state]);
  useEffect(() => { if (initialTopic) setState(s => ({ ...s, config: { ...s.config, topic: initialTopic } })); }, [initialTopic]);
  const { session, config, view } = state;
  const question = session?.questions[session.index];
  const locked = !!session && !!question && Object.hasOwn(session.answers, question.id);
  const deadline = question && session?.deadlines[question.id];
  const remaining = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;
  function answer(option: string | null) {
    setState(s => {
      const current = s.session;
      if (!current || current.endedAt || s.view !== 'session') return s;
      const q = current.questions[current.index];
      if (Object.hasOwn(current.answers, q.id)) return s;
      const expired = current.config.timed && (current.deadlines[q.id] || Infinity) <= Date.now();
      return { ...s, session: { ...current, answers: { ...current.answers, [q.id]: expired ? null : option } } };
    });
  }
  function move(index: number) {
    setNow(Date.now());
    setState(s => {
      const current = s.session;
      if (!current || index < 0 || index >= current.questions.length) return s;
      const id = current.questions[index].id;
      const deadlines = { ...current.deadlines };
      if (!current.endedAt && current.config.timed && !deadlines[id] && !Object.hasOwn(current.answers, id)) deadlines[id] = Date.now() + timeLimit(current.config) * 1000;
      return { ...s, session: { ...current, index, deadlines } };
    });
  }
  function finish() { setState(s => !s.session || s.session.endedAt ? s : { ...s, view: 'results', session: { ...s.session, endedAt: Date.now() } }); }
  function next() {
    if (!session) return;
    if (session.index < session.questions.length - 1) move(session.index + 1);
    else if (view === 'review') setState(s => ({ ...s, view: 'results' }));
    else finish();
  }
  useEffect(() => {
    if (view !== 'session' || !session?.config.timed || locked) return;
    const tick = () => { setNow(Date.now()); if (deadline && Date.now() >= deadline) answer(null); };
    tick(); const timer = window.setInterval(tick, 250); return () => clearInterval(timer);
  }, [view, session?.id, question?.id, locked, deadline]);
  useEffect(() => {
    if (view !== 'session' || session?.config.mode !== 'rapid' || !locked) return;
    const timer = window.setTimeout(next, 1800); return () => clearTimeout(timer);
  }, [view, session?.id, question?.id, locked]);
  useEffect(() => {
    if (!session?.endedAt || session.credited || !ready) return;
    let active = true;
    useProgressStore.getState().recordQuiz(summarize(session, userId)).then(awardedXp => {
      if (active) setState(s => s.session?.id === session.id ? { ...s, session: { ...s.session, credited: true, awardedXp } } : s);
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [session?.id, session?.endedAt, session?.credited, ready, userId]);
  useEffect(() => {
    if (view !== 'session' && view !== 'review') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || (e.target instanceof HTMLElement && e.target.closest('input,textarea,select'))) return;
      if (e.key === 'Enter' && e.target instanceof HTMLElement && e.target.closest('button,a')) return;
      const option = 'abcd'.indexOf(e.key.toLowerCase());
      const number = /^[1-4]$/.test(e.key) ? Number(e.key) - 1 : option;
      if (number >= 0 && view === 'session' && question) { e.preventDefault(); answer(question.options[number].id); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); move((session?.index || 0) - 1); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next(); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  });
  function start(chosen = config) {
    const nextSession = createSession(questionBank, chosen);
    if (nextSession && ready) { setError(''); setNow(Date.now()); setState({ config: chosen, session: nextSession, view: 'session' }); }
  }
  return {
    config, session, view, question, locked, remaining, error, ready,
    totals: ready ? progress.quizTotals : undefined,
    configure: (change: Partial<QuizConfig>) => setState(s => ({ ...s, config: { ...s.config, ...change } })),
    setView: (view: View) => setState(s => ({ ...s, view })),
    start, answer, move, next, result: session ? summarize(session, userId) : null,
  };
}
