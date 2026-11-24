import { apiFetch } from './api';
import useProgressStore from '../stores/useProgressStore';
import useAuthStore from '../stores/useAuthStore';

export type ClientLearningEvent =
  | { type: 'lesson_completed'; topicId: string }
  | { type: 'visualizer_completed'; moduleId: string; completedSteps: number; operationsCount: number }
  | { type: 'video_completed'; videoId: string }
  | { type: 'quiz_completed'; attemptId: string; topicId: string; total: number; correct: number };

const queueKey = (userId: string) => `alvio-xp-events-queue:${userId}`;

function eventIdentity(event: ClientLearningEvent): string {
  switch (event.type) {
    case 'lesson_completed': return `lesson:${event.topicId}`;
    case 'visualizer_completed': return `visualizer:${event.moduleId}`;
    case 'video_completed': return `video:${event.videoId}`;
    case 'quiz_completed': return `quiz:${event.attemptId}`;
  }
}

export function readPendingLearningEvents(userId: string): ClientLearningEvent[] {
  try {
    const raw = localStorage.getItem(queueKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePendingLearningEvents(userId: string, events: ClientLearningEvent[]): void {
  try {
    if (events.length === 0) localStorage.removeItem(queueKey(userId));
    else localStorage.setItem(queueKey(userId), JSON.stringify(events.slice(0, 100)));
  } catch {
    // Device storage unavailable
  }
}

export function enqueueLearningEvent(userId: string, event: ClientLearningEvent): void {
  const existing = readPendingLearningEvents(userId);
  const id = eventIdentity(event);
  if (existing.some((e) => eventIdentity(e) === id)) return;
  writePendingLearningEvents(userId, [...existing, event]);
}

/**
 * Replays queued offline/pending learning milestones for the signed-in account.
 * Server deduplicates via UNIQUE(user_id, event_type, event_key) so replays and multi-device
 * simultaneous flushes are completely idempotent.
 */
export async function flushPendingLearningEvents(): Promise<void> {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;
  const queued = readPendingLearningEvents(userId);
  if (queued.length === 0) return;

  const remaining: ClientLearningEvent[] = [];
  for (let i = 0; i < queued.length; i++) {
    const event = queued[i];
    if (useAuthStore.getState().user?.id !== userId) return;
    try {
      const res = await apiFetch('/api/learning/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        signal: AbortSignal.timeout(8000),
      });
      if (res.status >= 400 && res.status < 500 && res.status !== 401 && res.status !== 429) {
        // Permanently invalid event shape — drop from queue
        continue;
      }
      if (!res.ok) {
        remaining.push(...queued.slice(i));
        break;
      }
      const data = await res.json();
      if (typeof data?.totalXp === 'number' && Number.isFinite(data.totalXp)) {
        const current = useProgressStore.getState().progress;
        if (current && current.userId === userId && current.authoritativeXp !== data.totalXp) {
          useProgressStore.getState().setProgress({ ...current, authoritativeXp: data.totalXp });
        }
      }
      // If mocked fetch didn't return an XP ledger shape, still treat as delivered to avoid infinite loop.
    } catch {
      remaining.push(...queued.slice(i));
      break;
    }
  }
  if (useAuthStore.getState().user?.id === userId) {
    writePendingLearningEvents(userId, remaining);
  }
}

/**
 * Queues a learning milestone durably for the account and immediately attempts server delivery.
 */
export async function reportLearningEvent(event: ClientLearningEvent): Promise<void> {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;
  enqueueLearningEvent(userId, event);
  await flushPendingLearningEvents();
}
