import { ALGO_META } from './metadata';
export const categories = ['All','Sorting','Searching','Graph','Dynamic Programming','Greedy','Divide & Conquer','Backtracking','Two Pointer','Tree','String','Math'];
const groups: Record<string,string> = {sorting:'Sorting',searching:'Searching',graph:'Graph',dp:'Dynamic Programming',greedy:'Greedy',recursion:'Recursion',traversal:'Tree'};
export type Algorithm = {id:string;name:string;description:string;category:string;difficulty:string;keywords:string;lessonRoute:string;visualizationRoute?:string;paradigms:string[]};
const additions = [
 {id:'heap-sort',name:'Heap Sort',description:'Builds a max heap, then repeatedly moves its largest element to the end.',category:'Sorting',difficulty:'Intermediate',keywords:'heap priority queue',paradigms:[]},
 {id:'rabin-karp',name:'Rabin–Karp',description:'Uses a rolling hash to find a pattern in a string, verifying hash matches.',category:'String',difficulty:'Intermediate',keywords:'pattern matching rolling hash substring',paradigms:[]}
];
const order = ['bubble-sort','selection-sort','insertion-sort','merge-sort','quick-sort','heap-sort','linear-search','binary-search','dfs','bfs','dijkstra','bellman-ford','floyd-warshall','kruskal','prim','topological-sort','inorder-traversal','preorder-traversal','postorder-traversal','hanoi','two-pointer','reverse-array','knapsack','fibonacci','lcs','activity-selection','huffman-coding','rabin-karp'];
export const algorithms:Algorithm[] = [
 ...Object.entries(ALGO_META).map(([id,m])=>({id,...m,category:['two-pointer','reverse-array'].includes(id)?'Two Pointer':groups[m.type],lessonRoute:`/learn/algorithms/${id}`,visualizationRoute:`/algorithms-visualizer?algo=${id}`,keywords:[['bfs','dfs'].includes(id)?'traversal':'',['kruskal','prim'].includes(id)?'mst minimum spanning tree':'',['dijkstra','bellman-ford','floyd-warshall'].includes(id)?'shortest path':'',m.type==='dp'?'dp memoization dynamic programming':'',id==='lcs'?'longest common subsequence':''].join(' '),paradigms:['merge-sort','quick-sort','binary-search'].includes(id)?['Divide & Conquer']:m.type==='dp'?['Dynamic Programming']:m.type==='greedy'?['Greedy']:[]})),
 ...additions.map(a=>({...a,lessonRoute:`/learn/algorithms/${a.id}`}))
].sort((a,b)=>(order.indexOf(a.id)<0?999:order.indexOf(a.id))-(order.indexOf(b.id)<0?999:order.indexOf(b.id)));
export function selectAlgorithms(query:string,category:string,sort:string,progress:Record<string,number>) {
 const q=query.trim().toLowerCase();const rows=algorithms.filter(a=>(category==='All'||a.category===category||a.paradigms.includes(category))&&`${a.name} ${a.id} ${a.description} ${a.category} ${a.keywords} ${a.paradigms.join(' ')}`.toLowerCase().includes(q));
 const difficulty:Record<string,number>={Beginner:0,Intermediate:1,Advanced:2};
 if(sort==='A–Z')rows.sort((a,b)=>a.name.localeCompare(b.name));
 if(sort==='Difficulty'||sort==='Beginner First')rows.sort((a,b)=>difficulty[a.difficulty]-difficulty[b.difficulty]);
 if(sort==='Progress')rows.sort((a,b)=>(progress[b.id]||0)-(progress[a.id]||0));
 if(sort==='Recommended')rows.sort((a,b)=>Number((progress[a.id]||0)>=100)-Number((progress[b.id]||0)>=100));
 return rows;
}
