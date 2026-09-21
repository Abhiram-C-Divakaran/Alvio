export const adapters = {
  array: ['Compare','Swap','Insert','Delete','Search','Bubble sort','Merge sort','Quick sort'],
  string: ['Compare','Search','Reverse'],
  'linked-list': ['Traverse','Insert','Delete','Search','Reverse'],
  'doubly-linked-list': ['Traverse','Insert','Delete','Reverse'],
  stack: ['Push','Pop','Peek'], queue: ['Enqueue','Dequeue','Peek'], deque: ['Push front','Push back','Pop front','Pop back'],
  'hash-table': ['Insert','Delete','Search'],
  'binary-tree': ['Insert','Delete','Search','BFS','Preorder','Inorder','Postorder'],
  bst: ['Insert','Delete','Search','Inorder'], avl: ['Insert','Delete','Search','LL rotation','RR rotation','LR rotation','RL rotation'],
  heap: ['Insert','Extract minimum','Heapify'], graph: ['BFS','DFS','Dijkstra','Topological sort','Shortest path','Cycle detection','MST'],
  matrix: ['Traverse','Search','Update'], trie: ['Insert','Search','Delete'], 'dp-table': ['Initialize','Update','Backtrack'], 'recursion-tree': ['Expand','Return','Backtrack'],
} as const;
export type Structure = keyof typeof adapters;
export type Language = 'cpp'|'python'|'java'|'javascript';
export const languages: Record<Language,string> = {cpp:'C++',python:'Python',java:'Java',javascript:'JavaScript'};
export type NodeState = 'idle'|'active'|'comparing'|'visited'|'found'|'removed';
export interface VisualNode {id:string; value:string|number; label?:string; state:NodeState; row?:number; col?:number}
export interface VisualEdge {id:string; from:string; to:string; directed:boolean; weight?:string|number; state?:NodeState}
export interface Snapshot {nodes:VisualNode[]; edges:VisualEdge[]}
export interface Step {id:string; title:string; explanation:string; operation:'compare'|'swap'|'insert'|'delete'|'move'|'visit'|'connect'|'disconnect'|'highlight'|'update'; beforeState:Snapshot; afterState:Snapshot; codeLines:number[]}
export interface Specification {version:1; supported:boolean; title:string; structure:Structure; operation:string; explanation:string; hint:string; complexity:{time:string;space:string;why:string}; language:Language; code:string; steps:Step[]; suggestions:string[]}
const object=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const string=(v:unknown,max=1200):v is string=>typeof v==='string'&&v.length<=max;
const states=['idle','active','comparing','visited','found','removed'];
const canonical=(v:any):string=>JSON.stringify(v,(_k,x)=>object(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
function snapshot(v:unknown):v is Snapshot {
  if(!object(v)||!Array.isArray(v.nodes)||v.nodes.length>80||!Array.isArray(v.edges)||v.edges.length>180)return false;
  const ids=new Set<string>();
  for(const n of v.nodes){if(!object(n)||!string(n.id,80)||!n.id||ids.has(n.id)||!(string(n.value,80)||typeof n.value==='number'&&Number.isFinite(n.value))||!states.includes(n.state)||n.label!==undefined&&!string(n.label,100))return false; ids.add(n.id); for(const k of ['row','col'])if(n[k]!==undefined&&(!Number.isInteger(n[k])||n[k]<0||n[k]>79))return false;}
  const edges=new Set<string>();
  for(const e of v.edges){if(!object(e)||!string(e.id,80)||edges.has(e.id)||!ids.has(e.from)||!ids.has(e.to)||typeof e.directed!=='boolean'||e.state!==undefined&&!states.includes(e.state)||e.weight!==undefined&&!(string(e.weight,40)||typeof e.weight==='number'&&Number.isFinite(e.weight)))return false;edges.add(e.id);}
  return true;
}
/** Untrusted model output is bounded and validated before either renderer sees it. */
export function validateSpecification(v:unknown):Specification {
  const fail=()=>{throw new Error('Invalid visualization specification');};
  if(!object(v)||JSON.stringify(v).length>600000) return fail();
  if(v.version!==1||typeof v.supported!=='boolean'||!Object.hasOwn(adapters,v.structure)||!Object.hasOwn(languages,v.language)||!string(v.title,180)||!string(v.operation,80)||!string(v.explanation,6000)||!string(v.hint,1200)||!string(v.code,30000)||!object(v.complexity)||!['time','space','why'].every(k=>string(v.complexity[k],1200))||!Array.isArray(v.suggestions)||v.suggestions.length>6||!v.suggestions.every((s:unknown)=>string(s,200))||!Array.isArray(v.steps)||v.steps.length>120||v.supported&&v.steps.length===0)return fail();
  const ids=new Set(); const lines=v.code.split('\n').length;
  let last:Snapshot|undefined;
  for(const s of v.steps){
    if(!object(s)||!string(s.id,80)||ids.has(s.id)||!string(s.title,180)||!string(s.explanation,1800)||!['compare','swap','insert','delete','move','visit','connect','disconnect','highlight','update'].includes(s.operation)||!snapshot(s.beforeState)||!snapshot(s.afterState)||!Array.isArray(s.codeLines)||!s.codeLines.every((n:unknown)=>Number.isInteger(n)&&Number(n)>0&&Number(n)<=lines))return fail();
    // Full snapshots make previous/next and arbitrary seeks deterministic.
    if(last&&canonical(last)!==canonical(s.beforeState))return fail();
    if(['matrix','dp-table'].includes(v.structure)&&[...s.beforeState.nodes,...s.afterState.nodes].some(n=>n.row===undefined||n.col===undefined))return fail();
    ids.add(s.id);last=s.afterState;
  }
  return v as unknown as Specification;
}
/** The model emits initialState + after snapshots. The compiler owns before snapshots. */
export function compileSpecification(v:unknown):Specification {
  if(!object(v)||!snapshot(v.initialState)||!Array.isArray(v.steps)||!string(v.code,30000))throw new Error('Invalid trace envelope');
  let before=v.initialState;
  const lines=v.code.split('\n');
  const steps=v.steps.map((s:any)=>{
    if(!object(s)||!Array.isArray(s.codeFocus)||s.codeFocus.length>12||!s.codeFocus.every((text:unknown)=>string(text,1000)&&text.trim()))throw new Error('Invalid code anchors');
    const codeLines:number[]=[];
    for(const text of s.codeFocus.flatMap((anchor:string)=>anchor.split('\n')).filter((anchor:string)=>anchor.trim())){
      const needle=text.replace(/\s/g,'');
      const matches=lines.flatMap((line,i)=>{const haystack=line.replace(/\s/g,'');const suffix=haystack.slice(needle.length);return haystack===needle||haystack.startsWith(needle)&&/^(#|\/\/)/.test(suffix)?[i+1]:[];});
      if(!matches.length)throw new Error(`Code anchor missing at step ${s.id}: ${text.slice(0,160)}`);codeLines.push(...matches);
    }
    const {codeFocus:_,...rest}=s;const result={...rest,codeLines:[...new Set(codeLines)],beforeState:before};before=s.afterState;return result;
  });
  const {initialState:_,...rest}=v;
  return validateSpecification({...rest,steps});
}
export function safePlatformUrl(input:string):string|null {
  try{const u=new URL(input.trim());return u.protocol==='https:'&&!u.username&&!u.password&&['leetcode.com','www.leetcode.com','geeksforgeeks.org','www.geeksforgeeks.org','hackerrank.com','www.hackerrank.com','codeforces.com','www.codeforces.com'].includes(u.hostname)?u.href:null;}catch{return null;}
}
