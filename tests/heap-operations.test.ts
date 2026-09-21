import assert from 'node:assert/strict';
import { createDefaultStructure, insertValue, deleteValue } from '../src/features/workspace/dataStructureOps';
import { heapOperationFrames } from '../src/features/visualizer/heapOperationFrames';
import type { HeapStructure } from '../src/types/dataStructures';
for (const heapType of ['min','max'] as const) {
 let heap={...createDefaultStructure('heap'),type:'heap',nodes:[],root:null,heapType} as HeapStructure;
 const check=(h:HeapStructure)=>h.nodes.forEach((n,i)=>{if(i) assert(heapType==='min'? Number(h.nodes[(i-1)>>1].value)<=Number(n.value):Number(h.nodes[(i-1)>>1].value)>=Number(n.value));});
 for(let i=0;i<120;i++) {
  const old=structuredClone(heap); const val=String((i*7919)%199-80);
  const next=insertValue(heap,val) as HeapStructure;
  assert.deepEqual(heap,old);check(next);
  const frames=heapOperationFrames(old,next,'insert',val);
  assert.deepEqual(frames.at(-1)?.state,next);heap=next;
 }
 for(let i=0;i<120;i++) {
  const old=structuredClone(heap); const index=(i*37)%heap.nodes.length;
  const next=deleteValue(heap,'',index) as HeapStructure;
  assert.deepEqual(heap,old);check(next);
  const frames=heapOperationFrames(old,next,'delete','',index);
  assert.deepEqual(frames.at(-1)?.state,next);heap=next;
 }
 assert.equal(heap.nodes.length,0);assert.equal(heap.root,null);
}
console.log('PASS max/min heap: 480 insert/delete operations, immutable snapshots, replay final state, empty heap.');
