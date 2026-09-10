import { Bookmark, Check, ChevronRight, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { acceptance, problemStatus, problemTags, type ProblemSummary } from './practiceModel';
export function ProblemTag({ name }: {
    name: string;
}) { return <span className="problem-tag">{name}</span>; }
export function ProblemRow({ problem: p, number, href, status, bookmarked, onBookmark }: {
    problem: ProblemSummary;
    number: number;
    href: string;
    status: string;
    bookmarked: boolean;
    onBookmark: () => void;
}) {
    const tags = problemTags(p);
    const rate = acceptance(p);
    return <div className="problem-row"><Link className="problem-row-link" to={href} aria-label={`${number}. ${p.title}, ${p.difficulty}, ${status}`}><span className={`problem-status ${status.toLowerCase()}`} title={status}>{status === 'Solved' ? <Check size={14}/> : status === 'Attempted' ? <Minus size={14}/> : null}</span><span className="problem-number">{number}</span><strong className="problem-title">{p.title}</strong><span className="problem-acceptance" title={rate === null ? 'No submissions yet' : `${p.accepted} accepted of ${p.submissions} submissions`}>{rate === null ? '—' : `${rate.toFixed(1)}%`}</span><span className={`problem-difficulty ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span><span className="problem-tags">{tags.slice(0, 2).map(tag => <ProblemTag key={tag} name={tag}/>)}{tags.length > 2 && <ProblemTag name={`+${tags.length - 2}`}/>}</span><ChevronRight className="problem-arrow" size={18}/></Link><button className={`row-bookmark ${bookmarked ? 'saved' : ''}`} aria-label={`${bookmarked ? 'Remove bookmark for' : 'Bookmark'} ${p.title}`} aria-pressed={bookmarked} onClick={onBookmark}><Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'}/></button></div>;
}
export default function ProblemsTable({ problems, allProblems, solved, attempted, bookmarks, loading, href, onBookmark, onClear }: {
    problems: ProblemSummary[];
    allProblems: ProblemSummary[];
    solved: Set<string>;
    attempted: Set<string>;
    bookmarks: Set<string>;
    loading: boolean;
    href: (id: string) => string;
    onBookmark: (id: string) => void;
    onClear: () => void;
}) {
    return <section className="problems-table" aria-label="Coding problems" aria-busy={loading}><div className="problem-table-header"><span>✓</span><span>#</span><span>Title</span><span>Acceptance</span><span>Difficulty</span><span>Tags</span><span /></div>{loading ? Array.from({ length: 8 }, (_, i) => <div className="problem-skeleton" key={i}><i /><span /><span /><span /></div>) : problems.length ? problems.map(p => <ProblemRow key={p.id} problem={p} number={allProblems.findIndex(x => x.id === p.id) + 1} status={problemStatus(p.id, solved, attempted)} bookmarked={bookmarks.has(p.id)} href={href(p.id)} onBookmark={() => onBookmark(p.id)}/>) : <div className="practice-empty"><h2>No problems found</h2><p>Try adjusting your search or filters.</p><button className="practice-control" onClick={onClear}>Clear filters</button></div>}</section>;
}
