import '../../configure3DText';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import DashboardShell from '../../features/dashboard/DashboardShell';
import PracticeShell from '../../features/coding/PracticeShell';

export default function AppLayout() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  if (['/coding', '/workspace/pvp', '/quiz'].includes(location.pathname)) return <PracticeShell><Outlet /></PracticeShell>;

  if (['/dashboard', '/progress', '/profile', '/mock-interview', '/ai-tutor', '/learn/ai-visualizer', '/learn/data-structures', '/learn/complexity', '/learn/algorithms', '/video-learning', '/3d-visualizer', '/algorithms-visualizer'].includes(location.pathname)) return <DashboardShell><Outlet /></DashboardShell>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-bg-primary)] text-white font-sans relative">
      {/* Glow Backdrops - Neon Theme */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#1e3a8a]/40 rounded-full blur-[180px] pointer-events-none mix-blend-screen z-0" />
      <div className="absolute top-[20%] right-[-20%] w-[70%] h-[80%] bg-[#a21caf]/40 rounded-full blur-[200px] pointer-events-none mix-blend-screen z-0" />

      {/* Grid Pattern overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-soft-light z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}
      />

      <TopBar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className="flex-1 overflow-y-auto relative z-0">
          <Outlet />
        </main>
      </div>

      {/* AI Tutor Floating Action Button */}
      <button
        onClick={() => navigate('/ai-tutor')}
        className="absolute bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.6)] hover:scale-105 transition-all z-50 group border border-white/10"
        title="Ask AI Tutor"
      >
        <BrainCircuit size={26} className="group-hover:animate-pulse" />
      </button>
    </div>
  );
}
