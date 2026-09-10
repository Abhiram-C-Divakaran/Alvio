import { useEffect, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { emptyFilters, topics, type PracticeFilters } from './practiceModel';
export default function ProblemFilters({ value, tags, onApply }: {
    value: PracticeFilters;
    tags: string[];
    onApply: (value: PracticeFilters) => void;
}) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(value);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    useEffect(() => { const close = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node))
        setOpen(false); }; const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) {
        setOpen(false);
        trigger.current?.focus();
    } }; document.addEventListener('pointerdown', close); document.addEventListener('keydown', key); return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', key); }; }, [open]);
    const count = Object.values(value).filter(Boolean).length;
    return <div className="problem-filter-wrap" ref={root}><button ref={trigger} className="practice-control" aria-expanded={open} aria-controls="problem-filters" onClick={() => { setDraft(value); setOpen(!open); }}><SlidersHorizontal size={17}/>Filters{count > 0 && <span className="filter-count">{count}</span>}<ChevronDown size={13}/></button>{open && <div className="problem-filter-popover" id="problem-filters" role="region" aria-label="Problem filters">
 {(['difficulty', 'status', 'topic', 'tag'] as const).map(field => <label key={field}>{field === 'tag' ? 'Tags' : field === 'topic' ? 'Topics' : field[0].toUpperCase() + field.slice(1)}<select aria-label={field === 'tag' ? 'Tags' : field === 'topic' ? 'Topics' : field[0].toUpperCase() + field.slice(1)} value={draft[field]} onChange={e => setDraft({ ...draft, [field]: e.target.value })}><option value="">All</option>{(field === 'difficulty' ? ['Easy', 'Medium', 'Hard'] : field === 'status' ? ['Unsolved', 'Attempted', 'Solved'] : field === 'topic' ? topics.slice(1) : tags).map(option => <option key={option}>{option}</option>)}</select></label>)}
 <div className="filter-actions"><button onClick={() => { setDraft(emptyFilters); onApply(emptyFilters); }}>Reset</button><button className="primary" onClick={() => { onApply(draft); setOpen(false); trigger.current?.focus(); }}>Apply Filters</button></div></div>}</div>;
}
