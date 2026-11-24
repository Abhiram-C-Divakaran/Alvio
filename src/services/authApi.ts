import { apiFetch, readCsrfToken } from './api';
export { apiFetch as authenticatedFetch } from './api';
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
export const requestPasswordReset = (email: string) => authRequest<{ success: boolean; message: string }>('forgot-password', body({ email }));
export const confirmPasswordReset = (token: string, password: string) => authRequest<{ success: boolean; message: string }>('reset-password', body({ token, password }));
export const requestEmailVerification = () => authRequest<{ sent?: boolean; verified?: boolean; alreadyVerified?: boolean }>('verify-email/request', { method: 'POST' });
export const confirmEmailVerification = (token: string) => authRequest<{ verified: boolean }>('verify-email/confirm', body({ token }));

async function revokeOnServer(path: 'logout' | 'logout-all', token: string | null) {
  try {
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const csrf = readCsrfToken();
    if (csrf) headers.set('X-CSRF-Token', csrf);
    await fetch(`/api/auth/${path}`, {
      method: 'POST',
      credentials: 'include',
      headers,
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Best-effort revocation; local logout still proceeds when offline.
  }
}

/** Best-effort cloud flush + server session revocation; offline changes remain in the account's device cache. */
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
    await revokeOnServer('logout', token);
  } finally {
    clearTimeout(timeout);
    if (useAuthStore.getState().token === token) useAuthStore.getState().logout();
  }
}

/** Revoke all active sessions across every device for the signed-in account. */
export async function logoutAllSessions() {
  const token = useAuthStore.getState().token;
  try {
    await flushProgress();
    await revokeOnServer('logout-all', token);
  } finally {
    if (useAuthStore.getState().token === token) useAuthStore.getState().logout();
  }
}
