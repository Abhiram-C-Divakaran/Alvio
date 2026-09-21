export type Mode='time'|'space';
export const curves=[
{id:'constant',label:'O(1)',category:'Constant',color:'#34d399',fn:(_n:number)=>1,space:(_n:number)=>1,example:'Array index access',spaceExample:'One fixed-size variable'},
{id:'log',label:'O(log N)',category:'Logarithmic',color:'#a879ff',fn:(n:number)=>Math.max(1,Math.log2(n)),space:(n:number)=>Math.floor(Math.log2(n))+1,example:'Binary Search',spaceExample:'Recursive binary-search stack frames'},
{id:'linear',label:'O(N)',category:'Linear',color:'#38bdf8',fn:(n:number)=>n,space:(n:number)=>n,example:'Linear Search',spaceExample:'Copying N elements'},
{id:'nlog',label:'O(N log N)',category:'Linearithmic',color:'#facc15',fn:(n:number)=>n*Math.max(1,Math.log2(n)),space:(n:number)=>n*(Math.floor(Math.log2(n))+1),example:'Merge Sort',spaceExample:'Retaining every level of a merge tree'},
{id:'quadratic',label:'O(N²)',category:'Quadratic',color:'#fb923c',fn:(n:number)=>n*n,space:(n:number)=>n*n,example:'Bubble Sort',spaceExample:'An N × N matrix'},
{id:'exponential',label:'O(2^N)',category:'Exponential',color:'#fb5c6c',fn:(n:number)=>2**n,space:(n:number)=>2**n,example:'Subset enumeration',spaceExample:'One stored flag per subset'},
];
export type Curve=typeof curves[number];
export const value=(c:Curve,n:number,m:Mode)=>m==='time'?c.fn(n):c.space(n);
export const height=(v:number)=>Math.min(6,Math.max(0,Math.log10(Math.max(1,v))));
export const format=(v:number)=>v>=1e6?v.toExponential(2):v.toLocaleString('en-US',{maximumFractionDigits:1});
export const algorithms=[
{name:'Linear Search',best:'O(1)',avg:'O(N)',worst:'O(N)',space:'O(1)',note:'Stops at the first match; an unsuccessful search scans every element.'},
{name:'Binary Search',best:'O(1)',avg:'O(log N)',worst:'O(log N)',space:'O(1)',note:'Iterative implementation on a sorted array. Recursive implementation uses O(log N) stack space.'},
{name:'Bubble Sort',best:'O(N)',avg:'O(N²)',worst:'O(N²)',space:'O(1)',note:'In-place implementation with an early-exit flag.'},
{name:'Merge Sort',best:'O(N log N)',avg:'O(N log N)',worst:'O(N log N)',space:'O(N)',note:'Standard array merge sort uses a linear auxiliary buffer.'},
{name:'Quick Sort',best:'O(N log N)',avg:'O(N log N)',worst:'O(N²)',space:'O(log N) avg',note:'In-place partitioning; recursive stack can reach O(N) in the worst case.'},
{name:'Heap Sort',best:'O(N log N)',avg:'O(N log N)',worst:'O(N log N)',space:'O(1)',note:'Standard in-place heapsort with iterative heap maintenance.'},
{name:'Array index access',best:'O(1)',avg:'O(1)',worst:'O(1)',space:'O(1)',note:'Direct access at a valid array index. Hash lookup is only expected O(1), not guaranteed worst-case.'},
{name:'Subset enumeration',best:'O(2^N)',avg:'O(2^N)',worst:'O(2^N)',space:'O(N)',note:'Visits each subset with a depth-first traversal. Materializing all subset contents costs O(N × 2^N) space. Naive recursive Fibonacci has exponential time but linear stack space.'},
];

