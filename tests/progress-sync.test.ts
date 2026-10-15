import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { indexedDB } from 'fake-indexeddb';

// Browser primitives, with the real IndexedDB cache, stores and sync service.
const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => memory.set(k, v), removeItem: (k: string) => memory.delete(k) }, configurable: true });
Object.assign(globalThis, { indexedDB, window: Object.assign(new EventTarget(), { localStorage: globalThis.localStorage, location: { origin: 'http://localhost' } }), document: Object.assign(new EventTarget(), { visibilityState: 'visible' }) });
const cloud = new Map<string, any>(); let offline = false, conflicts = 0, unauthorized = false;
let delay: (() => Promise<void>) | undefined;
globalThis.fetch = async (_url, init) => {
  if (offline) throw new TypeError('Offline');
  if (delay) await delay();
  const id = new Headers(init?.headers).get('Authorization')?.replace('Bearer ', '') || '';
  if (unauthorized) return Response.json({ error: 'Expired' }, { status: 401 });
  const stored = cloud.get(id) || { progress: null, revision: 0 };
  if (init?.method === 'PUT') {
    const body = JSON.parse(init.body as string);
    if (body.revision !== stored.revision || conflicts-- > 0) return Response.json(stored, { status: 409 });
    const saved = { progress: { ...body.progress, authoritativeXp: 7, updatedAt: new Date().toISOString() }, revision: stored.revision + 1 };
    cloud.set(id, saved); return Response.json(saved);
  }
  return Response.json(stored);
};
const { default: auth } = await import('../src/stores/useAuthStore');
const { default: store } = await import('../src/stores/useProgressStore');
const sync = await import('../src/services/progressSync');
const { dbService } = await import('../src/services/db');
const { apiFetch } = await import('../src/services/api');
const user = (id: string) => ({ id, name: id, email: `${id}@example.test`, createdAt: '', settings: { theme: 'dark' as const, voiceEnabled: false, animationSpeed: 1, notifications: true } });
async function login(id: string) { auth.getState().setUser(user(id), id); await sync.startProgressSync(id, 7); }
after(() => sync.stopProgressSync());

