import { apiFetch } from './api';
import useAuthStore from '../stores/useAuthStore';
import { flushProgress } from './progressSync';
import type { User } from '../types/user';

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(`/api/auth/${path}`, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to verify your account. Please try again.');
  return data;
}
type Credentials = { email: string; password: string };
type ServerUser = User & { xp: number; level: string };
type Session = { user: ServerUser; token: string };
const body = (value: unknown): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
export const login = (credentials: Credentials) => authRequest<Session>('login', body(credentials));
export const signup = (credentials: Credentials & { name: string }) => authRequest<Session>('signup', body(credentials));
export const getCurrentUser = () => authRequest<{ user: ServerUser }>('me', { signal: AbortSignal.timeout(10000) });

/** Best-effort cloud flush; offline changes remain in the account's device cache. */
export async function logoutLocalSession() {
  const token = useAuthStore.getState().token;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      (async () => {
        await flushProgress();
        // Capture edits made while an already-running request was completing.
        if (useAuthStore.getState().token === token) await flushProgress();
      })(),
      new Promise<void>(resolve => { timeout = setTimeout(resolve, 3000); }),
    ]);
  } finally {
    clearTimeout(timeout);
    if (useAuthStore.getState().token === token) useAuthStore.getState().logout();
  }
}
