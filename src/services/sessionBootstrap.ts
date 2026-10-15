import useAuthStore from '../stores/useAuthStore';
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
    if (!token) { useAuthStore.setState({ sessionStatus: 'anonymous', isAuthenticated: false }); return; }
    useAuthStore.setState({ sessionStatus: 'checking' });
    try {
      const { user } = await getCurrentUser();
      if (useAuthStore.getState().token !== token) return;
      useAuthStore.setState({ user: { ...user, id: String(user.id) }, verifiedToken: token });
      await startProgressSync(String(user.id), user.xp);
      if (useAuthStore.getState().token === token) useAuthStore.setState({ sessionStatus: 'ready', isAuthenticated: true, error: null });
    } catch {
      if (useAuthStore.getState().token !== token) return;
      const auth = useAuthStore.getState();
      let cached = false, unexpired = false;
      try { unexpired = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).exp * 1000 > Date.now(); cached = !!localStorage.getItem(`alvio-progress-cache:${auth.user?.id}`) || !!(auth.user && await dbService.getProgress(auth.user.id)); } catch { /* Remain locked without a verified cache. */ }
      if (auth.verifiedToken === token && auth.user && unexpired && cached) {
        await startProgressSync(auth.user.id);
        if (useAuthStore.getState().token === token) useAuthStore.setState({ sessionStatus: 'ready', isAuthenticated: true });
      } else useAuthStore.setState({ sessionStatus: 'unavailable', isAuthenticated: false });
    }
  })().finally(() => { if (pendingToken === token) pending = undefined; });
  return pending;
}
