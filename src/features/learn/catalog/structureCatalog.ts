import type {LearningProgress} from '../../../types/user';
export type Category='All'|'Linear'|'Non-Linear'|'Advanced';
export type Sort='Popular'|'Beginner First'|'Difficulty'|'Progress'|'A–Z';
export interface StructureItem{id:string;title:string;description:string;difficulty:'Beginner'|'Intermediate'|'Advanced';categories:Category[];aliases:string[];route:string;progressId:string;prerequisites:string[];color:string;}
export const structures:StructureItem[]=[
 {id:'array',title:'Array',description:'Contiguous indexed elements with fast access.',difficulty:'Beginner',categories:['Linear'],aliases:['arrays','index','contiguous memory','random access'],route:'/learn/array',progressId:'array',prerequisites:[],color:'#388aff'},
 {id:'linked-list',title:'Linked List',description:'Nodes connected via pointers (dynamic size).',difficulty:'Beginner',categories:['Linear'],aliases:['linked lists','nodes','pointers','singly','doubly'],route:'/learn/linked-list',progressId:'linked-list',prerequisites:['array'],color:'#8255f7'},
 {id:'stack',title:'Stack',description:'LIFO — push and pop operations.',difficulty:'Beginner',categories:['Linear'],aliases:['stacks','last in first out','push','pop'],route:'/learn/stack',progressId:'stack',prerequisites:['array'],color:'#536bff'},
 {id:'queue',title:'Queue',description:'FIFO — enqueue and dequeue operations.',difficulty:'Beginner',categories:['Linear'],aliases:['queues','first in first out','enqueue','dequeue'],route:'/learn/queue',progressId:'queue',prerequisites:['array'],color:'#f4a636'},
 {id:'hash-table',title:'Hash Table',description:'Key-value storage via hashing.',difficulty:'Intermediate',categories:['Advanced'],aliases:['hashmap','hash map','dictionary','hashing','buckets'],route:'/learn/hash-table',progressId:'hash-table',prerequisites:['array'],color:'#00bea9'},
 {id:'binary-tree',title:'Binary Tree',description:'Hierarchical structure with parent-child nodes.',difficulty:'Intermediate',categories:['Non-Linear'],aliases:['trees','hierarchy','children','root','leaf'],route:'/learn/binary-tree',progressId:'binary-tree',prerequisites:['linked-list'],color:'#499aff'},
 {id:'bst',title:'BST',description:'Ordered binary tree for efficient search.',difficulty:'Intermediate',categories:['Non-Linear'],aliases:['binary search tree','ordered tree','bst'],route:'/learn/binary-tree#bst',progressId:'binary-tree',prerequisites:['binary-tree'],color:'#00cfa0'},
 {id:'avl-tree',title:'AVL Tree',description:'Self-balancing binary tree.',difficulty:'Advanced',categories:['Non-Linear','Advanced'],aliases:['balanced tree','rotation','height balance','avl'],route:'/learn/avl-tree',progressId:'avl-tree',prerequisites:['binary-tree'],color:'#fa628d'},
 {id:'heap',title:'Heap',description:'Complete binary tree for priority queues.',difficulty:'Intermediate',categories:['Non-Linear'],aliases:['priority queue','min heap','max heap','heapify'],route:'/learn/heap',progressId:'heap',prerequisites:['binary-tree'],color:'#f7b849'},
 {id:'graph',title:'Graph',description:'Nodes connected by edges (directed or undirected).',difficulty:'Advanced',categories:['Non-Linear','Advanced'],aliases:['graphs','network','vertices','edges','bfs','dfs'],route:'/learn/graph',progressId:'graph',prerequisites:['binary-tree'],color:'#467afa'},
];
export function topicPercent(item:StructureItem,progress:LearningProgress|null){const topic=progress?.topics.find(t=>t.topicId===item.progressId);return topic?.status==='completed'?100:Math.max(0,Math.min(100,topic?.completionPercent||0));}
export function browseStructures(query:string,category:Category,sort:Sort,progress:LearningProgress|null){
 const q=query.trim().toLowerCase();const difficulty={Beginner:0,Intermediate:1,Advanced:2};
 return structures.filter(s=>(category==='All'||s.categories.includes(category))&&`${s.title} ${s.description} ${s.aliases.join(' ')}`.toLowerCase().includes(q)).sort((a,b)=>sort==='A–Z'?a.title.localeCompare(b.title):sort==='Progress'?topicPercent(b,progress)-topicPercent(a,progress):sort==='Beginner First'||sort==='Difficulty'?difficulty[a.difficulty]-difficulty[b.difficulty]:0);
}
export function recommendedStructure(progress:LearningProgress|null){
 const incomplete=(s:StructureItem)=>topicPercent(s,progress)<100;
 const preferred=[...(progress?.recommendedTopics||[]),...(progress?.weakAreas||[])];
 const recommended=preferred.map(id=>structures.find(s=>s.id===id)).find(s=>s&&incomplete(s)&&s.prerequisites.every(id=>topicPercent(structures.find(t=>t.id===id)!,progress)===100));
 return recommended||structures.find(s=>incomplete(s)&&s.prerequisites.every(id=>topicPercent(structures.find(t=>t.id===id)!,progress)===100))||structures.find(incomplete)||structures[0];
}
