import type { LearningProgress, VisualizerModuleProgress } from '../types/user';
import { recordActivity } from './progressActivity';

export const visualizerTopics: Record<string, { id: string; topicId: string; quiz: string; variant: string }> = {
  Array: { id: 'array', topicId: 'array', quiz: 'Arrays', variant: 'Static Array' },
  'Linked List': { id: 'linked-list', topicId: 'linked-list', quiz: 'Linked Lists', variant: 'Singly Linked' },
  Stack: { id: 'stack', topicId: 'stack', quiz: 'Stacks', variant: 'Array Stack' },
  Queue: { id: 'queue', topicId: 'queue', quiz: 'Queues', variant: 'Simple Queue' },
  'Hash Table': { id: 'hash-table', topicId: 'hash-table', quiz: 'Hash Tables', variant: 'Chaining' },
  'Binary Tree': { id: 'binary-tree', topicId: 'binary-tree', quiz: 'Binary Trees', variant: 'Binary Search Tree' },
  BST: { id: 'bst', topicId: 'binary-tree', quiz: 'Binary Trees', variant: 'Binary Search Tree' },
  'AVL Tree': { id: 'avl-tree', topicId: 'binary-tree', quiz: 'AVL Trees', variant: 'AVL Tree' },
  Heap: { id: 'heap', topicId: 'heap', quiz: 'Binary Trees', variant: 'Max Heap' },
  Graph: { id: 'graph', topicId: 'graph', quiz: 'Graphs', variant: 'Directed Graph' },
};
export const visualizerKey = (name: string, variant: string) => `${visualizerTopics[name].id}:${variant}`;
export function latestVisualizer(progress: LearningProgress | null, name?: string) {
  return Object.values(progress?.visualizerModules || {})
    .filter(p => Object.values(visualizerTopics).some(t => t.id === p.moduleId) && (!name || p.moduleId === visualizerTopics[name]?.id))
    .reverse().sort((a, b) => b.lastAccessed.localeCompare(a.lastAccessed))[0];
}
export interface VisualizerUpdate {
  name: string; variant: string; totalSteps: number;
  step?: number; inspected?: string; operation?: 'insert' | 'delete' | 'reset';
  seconds?: number; reducedMotion?: boolean;
}

/** One atomic update: no synthetic XP, no course completion, and no lost counters. */
export function applyVisualizerProgress(base: LearningProgress, event: VisualizerUpdate, date = new Date()): LearningProgress {
  const meta = visualizerTopics[event.name];
  if (!meta || !Number.isInteger(event.totalSteps) || event.totalSteps < 1) return base;
  const key = visualizerKey(event.name, event.variant);
  const old = base.visualizerModules?.[key];
  const step = Math.max(0, Math.min(event.totalSteps - 1, Math.trunc(event.step ?? old?.currentStep ?? 0)));
  const operations = { insert: 0, delete: 0, reset: 0, ...old?.operationsPerformed };
  if (event.operation) operations[event.operation]++;
  const completedSteps = [...new Set([...(old?.completedSteps || []), ...(event.step === undefined ? [] : [step])])].filter(n => n >= 0 && n < event.totalSteps).sort((a, b) => a - b);
  const exploredNodeIds = [...new Set([...(old?.exploredNodeIds || []), ...(event.inspected ? [event.inspected] : [])])].slice(-256);
  const seconds = Number.isFinite(event.seconds) ? Math.max(0, Math.min(30, event.seconds!)) : 0;
  const completed = !!old?.completed || (completedSteps.length === event.totalSteps && (event.name === 'Heap' ? operations.insert + operations.delete > 0 : exploredNodeIds.length > 0));
  const module: VisualizerModuleProgress = {
    moduleId: meta.id, variant: event.variant, currentStep: step, completedSteps, totalSteps: event.totalSteps,
    operationsPerformed: operations, exploredNodeIds, timeSpentSeconds: (old?.timeSpentSeconds || 0) + seconds,
    lastAccessed: date.toISOString(), completed,
  };
  const topics = base.topics.map(t => ({ ...t }));
  let topic = topics.find(t => t.topicId === meta.topicId);
  if (!topic) {
    topic = { topicId: meta.topicId, topicName: meta.topicId === 'binary-tree' ? 'Binary Trees' : event.name, status: 'not-started', completionPercent: 0, timeSpentMinutes: 0, quizScore: null, lastAccessed: module.lastAccessed };
    topics.push(topic);
  }
  if (topic.status === 'not-started') topic.status = 'in-progress';
  topic.lastAccessed = module.lastAccessed;
  topic.timeSpentMinutes += seconds / 60;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const updated: LearningProgress = {
    ...base, topics, visualizerModules: { ...base.visualizerModules, [key]: module },
    ...(event.reducedMotion === undefined ? {} : { visualizerReducedMotion: event.reducedMotion }),
    totalTimeSpentMinutes: base.totalTimeSpentMinutes + seconds / 60,
    weeklyActivity: (base.weeklyActivity || days.map(day => ({ day, minutes: 0 }))).map(a => a.day === days[date.getDay()] ? { ...a, minutes: a.minutes + seconds / 60 } : a),
  };
  if (seconds || (completed && !old?.completed)) updated.dailyActivity = recordActivity(updated, seconds / 60, completed && !old?.completed ? 1 : 0, date);
  return updated;
}
