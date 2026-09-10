import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Code2,
  Video,
  Terminal,
  BrainCircuit,
  Box,
  TrendingUp,
  HelpCircle,
  User,
  Layers,
  Sparkles,
  Swords
} from 'lucide-react';
import type { ReactNode } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export default function Sidebar({ collapsed, footer }: { collapsed?: boolean; footer?: ReactNode }) {
  const location = useLocation();

  const getSubNav = (): { title: string, items: NavItem[] } => {
    if (['/dashboard', '/skill-tree', '/progress', '/profile'].some(p => location.pathname.startsWith(p))) {
      return {
        title: 'Overview',
        items: [
          { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
          { label: 'My Progress', path: '/progress', icon: <TrendingUp size={18} /> },
          { label: 'My Profile', path: '/profile', icon: <User size={18} /> },
        ]
      };
    }
    if (['/coding', '/quiz', '/workspace/pvp'].some(p => location.pathname.startsWith(p))) {
      return {
        title: 'Practice',
        items: [
          { label: 'Coding Area', path: '/coding', icon: <Terminal size={18} />, badge: 'New', badgeColor: 'bg-blue-500' },
          { label: 'PvP Coding Duel', path: '/workspace/pvp', icon: <Swords size={18} />, badge: 'LIVE', badgeColor: 'bg-red-500' },
          { label: 'Quizzes', path: '/quiz', icon: <HelpCircle size={18} /> }
        ]
      };
    }
    if (['/catalog', '/learn', '/workspace', '/video-learning', '/3d-visualizer', '/algorithms-visualizer'].some(p => location.pathname.startsWith(p))) {
      return {
        title: 'Learn',
        items: [
          
          { label: 'Constellation', path: '/learn', icon: <Sparkles size={18} /> },
          { label: 'Data Structures', path: '/learn/data-structures', icon: <Layers size={18} /> },
          { label: 'Algorithms', path: '/learn/algorithms', icon: <Code2 size={18} /> },
          { label: '3D Complexity', path: '/learn/complexity', icon: <TrendingUp size={18} />, badge: '3D', badgeColor: 'bg-emerald-500' },
          { label: 'Video Lessons', path: '/video-learning', icon: <Video size={18} />, badge: 'AI', badgeColor: 'bg-indigo-500' },
          { label: '3D Data Structures', path: '/3d-visualizer', icon: <Box size={18} /> },
          { label: '3D Algorithms', path: '/algorithms-visualizer', icon: <Box size={18} /> },
        ]
      };
    }
    if (['/ai-tutor', '/mock-interview', '/learn/ai-visualizer'].some(p => location.pathname.startsWith(p))) {
      return {
        title: 'AI Tools',
        items: [
          { label: 'AI Visualizer', path: '/learn/ai-visualizer', icon: <Sparkles size={18} />, badge: 'NEW', badgeColor: 'bg-indigo-500' },
          { label: 'AI Tutor', path: '/ai-tutor', icon: <Sparkles size={18} /> },
          { label: 'Mock Interview', path: '/mock-interview', icon: <BrainCircuit size={18} />, badge: 'NEW', badgeColor: 'bg-emerald-500' },
        ]
      };
    }
    return { title: '', items: [] };
  };

  const navSection = getSubNav();

  const bottomNav: NavItem[] = [];

  return (
    <motion.aside
      className={`sidebar h-full sticky top-0 flex flex-col overflow-hidden bg-[var(--color-bg-secondary)] ${collapsed ? 'border-none' : 'border-r border-[var(--color-border-subtle)]'}`}
      initial={{ width: 250 }}
      animate={{ width: collapsed ? 0 : 250, opacity: collapsed ? 0 : 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 custom-scrollbar">
        {navSection.items.length > 0 && (
          <div className="px-3">
            <h3 className="text-[11px] font-medium text-[var(--color-text-muted)] tracking-wider mb-2 px-3 uppercase">{navSection.title}</h3>
            <nav className="flex flex-col gap-0.5">
              {navSection.items.map((item) => {
                const isActive = location.pathname === item.path || (item.path.includes('?') && location.search === item.path.split('?')[1]);
                const isLearnActive = item.path === '/learn/data-structures' && location.pathname.startsWith('/learn') && !location.pathname.includes('/learn/algorithms') && !['/learn', '/learn/sorting', '/learn/searching', '/learn/divide-conquer', '/learn/dynamic-programming', '/learn/greedy', '/learn/graph-algorithms'].includes(location.pathname);
                const isAlgoActive = item.path === '/learn/algorithms' && (location.pathname.startsWith('/learn/algorithms') || location.pathname.startsWith('/algorithms-visualizer') || ['/learn/sorting', '/learn/searching', '/learn/divide-conquer', '/learn/dynamic-programming', '/learn/greedy', '/learn/graph-algorithms'].includes(location.pathname));
                const isReallyActive = isActive || isLearnActive || isAlgoActive;

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors group ${
                      isReallyActive
                        ? 'bg-[var(--color-surface-glass)] text-white font-medium shadow-sm'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${isReallyActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]'}`}>
                        {item.icon}
                      </span>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`${item.badgeColor || 'bg-[var(--color-bg-elevated)] text-white'} text-[10px] font-semibold px-1.5 py-0.5 rounded-sm flex items-center justify-center min-w-[20px]`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      {footer}
      <div className="px-3 pb-4 shrink-0">
        <nav className="flex flex-col gap-0.5 mb-2 border-t border-[var(--color-border-subtle)] pt-4">
          {bottomNav.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors group ${
                  isActive
                    ? 'bg-[var(--color-surface-glass)] text-white font-medium shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`${isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
}
