import type { LearningProgress } from '../types/user';
/** Monotonic timestamps; ignore suspended scheduling gaps and the part after idle timeout. */
export function activeLearningSeconds(previous: number, now: number, lastInteraction: number, active: boolean) {
  return active && now >= previous && now - previous < 5000
    ? Math.max(0, Math.min(now, lastInteraction + 60000) - previous) / 1000 : 0;
}
export const localDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function recordActivity(progress: LearningProgress, minutes: number, sessions: number, date = new Date()) {
  const day = localDay(date);
  const previous = progress.dailyActivity?.[day];
  return { ...progress.dailyActivity, [day]: {
    minutes: (previous?.minutes || 0) + Math.max(0, minutes),
    sessions: (previous?.sessions || 0) + sessions,
    completion: progress.topics.length ? Math.round(progress.topics.reduce((n, t) => n + t.completionPercent, 0) / progress.topics.length) : 0,
  } };
}
