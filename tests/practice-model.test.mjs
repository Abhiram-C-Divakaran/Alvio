import assert from 'node:assert/strict';
import { acceptance, emptyFilters, matchesTopic, selectProblems } from '../src/features/coding/practiceModel.ts';
const problems = [
 {id:'a',title:'First',topic:'Array, Hash Table',difficulty:'Medium',accepted:8,submissions:10},
 {id:'b',title:'Second',topic:'Binary Tree, DFS',difficulty:'Easy',accepted:3,submissions:5},
 {id:'c',title:'Third',topic:'Linked List, Two Pointers',difficulty:'Hard',accepted:0,submissions:0},
];
const solved=new Set(['a']), attempted=new Set(['a','b']);
const select=(q='',topic='All',filters=emptyFilters,sort='Most Relevant',bookmarks)=>selectProblems(problems,q,topic,filters,sort,solved,attempted,bookmarks).map(p=>p.id);
assert.equal(acceptance(problems[0]),80);assert.equal(acceptance(problems[2]),null);
assert.deepEqual(select('hash table'),['a']);assert.deepEqual(select('easy'),['b']);assert.deepEqual(select('','Arrays'),['a']);assert(matchesTopic(problems[1],'Trees'));assert(matchesTopic(problems[2],'Linked Lists'));
assert.deepEqual(select('','All',{...emptyFilters,status:'Attempted'}),['b']);assert.deepEqual(select('','All',{...emptyFilters,status:'Solved'}),['a']);assert.deepEqual(select('','All',{...emptyFilters,status:'Unsolved'}),['c']);
assert.deepEqual(select('','All',{...emptyFilters,difficulty:'Easy',tag:'DFS',topic:'Trees'}),['b']);
assert.deepEqual(select('','All',emptyFilters,'Acceptance Rate'),['a','b','c']);assert.deepEqual(select('','All',emptyFilters,'Difficulty'),['b','a','c']);assert.deepEqual(select('','All',emptyFilters,'Recently Added'),['c','b','a']);assert.deepEqual(select('','All',emptyFilters,'Most Attempted'),['a','b','c']);assert.deepEqual(select('','All',emptyFilters,'Most Relevant',new Set(['c'])),['c']);assert.deepEqual(problems.map(p=>p.id),['a','b','c']);
console.log('PASS: search across metadata, topic aliases, combined filters, solved precedence, all sort strategies, missing acceptance, bookmarks, immutable source order.');
