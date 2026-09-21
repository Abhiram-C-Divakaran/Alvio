import makeItASecVideo from '../../assets/ll.mp4';
import queueVideo from '../../assets/PixVerse_V6_Image_Text_540P_make_a_game_like_v.mp4';
import binaryTreeVideo from '../../assets/bt.mp4';
import arr from '../../assets/i_want_the_video_to_explain_ab.mp4';

import hash from '../../assets/hash.mp4';
import heapVideo from '../../assets/WhatsApp Video 2026-07-22 at 10.44.31 AM.mp4';

export type TranscriptEntry={time:number;text:string};
export type VideoLesson={id:string;title:string;duration:number;description:string;videoUrl:string;videoType?:string;type?:string;target?:string;summary:string[];transcript?:TranscriptEntry[]};
export const lessons: VideoLesson[] = [
  {
    id: 'arrays',
    title: 'Understanding Arrays',
    duration: 0,
    description: 'Learn array structure, indexes, and layout.',
    
    videoUrl: arr,
    videoType: 'mp4',
    type: 'video',
    summary: [
      "An array is a collection of items stored at contiguous memory locations.",
      "The idea is to store multiple items of the same type together.",
      "This makes it easier to calculate the position of each element by simply adding an offset to a base value."
    ]
  },
  {
    id: 'linked-lists',
    title: 'Linked List Operations',
    duration: 0,
    description: 'Pointers, Node links, and traversal.',
    
    videoUrl: makeItASecVideo,
    videoType: 'mp4',
    type: 'video',
    summary: [
      "Unlike arrays, linked lists do not store elements in contiguous memory.",
      "Each element is a separate object called a Node, storing data and a next pointer."
    ]
  },
  {
    id: 'queues',
    title: 'Queues',
    duration: 0,
    description: 'FIFO data transfer and rings.',
    
    videoUrl: queueVideo,
    videoType: 'mp4',
    type: 'video',
    summary: [
      "A Queue is a linear structure which follows First In First Out order.",
      "Circular Queues wrap the tail back to index zero to maximize memory utilization."
    ]
  },
  {
    id: 'binary-tree',
    title: 'Binary Tree',
    duration: 0,
    description: 'Binary Tree .',
    
    videoUrl: binaryTreeVideo,
    type: 'video',
    summary: [
      "Binary Tree is a tree data structure in which each node has at most two children, referred to as the left child and the right child."
    ]
  },
  {
    id: 'hash',
    title: 'Hash Map Explained',
    duration: 0,
    description: 'Explore Hashing',
    
    videoUrl: hash,
    videoType: 'mp4',
    type: 'video',
    summary: [
      "Hash maps, also known as hash tables or dictionaries, are one of the most important data structures used in computer science.",
      "They provide a way to store and retrieve data using a key-value pair system.",
      "The primary advantage of using a hash map is its average-case time complexity of O(1) for insertion, deletion, and search operations."
    ]
  },
  {
    id: 'heap',
    title: 'Heap Data Structure',
    duration: 0,
    description: 'Understand Min-Heaps and Max-Heaps.',
    
    videoUrl: heapVideo,
    videoType: 'mp4',
    type: 'video',
    summary: [
      "A Heap is a special Tree-based data structure in which the tree is a complete binary tree.",
      "In a Max-Heap, the root node key must be greatest among all keys present in the heap.",
      "In a Min-Heap, the root node key must be minimum among all keys present in the heap."
    ]
  }
];


export const topicIds:Record<string,string>={arrays:'array','linked-lists':'linked-list',queues:'queue','binary-tree':'binary-tree',hash:'hash-table',heap:'heap'};
export const topicNames:Record<string,string>={arrays:'Arrays','linked-lists':'Linked Lists',queues:'Queues','binary-tree':'Binary Tree',hash:'Hash Map',heap:'Heap'};
export const formatTime=(n:number)=>Math.floor(n/60).toString().padStart(2,'0')+':'+Math.floor(n%60).toString().padStart(2,'0');
