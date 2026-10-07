import { dbService } from './db';
import useProgressStore from '../stores/useProgressStore';
import type { LearningProgress } from '../types/user';
/** Restore this account's progress, never a previous account's browser state. */
export async function restoreSessionProgress(userId: string) {
  const local = useProgressStore.getState();
  // A failed IndexedDB write must not replace this account's newer local learning
  // session with its older database snapshot when signing back in.
  if (local.visualizerSyncPending && local.progress?.userId === userId) {
    try {
      await dbService.saveProgress(local.progress);
      if (useProgressStore.getState().progress === local.progress) local.setProgress(local.progress);
    } catch { console.warn('Using locally saved visualizer progress; database sync is pending.'); }
    return;
  }
  let progress = await dbService.getProgress(userId);
  if (!progress) {
    const topics = [['array','Arrays'],['linked-list','Linked Lists'],['stack','Stacks'],['queue','Queues'],['binary-tree','Binary Trees'],['avl-tree','AVL Trees'],['graph','Graphs'],['hash-table','Hash Tables']];
    progress = {
      userId,
      topics: topics.map(([topicId, topicName]) => ({ topicId, topicName, status: 'not-started', completionPercent: 0, timeSpentMinutes: 0, quizScore: null, lastAccessed: new Date().toISOString() })),
      totalTimeSpentMinutes: 0, overallScore: 0, streak: 0, badges: [], weakAreas: [], recommendedTopics: ['array','stack'],
    } satisfies LearningProgress;
    await dbService.saveProgress(progress);
  }
  useProgressStore.getState().setProgress(progress);
}
