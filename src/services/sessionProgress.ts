import useAuthStore from '../stores/useAuthStore';
import useProgressStore from '../stores/useProgressStore';
import { startProgressSync } from './progressSync';
export async function restoreSessionProgress(userId: string) {
  if (useAuthStore.getState().user?.id !== userId) return;
  if (useProgressStore.getState().progress?.userId === userId) return;
  await startProgressSync(userId);
}
