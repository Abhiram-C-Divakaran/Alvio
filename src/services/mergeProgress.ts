import type { LearningProgress } from '../types/user';
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const record = (x: any) => x && typeof x === 'object' && !Array.isArray(x);
const counters = new Set(['minutes', 'sessions', 'totalTimeSpentMinutes', 'timeSpentMinutes', 'timeSpentSeconds', 'insert', 'delete', 'reset', 'totalXp', 'correct', 'questions']);

/** Three-way merge: unchanged values follow cloud; concurrent counters add only local deltas.
 * Legacy caches have no common ancestor, so their counters use the newer snapshot.
 * Completion sets are monotonic. Position, speed and preferences may move backwards.
 */
export function mergeProgress(local: LearningProgress, cloud: LearningProgress, base: LearningProgress | null): LearningProgress {
  if (local.userId !== cloud.userId || (base && base.userId !== local.userId)) throw Error('Account mismatch');
  const localNewer = (local.updatedAt || '') > (cloud.updatedAt || '');
  function merge(l: any, c: any, b: any, key = '', preferLocal = localNewer): any {
    const lt = record(l) && (l.updatedAt || l.lastAccessed), ct = record(c) && (c.updatedAt || c.lastAccessed);
    const newer = lt && ct ? lt > ct : preferLocal;
    if (equal(l, c)) return c;
    if (equal(l, b)) return c;
    if (equal(c, b)) return l;
    if (l === undefined) return c;
    if (c === undefined) return l;
    if (key === 'authoritativeXp') return c;
    if (Array.isArray(l) && Array.isArray(c)) {
      if (['completedQuizIds', 'completedSteps', 'exploredNodeIds', 'watchedSeconds'].includes(key)) return [...new Set([...c, ...l])];
      const id = key === 'topics' ? 'topicId' : key === 'weeklyActivity' ? 'day' : ['quizHistory', 'notes', 'badges'].includes(key) ? 'id' : null;
      if (id) {
        const values = new Map(c.map(v => [v[id], v]));
        for (const v of l) values.set(v[id], values.has(v[id]) ? merge(v, values.get(v[id]), b?.find((x: any) => x[id] === v[id]), '', newer) : v);
        const result = [...values.values()];
        return key === 'quizHistory' ? result.sort((a, z) => (a.endedAt || '').localeCompare(z.endedAt || '')).slice(-100) : result;
      }
      return newer ? l : c;
    }
    if (record(l) && record(c)) return Object.fromEntries([...new Set([...Object.keys(c), ...Object.keys(l)])].filter(k => !['__proto__', 'constructor', 'prototype'].includes(k)).map(k => [k, merge(l[k], c[k], b?.[k], k, newer)]));
    if (key === 'completed' && typeof l === 'boolean') return l || c;
    if (key === 'status' && (l === 'completed' || c === 'completed')) return 'completed';
    if (['completionPercent', 'quizScore', 'bestStreak'].includes(key) && typeof l === 'number' && typeof c === 'number') return Math.max(l, c);
    if (counters.has(key) && typeof b === 'number' && typeof l === 'number' && typeof c === 'number') return c + Math.max(0, l - b);
    return newer ? l : c;
  }
  const result: LearningProgress = { ...merge(local, cloud, base), authoritativeXp: cloud.authoritativeXp, updatedAt: new Date().toISOString() };
  if (base && local.quizTotals && cloud.quizTotals) {
    const known = new Set([...(cloud.completedQuizIds || []), ...(cloud.quizHistory || []).map(q => q.id), ...(base.completedQuizIds || [])]);
    const unique = (local.quizHistory || []).filter(q => !known.has(q.id));
    result.quizTotals = { ...result.quizTotals!, completed: cloud.quizTotals.completed + unique.length, correct: cloud.quizTotals.correct + unique.reduce((n,q) => n + q.correct, 0), questions: cloud.quizTotals.questions + unique.reduce((n,q) => n + q.total, 0) };
    const baseIds = new Set(base.completedQuizIds || []);
    const localQuizXp = (local.quizHistory || []).filter(q => !baseIds.has(q.id)).reduce((n,q) => n + q.answerXp, 0);
    const otherDelta = Math.max(0, (local.totalXp || 0) - (base.totalXp || 0) - localQuizXp);
    result.totalXp = (cloud.totalXp || 0) + unique.reduce((n,q) => n + q.answerXp, 0) + otherDelta;
  }
  return result;
}
