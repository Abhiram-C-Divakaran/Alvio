import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Bookmark, ChevronDown, Flame, HelpCircle, ListChecks, Menu, Search, Sparkles, Swords, Terminal, TrendingUp, Trophy, X } from 'lucide-react';
import Logo from '../../components/ui/Logo';
import useAuthStore from '../../stores/useAuthStore';
import useProgressStore from '../../stores/useProgressStore';
import './practice.css';
export function PracticeSidebarCard({ duel = false }: { duel?: boolean }) {
    return <Link to={duel ? '/workspace/pvp#duel-actions' : '/coding?status=Unsolved'} className="practice-motivation"><span className="motivation-star">{duel ? <Trophy size={19}/> : <Sparkles size={19}/>}</span><strong>{duel ? <>Compete.<br/>Improve. Grow.</> : 'Keep going!'}</strong><p>{duel ? <>Challenge others and<br/>become a stronger<br/>problem solver.</> : <>Practice daily and<br/>build unstoppable<br/>skills.</>}</p><span className="motivation-arrow"><ArrowRight size={17}/></span></Link>;
}export default function PracticeShell({ children }: {
    children: ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifications, setNotifications] = useState(false);
    const [query, setQuery] = useState('');
    const input = useRef<HTMLInputElement>(null);
    const user = useAuthStore(s => s.user);
    const stats = useProgressStore(s => s.stats);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => { setMobileOpen(false); }, [location]);
    useEffect(() => { const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
    } if (e.key === 'Escape') {
        setMobileOpen(false);
        setNotifications(false);
    } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, []);
    const view = new URLSearchParams(location.search).get('view');
    const isDuel = location.pathname === '/workspace/pvp';
    const isCoding = location.pathname === '/coding';
    const links = [
      { label: 'Coding Playground', to: '/coding', Icon: Terminal, active: isCoding && !view },
      { label: 'Problem Set', to: '/coding?view=all', Icon: ListChecks, active: isCoding && view === 'all' },
      { label: 'PvP Coding Duel', to: '/workspace/pvp', Icon: Swords, active: isDuel && view !== 'leaderboard' && !location.hash, live: true },
      { label: 'Quizzes', to: '/quiz', Icon: HelpCircle, active: location.pathname === '/quiz' },
      { label: 'Contests', to: '/workspace/pvp#duel-actions', Icon: Trophy, active: isDuel && location.hash === '#duel-actions' },
      { label: 'Progress', to: '/progress', Icon: TrendingUp },
      { label: 'Bookmarks', to: '/coding?view=bookmarks', Icon: Bookmark, active: isCoding && view === 'bookmarks' },
      { label: 'Leaderboard', to: '/workspace/pvp?view=leaderboard', Icon: Trophy, active: isDuel && view === 'leaderboard' },
    ];    return <div className={`practice-shell ${isDuel ? 'duel-shell' : location.pathname === '/quiz' ? 'quiz-shell' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}><header className="practice-topbar"><button className="practice-icon-button" aria-label="Toggle navigation" aria-expanded={mobileOpen || !collapsed} onClick={() => { if (window.matchMedia('(max-width: 1023px)').matches)
        setMobileOpen(!mobileOpen);
    else
        setCollapsed(!collapsed); }}><Menu size={19}/></button><Link className="practice-brand" to="/dashboard"><Logo variant="academy" className="w-8 h-8"/><span>Alvio</span></Link><nav className="practice-topnav" aria-label="Main navigation">{[['Dashboard', '/dashboard'], ['Learn', '/learn'], ['Practice', '/coding'], ['AI Tools', '/ai-tutor']].map(([label, to]) => <Link key={to} className={label === 'Practice' ? 'active' : ''} to={to}>{label}</Link>)}</nav><form className="practice-global-search" onSubmit={e => { e.preventDefault(); navigate(`/coding?q=${encodeURIComponent(query)}`); }}><Search size={17}/><input ref={input} value={query} onChange={e => setQuery(e.target.value)} aria-label="Search anything" placeholder="Search anything..."/><kbd>⌘ K</kbd></form><Link to="/progress" className="practice-streak"><Flame size={18}/>{stats?.currentStreak || 0} day streak</Link><div className="practice-notifications"><button className="practice-icon-button" aria-label="Notifications" aria-expanded={notifications} onClick={() => setNotifications(!notifications)}><Bell size={18}/></button>{notifications && <><button className="notification-dismiss" aria-label="Close notifications" onClick={() => setNotifications(false)}/><div className="practice-notification-popover"><strong>You're all caught up</strong><p>Your learning progress is ready to explore.</p><Link to="/progress">View progress <ArrowRight size={14}/></Link></div></>}</div><Link className="practice-user" to={user ? '/profile' : '/auth?mode=login&next=%2Fcoding'}><span className="practice-avatar">{user?.avatar ? <img src={user.avatar} alt=""/> : (user?.name || 'S')[0]}</span><span>{user?.name || 'Student'}<small>{stats?.levelName || 'Novice'}</small></span><ChevronDown size={13}/></Link></header><div className="practice-body">{mobileOpen && <button className="practice-sidebar-dismiss" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}<aside className={`practice-sidebar ${mobileOpen ? 'mobile-open' : ''}`}><div><div className="practice-sidebar-label">PRACTICE<button className="mobile-close practice-icon-button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18}/></button></div><nav aria-label="Practice navigation">{links.map(({ label, to, Icon, active, live }) => <Link to={to} key={label} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}><Icon size={19}/><span>{label}</span>{live && <small className="practice-nav-live">LIVE</small>}</Link>)}</nav><nav className="practice-mobile-main" aria-label="Mobile main navigation"><Link to="/dashboard">Dashboard</Link><Link to="/learn">Learn</Link><Link to="/ai-tutor">AI Tools</Link></nav></div><PracticeSidebarCard duel={isDuel}/></aside><main className="practice-main">{children}</main></div></div>;
}
