// ============================================================
// Top Bar Component
// ============================================================
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Menu } from 'lucide-react';
import Logo from '../ui/Logo';
import useAuthStore from '../../stores/useAuthStore';
import useProgressStore from '../../stores/useProgressStore';
import RankBadge from '../ui/RankBadge';

const mainNavGroups = [
  { label: 'Dashboard', path: '/dashboard', matches: ['/dashboard', '/progress', '/profile'] },
  { label: 'Learn', path: '/learn', matches: ['/catalog', '/learn', '/workspace', '/video-learning', '/3d-visualizer'] },
  { label: 'Practice', path: '/coding', matches: ['/coding', '/quiz', '/workspace/pvp'] },
  { label: 'AI Tools', path: '/ai-tutor', matches: ['/ai-tutor', '/mock-interview'] },
];

function getEpicLevel(xp: number) {
  if (xp < 100) return 'Bronze V';
  if (xp < 250) return 'Bronze IV';
  if (xp < 500) return 'Bronze I';
  if (xp < 800) return 'Silver V';
  if (xp < 1200) return 'Silver I';
  if (xp < 1800) return 'Gold V';
  if (xp < 2500) return 'Gold I';
  if (xp < 3500) return 'Platinum V';
  if (xp < 4800) return 'Platinum I';
  if (xp < 6200) return 'Diamond V';
  if (xp < 7800) return 'Diamond I';
  if (xp < 9500) return 'Crown';
  if (xp < 12000) return 'Ace';
  return 'Conqueror';
}

export default function TopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const stats = useProgressStore((s) => s.stats);
  const navigate = useNavigate();
  const location = useLocation();

  const xp = stats?.totalXp || 0;
  const level = getEpicLevel(xp);

  return (
    <header className="topbar sticky top-0 flex items-center justify-between px-6 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-subtle)] backdrop-blur-md bg-opacity-80 h-14 shrink-0" style={{ zIndex: 'var(--z-sticky)' }}>
      <div className="flex items-center gap-8 flex-1">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-[var(--color-bg-hover)] rounded-md transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] -ml-2"
            title="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
        )}
        {/* Logo Area */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Logo className="w-8 h-8" />
          <span className="font-semibold text-lg tracking-wide text-white">Alvio</span>
        </div>
        
        {/* Main Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {mainNavGroups.map((group) => {
            const isActive = group.matches.some(m => {
              if (m === '/workspace' && location.pathname.startsWith('/workspace/pvp')) return false;
              return location.pathname.startsWith(m) || location.search.includes(m);
            });
            return (
              <NavLink
                key={group.label}
                to={group.path}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-surface-glass)] text-white shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                {group.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">

        
        {/* User Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-[var(--color-text-primary)] leading-tight">
                {user?.name || 'Student'}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] font-medium tracking-wide flex items-center justify-end gap-1">
                <RankBadge level={level} size={16} />
                <span>{level}</span>
                <span className="mx-1">•</span>
                <span>{xp} XP</span>
              </p>
            </div>
            <button
              type="button"
              aria-label="View Profile"
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-[#3e3e3e] shadow-sm ring-2 ring-[#333] cursor-pointer hover:ring-[#555] transition-all"
              title="View Profile"
            >
              {user ? (
                <img src={user.avatar || user.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={14} className="text-white" />
              )}
            </button>
          </div>
          
          {/* Logout button */}
          <button
            onClick={logout}
            className="p-1.5 hover:bg-[var(--color-bg-hover)] rounded-md transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] ml-1"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
