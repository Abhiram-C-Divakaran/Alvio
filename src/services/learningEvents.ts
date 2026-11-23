import { apiFetch } from './api';
import useProgressStore from '../stores/useProgressStore';
import useAuthStore from '../stores/useAuthStore';

export type ClientLearningEvent =
  | { type: 'lesson_completed'; topicId: string }
  | { type: 'visualizer_completed'; moduleId: string; completedSteps: number; operationsCount: number }
  | { type: 'video_completed'; videoId: string }
  | { type: 'quiz_completed'; attemptId: string; topicId: string; total: number; correct: number };

/**
 * Best-effort notification to the server-authoritative XP ledger.
 * Server validates the event, deduplicates via UNIQUE(user_id, event_type, event_key),
 * enforces daily caps, and returns the authoritative totalXp.
 */
export async function reportLearningEvent(event: ClientLearningEvent): Promise<void> {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;
  try {
    const res = await apiFetch('/api/learning/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (typeof data?.totalXp === 'number' && Number.isFinite(data.totalXp)) {
      const current = useProgressStore.getState().progress;
      if (current && current.userId === userId && current.authoritativeXp !== data.totalXp) {
        useProgressStore.getState().setProgress({ ...current, authoritativeXp: data.totalXp });
      }
    }
  } catch {
    // Offline or transient failure — learning snapshot remains safely cached locally.
  }
}
