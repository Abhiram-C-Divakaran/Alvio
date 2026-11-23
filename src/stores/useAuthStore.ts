// ============================================================
// Auth Store — Zustand state management for authentication
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '../types/user';
import { cancelSessionRequests } from '../services/sessionRequests';

interface AuthActions {
  verifiedToken: string | null;
  sessionStatus: 'checking' | 'ready' | 'anonymous' | 'unavailable';
  /** Set user data after login/register */
  setUser: (user: User, token: string) => void;
  /** Silently update rotated access token without interrupting active requests */
  updateSessionToken: (user: User, token: string) => void;
  /** Clear auth state on logout */
  logout: () => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error message */
  setError: (error: string | null) => void;
}

/**
 * Global authentication state.
 * Persists public account details and a server-issued token; bootstrap verifies it.
 */
const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // ---- State ----
      sessionStatus: 'checking',
      verifiedToken: null,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ---- Actions ----
      setUser: (user: User, token: string) => {
        const sameSession = useAuthStore.getState().token === token;
        if (!sameSession) cancelSessionRequests();
        set({ user: { ...user, id: String(user.id) }, token, ...(sameSession ? {} : { sessionStatus: 'checking' as const, isAuthenticated: false }), isLoading: false, error: null });
      },

      updateSessionToken: (user: User, token: string) => {
        set((state) => ({
          user: { ...state.user, ...user, id: String(user.id) },
          token,
          verifiedToken: token,
          error: null,
        }));
      },

      logout: () => {
        cancelSessionRequests();
        set({ user: null, token: null, verifiedToken: null, sessionStatus: 'anonymous', isAuthenticated: false, error: null });
      },

      setLoading: (isLoading: boolean) =>
        set({ isLoading }),

      setError: (error: string | null) =>
        set({ error, isLoading: false }),
    }),
    {
      name: 'alvio-auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, verifiedToken: state.verifiedToken }),
      merge: (persisted, current) => { const saved = persisted as Partial<AuthState & AuthActions>; return { ...current, user: saved?.user ?? null, token: saved?.token ?? null, verifiedToken: saved?.verifiedToken ?? null, sessionStatus: 'checking', isAuthenticated: false }; },
    }
  )
);

export default useAuthStore;
