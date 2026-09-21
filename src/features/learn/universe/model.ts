import {curriculumData} from '../data/curriculumData';
export const topicIds:Record<string,string>={'arrays':'array','linked-lists':'linked-list','stacks':'stack','queues':'queue','hash-tables':'hash-table','trees':'binary-tree','graphs':'graph'};
const concepts:Record<string,string[]>={'arrays':['Indexing','Traversal','Insertion'], 'linked-lists':['Nodes','Pointers','Singly Linked List','Doubly Linked List','Circular List'],'stacks':['LIFO','Push','Pop'],'queues':['FIFO','Enqueue','Dequeue'],'hash-tables':['Hash functions','Collisions','Buckets'],'trees':['Root','Traversal','Binary Search Tree'],'graphs':['Vertices','Edges','BFS','DFS']};
const colors:Record<string,string>={'arrays':'#24d6b0','linked-lists':'#a454ff','stacks':'#348cff','queues':'#ffb443','hash-tables':'#22d3ee','trees':'#8553ff','graphs':'#fb638c'};
const positions:Record<string,[number,number,number]>={'arrays':[0,0,-4.7],'linked-lists':[-5,0,-2.3],'stacks':[4.2,0,-2.8],'queues':[5.1,0,1.7],'hash-tables':[-5.4,0,1.6],'trees':[-2.8,0,4.5],'graphs':[3.5,0,4.4]};
export const topics=curriculumData.filter(t=>topicIds[t.id]).map(t=>({...t,color:colors[t.id],position:positions[t.id],concepts:concepts[t.id],group:t.id==='hash-tables'?'Hashing':['trees','graphs'].includes(t.id)?'Non-Linear':'Linear',progressId:topicIds[t.id]}));
export type UniverseTopic=typeof topics[number];
