import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import useProgressStore from '../../stores/useProgressStore';
import CodingWorkspace from './CodingWorkspace';
import type { CodingProblem } from '../../data/codingProblems';
import { CodingHero, Pagination, ProblemSearch, TopicTabs } from './PracticeComponents';
import ProblemFilters from './ProblemFilters';
import ProblemsTable from './ProblemsTable';
import { problemTags, selectProblems, sorts, type ProblemSummary, type PracticeFilters } from './practiceModel';
import './practice.css';
export default function CodingPage() {
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const token = useAuthStore(s => s.token);
    const rank = useProgressStore(s => s.stats?.levelName || 'Novice');
    const [problems, setProblems] = useState<ProblemSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [progressError, setProgressError] = useState('');
    const [solved, setSolved] = useState(new Set<string>());
    const [attempted, setAttempted] = useState(new Set<string>());
    const [bookmarks, setBookmarks] = useState(new Set<string>());
    const [selected, setSelected] = useState<CodingProblem | null>(null);
    const [opening, setOpening] = useState(false);
    const [retry, setRetry] = useState(0);
    const query = params.get('q') || '';
    const [search, setSearch] = useState(query);
    const topic = params.get('topic') || 'All';
    const sort = params.get('sort') || sorts[0];
    const id = params.get('problem');
    const workspaceOpen = Boolean(id);
    const bookmarkRequests = useRef(new Set<string>());
    const filters: PracticeFilters = { difficulty: params.get('difficulty') || '', status: params.get('status') || '', topic: params.get('filterTopic') || '', tag: params.get('tag') || '' };
    const bookmarkedOnly = params.get('view') === 'bookmarks';
    function update(values: Record<string, string>, resetPage = true) { setParams(previous => { const next = new URLSearchParams(previous); Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); if (resetPage)
        next.delete('page'); return next; }, { replace: true }); }
    useEffect(() => setSearch(query), [query]);
    useEffect(() => { if (search === query)
        return; const timer = setTimeout(() => update({ q: search }), 200); return () => clearTimeout(timer); }, [search, query]);
    useEffect(() => { const controller = new AbortController(); setLoading(true); setError(''); fetch('/api/problems', { signal: controller.signal }).then(async (r) => { if (!r.ok)
        throw new Error('Unable to load problems. Please try again.'); setProblems(await r.json()); }).catch(e => { if (e.name !== 'AbortError')
        setError(e.message); }).finally(() => { if (!controller.signal.aborted)
        setLoading(false); }); return () => controller.abort(); }, [retry, workspaceOpen]);
    useEffect(() => {
        setSolved(new Set());
        setAttempted(new Set());
        setBookmarks(new Set());
        setProgressError('');
        if (!token)
            return;
        const controller = new AbortController();
        const options = { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal };
        Promise.all([fetch('/api/profile', options), fetch('/api/profile/favourites', options)]).then(async ([profile, favourites]) => {
            if (!profile.ok || !favourites.ok)
                throw new Error('Your progress and bookmarks could not be loaded. Please sign in again or retry.');
            const data = await profile.json();
            const saved: {
                problem_id: string;
            }[] = await favourites.json();
            if (!controller.signal.aborted) {
                setSolved(new Set((data.solvedProblems || []).map((p: {
                    id: string;
                }) => p.id)));
                setAttempted(new Set((data.attemptedProblems || []).map((p: {
                    id: string;
                }) => p.id)));
                setBookmarks(new Set(saved.map(p => p.problem_id)));
            }
        }).catch(e => { if (e.name !== 'AbortError')
            setProgressError(e.message); });
        return () => controller.abort();
    }, [token, id, retry]);
    useEffect(() => { setSelected(null); if (!id) {
        setOpening(false);
        return;
    } const controller = new AbortController(); setOpening(true); setError(''); fetch(`/api/problems/${encodeURIComponent(id)}`, { signal: controller.signal }).then(async (r) => { if (!r.ok)
        throw new Error('This problem could not be opened. Please try again.'); const p = await r.json(); if (!controller.signal.aborted)
        setSelected(p); }).catch(e => { if (e.name !== 'AbortError')
        setError(e.message); }).finally(() => { if (!controller.signal.aborted)
        setOpening(false); }); return () => controller.abort(); }, [id, retry]);
    const filtered = selectProblems(problems, query, topic, filters, sort, solved, attempted, bookmarkedOnly ? bookmarks : undefined);
    const pages = Math.max(1, Math.ceil(filtered.length / 25));
    const page = Math.min(pages, Math.max(1, Math.floor(Number(params.get('page'))) || 1));
    const tags = useMemo(() => [...new Set(problems.flatMap(problemTags))].sort(), [problems]);
    const href = (problemId: string) => { const next = new URLSearchParams(params); next.set('problem', problemId); return `/coding?${next}`; };
    const back = () => { const next = new URLSearchParams(params); next.delete('problem'); setParams(next); };
    const applyFilters = (v: PracticeFilters) => update({ difficulty: v.difficulty, status: v.status, filterTopic: v.topic, tag: v.tag });
    const clear = () => { setSearch(''); update({ q: '', topic: '', difficulty: '', status: '', filterTopic: '', tag: '', view: '' }); };
    async function bookmark(problemId: string) {
        if (!token) {
            navigate(`/auth?mode=login&next=${encodeURIComponent(`/coding?${params}`)}`);
            return;
        }
        if (bookmarkRequests.current.has(problemId)) return;
        bookmarkRequests.current.add(problemId);
        const shouldSave = !bookmarks.has(problemId);
        try {
            const response = await fetch(`/api/problems/${encodeURIComponent(problemId)}/interaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ type: 'star', action: shouldSave ? 'add' : 'remove' })
            });
            if (!response.ok) throw new Error('Could not update bookmark. Please retry.');
            setBookmarks(previous => {
                const next = new Set(previous);
                if (shouldSave) next.add(problemId);
                else next.delete(problemId);
                return next;
            });
        } catch (error) {
            setProgressError((error as Error).message);
        } finally {
            bookmarkRequests.current.delete(problemId);
        }
    }
    if (selected && id) {
        const index = problems.findIndex(p => p.id === id);
        return <div className="practice-workspace"><CodingWorkspace problem={selected} problemNumber={index + 1} isSolved={solved.has(id)} onBack={back} onNext={() => { if (index < problems.length - 1)
            navigate(href(problems[index + 1].id), { replace: true }); }} onPrev={() => { if (index > 0)
            navigate(href(problems[index - 1].id), { replace: true }); }} onShuffle={() => { if (problems.length)
            navigate(href(problems[Math.floor(Math.random() * problems.length)].id), { replace: true }); }}/></div>;
    }
    return <div className="coding-page"><CodingHero rank={rank} solved={solved.size} total={problems.length} loading={loading}/>
 {(error || progressError) && <div role="alert" className="practice-error">{error || progressError}<button onClick={() => setRetry(n => n + 1)}>Retry</button>{id && <button onClick={back}>Back to problems</button>}</div>}
 {opening && <p role="status">Opening problem…</p>}
 <div className="practice-toolbar"><ProblemSearch value={search} onChange={setSearch}/><div className="practice-filter-controls"><ProblemFilters value={filters} tags={tags} onApply={applyFilters}/><select className="practice-control practice-sort" aria-label="Sort problems" value={sort} onChange={e => update({ sort: e.target.value })}>{sorts.map(s => <option key={s}>{s}</option>)}</select></div></div>
 <TopicTabs value={topic} onChange={topic => update({ topic: topic === 'All' ? '' : topic })}/>
 {bookmarkedOnly && <div className="bookmark-heading"><h2>Bookmarks</h2><span>{token ? 'Your saved problems' : 'Sign in to see your saved problems.'}</span>{!token && <button onClick={() => navigate('/auth?mode=login&next=%2Fcoding%3Fview%3Dbookmarks')}>Sign in</button>}</div>}
 <ProblemsTable problems={filtered.slice((page - 1) * 25, page * 25)} allProblems={problems} solved={solved} attempted={attempted} bookmarks={bookmarks} loading={loading || opening} href={href} onBookmark={bookmark} onClear={clear}/>
 {!loading && <Pagination page={page} pages={pages} total={filtered.length} onChange={n => { update({ page: String(n) }, false); document.querySelector('.practice-main')?.scrollTo({ top: 0 }); }}/>}</div>;
}
