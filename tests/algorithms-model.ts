import assert from 'node:assert/strict';
import {ALGO_META} from '../src/features/learn/algorithms/metadata';
import {algorithms,selectAlgorithms} from '../src/features/learn/algorithms/model';
assert.equal(algorithms.length,28);
assert.equal(new Set(algorithms.map(a=>a.id)).size,28);
for(const id of Object.keys(ALGO_META)){
 const a=algorithms.find(a=>a.id===id)!;
 assert(a);assert.equal(a.lessonRoute,`/learn/algorithms/${id}`);
 assert.equal(a.visualizationRoute,`/algorithms-visualizer?algo=${id}`);
}
assert.equal(selectAlgorithms('','Sorting','Popular',{}).length,6);
assert.equal(selectAlgorithms('','Graph','Popular',{}).length,8);
assert.equal(selectAlgorithms('traversal','All','Popular',{}).length,5);
assert.equal(selectAlgorithms('','Divide & Conquer','Popular',{}).length,3);
assert.equal(selectAlgorithms('','All','Progress',{'lcs':75})[0].id,'lcs');
assert.equal(selectAlgorithms('','All','Recommended',{'bubble-sort':100})[0].id,'selection-sort');
assert.equal(selectAlgorithms('shortest path','Sorting','Popular',{}).length,0);
console.log('PASS metadata coverage, lesson/visualizer mappings, search aliases, categories and progress sorting');
