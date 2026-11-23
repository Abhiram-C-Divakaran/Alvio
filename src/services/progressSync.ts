import { create } from 'zustand';
import { apiFetch } from './api';
import { dbService, type ProgressCache } from './db';
import { mergeProgress } from './mergeProgress';
import useProgressStore from '../stores/useProgressStore';
import useAuthStore from '../stores/useAuthStore';
import type { LearningProgress } from '../types/user';
import { reportLearningEvent } from './learningEvents';

export const useSyncStatus = create<{ status: 'idle' | 'syncing' | 'synced' | 'offline' | 'error'; message: string }>(() => ({ status: 'idle', message: '' }));
let cache: ProgressCache | null = null;
let epoch = 0, saving = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let writes = Promise.resolve();
let inFlight: Promise<void> | undefined;
const status = (state: 'idle' | 'syncing' | 'synced' | 'offline' | 'error', message: string) => useSyncStatus.setState({ status: state, message });
const key = (id: string) => `alvio-progress-cache:${id}`;
function persist(snapshot: ProgressCache) {
  // Synchronous fallback closes the navigation/crash window before IndexedDB commits.
  let fallback = false;
  try { localStorage.setItem(key(snapshot.userId), JSON.stringify(snapshot)); fallback = true; } catch { /* IndexedDB may still work. */ }
  writes = writes.catch(() => {}).then(() => dbService.saveCache(snapshot)).catch(() => {
    if (!fallback) status('error', 'Device storage is unavailable. Keep this page open and retry syncing.');
  });
  return writes;
}
function schedule(delay = 2000) { clearTimeout(timer); timer = setTimeout(() => void flushProgress(), delay); }
export function stopProgressSync() {
  const legacy = useProgressStore.getState().progress;
  if (!cache && legacy) void persist({ userId: legacy.userId, progress: legacy, base: null, revision: 0, pending: true });
  epoch++; clearTimeout(timer); cache = null; saving = false; inFlight = undefined;
  useProgressStore.setState({ progress: null, stats: null, visualizerSyncPending: false });
  status('idle', '');
}
export async function persistProgress(progress: LearningProgress) {
  if (progress.userId !== useAuthStore.getState().user?.id || !cache || cache.userId !== progress.userId) return;
  const previous = cache.progress;
  const milestone = (progress.completedQuizIds?.length || 0) > (previous.completedQuizIds?.length || 0)
    || progress.topics.some(t => t.status === 'completed' && previous.topics.find(p => p.topicId === t.topicId)?.status !== 'completed')
    || Object.entries(progress.videoLessons || {}).some(([id,v]) => v.completed && !previous.videoLessons?.[id]?.completed)
    || Object.entries(progress.visualizerModules || {}).some(([id,v]) => v.completed && !previous.visualizerModules?.[id]?.completed);
  const stamped = { ...progress, updatedAt: new Date().toISOString() };
  cache = { ...cache, progress: stamped, pending: true };
  if (useProgressStore.getState().progress === progress) useProgressStore.getState().setProgress(stamped);
  status('syncing', 'Saving progress…');
  schedule(milestone ? 0 : 2000);
  await persist(cache);

  // Notify server-authoritative XP ledger on newly completed milestones (best-effort, idempotent).
  if (milestone) {
    for (const t of progress.topics) {
      if (t.status === 'completed' && previous.topics.find(p => p.topicId === t.topicId)?.status !== 'completed') {
        void reportLearningEvent({ type: 'lesson_completed', topicId: t.topicId });
      }
    }
    for (const [id, v] of Object.entries(progress.videoLessons || {})) {
      if (v.completed && !previous.videoLessons?.[id]?.completed) {
        void reportLearningEvent({ type: 'video_completed', videoId: id });
      }
    }
    for (const [id, v] of Object.entries(progress.visualizerModules || {})) {
      if (v.completed && !previous.visualizerModules?.[id]?.completed) {
        const ops = (v.operationsPerformed?.insert || 0) + (v.operationsPerformed?.delete || 0) + (v.operationsPerformed?.reset || 0);
        void reportLearningEvent({
          type: 'visualizer_completed',
          moduleId: id,
          completedSteps: v.completedSteps?.length || 0,
          operationsCount: Math.max(1, ops),
        });
      }
    }
    const prevQuizIds = new Set(previous.completedQuizIds || []);
    for (const attempt of progress.quizHistory || []) {
      if (!prevQuizIds.has(attempt.id)) {
        const topicId = attempt.topics.length === 1 ? attempt.topics[0].topicId : 'mixed';
        void reportLearningEvent({
          type: 'quiz_completed',
          attemptId: attempt.id,
          topicId,
          total: attempt.total,
          correct: attempt.correct,
        });
      }
    }
  }
}
export async function startProgressSync(userId: string, permanentXp?: number) {
  const existing = useProgressStore.getState().progress;
  stopProgressSync(); const generation = epoch;
  let stored: ProgressCache | null = null, legacy: LearningProgress | null = null;
  try { stored = JSON.parse(localStorage.getItem(key(userId)) || 'null'); } catch { /* Corrupt cache is ignored. */ }
  try { stored ||= await dbService.getCache(userId); legacy = await dbService.getProgress(userId); } catch { /* Offline fallback below. */ }
  if (generation !== epoch) return;
  if (stored?.userId !== userId || stored?.progress?.userId !== userId) stored = null;
  if (legacy?.userId !== userId) legacy = null;
  if (!stored && existing?.userId === userId) legacy = existing;
  const progress = stored?.progress || legacy || { userId, topics: [['array','Arrays'],['linked-list','Linked Lists'],['stack','Stacks'],['queue','Queues'],['binary-tree','Binary Trees'],['avl-tree','AVL Trees'],['graph','Graphs'],['hash-table','Hash Tables']].map(([topicId,topicName]) => ({ topicId, topicName, status: 'not-started' as const, completionPercent: 0, timeSpentMinutes: 0, quizScore: null, lastAccessed: new Date().toISOString() })), totalTimeSpentMinutes: 0, overallScore: 0, streak: 0, badges: [], weakAreas: [], recommendedTopics: [] };
  cache = stored || { userId, progress, base: null, revision: 0, pending: !!legacy };
  if (permanentXp !== undefined) cache.progress = { ...cache.progress, authoritativeXp: permanentXp };
  try {
    const response = await apiFetch('/api/progress', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw Error('Unavailable');
    const remote = await response.json();
    if (generation !== epoch) return;
    const merged = remote.progress ? (cache.pending ? mergeProgress(cache.progress, remote.progress, cache.base) : remote.progress) : cache.progress;
    cache = { userId, progress: merged, base: remote.progress, revision: remote.revision, pending: cache.pending || !remote.progress };
    useProgressStore.getState().setProgress(merged); await persist(cache);
    if (generation !== epoch) return;
    if (cache?.pending) schedule(0); else status('synced', 'Progress synced');
  } catch {
    if (generation !== epoch || !cache) return;
    useProgressStore.getState().setProgress(cache.progress);
    status('offline', 'Cloud sync is unavailable. Your progress is saved on this device.');
    schedule(15000);
  }
}
export function flushProgress(): Promise<void> {
  if (inFlight) return inFlight;
  const request = flushProgressOnce();
  inFlight = request;
  void request.finally(() => { if (inFlight === request) inFlight = undefined; });
  return request;
}
async function flushProgressOnce() {
  if (saving || !cache || cache.userId !== useAuthStore.getState().user?.id) return;
  const generation = epoch; saving = true;
  try {
    // Refresh first: another device might have changed even when this device has no pending writes.
    const response = await apiFetch('/api/progress', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw Error();
    const remote = await response.json(); if (generation !== epoch || !cache) return;
    if (remote.revision !== cache.revision) {
      cache = { ...cache, progress: remote.progress ? (cache.pending ? mergeProgress(cache.progress, remote.progress, cache.base) : remote.progress) : cache.progress, base: remote.progress, revision: remote.revision };
      useProgressStore.getState().setProgress(cache.progress); await persist(cache);
    }
    if (generation !== epoch || !cache) return;
    if (!cache.pending) { status('synced', 'Progress synced'); return; }
    status('syncing', 'Saving progress…');
    const sent = cache;
    const put = await apiFetch('/api/progress', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000), body: JSON.stringify({ progress: sent.progress, revision: sent.revision }) });
    if (generation !== epoch || !cache) return;
    if (put.status === 409) { schedule(1000); return; }
    if (!put.ok) { status('error', 'Progress could not sync. Your device copy is retained.'); schedule(30000); return; }
    const ack = await put.json(); if (generation !== epoch || !cache) return;
    const changed = cache !== sent;
    cache = { userId: sent.userId, progress: changed ? mergeProgress(cache.progress, ack.progress, sent.progress) : ack.progress, base: ack.progress, revision: ack.revision, pending: changed };
    useProgressStore.getState().setProgress(cache.progress); await persist(cache);
    if (generation !== epoch) return;
    if (changed) schedule(); else status('synced', 'Progress synced');
  } catch {
    if (generation !== epoch) return;
    status('offline', 'Cloud sync is unavailable. Your progress is saved on this device.'); schedule(15000);
  } finally { if (generation === epoch) saving = false; }
}
if (typeof window !== 'undefined') {
  window.addEventListener('alvio-session-ended', stopProgressSync);
  window.addEventListener('pagehide', () => void flushProgress());
  window.addEventListener('online', () => void flushProgress());
  window.addEventListener('focus', () => void flushProgress());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void flushProgress(); });
}
