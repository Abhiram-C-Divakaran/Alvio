import '../../configure3DText';
import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppShell from './AppShell';
import ErrorBoundary from '../ui/ErrorBoundary';

export default function AppLayout() {
  const location = useLocation();
  return (
    <AppShell>
      <ErrorBoundary resetKey={location.pathname + location.search}>
        <Suspense fallback={<p role="status">Opening lesson…</p>}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}
