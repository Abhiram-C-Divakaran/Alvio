import { ArrowLeft, ChartNoAxesColumnIncreasing, Search, Shield, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { topics } from './practiceModel';
export function PracticeStats({ rank, solved, total, loading }: {
    rank: string;
    solved: number;
    total: number;
    loading: boolean;
}) {
    return <div className="practice-stats" aria-label="Practice statistics">
    <div><Shield className="rank-icon"/><strong>{rank}</strong><span>Current Rank</span></div>
    <div><svg className="solved-ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14" stroke="#14658a"/><circle cx="18" cy="18" r="14" stroke="url(#progress-gradient)" strokeDasharray={`${Math.min(88, total ? solved / total * 88 : 0)} 88`} transform="rotate(-90 18 18)"/><defs><linearGradient id="progress-gradient"><stop stopColor="#38bdf8"/><stop offset="1" stopColor="#6366f1"/></linearGradient></defs></svg><strong>{solved}</strong><span>Solved</span></div>
    <div><ChartNoAxesColumnIncreasing className="total-icon"/><strong>{loading ? '—' : total}</strong><span>Total Problems</span></div>
  </div>;
}
export function CodingHero({ rank, solved, total, loading }: Parameters<typeof PracticeStats>[0]) {
    return <section className="coding-hero"><div className="coding-hero-art" aria-hidden="true"/><div className="coding-heading"><Link className="practice-breadcrumb" to="/coding"><ArrowLeft size={14}/> PRACTICE</Link><h1><Terminal aria-hidden="true"/><span>Coding <em>Playground</em></span></h1><p>Master key algorithm techniques and data structures. Solve challenges<br className="hero-break"/> and track your progress in real-time.</p></div><PracticeStats rank={rank} solved={solved} total={total} loading={loading}/></section>;
}
export function ProblemSearch({ value, onChange }: {
    value: string;
    onChange: (value: string) => void;
}) {
    return <label className="problem-search"><Search size={21}/><input type="search" aria-label="Search problems" placeholder="Search problems, topics, or keywords..." value={value} onChange={e => onChange(e.target.value)}/></label>;
}
export function TopicTabs({ value, onChange }: {
    value: string;
    onChange: (value: string) => void;
}) {
    return <nav className="topic-tabs" aria-label="Problem topics">{topics.map(topic => <button key={topic} aria-pressed={value === topic} className={value === topic ? 'active' : ''} onClick={() => onChange(topic)}>{topic}</button>)}</nav>;
}
export function Pagination({ page, pages, total, onChange }: {
    page: number;
    pages: number;
    total: number;
    onChange: (p: number) => void;
}) {
    const numbers = [...new Set([1, page - 1, page, page + 1, pages])].filter(n => n > 0 && n <= pages).sort((a, b) => a - b);
    return <footer className="practice-pagination"><span>{total ? `${(page - 1) * 25 + 1}–${Math.min(page * 25, total)} of ${total} problems` : '0 problems'}</span><nav aria-label="Problem pages"><button disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>{numbers.map((n, i) => <span key={n}>{i > 0 && n - numbers[i - 1] > 1 && <span className="page-ellipsis">…</span>}<button aria-label={`Page ${n}`} aria-current={page === n ? 'page' : undefined} onClick={() => onChange(n)}>{n}</button></span>)}<button disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button></nav></footer>;
}

