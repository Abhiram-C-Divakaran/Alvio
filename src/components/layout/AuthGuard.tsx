import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { logoutLocalSession } from '../../services/authApi';
import { bootstrapSession } from '../../services/sessionBootstrap';
export default function AuthGuard() {
  const { sessionStatus, user, token } = useAuthStore();
  const location = useLocation();
  useEffect(() => { void bootstrapSession(); }, [token]);
  if (sessionStatus === 'checking') return <main role="status" className="p-8 text-center">Restoring your learning session…</main>;
  if (sessionStatus === 'unavailable') return <main className="p-8 text-center"><p>We couldn’t verify your session. Your saved learning history is safe on this device.</p><button onClick={() => void bootstrapSession()}>Retry connection</button><button onClick={() => void logoutLocalSession()}>Sign out</button></main>;
  if (sessionStatus !== 'ready' || !user) return <Navigate replace to={`/auth?mode=login&next=${encodeURIComponent(location.pathname + location.search + location.hash)}`} />;
  return <Outlet key={user.id} />;
}
