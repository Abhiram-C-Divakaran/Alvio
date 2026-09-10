import type { DashboardStats, LearningProgress, TopicProgress } from '../../types/user';
import { localDay } from '../../services/progressActivity.ts';
import { dashboardData, topicUrl, percent } from '../dashboard/dashboardData.ts';

export interface PracticeActivity { recordedAt: string; attempts: number }
export const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const studyTime = (minutes: number) => minutes > 0 && minutes < 1 ? '<1m' : minutes >= 60 ? `${Math.floor(minutes / 60)}h${Math.round(minutes % 60) ? ` ${Math.round(minutes % 60)}m` : ''}` : `${Math.round(minutes)}m`;
const monthKey = (date: Date) => localDay(date).slice(0, 7);
const topicOrder = ['array', 'linked-list', 'binary-tree', 'graph', 'hash-table'];
const practiceTopics: Record<string, string> = { 'binary-tree': 'Trees', 'avl-tree': 'Trees', 'hash-table': 'Hash Table', greedy: 'Greedy' };
export function learningRoute(topic: TopicProgress) { return topicUrl(topic); }
export function skillStatus(topic: TopicProgress) {
  if (topic.status === 'not-started' && topic.quizScore === null) return { label: 'Not Started', tone: 'slate' };
  const mastery = topic.quizScore ?? topic.completionPercent;
  return mastery >= 80 ? { label: 'Strong', tone: 'green' } : mastery >= 70 ? { label: 'Improving', tone: 'blue' } : { label: 'At Risk', tone: 'amber' };
}
export function progressData(progress: LearningProgress, stats: DashboardStats | null, practice: PracticeActivity[] = [], now = new Date()) {
  const base = dashboardData(progress, stats);
  const day = localDay(now), month = monthKey(now);
  const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const history = progress.quizHistory || [];
  const journal = progress.dailyActivity || {};
  const entries = Object.entries(journal);
  const dated = entries.length > 0;
  const monthEntries = entries.filter(([d]) => d.startsWith(month));
  const previousEntries = entries.filter(([d]) => d.startsWith(lastMonth));
  const minutes = monthEntries.reduce((n, [, a]) => n + a.minutes, 0);
  const previousMinutes = previousEntries.reduce((n, [, a]) => n + a.minutes, 0);
  const priorSnapshot = previousEntries.sort(([a], [b]) => b.localeCompare(a))[0]?.[1];
  const quizTopics = progress.topics.filter(t => t.quizScore !== null);
  const quizScore = quizTopics.length ? Math.round(quizTopics.reduce((n, t) => n + t.quizScore!, 0) / quizTopics.length) : null;
  const average = (key: string) => { const quizzes = history.filter(q => monthKey(new Date(q.endedAt)) === key); return quizzes.length ? Math.round(quizzes.reduce((n, q) => n + q.correct, 0) / quizzes.reduce((n, q) => n + q.total, 0) * 100) : null; };
  const thisQuiz = average(month), priorQuiz = average(lastMonth);
  const attempts: Record<string, number> = {};
  for (const event of practice) {
    const date = new Date(event.recordedAt);
    if (Number.isFinite(date.getTime())) { const key = localDay(date); attempts[key] = (attempts[key] || 0) + Math.max(0, event.attempts); }
  }
  const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(now.getDate() - (now.getDay() + 6) % 7);
  const week = shortDays.map((name, i) => {
    const date = new Date(monday); date.setDate(monday.getDate() + i); const key = localDay(date);
    return { name, date: key, label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes: dated ? journal[key]?.minutes || 0 : base.activity.find(a => a.day === name)?.minutes || 0,
      active: !!journal[key]?.sessions || !!attempts[key], future: key > day, today: key === day };
  });
  const heatmap = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now); date.setDate(now.getDate() - 29 + i); const key = localDay(date);
    return { date: key, weekday: (date.getDay() + 6) % 7, count: (journal[key]?.sessions || 0) + (attempts[key] || 0), minutes: journal[key]?.minutes || 0 };
  });
  const ordered = [...progress.topics].sort((a, b) => {
    const ai = topicOrder.indexOf(a.topicId), bi = topicOrder.indexOf(b.topicId); return (ai < 0 ? 100 : ai) - (bi < 0 ? 100 : bi);
  });
  const pathIds = ['array', 'linked-list', 'binary-tree', 'graph', 'dynamic-programming'];
  const path = pathIds.map(id => progress.topics.find(t => t.topicId === id)).filter((t): t is TopicProgress => !!t);
  if (base.current && !path.some(t => t.topicId === base.current!.topicId)) path.splice(Math.min(path.length, 4), 0, base.current);
  for (const topic of progress.topics) if (path.length < 5 && !path.some(t => t.topicId === topic.topicId)) path.push(topic);
  const suggestions = base.recommendations.length ? base.recommendations : ordered.slice(0, 3);
  const actions = suggestions.map((topic, i) => {
    const hasWeakQuiz = topic.quizScore !== null && topic.quizScore < 70;
    const kind = hasWeakQuiz ? 'review' : topic.status === 'in-progress' && topic.quizScore === null ? 'quiz' : i === 0 ? 'practice' : i === 1 ? 'quiz' : 'review';
    return { topic, kind, title: `${kind === 'practice' ? 'Practice' : kind === 'quiz' ? 'Take' : 'Review'} ${topic.topicName}${kind === 'quiz' ? ' Quiz' : ''}`, reason: hasWeakQuiz ? `Revisit concepts · ${topic.quizScore}% quiz score` : kind === 'practice' ? 'Build your problem solving skills' : kind === 'quiz' ? 'Check your understanding' : 'Strengthen your fundamentals', to: kind === 'practice' ? `/coding?topic=${encodeURIComponent(practiceTopics[topic.topicId] || topic.topicName)}` : kind === 'quiz' ? `/quiz?topic=${encodeURIComponent(topic.topicName)}` : learningRoute(topic) };
  });
  return { ...base, completion: percent(base.completion), quizScore, quizDelta: thisQuiz !== null && priorQuiz !== null ? thisQuiz - priorQuiz : null,
    studyMinutes: dated ? minutes : base.totalMinutes, studyLabel: dated ? 'this month' : 'total recorded',
    studyDelta: monthEntries.length && previousEntries.length ? minutes - previousMinutes : null,
    growthDelta: priorSnapshot ? base.completion - priorSnapshot.completion : null,
    week, dated, heatmap, skills: ordered, path: path.slice(0, 5), actions,
    continueTo: base.current ? learningRoute(base.current) : '/learn',
  };
}
export type ProgressData = ReturnType<typeof progressData>;
