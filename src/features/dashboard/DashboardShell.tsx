import {algorithms as learningAlgorithms} from '../learn/algorithms/model';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Layers, Sparkles, Code2, BookOpen, Network, BrainCircuit, PlaySquare, Box, UserRound, Trophy, Users, Star, Search, Flame, Shield, Bell, Menu, X, ArrowRight, TrendingUp as ChartIcon } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import useProgressStore from '../../stores/useProgressStore';
import { dashboardData, topicUrl } from './dashboardData';
import { ProgressBar } from './DashboardCards';
import './dashboard.css';
const navigation = [{ label: 'Dashboard', to: '/dashboard', Icon: Home }, { label: 'Learn', to: '/learn', Icon: BookOpen }, { label: 'Practice', to: '/coding', Icon: Network }, { label: 'AI Tools', to: '/ai-tutor', Icon: BrainCircuit }, { label: 'Video Learning', to: '/video-learning', Icon: PlaySquare }, { label: '3D Visualizer', to: '/3d-visualizer', Icon: Box }, { label: 'Achievements', to: '/dashboard#achievements', Icon: Trophy }];
function Brand() {
  return <Link to="/dashboard" className="ad-brand" aria-label="Alvio dashboard">
    <svg width="44" height="40" viewBox="0 0 44 40" aria-hidden="true">
      <path d="M22 2 44 35H29L22 24 14 35H0Z" fill="#6246ec" />
      <path d="m22 2 7 10-7 5-7-5Z" fill="#c8baff" />
      <path d="m15 12 7 5-8 18H0Z" fill="#9274ff" />
      <path d="m22 24 7 11H14Z" fill="#101627" />
    </svg>
    <span>Alvio<small>Learn&nbsp; Build&nbsp; Grow</small>
    </span>
  </Link>;
}
export function DashboardHeader({ onMenu }: {
  onMenu: () => void;
}) {
  const user = useAuthStore(s => s.user);
  const learnSection=['/learn','/learn/data-structures','/learn/complexity','/learn/algorithms','/video-learning','/3d-visualizer','/algorithms-visualizer'].includes(useLocation().pathname);
  const aiSection=['/mock-interview','/ai-tutor','/learn/ai-visualizer'].includes(useLocation().pathname);
  const { progress, stats } = useProgressStore();
  const data = dashboardData(progress, stats);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
      } if (e.key === 'Escape') {
        setFocused(false);
        setNotifications(false);
        input.current?.blur();
      }
    }; window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener);
  }, []);
  const matches = data.topics.filter(t => t.topicName.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
  return <header className="ad-header">
    <button className="ad-icon-button ad-menu-toggle" onClick={onMenu} aria-label="Open navigation">
      <Menu />
    </button>
    {(aiSection||learnSection)&&<><div className="ad-ai-brand"><Brand/></div><nav className="ad-global-ai" aria-label="Product sections"><Link to="/dashboard">Dashboard</Link><Link className={learnSection?"active":""} aria-current={learnSection?"page":undefined} to="/learn">Learn</Link><Link to="/coding">Practice</Link><Link className={aiSection?"active":""} aria-current={aiSection?"page":undefined} to="/ai-tutor">AI Tools</Link></nav></>}<div className="ad-search-wrap">
      <form className="ad-search" onSubmit={e => {
        e.preventDefault(); if (query.trim()) {
          navigate(`/coding?topic=${encodeURIComponent(query.trim())}`);
          setFocused(false);
        }
      }}>
        <Search size={17} />
        <input ref={input} aria-label="Search topics and problems" placeholder="Search topics, problems, or ask AI..." value={query} onFocus={() => setFocused(true)} onChange={e => setQuery(e.target.value)} />
        <kbd>⌘ K</kbd>
      </form>{focused && <>
        <button className="ad-dismiss" aria-label="Close search" onClick={() => setFocused(false)} />
        <div className="ad-search-results">
          <span className="ad-eyebrow">{query ? 'Matching topics' : 'Explore your learning path'}</span>{matches.map(t => <Link key={t.topicId} to={topicUrl(t)} onClick={() => setFocused(false)}>
            <BookOpen size={16} />{t.topicName}<ArrowRight size={13} />
          </Link>)}{query && <Link to={`/coding?topic=${encodeURIComponent(query)}`} onClick={() => setFocused(false)}>
            <Search size={16} />Find problems for “{query}”</Link>}<Link to="/ai-tutor" onClick={() => setFocused(false)}>
            <BrainCircuit size={16} />Open AI Tutor<ArrowRight size={13} />
          </Link>
        </div>
      </>}</div>
    <div className="ad-header-right">
      <span className="ad-header-streak">
        <Flame size={19} />{data.streak} day streak</span>
      <Link to="/progress" className="ad-header-rank">
        <Shield size={25} />
        <div>
          <strong>{data.rank}</strong>
          <small>{data.xp.toLocaleString()} / {data.nextXp.toLocaleString()} XP</small>
          <ProgressBar value={data.xpPercent} />
        </div>
      </Link>
      <Link className="ad-avatar" to="/profile" aria-label="Open profile">{user?.avatar ? <img src={user.avatar} alt="" /> : (user?.name?.slice(0, 1) ?? 'A').toUpperCase()}</Link>
      <button className="ad-icon-button" aria-label="Notifications" aria-expanded={notifications} onClick={() => setNotifications(v => !v)}>
        <Bell size={20} />
      </button>
    </div>{notifications && <>
      <button className="ad-dismiss" aria-label="Close notifications" onClick={() => setNotifications(false)} />
      <div className="ad-notifications">
        <h2>Your achievements</h2>{data.badges.length ? data.badges.slice(-3).reverse().map(b => <p key={b.id}>
          <strong>{b.name}</strong>
          <span>{b.description}</span>
        </p>) : <p>No new notifications. Your earned achievements will appear here.</p>}</div>
    </>}</header>;
}
export default function DashboardShell({ children }: {
  children: ReactNode;
}) {
  const pathname = useLocation().pathname;
  const algorithmProgress=useProgressStore(s=>s.progress);
  const algorithmStats=useProgressStore(s=>s.stats);
  const nextAlgorithm=learningAlgorithms.find(a=>!algorithmProgress?.topics.some(t=>t.topicId===a.id&&t.status==='completed'))||learningAlgorithms[0];
  const isProgress = pathname === '/progress';
  const isProfile = pathname === '/profile';
  const isLearn=['/learn','/learn/data-structures','/learn/complexity','/learn/algorithms','/video-learning','/3d-visualizer','/algorithms-visualizer'].includes(pathname);
  const isAi = ['/mock-interview','/ai-tutor','/learn/ai-visualizer'].includes(pathname);
  const aiNavigation=[{label:'AI Visualizer',to:'/learn/ai-visualizer',Icon:Box},{label:'AI Tutor',to:'/ai-tutor',Icon:BrainCircuit},{label:'Mock Interview',to:'/mock-interview',Icon:UserRound}];
  const learnNavigation=pathname==='/learn'?[{label:'Learning Map',to:'/learn',Icon:Sparkles},{label:'Lessons',to:'/learn/data-structures',Icon:BookOpen},{label:'Visual Lab',to:'/3d-visualizer',Icon:Box},{label:'Practice',to:'/coding',Icon:Code2},{label:'Complexity Lab',to:'/learn/complexity',Icon:ChartIcon}]:[{label:'Constellation',to:'/learn',Icon:Sparkles},{label:'Data Structures',to:'/learn/data-structures',Icon:Layers},{label:'Algorithms',to:'/learn/algorithms',Icon:Code2},{label:'3D Complexity',to:'/learn/complexity',Icon:ChartIcon},{label:'Video Lessons',to:'/video-learning',Icon:PlaySquare},{label:'3D Data Structures',to:'/3d-visualizer',Icon:Box},{label:'3D Algorithms',to:'/algorithms-visualizer',Icon:Box}];
  const pageNavigation = isProfile ? [navigation[0], {label:'My Progress',to:'/progress',Icon:ChartIcon}, {label:'My Profile',to:'/profile',Icon:UserRound}, ...navigation.slice(1)] : navigation;
  const [open, setOpen] = useState(false);
  const [community, setCommunity] = useState(false);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 1000px)').matches);
  useEffect(() => { const media = window.matchMedia('(max-width: 1000px)'); const change = () => setCompact(media.matches); media.addEventListener('change', change); return () => media.removeEventListener('change', change); }, []);
  useEffect(() => {
    if (!community && !(open && compact))
      return;
    const previous = document.activeElement as HTMLElement | null;
    const root = document.querySelector<HTMLElement>(community ? '.ad-community' : '.ad-sidebar');
    const controls = () => Array.from(root?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? []).filter(el => el.getClientRects().length && getComputedStyle(el).display !== 'none');
    controls()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab')
        return; const items = controls(); const first = items[0], last = items.at(-1); if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
      else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => { document.removeEventListener('keydown', trap); previous?.focus(); };
  }, [open, community, compact]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setCommunity(false);
      }
    }; window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener);
  }, []);
  return <div className={`academy-dashboard ${pathname==='/learn'?'academy-universe':pathname==='/learn/algorithms'?'academy-algorithms':pathname==='/video-learning'?'academy-video':['/3d-visualizer','/algorithms-visualizer'].includes(pathname)?'academy-structures':''} ${isLearn ? 'academy-learn' : ''} ${isProgress ? 'academy-progress' : ''} ${(isAi||isLearn) ? 'academy-ai' : ''}`}>
    <a className="ad-skip" href="#dashboard-content">Skip to content</a>{open && <button className="ad-nav-backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" />}<aside inert={compact && !open} className={`ad-sidebar ${open ? 'open' : ''}`}>
      <Brand />
      <button className="ad-icon-button ad-close-nav" onClick={() => setOpen(false)} aria-label="Close navigation">
        <X size={18} />
      </button>
      {isProfile && <small style={{display:"block",padding:"0 16px 12px",color:"#718099",fontSize:11}}>OVERVIEW</small>}<nav aria-label="Main navigation">{((isAi||isLearn)?[]:pageNavigation).map(({ label, to, Icon }, i) => <Link key={label} to={to} className={(isAi ? label === 'AI Tools' : isProfile ? to === '/profile' : i === 0) ? 'active' : ''} aria-current={(isAi ? label === 'AI Tools' : isProfile ? to === '/profile' : i === 0) ? 'page' : undefined} onClick={() => {
        setOpen(false); if (label === 'Achievements')
          document.getElementById('achievements')?.focus();
      }}>
        <Icon size={19} />{label}</Link> )}{!isAi&&!isLearn&&<button onClick={() => { setCommunity(true); setOpen(false); }}>
          <Users size={19} />Community</button>}{(isAi||isLearn)&&<div className="ad-ai-subnav"><small>{isLearn?"LEARN":"AI TOOLS"}</small>{(isLearn?learnNavigation:aiNavigation).map(({label,to,Icon})=><Link key={to} to={to} className={pathname===to?"active":""} aria-current={pathname===to?"page":undefined} onClick={()=>setOpen(false)}><Icon size={18}/><span>{label}{['/learn/algorithms','/video-learning','/3d-visualizer','/algorithms-visualizer'].includes(pathname)&&<small className="al-nav-description">{({'Constellation':'Learning overview','Algorithms':'Learn & visualize','3D Complexity':'Interactive analysis','Video Lessons':'Visual learning','3D Data Structures':'Explore in 3D','3D Algorithms':'Step-by-step visuals'} as Record<string,string>)[label]}</small>}{pathname==='/learn'&&<small className="uv-nav-description">{({"Learning Map":"Explore your path",Lessons:"Structured learning","Visual Lab":"3D interactive labs",Practice:"Exercises & challenges","Complexity Lab":"Analyze & compare"} as Record<string,string>)[label]}</small>}</span>{isLearn&&label==="3D Complexity"&&<span className="ds-nav-badge">3D</span>}{isLearn&&label==="Video Lessons"&&<span className="ds-nav-badge ai">AI</span>}</Link>)}</div>}
      </nav>
      {pathname==='/learn'&&<div className="uv-sidebar-topics"><small>TOPICS</small><Link to="/learn/data-structures"><i style={{background:'#24d6b0'}}/>Data Structures</Link><Link to="/learn/algorithms"><i style={{background:'#8651ff'}}/>Algorithms</Link><Link to="/ai-tutor?topic=system-design"><i style={{background:'#348cff'}}/>System Design</Link><Link to="/mock-interview"><i style={{background:'#ff9a42'}}/>Interview Prep</Link></div>}
      <div className="ad-motivation">{['/3d-visualizer','/algorithms-visualizer'].includes(pathname)&&<Link className="st-side-cta" to="/ai-tutor" aria-label="Try AI Tutor"><img src="/learn/structures/motivation.png" alt="Turn Concepts Into Clarity. Interactive 3D visualizations powered by AI. Try AI Tutor."/></Link>}{pathname==='/video-learning'&&<Link className="vl-side-cta" to="/ai-tutor">Try AI Tutor →</Link>}{pathname==='/learn/algorithms'&&<Link className="al-side-continue" to={nextAlgorithm.lessonRoute}>Continue Learning →</Link>}
        <span>
          <Star size={17} fill="currentColor" />{isProfile ? "Keep growing!" : "Keep going!"}</span>
        <p>{pathname==='/video-learning'?<>Turn Concepts<br/>Into Clarity<br/><small>Beautiful visual lessons<br/>powered by AI.</small></>:pathname==='/learn' ? <>Build Smarter<br/>Go Further<br/><small>Interactive. Visual.<br/>Made for your growth.</small></> : pathname==='/learn/complexity' ? <>Learn Smarter<br/>Build Brighter<br/><small>Visualize. Understand.<br/>Master Computer Science.</small></> : isLearn ? <>“Small steps<br/>today, big results<br/>tomorrow.”</> : isAi ? <>“Practice today,<br/>perform tomorrow.”</> : isProfile ? <>“A better you<br />is a more capable<br />you.”</> : <>“Small consistent<br />steps lead to big<br />results.”</>}</p><cite>— Alvio Academy</cite>
        <svg viewBox="0 0 185 95" aria-hidden="true">
          <path d="m0 95 32-34 36 25L133 8l52 73v14Z" fill="#242060" />
          <path d="m70 95 63-87 52 73v14h-24l-28-39-33 39Z" fill="#6749ef" />
          <path d="m119 28 14-20 15 21-14-6Z" fill="#b29aff" />
        </svg>
      </div>
      <footer>{['/learn/algorithms','/video-learning','/3d-visualizer','/algorithms-visualizer'].includes(pathname)?<div className="al-side-progress"><span>Level {algorithmStats?.level||1}</span><span>{algorithmStats?.totalXp||0} / {algorithmStats?.nextLevelXp||1000} XP</span><progress max={algorithmStats?.nextLevelXp||1000} value={algorithmStats?.totalXp||0}/></div>:<>Alvio Academy<small>Learn. Practice. Build. Grow.</small></>}
      </footer>
    </aside>
    <div className="ad-workspace" inert={community || (compact && open)}>
      <DashboardHeader onMenu={() => setOpen(true)} />
      <main id="dashboard-content" tabIndex={-1}>{children}</main>
    </div>{community && <div className="ad-modal-backdrop" onClick={() => setCommunity(false)}>
      <section className="ad-community ad-card" role="dialog" aria-modal="true" aria-labelledby="community-title" onClick={e => e.stopPropagation()}>
        <button autoFocus className="ad-icon-button" onClick={() => setCommunity(false)} aria-label="Close community">
          <X />
        </button>
        <Users size={32} />
        <h2 id="community-title">Learn alongside others</h2>
        <p>Challenge another developer in the coding arena.</p>
        <Link className="ad-button primary" to="/workspace/pvp">Open PvP arena<ArrowRight size={15} />
        </Link>
      </section>
    </div>}</div>;
}
