import { ArrowRight, Bookmark, Clock3, Flame, Target, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ProgressData } from './progressModel';
import { studyTime } from './progressModel';
import type { ReactNode } from 'react';
export function ProgressCardTitle({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return <div className="pg-card-title"><span>{icon}</span><h2>{title}</h2>{children}</div>;
}
export function ProgressHero({ data }: { data: ProgressData }) {
  return <section className="pg-card pg-hero"><div className="pg-hero-art" aria-hidden="true"/><div className="pg-hero-copy"><h2><span className="pg-icon violet"><Target size={30}/></span>On track this week</h2><p>You’ve completed <strong>{data.completion}%</strong> of your learning journey.<br/>Keep going — consistency compounds!</p><Link className="pg-continue" to={data.continueTo}>Continue Learning<ArrowRight size={21}/></Link></div><p className="pg-hero-quote">Progress<br/>today builds<br/>tomorrow.</p><div className="pg-hero-metrics"><div><Flame className="orange"/><span><strong>{data.streak} day streak</strong><small>{data.streak ? 'Keep it up!' : 'Start your streak'}</small></span></div><div><Target className="green"/><span><strong>{data.completed} topics</strong><small>mastered</small></span></div><div><Zap className="amber"/><span><strong>{studyTime(data.studyMinutes)}</strong><small>study time {data.studyLabel}</small></span></div></div></section>;
}
function arc(radius: number, start: number, end: number) {
  const point = (angle: number) => [110 + radius * Math.cos((angle - 90) * Math.PI / 180), 110 + radius * Math.sin((angle - 90) * Math.PI / 180)];
  const a = point(start), b = point(end); return `M ${a[0]} ${a[1]} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${b[0]} ${b[1]}`;
}
export function GrowthScore({ data }: { data: ProgressData }) {
  const segments = 12, sweep = data.completion * 3.6;
  return <section className="pg-card pg-growth"><ProgressCardTitle icon={<svg width="27" height="27" viewBox="0 0 27 27" aria-hidden="true"><defs><linearGradient id="pg-bars" x2="0" y2="1"><stop stopColor="#12d5ff"/><stop offset="1" stopColor="#8651ff"/></linearGradient></defs><rect x="3" y="13" width="5" height="11" rx="2" fill="#9858ff"/><rect x="11" y="3" width="5" height="21" rx="2" fill="url(#pg-bars)"/><rect x="19" y="8" width="5" height="16" rx="2" fill="#169eee"/></svg>} title="Growth Score"/><p className="pg-card-subtitle">Overall learning progress</p><div className="pg-growth-body"><div className="pg-growth-ring"><svg viewBox="0 0 220 220" role="img" aria-label={`${data.completion}% overall learning progress`}><defs><linearGradient id="pg-ring-gradient" gradientUnits="userSpaceOnUse" x1="110" y1="10" x2="110" y2="210"><stop stopColor="#08d4ed"/><stop offset=".5" stopColor="#3683ff"/><stop offset="1" stopColor="#8653ff"/></linearGradient></defs>{[94, 76].map(radius => Array.from({length:segments}, (_, i) => {
    const start = i * 30 + 1.5, end = i * 30 + 28.5;
    return <g key={`${radius}-${i}`}><path d={arc(radius, start, end)} stroke="#284779" strokeOpacity=".65" strokeWidth={radius === 94 ? 16.5 : 14.5} fill="none"/><path d={arc(radius, start, end)} stroke={radius === 94 ? '#122449' : '#122749'} strokeWidth={radius === 94 ? 15 : 13} fill="none" strokeLinecap="butt"/>{sweep > start && <path d={arc(radius, start, Math.min(sweep, end))} stroke="url(#pg-ring-gradient)" strokeWidth={radius === 94 ? 15 : 13} opacity={radius === 94 ? 1 : .7} fill="none" strokeLinecap="butt"/>}</g>;
  }))}</svg><div><strong>{data.completion}%</strong><small>Overall Progress</small></div></div><ol className="pg-growth-stages">{['Learn','Practice','Build','Improve','Repeat'].map(stage=><li key={stage} className={stage==='Improve'?'active':''}><span/>{stage}</li>)}</ol></div><div className="pg-growth-foot"><span><strong><TrendingUp size={14}/>{data.growthDelta === null ? '—' : `${data.growthDelta > 0 ? '+' : ''}${data.growthDelta} pp`}</strong><small>{data.growthDelta === null ? 'No prior month' : 'vs. last month'}</small></span><p>Consistent effort leads to extraordinary results.</p></div></section>;
}
export function ProgressSummaryCards({ data }: { data: ProgressData }) {
  const cards = [
    { Icon: Bookmark, tone: 'green', label: 'Topics Mastered', value: `${data.completed}/${data.topics.length}`, note: data.completed ? 'You’re making great progress!' : 'Your next milestone starts here.', to: '#learning-path' },
    { Icon: Target, tone: 'amber', label: 'Avg. Quiz Score', value: data.quizScore === null ? '—' : `${data.quizScore}%`, note: data.quizDelta === null ? data.quizScore === null ? 'Take your first quiz' : 'Best topic quiz scores' : `${data.quizDelta > 0 ? '+' : ''}${data.quizDelta} pp vs. last month`, to: '#skill-focus' },
    { Icon: Clock3, tone: 'blue', label: 'Study Time', value: studyTime(data.studyMinutes), detail: data.studyLabel, note: data.studyDelta === null ? 'No prior month yet' : `${data.studyDelta >= 0 ? '+' : '−'}${studyTime(Math.abs(data.studyDelta))} from last month`, to: '#weekly-momentum' },
  ];
  return <div className="pg-summary">{cards.map(({Icon,tone,label,value,note,detail,to})=><a className="pg-card pg-summary-card" href={to} key={label}><span className={`pg-icon ${tone}`}><Icon size={25}/></span><div><h2>{label}</h2><strong>{value}</strong>{detail && <span className="pg-summary-detail">{detail}</span>}<p>{note}</p></div><ChevronRight size={17}/></a>)}</div>;
}
