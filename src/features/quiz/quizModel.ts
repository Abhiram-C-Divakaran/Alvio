import type { Question, Difficulty } from '../../data/quizQuestions';

export const topics = ['All', 'Arrays', 'Stacks', 'Binary Trees', 'AVL Trees', 'Graphs', 'Linked Lists', 'Queues', 'Hash Tables', 'Sorting', 'Searching', 'Dynamic Programming', 'Greedy', 'Recursion', 'String', 'Math'];
export const extraTopics = ['Backtracking', 'Divide and Conquer', 'Two Pointers', 'Sliding Window', 'Bit Manipulation'];
export interface QuizConfig { topic: string; difficulty: Difficulty | 'mixed'; mode: 'solo' | 'rapid'; count: number; timed: boolean }
export const defaultConfig: QuizConfig = { topic: 'All', difficulty: 'medium', mode: 'solo', count: 10, timed: true };
export interface QuizSessionState {
  id: string; config: QuizConfig; questions: Question[]; index: number;
  answers: Record<string, string | null>; deadlines: Record<string, number>;
  startedAt: number; endedAt?: number; credited?: boolean; awardedXp?: number;
}
export interface QuizTopicResult { topicId: string; topicName: string; correct: number; total: number; accuracy: number }
export interface QuizCompletion {
  id: string; userId: string; total: number; correct: number; accuracy: number; seconds: number;
  answerXp: number; bestStreak: number; endedAt: string; topics: QuizTopicResult[]; awardedXp?: number;
}
export const reward: Record<Difficulty, number> = { easy: 20, medium: 50, hard: 100 };
const topicIds: Record<string, string> = { Arrays: 'array', Stacks: 'stack', 'Binary Trees': 'binary-tree', 'AVL Trees': 'avl-tree', Graphs: 'graph', 'Linked Lists': 'linked-list', Queues: 'queue', 'Hash Tables': 'hash-table', 'Greedy Algorithms': 'greedy', 'Divide and Conquer': 'divide-conquer' };
export function availableQuestions(bank: Question[], config: QuizConfig) {
  return bank.filter(q => (config.difficulty === 'mixed' || q.difficulty === config.difficulty) && (
    config.topic === 'All' || q.topic === (config.topic === 'Greedy' ? 'Greedy Algorithms' : config.topic) ||
    (config.topic === 'Recursion' && /\brecurs(?:ion|ive|ively)\b/i.test(q.question + ' ' + q.codeSnippet + ' ' + q.explanation))
  ));
}
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export const timeLimit = (config: QuizConfig) => config.mode === 'rapid' ? 15 : 30;
export function createSession(bank: Question[], config: QuizConfig): QuizSessionState | null {
  const questions = shuffle(availableQuestions(bank, config)).slice(0, config.count).map(q => ({ ...q, options: shuffle(q.options) }));
  if (!questions.length) return null;
  const now = Date.now();
  return { id: crypto.randomUUID(), config: { ...config }, questions, index: 0, answers: {}, startedAt: now, deadlines: config.timed ? { [questions[0].id]: now + timeLimit(config) * 1000 } : {} };
}
export function summarize(session: QuizSessionState, userId: string): QuizCompletion {
  let correct = 0, answerXp = 0, streak = 0, bestStreak = 0;
  const byTopic = new Map<string, QuizTopicResult>();
  for (const q of session.questions) {
    const right = session.answers[q.id] === q.correctId;
    if (right) { correct++; answerXp += reward[q.difficulty]; streak++; bestStreak = Math.max(streak, bestStreak); } else streak = 0;
    const item = byTopic.get(q.topic) || { topicId: topicIds[q.topic] || q.topic.toLowerCase().replaceAll(' ', '-'), topicName: q.topic, correct: 0, total: 0, accuracy: 0 };
    item.total++; item.correct += Number(right); item.accuracy = Math.round(item.correct / item.total * 100); byTopic.set(q.topic, item);
  }
  return { id: session.id, userId, total: session.questions.length, correct, accuracy: Math.round(correct / session.questions.length * 100), seconds: Math.max(0, Math.round(((session.endedAt || Date.now()) - session.startedAt) / 1000)), answerXp, bestStreak, endedAt: new Date(session.endedAt || Date.now()).toISOString(), topics: [...byTopic.values()] };
}
