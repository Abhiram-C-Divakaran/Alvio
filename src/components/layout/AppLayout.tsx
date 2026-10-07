import '../../configure3DText';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from './AppShell';
export default function AppLayout(){return <AppShell><Suspense fallback={<p role="status">Opening lesson…</p>}><Outlet/></Suspense></AppShell>}
