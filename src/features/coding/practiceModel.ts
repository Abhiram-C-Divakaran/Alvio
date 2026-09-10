export interface ProblemSummary {
    id: string;
    title: string;
    topic: string;
    difficulty: string;
    accepted: number;
    submissions: number;
    created_at?: string;
    tags?: string[];
}
export interface PracticeFilters {
    difficulty: string;
    status: string;
    topic: string;
    tag: string;
}
export const emptyFilters: PracticeFilters = { difficulty: '', status: '', topic: '', tag: '' };
export const topics = ['All', 'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Stacks', 'Queues'];
export const sorts = ['Most Relevant', 'Acceptance Rate', 'Difficulty', 'Recently Added', 'Most Attempted'];
export const problemTags = (p: ProblemSummary) => [...new Set([...(p.tags || []), ...(p.topic || '').split(/[,;|]/)].map(t => t.trim()).filter(Boolean))];
export const acceptance = (p: ProblemSummary) => p.submissions > 0 ? p.accepted / p.submissions * 100 : null;
export const problemStatus = (id: string, solved: Set<string>, attempted: Set<string>) => solved.has(id) ? 'Solved' : attempted.has(id) ? 'Attempted' : 'Unsolved';
export function matchesTopic(p: ProblemSummary, topic: string) {
    if (!topic || topic === 'All')
        return true;
    const aliases: Record<string, string[]> = { Arrays: ['array'], Strings: ['string'], 'Linked Lists': ['linked list', 'linked-list'], Trees: ['tree'], Graphs: ['graph'], Searching: ['search'], Stacks: ['stack'], Queues: ['queue'] };
    const haystack = problemTags(p).join(' ').toLowerCase();
    return (aliases[topic] || [topic.toLowerCase()]).some(t => haystack.includes(t));
}
export function selectProblems(problems: ProblemSummary[], query: string, topic: string, filters: PracticeFilters, sort: string, solved: Set<string>, attempted: Set<string>, bookmarks?: Set<string>) {
    const q = query.trim().toLowerCase();
    const result = problems.filter(p => (!q || [p.title, p.difficulty, ...problemTags(p)].join(' ').toLowerCase().includes(q)) && matchesTopic(p, topic) && matchesTopic(p, filters.topic) && (!filters.tag || problemTags(p).includes(filters.tag)) && (!filters.difficulty || p.difficulty === filters.difficulty) && (!filters.status || problemStatus(p.id, solved, attempted) === filters.status) && (!bookmarks || bookmarks.has(p.id)));
    const weights: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };
    if (sort === 'Acceptance Rate')
        result.sort((a, b) => (acceptance(b) ?? -1) - (acceptance(a) ?? -1));
    if (sort === 'Difficulty')
        result.sort((a, b) => weights[a.difficulty] - weights[b.difficulty]);
    if (sort === 'Most Attempted')
        result.sort((a, b) => b.submissions - a.submissions);
    // The API's canonical order is created_at ASC; reverse it for newest first.
    if (sort === 'Recently Added')
        result.reverse();
    return result;
}
