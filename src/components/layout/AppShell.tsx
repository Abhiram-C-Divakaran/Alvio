import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Flame, Bell } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import useProgressStore from '../../stores/useProgressStore';
import { dashboardData } from '../../features/dashboard/dashboardData';
import { activeNavigation, appSection, globalNavigation, navigation, searchNavigation } from '../../navigation/navigationConfig';
import '../../features/dashboard/dashboard.css';
import '../../features/coding/practice.css';
import './app-shell.css';

export function PageContainer({children,wide=false}:{children:ReactNode;wide?:boolean}) {
  return <div className={`app-page-container${wide?' app-page-container--wide':''}`}>{children}</div>;
}
export default function AppShell({children}:{children:ReactNode}) {
  const location=useLocation(), navigate=useNavigate();
  const section=appSection(location.pathname), active=activeNavigation(new URL(location.pathname+location.search+location.hash,window.location.origin));
  const user=useAuthStore(s=>s.user), progress=useProgressStore(s=>s.progress), stats=useProgressStore(s=>s.stats);
  const data=dashboardData(progress,stats);
  const [drawer,setDrawer]=useState(false),[search,setSearch]=useState(false),[query,setQuery]=useState(''),[selected,setSelected]=useState(0),[notifications,setNotifications]=useState(false);
  const menu=useRef<HTMLButtonElement>(null), sidebar=useRef<HTMLElement>(null), main=useRef<HTMLElement>(null), header=useRef<HTMLElement>(null), input=useRef<HTMLInputElement>(null);
  const results=searchNavigation(query), items=navigation.filter(n=>n.section===section);
  useEffect(()=>{setDrawer(false);setSearch(false);setNotifications(false)},[location.pathname,location.search,location.hash]);
  useEffect(()=>{if(!location.hash)window.scrollTo(0,0)},[location.pathname]);
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearch(true);requestAnimationFrame(()=>input.current?.focus())}if(e.key==='Escape'){setDrawer(false);setSearch(false);setNotifications(false)}};
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[]);
  useEffect(()=>{
    if(!drawer)return;
    const previous=document.activeElement as HTMLElement;
    const oldOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';main.current?.setAttribute('inert','');header.current?.setAttribute('inert','');
    sidebar.current?.querySelector<HTMLElement>('button,a')?.focus();
    const trap=(e:KeyboardEvent)=>{if(e.key!=='Tab')return;const nodes=Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a,button')??[]).filter(n=>n.getClientRects().length);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}};
    const media=window.matchMedia('(min-width:1024px)'), close=()=>{if(media.matches)setDrawer(false)};
    document.addEventListener('keydown',trap);media.addEventListener('change',close);
    return()=>{document.body.style.overflow=oldOverflow;main.current?.removeAttribute('inert');header.current?.removeAttribute('inert');document.removeEventListener('keydown',trap);media.removeEventListener('change',close);previous?.focus()};
  },[drawer]);
  const sections=(mobile=false)=><nav className={mobile?'app-mobile-sections':'app-sections'} aria-label={mobile?'Mobile product sections':'Product sections'}>{globalNavigation.map(n=><Link key={n.section} data-section={n.section} aria-current={section===n.section?'page':undefined} to={n.path}>{n.label}</Link>)}</nav>;
  return <div className={`academy-dashboard academy-${section} app-shell${section==='practice'?' practice-theme':''}`}>
    <a className="app-skip" href="#app-content">Skip to content</a>
    <header ref={header} className="app-header">
      <button ref={menu} className="app-icon app-menu" aria-label="Open navigation" aria-expanded={drawer} aria-controls="app-sidebar" onClick={()=>setDrawer(true)}><Menu/></button>
      <Link className="app-brand" to="/dashboard" aria-label="Alvio dashboard"><svg width="38" height="38" viewBox="0 0 44 40" aria-hidden="true"><path d="M22 2 44 35H29L22 24 14 35H0Z" fill="#6246ec"/><path d="m22 2 7 10-7 5-7-5Z" fill="#c8baff"/><path d="m15 12 7 5-8 18H0Z" fill="#9274ff"/></svg><span>Alvio<small>Learn · Practice · Grow</small></span></Link>
      {sections()}
      <div className={`app-search ${search?'is-open':''}`}><Search size={17}/><input ref={input} role="combobox" aria-label="Search Alvio" aria-autocomplete="list" aria-expanded={search} aria-controls="app-search-results" aria-activedescendant={search?`app-result-${selected}`:undefined} placeholder="Search lessons, practice, or AI…" value={query} onFocus={()=>setSearch(true)} onChange={e=>{setQuery(e.target.value);setSelected(0)}} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setSearch(true);setSelected(i=>(i+(e.key==='ArrowDown'?1:-1)+results.length)%results.length)}if(e.key==='Enter'&&results[selected]){e.preventDefault();navigate(results[selected].path);setSearch(false);input.current?.blur()}if(e.key==='Escape'){setSearch(false);input.current?.blur()}}}/><kbd>⌘ K</kbd>
      {search&&<><button className="app-dismiss" aria-label="Close search" onClick={()=>setSearch(false)}/><div id="app-search-results" role="listbox" className="app-search-results">{results.map((r,i)=><div key={r.path}>{(i===0||results[i-1].group!==r.group)&&<small>{r.group}</small>}<Link id={`app-result-${i}`} role="option" aria-selected={selected===i} to={r.path} onMouseEnter={()=>setSelected(i)} onClick={()=>setSearch(false)}><r.icon size={17}/>{r.label}</Link></div>)}</div></>}
      </div>
      <div className="app-account"><button className="app-icon app-search-toggle" aria-label="Open search" onClick={()=>{setSearch(true);requestAnimationFrame(()=>input.current?.focus())}}><Search/></button><span className="app-streak"><Flame size={18}/>{data.streak} day streak</span><Link className="app-xp" to="/progress">{data.xp.toLocaleString()} XP<small>{data.rank}</small></Link><Link className="app-avatar" to="/profile" aria-label="Open profile">{user?.avatar?<img src={user.avatar} alt=""/>:(user?.name||'A')[0]}</Link><button className="app-icon app-notification-button" aria-label="Notifications" aria-expanded={notifications} onClick={()=>setNotifications(!notifications)}><Bell size={20}/></button></div>
      {notifications&&<div className="app-notifications"><h2>Your achievements</h2>{data.badges.length?data.badges.slice(-3).map(b=><p key={b.id}>{b.name}</p>):<p>No new notifications. Earned achievements appear here.</p>}<Link to="/dashboard#achievements">View achievements →</Link></div>}
    </header>
    {drawer&&<button className="app-drawer-backdrop" aria-label="Close navigation" onClick={()=>setDrawer(false)}/>}
    <aside id="app-sidebar" ref={sidebar} className={`app-sidebar${drawer?' is-open':''}`} role={drawer?'dialog':undefined} aria-modal={drawer||undefined} aria-label="Navigation"><button className="app-icon app-drawer-close" aria-label="Close navigation" onClick={()=>setDrawer(false)}><X/></button>{sections(true)}<nav aria-label={`${section==='ai'?'AI Tools':section[0].toUpperCase()+section.slice(1)} navigation`}>{items.map((n,i)=><div key={n.id}>{(i===0||items[i-1].group!==n.group)&&<h2 className="app-nav-group">{n.group}</h2>}<Link data-nav-id={n.id} className="app-nav-link" aria-current={active?.id===n.id?'page':undefined} to={n.path}><n.icon size={20}/><span>{n.label}{n.description&&<small>{n.description}</small>}</span></Link></div>)}</nav><div className="app-motivation"><strong>Learn smarter.<br/>Build with confidence.</strong><p>Small steps today, big results tomorrow.</p><Link to="/learn">Continue learning →</Link></div><footer className="app-sidebar-footer"><Link to="/progress"><strong>Level {stats?.level ?? 1}</strong><span>{data.xp.toLocaleString()} / {data.nextXp.toLocaleString()} XP</span></Link><progress max="100" value={data.xpPercent} aria-label="Progress to next level"/></footer></aside>
    <main id="app-content" ref={main} className="app-main" tabIndex={-1}><PageContainer wide={['/coding','/workspace/pvp','/3d-visualizer','/algorithms-visualizer'].includes(location.pathname)}>{children}</PageContainer></main>
  </div>;
}
