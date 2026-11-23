import useAuthStore from '../stores/useAuthStore';
import { sessionSignal } from './sessionRequests';

export class ApiError extends Error {}

const CSRF_COOKIE_NAME = 'alvio_csrf';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function readCsrfToken(): string {
  if (typeof document === 'undefined' || !document.cookie) return '';
  for (const part of document.cookie.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const name = part.slice(0, idx).trim();
    if (name === CSRF_COOKIE_NAME) {
      try {
        return decodeURIComponent(part.slice(idx + 1).trim());
      } catch {
        return part.slice(idx + 1).trim();
      }
    }
  }
  return '';
}

let pendingRefresh: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (pendingRefresh) return pendingRefresh;
  const startingToken = useAuthStore.getState().token;
  pendingRefresh = (async () => {
    try {
      const headers = new Headers();
      const csrf = readCsrfToken();
      if (csrf) headers.set('X-CSRF-Token', csrf);
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers,
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (!data?.token || !data?.user) return null;
      if (useAuthStore.getState().token !== startingToken) return null;
      useAuthStore.getState().updateSessionToken(data.user, data.token);
      return String(data.token);
    } catch {
      return null;
    }
  })().finally(() => {
    pendingRefresh = null;
  });
  return pendingRefresh;
}

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

  const method = (init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  if (!SAFE_METHODS.has(method)) {
    const csrf = readCsrfToken();
    if (csrf && !headers.has('X-CSRF-Token')) headers.set('X-CSRF-Token', csrf);
  }

  const signals = [sessionSignal(), init.signal].filter(Boolean) as AbortSignal[];
  let response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers,
    signal: AbortSignal.any(signals),
  });

  const isAuthLifecycleEndpoint = /^\/api\/auth\/(login|signup|refresh|logout)$/.test(url.pathname);
  if (
    response.status === 401 &&
    !isAuthLifecycleEndpoint &&
    response.headers.get('X-Auth-Expired') === '1' &&
    token === useAuthStore.getState().token
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders = new Headers(headers);
      retryHeaders.set('Authorization', `Bearer ${refreshed}`);
      const csrf = readCsrfToken();
      if (!SAFE_METHODS.has(method) && csrf) retryHeaders.set('X-CSRF-Token', csrf);
      const retrySignals = [sessionSignal(), init.signal].filter(Boolean) as AbortSignal[];
      response = await fetch(input, {
        ...init,
        credentials: 'include',
        headers: retryHeaders,
        signal: AbortSignal.any(retrySignals),
      });
    }
  }

  if (response.status === 401 && !isAuthLifecycleEndpoint && token === useAuthStore.getState().token) {
    useAuthStore.getState().logout();
    useAuthStore.getState().setError('Your session expired. Sign in to continue.');
  }
  if (response.status === 429) throw new ApiError("You're sending requests too quickly. Try again in a moment.");
  return response;
}
