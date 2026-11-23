import useAuthStore from '../stores/useAuthStore';
import { readCsrfToken, refreshAccessToken } from './api';
import { getCurrentUser } from './authApi';
import { dbService } from './db';
import { startProgressSync } from './progressSync';

let pending: Promise<void> | undefined;
let pendingToken: string | null = null;

export function bootstrapSession() {
  const { token } = useAuthStore.getState();
  if (pending && pendingToken === token) return pending;
  pendingToken = token;
  pending = (async () => {
    let activeToken = token;
    if (!activeToken) {
      // Support cookie-only sessions (e.g. HttpOnly cookies present without localStorage token).
      if (readCsrfToken()) {
        useAuthStore.setState({ sessionStatus: 'checking' });
        activeToken = await refreshAccessToken();
      }
      if (!activeToken) {
        useAuthStore.setState({ sessionStatus: 'anonymous', isAuthenticated: false });
        return;
      }
    }
    useAuthStore.setState({ sessionStatus: 'checking' });
    try {
      const { user } = await getCurrentUser();
      const latestToken = useAuthStore.getState().token;
      if (!latestToken) return;
      useAuthStore.setState({ user: { ...user, id: String(user.id) }, verifiedToken: latestToken });
      await startProgressSync(String(user.id), user.xp);
      if (useAuthStore.getState().token === latestToken) {
        useAuthStore.setState({ sessionStatus: 'ready', isAuthenticated: true, error: null });
      }
    } catch {
      const latestToken = useAuthStore.getState().token;
      if (!latestToken || latestToken !== activeToken) return;
      const auth = useAuthStore.getState();
      let cached = false;
      let unexpired = false;
      try {
        unexpired = JSON.parse(atob(latestToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000 > Date.now();
        cached = !!localStorage.getItem(`alvio-progress-cache:${auth.user?.id}`) || !!(auth.user && await dbService.getProgress(auth.user.id));
      } catch {
        /* Remain locked without a verified cache. */
      }
      if (auth.verifiedToken === latestToken && auth.user && unexpired && cached) {
        await startProgressSync(auth.user.id);
        if (useAuthStore.getState().token === latestToken) {
          useAuthStore.setState({ sessionStatus: 'ready', isAuthenticated: true });
        }
      } else {
        useAuthStore.setState({ sessionStatus: 'unavailable', isAuthenticated: false });
      }
    }
  })().finally(() => {
    if (pendingToken === token) pending = undefined;
  });
  return pending;
}
