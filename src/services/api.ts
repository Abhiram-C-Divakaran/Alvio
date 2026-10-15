import useAuthStore from '../stores/useAuthStore';
import { sessionSignal } from './sessionRequests';
export class ApiError extends Error {}

/** Credentials are attached only to this application's API, never execution providers. */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const url = new URL(input instanceof Request ? input.url : String(input), window.location.origin);
  if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) return fetch(input, init);
  const token = useAuthStore.getState().token;
  const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
  const supplied = headers.get('Authorization');
  if (supplied && supplied !== `Bearer ${token}`) throw new DOMException('Session changed', 'AbortError');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  else headers.delete('Authorization');
  const signals = [sessionSignal(), init.signal].filter(Boolean) as AbortSignal[];
  const response = await fetch(input, { ...init, headers, signal: AbortSignal.any(signals) });
  if (response.status === 401 && !/^\/api\/auth\/(login|signup)$/.test(url.pathname) && token === useAuthStore.getState().token) {
    useAuthStore.getState().logout();
    useAuthStore.getState().setError('Your session expired. Sign in to continue.');
  }
  if (response.status === 429) throw new ApiError("You're sending requests too quickly. Try again in a moment.");
  return response;
}