test('legacy device cache migrates, then video/quiz/Heap state survives cloud restore without repeated rewards', async () => {
  await dbService.saveProgress({ userId: 'A', topics: [], totalTimeSpentMinutes: 5, overallScore: 0, streak: 0, badges: [], weakAreas: [], recommendedTopics: [] });
  await login('A'); await sync.flushProgress(); assert.equal(cloud.get('A').progress.totalTimeSpentMinutes, 5);
  await store.getState().saveVideoLesson('arrays', { position: 42, duration: 600, watchedSeconds: [1,2,3], speed: 1.5 }, 'A', 'array');
  await store.getState().saveVisualizerProgress('A', { name: 'Heap', variant: 'Max Heap', totalSteps: 5, step: 2, seconds: 10 });
  const quiz = { id: 'quiz-once', userId: 'A', total: 1, correct: 1, accuracy: 100, seconds: 30, answerXp: 20, bestStreak: 1, endedAt: new Date().toISOString(), topics: [{ topicId: 'array', topicName: 'Arrays', correct: 1, total: 1, accuracy: 100 }] };
  await store.getState().recordQuiz(quiz); await sync.flushProgress();
  const before = structuredClone(cloud.get('A').progress);
  auth.getState().logout(); assert.equal(store.getState().progress, null);
  // Remove both device caches, proving the next login uses cloud.
  memory.delete('alvio-progress-cache:A'); const db = await dbService.init(); const tx = db.transaction(['progress','progressCache'], 'readwrite'); tx.objectStore('progress').delete('A'); tx.objectStore('progressCache').delete('A'); await new Promise(r => tx.oncomplete = r);
  await login('A'); assert.equal(store.getState().progress?.videoLessons?.arrays.position, 42); assert.deepEqual(store.getState().progress?.visualizerModules, before.visualizerModules);
  await store.getState().recordQuiz(quiz); await sync.flushProgress();
  assert.equal(store.getState().progress?.quizTotals?.completed, 1); assert.equal(store.getState().progress?.totalXp, before.totalXp); assert.equal(store.getState().stats?.totalXp, 7);
});
test('offline startup and interrupted writes retain pending changes for reconnect', async () => {
  offline = true; auth.getState().logout(); await login('A');
  assert.equal(store.getState().progress?.videoLessons?.arrays.position, 42);
  await store.getState().saveVideoLesson('arrays', { position: 80 }, 'A', 'array'); await sync.flushProgress(); assert.equal(sync.useSyncStatus.getState().status, 'offline');
  auth.getState().logout(); await login('A'); assert.equal(store.getState().progress?.videoLessons?.arrays.position, 80);
  offline = false; await sync.flushProgress(); assert.equal(cloud.get('A').progress.videoLessons.arrays.position, 80); assert.equal(sync.useSyncStatus.getState().status, 'synced');
});
test('conflicts preserve concurrent progress and retry without duplicating counters', async () => {
  const before = cloud.get('A').progress.totalTimeSpentMinutes;
  await store.getState().addTimeSpent(2);
  const remote = cloud.get('A'); cloud.set('A', { revision: remote.revision + 1, progress: { ...remote.progress, totalTimeSpentMinutes: before + 3 } });
  conflicts = 1; await sync.flushProgress(); await sync.flushProgress();
  assert.equal(cloud.get('A').progress.totalTimeSpentMinutes, before + 5);
});
test('account B cannot see A state and late A responses cannot replace B state', async () => {
  await store.getState().addTimeSpent(1);
  let release!: () => void; delay = () => new Promise<void>(resolve => { release = resolve; });
  const inFlight = sync.flushProgress(); await new Promise(r => setTimeout(r, 0));
  auth.getState().logout(); delay = undefined; await login('B');
  release(); await inFlight;
  assert.equal(store.getState().progress?.userId, 'B'); assert.equal(store.getState().progress?.videoLessons, undefined);
  await assert.rejects(apiFetch('/api/chat', { headers: { Authorization: 'Bearer A' } }), { name: 'AbortError' });
  await login('A'); assert.equal(store.getState().progress?.videoLessons?.arrays.position, 80);
});
test('API 401 clears visible account state and cached learning history stays available', async () => {
  unauthorized = true; await apiFetch('/api/chat'); unauthorized = false;
  assert.equal(auth.getState().token, null); assert.equal(store.getState().progress, null);
  assert(await dbService.getProgress('A'));
});

 test('explicit logout flushes pending edits before clearing the session', async () => {
  const { logoutLocalSession } = await import('../src/services/authApi');
  await login('A'); await store.getState().saveVideoLesson('arrays', { position: 99 }, 'A', 'array');
  await logoutLocalSession();
  assert.equal(auth.getState().token, null);
  assert.equal(cloud.get('A').progress.videoLessons.arrays.position, 99);
  await login('A'); assert.equal(store.getState().progress?.videoLessons?.arrays.position, 99);
});

test('logout waits for an active save and retains offline changes', async () => {
  const { logoutLocalSession } = await import('../src/services/authApi');
  await login('A'); await sync.flushProgress();
  await store.getState().saveVideoLesson('arrays', { position: 101 }, 'A', 'array');
  let release!: () => void; delay = () => new Promise<void>(resolve => { release = resolve; });
  const request = sync.flushProgress();
  await new Promise(resolve => setTimeout(resolve, 0));
  const logout = logoutLocalSession(); delay = undefined; release();
  await request; await logout;
  assert.equal(cloud.get('A').progress.videoLessons.arrays.position, 101);
  await login('A'); offline = true;
  await store.getState().saveVideoLesson('arrays', { position: 103 }, 'A', 'array');
  await logoutLocalSession();
  assert.equal(auth.getState().token, null);
  offline = false; await login('A'); await sync.flushProgress();
  assert.equal(cloud.get('A').progress.videoLessons.arrays.position, 103);
});
