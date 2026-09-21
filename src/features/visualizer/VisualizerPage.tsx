import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, ContactShadows, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { heapOperationFrames } from './heapOperationFrames';
import Array3D from './Array3D';
import Stack3D from './Stack3D';
import Queue3D from './Queue3D';
import LinkedList3D from './LinkedList3D';
import BinaryTree3D from './BinaryTree3D';
import Graph3D from './Graph3D';
import HashTable3D from './HashTable3D';
import type { TutorialStep } from './TutorialOverlay';
import Asteroids from './Asteroids';
import StructureLayout from './StructureLayout';
import VisualizerToolbar from './VisualizerToolbar';
import CodeImplementationsModal from './CodeImplementationsModal';
import { createDefaultStructure, insertValue, deleteValue } from '../workspace/dataStructureOps';
import type { DataStructureType, DataStructure } from '../../types/dataStructures';

function CameraReset({ revision, module, count }: { revision: number; module: string; count: number }) {
  const { camera, controls, size } = useThree();
  useEffect(() => {
    const linear = ['Linked List', 'Array', 'Queue'].includes(module);
    const width = module === 'Linked List' ? Math.max(6, count * 2.5 + 3) : Math.max(6, count * 1.5 + 3);
    const aspect = size.width / Math.max(1, size.height);
    const distance = linear ? Math.max(10, width / (2 * Math.tan(Math.PI / 8) * aspect) * 1.15) : 10;
    camera.position.set(module === 'Linked List' ? 1 : 0, linear ? 1.4 : 1.4, distance);
    const orbit = controls as any;
    orbit?.target.set(module === 'Linked List' ? 1 : 0, linear ? -.4 : -1.2, 0);
    orbit?.update();
  }, [revision, camera, controls, module, count, size.width, size.height]);
  return null;
}

// --- Scripts & Data ---
const dsList = ['Array', 'Linked List', 'Stack', 'Queue', 'Hash Table', 'Binary Tree', 'BST', 'AVL Tree', 'Heap', 'Graph'];

const tutorials: Record<string, TutorialStep[]> = {
  'Array-Dynamic Array': [
    { index: null, title: 'Dynamic Arrays', text: 'Dynamic arrays (like ArrayList in Java or std::vector in C++) automatically resize themselves when they run out of space.' },
    { index: 3, title: 'Hidden Capacity', text: 'To do this, they allocate MORE memory than currently needed (the "capacity"). The array keeps track of its true capacity behind the scenes.' },
    { index: null, title: 'The Resize Operation', text: 'When the capacity is full and you add a new item, the array creates a new, larger block of memory (often double the size), copies everything over, and deletes the old block. This is O(N).' },
    { index: null, title: 'Amortized O(1)', text: 'Because resizing happens rarely, we say appending is "Amortized O(1)", meaning it averages out to O(1) over time.' }
  ],
  'Array-2D Array': [
    { index: null, title: '2D Arrays', text: 'A 2D array is an array of arrays. It represents a matrix or a grid, perfect for modeling board games, terrain maps, or spreadsheets.' },
    { index: 1, title: 'Row and Column Indexing', text: 'Instead of a single index, elements are accessed using two indices: [row][column]. For example, the top middle item is at [0][1].' },
    { index: 4, title: 'Flattened Memory', text: 'In RAM, a 2D array is often stored as a single flat 1D array. The computer calculates the physical offset using the formula: (row * total_cols) + col.' },
    { index: null, title: 'Use Cases', text: 'Extremely common in image processing (where each pixel is a row/col coordinate with RGB values) and dynamic programming algorithms.' }
  ],
  'Array': [
    { index: null, title: 'Introduction to Arrays', text: 'An Array is a foundational linear data structure. It stores a fixed-size sequential collection of elements of the same type.' },
    { index: 0, title: 'Contiguous Memory', text: 'Unlike other structures, arrays store elements in a single contiguous block of memory. This allows the CPU to cache them efficiently for extremely fast processing.' },
    { index: 0, title: 'Zero-Indexing', text: 'Arrays are zero-indexed. The index is actually a mathematical offset from the starting memory address. Offset 0 means the very first slot.' },
    { index: 2, title: 'Random Access: O(1)', text: 'Because memory is contiguous, the computer can instantly calculate the exact address of any index. Accessing the 3rd item is instantaneous: O(1) time complexity.' },
    { index: 3, title: 'Linear Search: O(N)', text: 'If you want to find a specific value (like 24) but don\'t know its index, you must check every element one by one from the start. This is a Linear Search (O(N)).' },
    { index: null, title: 'Insertion at the End: O(1)', text: 'Adding an element to the very end of an array is extremely fast, provided there is still empty space allocated in memory.' },
    { index: 1, title: 'Insertion in the Middle: O(N)', text: 'However, inserting an element in the middle requires physically shifting every subsequent element one slot to the right. This makes insertions slow (O(N)).' },
    { index: null, title: 'Deletions: O(N)', text: 'Similarly, deleting an element from the middle leaves a gap. You must shift all following elements to the left to fill the hole.' },
    { index: null, title: 'Static vs Dynamic', text: 'Standard arrays have a fixed size. Dynamic arrays (like Lists in Python or ArrayLists in Java) automatically resize themselves in the background when they get full.' },
    { index: null, title: 'Summary', text: 'Use Arrays when you need lightning-fast read access by index, and don\'t plan on frequently adding or removing elements from the middle of the collection.' }
  ],
  'Stack-Linked Stack': [
    { index: null, title: 'Linked Stacks', text: 'Instead of an array, a Linked Stack is built using a Linked List. The "Top" is just the Head of the list.' },
    { index: 3, title: 'Push (Insert at Head)', text: 'Pushing an item simply creates a new Node, points it downwards to the old Head, and updates the Top pointer. This is always O(1).' },
    { index: 3, title: 'No Overflow', text: 'Because nodes are dynamically allocated anywhere in memory, a Linked Stack will never "Overflow" unless the entire computer runs out of RAM.' },
    { index: null, title: 'Memory Tradeoff', text: 'The downside is memory overhead: every item must now store a pointer (the downward arrow) alongside its actual data.' }
  ],
  'Stack-Monotonic Stack': [
    { index: null, title: 'Monotonic Stacks', text: 'A Monotonic Stack is a clever algorithmic technique. It enforces a strict rule: elements must remain strictly increasing (or decreasing).' },
    { index: 1, title: 'Enforcing the Rule', text: 'If we want an increasing stack, and we try to push a small number onto a large number, we must pop the large number FIRST until the rule is satisfied.' },
    { index: null, title: 'Finding the Next Greater Element', text: 'This technique is famously used to solve the "Next Greater Element" problem in O(N) time, commonly asked in coding interviews.' },
    { index: null, title: 'Stock Spans', text: 'It is also used to calculate stock price spans (how many consecutive days a stock was lower than today).' }
  ],
  'Stack': [
    { index: null, title: 'Introduction to Stacks', text: 'A Stack is a linear data structure governed by the LIFO (Last-In-First-Out) principle. It restricts operations to a single end.' },
    { index: null, title: 'The Physical Analogy', text: 'Imagine a stack of heavy plates at a buffet. You can only place a new plate on the very top, and you can only take the top plate off.' },
    { index: 3, title: 'The Push Operation: O(1)', text: 'Adding an item is called a "Push". The new element is placed directly onto the top of the stack. This operation is instant: O(1).' },
    { index: 3, title: 'The Top Pointer', text: 'The stack maintains a "Top" pointer to track the highest element. You can "Peek" at this element at any time without removing it.' },
    { index: 2, title: 'The Pop Operation: O(1)', text: 'Removing an item is called a "Pop". It removes the current Top element, and the pointer drops to the item beneath it. Also O(1).' },
    { index: null, title: 'No Random Access', text: 'You cannot access the items at the bottom or middle of the stack without popping off everything above them first.' },
    { index: null, title: 'Stack Overflow', text: 'If a stack has a fixed memory limit and you keep pushing items indefinitely, it will cause a "Stack Overflow" error and crash.' },
    { index: null, title: 'Real-World: The Call Stack', text: 'When a program executes functions, the CPU uses a Call Stack. When Function A calls Function B, B is pushed onto the stack. When B finishes, it pops off.' },
    { index: null, title: 'Real-World: Undo Features', text: 'Every time you type a word, the action is pushed to an "Undo Stack". When you hit Ctrl+Z, the last action is popped and reversed.' },
    { index: null, title: 'Summary', text: 'Stacks are perfect for reversing operations, backtracking (like a browser\'s back button), and managing execution contexts.' }
  ],
  'Queue-Circular Queue': [
    { index: null, title: 'Circular Queues', text: 'A standard array-based queue wastes space. As the Front and Rear pointers march forward, the empty slots left behind are lost forever.' },
    { index: 3, title: 'The Wrap-Around', text: 'A Circular Queue solves this using modular arithmetic (%). When the Rear pointer hits the end of the array, it simply loops back to index 0.' },
    { index: null, title: 'Full vs Empty', text: 'The tricky part is distinguishing a "Full" queue from an "Empty" queue, since in both states the Front and Rear pointers touch. We usually reserve one empty slot to solve this.' },
    { index: null, title: 'Use Cases', text: 'Used extensively in hardware buffering (e.g. keyboard input streams) and memory management where physical space is fixed.' }
  ],
  'Queue-Priority Queue': [
    { index: null, title: 'Priority Queues', text: 'In a Priority Queue, elements are NOT processed First-In-First-Out. Instead, they are processed based on their assigned Priority.' },
    { index: 1, title: 'Jumping the Line', text: 'An element with Priority 1 (highest) will bypass everyone else and jump straight to the Front of the line, even if it arrived last.' },
    { index: null, title: 'Implementation', text: 'While you can use an array, Priority Queues are almost always implemented using a "Heap" tree, which allows O(log N) insertions and removals.' },
    { index: null, title: 'Use Cases', text: 'Used in hospital triage systems, OS process scheduling (important tasks first), and Dijkstra\'s shortest path algorithm.' }
  ],
  'Queue-Deque': [
    { index: null, title: 'Deques (Double-Ended Queues)', text: 'A Deque (pronounced "Deck") removes the strict FIFO rule. It allows insertions AND deletions from BOTH ends.' },
    { index: 0, title: 'Front Operations', text: 'You can Enqueue to the Front, and Dequeue from the Front.' },
    { index: 3, title: 'Rear Operations', text: 'You can also Enqueue to the Rear, and Dequeue from the Rear.' },
    { index: null, title: 'Versatility', text: 'Because of this, a Deque can act as a Queue OR a Stack depending on how you use it. Python\'s collections.deque is the standard way to implement queues in Python.' }
  ],
  'Queue': [
    { index: null, title: 'Introduction to Queues', text: 'A Queue is a linear data structure governed by the FIFO (First-In-First-Out) principle. It operates from two ends, rather than one.' },
    { index: null, title: 'The Physical Analogy', text: 'Think of a Queue exactly like a line of people waiting at a grocery store checkout. The first person in line is the first one served.' },
    { index: 0, title: 'The Front Pointer', text: 'The Queue maintains a "Front" (or Head) pointer. This tracks the oldest element that has been waiting the longest. Elements are only removed from here.' },
    { index: 3, title: 'The Rear Pointer', text: 'It also maintains a "Rear" (or Tail) pointer. New elements join the queue exclusively at this end.' },
    { index: 3, title: 'Enqueue Operation: O(1)', text: 'Adding an item to the Rear is called "Enqueueing". The Rear pointer moves back one slot. This is an O(1) operation.' },
    { index: 0, title: 'Dequeue Operation: O(1)', text: 'Removing an item from the Front is called "Dequeueing". The Front pointer moves forward to the next item. Also an O(1) operation.' },
    { index: null, title: 'Circular Queues', text: 'In array-based queues, as the front and rear move forward, space is wasted at the beginning. A Circular Queue wraps the Rear back to index 0 to save space.' },
    { index: null, title: 'Priority Queues', text: 'A variation is the Priority Queue, where elements bypass the line based on urgency (like a VIP fastpass), often implemented using Heaps.' },
    { index: null, title: 'Real-World: Task Scheduling', text: 'Your Operating System uses queues to manage which programs get CPU time. Print spoolers use queues to manage documents waiting to be printed.' },
    { index: null, title: 'Summary', text: 'Queues ensure fairness. They are essential for asynchronous data transfers, breadth-first search algorithms, and managing limited resources.' }
  ],
  'Linked List-Doubly Linked': [
    { index: null, title: 'Doubly Linked Lists', text: 'A Doubly Linked List adds a "Prev" pointer to every node, in addition to the "Next" pointer.' },
    { index: 2, title: 'Reverse Traversal', text: 'This allows you to traverse the list backwards from the Tail to the Head, which is impossible in a Singly Linked List.' },
    { index: 1, title: 'O(1) Deletions', text: 'If you have a reference to a node in the middle, you can delete it in O(1) time because you instantly know its previous node. In a singly linked list, you\'d have to start from the Head to find the previous node (O(N)).' },
    { index: null, title: 'Tradeoffs', text: 'The cost of these benefits is double the memory overhead for pointers, and slightly more complex logic when inserting/deleting to manage 4 pointers instead of 2.' }
  ],
  'Linked List-Circular Linked': [
    { index: null, title: 'Circular Linked Lists', text: 'In a Circular Linked List, the tail node does NOT point to null. Instead, it loops back and points directly to the head node.' },
    { index: 4, title: 'The Loop', text: 'This continuous loop means you can start at any node and traverse the entire list without ever hitting a dead end.' },
    { index: 0, title: 'No True Head', text: 'While we often maintain a pointer to an arbitrary "Head" for convenience, the structure itself has no clear beginning or end.' },
    { index: null, title: 'Use Cases', text: 'Perfect for turn-based multiplayer games, round-robin task scheduling in Operating Systems, or a music player on repeat.' }
  ],
  'Linked List': [
    { index: null, title: 'Introduction to Linked Lists', text: 'A Linked List is a linear data structure whose elements are NOT stored in contiguous memory. It is highly flexible and dynamic.' },
    { index: null, title: 'The Node', text: 'The building block is a "Node". A Node is an object containing two parts: the actual data (value), and a Pointer (memory address) to the next Node.' },
    { index: 0, title: 'The Head', text: 'Because memory is scattered, the computer only keeps track of the very first node, called the "Head". You must always start here.' },
    { index: 4, title: 'The Tail', text: 'The final node in the chain is the "Tail". Its pointer points to a null reference, signifying the end of the list.' },
    { index: 1, title: 'Traversal: O(N)', text: 'There is no Random Access. To read the 3rd item, you cannot jump there instantly. You must ask the Head where the 2nd is, then ask the 2nd where the 3rd is.' },
    { index: 0, title: 'Insertions at Head: O(1)', text: 'This is where Linked Lists shine. To insert a new Head, you just create a Node and point it to the old Head. No elements need to be shifted! It is instant.' },
    { index: null, title: 'Insertions in Middle: O(N)', text: 'To insert in the middle, you must first traverse O(N) to find the spot. Once there, updating the pointers to slot the new node in takes O(1) time.' },
    { index: null, title: 'Doubly Linked Lists', text: 'A standard list only points forward. A "Doubly Linked List" gives each Node a second pointer pointing BACKWARDS to the previous node, allowing reverse traversal.' },
    { index: null, title: 'Memory Overhead', text: 'The tradeoff for this flexibility is memory overhead. Storing the pointer addresses requires extra RAM compared to a standard array.' },
    { index: null, title: 'Summary', text: 'Use Linked Lists when you need constant-time insertions/deletions at the ends of the collection, and you don\'t know the final size of your data in advance.' }
  ],
  'Binary Tree-AVL Tree': [
    { index: null, title: 'AVL Trees', text: 'An AVL Tree is a self-balancing Binary Search Tree. It guarantees that the height difference between the left and right subtrees of ANY node is never more than 1.' },
    { index: 1, title: 'The Balance Factor (BF)', text: 'Every node tracks its Balance Factor (Right Height - Left Height). Valid values are -1, 0, or 1.' },
    { index: null, title: 'Tree Rotations', text: 'If an insertion causes a BF to hit 2 or -2, the tree performs a "Rotation" to fix the imbalance while maintaining the BST sorting rule.' },
    { index: null, title: 'Guaranteed O(log N)', text: 'Because it strictly enforces balance, AVL trees guarantee O(log N) lookup times, preventing the O(N) worst-case scenario of standard BSTs.' }
  ],
  'Binary Tree-Heap': [
    { index: null, title: 'Heaps', text: 'A Heap is a complete binary tree used to quickly find the maximum (Max-Heap) or minimum (Min-Heap) value.' },
    { index: 0, title: 'The Heap Property', text: 'In a Max-Heap, every parent node must be LARGER than its children. Thus, the largest number is always at the Root.' },
    { index: 3, title: 'Array Implementation', text: 'Heaps are usually stored flat in an Array! The children of index `i` are always at `2i + 1` and `2i + 2`. This saves massive memory.' },
    { index: null, title: 'Use Cases', text: 'Heaps are the underlying data structure for Priority Queues, and power the efficient O(N log N) HeapSort algorithm.' }
  ],
  'Binary Tree': [
    { index: null, title: 'Introduction to Trees', text: 'A Tree is a non-linear, hierarchical data structure. It breaks away from flat lists to represent data with parent-child relationships.' },
    { index: 50, title: 'The Root Node', text: 'Every tree begins with a single topmost node called the Root. Every other node in the tree descends from this Root.' },
    { index: 30, title: 'Binary Constraints', text: 'In a "Binary" Tree, a node is strictly limited to having a maximum of two children, typically referred to as the Left Child and Right Child.' },
    { index: null, title: 'Binary Search Tree (BST)', text: 'A BST introduces a powerful rule: Every node in the Left subtree must be SMALLER than the parent, and every node in the Right subtree must be LARGER.' },
    { index: 70, title: 'Searching: O(log N)', text: 'Because of the BST rule, if you search for 70 starting at 50, you know to go right. You instantly eliminate half the tree! This makes searching incredibly fast.' },
    { index: 20, title: 'Leaf Nodes', text: 'Nodes at the very bottom that have zero children are called Leaf Nodes.' },
    { index: null, title: 'Tree Balance', text: 'If you insert already sorted data (1, 2, 3, 4), the tree becomes a single long line (unbalanced). Search time degrades to O(N). Keeping trees balanced is crucial.' },
    { index: null, title: 'Traversals', text: 'To print a tree, algorithms use DFS (Depth First Search) traversals. "In-order" traversal prints a BST in perfect ascending alphabetical/numerical order.' },
    { index: null, title: 'Real-World Uses', text: 'Trees power the DOM (how browsers render HTML), file directory systems on your computer, and syntax trees in code compilers.' },
    { index: null, title: 'Summary', text: 'Binary Search Trees offer a "best of both worlds" compromise: fast O(log N) insertions (better than arrays) and fast O(log N) lookups (better than linked lists).' }
  ],
  'Heap-Max Heap': [
    { index: '1', title: 'Max Heap', text: 'In a Max Heap, every parent node is greater than or equal to its children. The root node (top) holds the maximum value.' },
    { index: '1', title: 'Access Max: O(1)', text: 'Accessing the maximum value is extremely fast since it always sits at the root (index 0) of the heap array.' },
    { index: null, title: 'Insertions & Deletions: O(log N)', text: 'Inserting a new value or deleting the root requires sifting up or sifting down values to restore the heap property.' }
  ],
  'Heap-Min Heap': [
    { index: '1', title: 'Min Heap', text: 'In a Min Heap, every parent node is less than or equal to its children. The root node (top) holds the minimum value.' },
    { index: '1', title: 'Access Min: O(1)', text: 'Accessing the minimum value is instantaneous since it always sits at the root.' },
    { index: null, title: 'Sifting Logic', text: 'Values sift up and down along tree path steps, taking at most O(log N) operations.' }
  ],
  'Graph-Directed Graph': [
    { index: null, title: 'Directed Graphs (Digraphs)', text: 'In a Directed Graph, edges have a specific direction (one-way streets). Just because A points to B doesn\'t mean B points to A.' },
    { index: 'A', title: 'In-Degree & Out-Degree', text: 'Nodes now have an "In-Degree" (how many arrows point to them) and an "Out-Degree" (how many arrows leave them).' },
    { index: null, title: 'Cycles', text: 'Directed graphs can contain Cycles (A -> B -> C -> A). A Directed Acyclic Graph (DAG) is a graph with NO cycles.' },
    { index: null, title: 'Use Cases', text: 'DAGs are used for task scheduling (Task B must run after Task A), Git branch histories, and tracking followers on social media like Twitter.' }
  ],
  'Graph-Weighted Graph': [
    { index: null, title: 'Weighted Graphs', text: 'In a Weighted Graph, every edge is assigned a numerical value called a "Weight" or "Cost".' },
    { index: null, title: 'What do Weights Mean?', text: 'Weights can represent anything: the distance in miles between two cities, the latency between two servers, or the toll cost of a road.' },
    { index: 'C', title: 'Path of Least Resistance', text: 'Unlike an unweighted graph where the shortest path is just the fewest number of edges, here the shortest path is the one with the lowest TOTAL weight.' },
    { index: null, title: 'Dijkstra\'s Algorithm', text: 'To find the optimal route, algorithms like Dijkstra\'s evaluate the cumulative weights, bypassing short paths with heavy costs in favor of longer paths with cheaper costs.' },
    { index: null, title: 'Use Cases', text: 'This powers GPS navigation apps (Google Maps), internet packet routing protocols (OSPF), and airline flight pricing networks.' }
  ],
  'Graph': [
    { index: null, title: 'Introduction to Graphs', text: 'A Graph is the ultimate networking data structure. It is used to model complex, many-to-many relationships between discrete objects.' },
    { index: 'A', title: 'Vertices (Nodes)', text: 'The entities in a graph are called Vertices or Nodes. In a real-world scenario, a Vertex could represent a User, a City, or a Computer Server.' },
    { index: ['A', 'B', 'C', 'E'], title: 'Edges', text: 'Vertices are connected by Edges. Edges represent the relationship itself, such as a "Friendship" between Users, or a "Highway" between Cities.' },
    { index: null, title: 'Directed vs Undirected', text: 'In an Undirected graph (like Facebook friendships), the connection is mutual. In a Directed graph (like Twitter followers), A might point to B, but B doesn\'t point to A.' },
    { index: null, title: 'Weighted Edges', text: 'Edges can have "Weights" (costs). If modeling a map, the weight of an edge between two cities could be the driving distance or the toll cost.' },
    { index: null, title: 'Adjacency List', text: 'In code, graphs are often stored as an Adjacency List: a Hash Table where every Vertex maps to an array of its neighbors. This is very memory efficient.' },
    { index: null, title: 'Adjacency Matrix', text: 'Alternatively, a 2D Array (Matrix) can be used where rows and columns represent vertices. A 1 or 0 indicates if an edge exists. Fast, but uses O(VÂ²) memory.' },
    { index: 'D', title: 'Pathfinding & BFS', text: 'Breadth-First Search (BFS) explores the graph in ripples, finding the absolute shortest path between two nodes in an unweighted graph.' },
    { index: null, title: 'Dijkstra\'s Algorithm', text: 'For weighted graphs, algorithms like Dijkstra\'s or A* are used to calculate the path of least resistance. This is exactly how GPS navigation works.' },
    { index: null, title: 'Summary', text: 'Graphs are complex but incredibly powerful. They run Google\'s Search ranking (PageRank), routing protocols on the internet, and AI recommendation engines.' }
  ],
  'Hash Table-Open Addressing': [
    { index: null, title: 'Open Addressing', text: 'Instead of storing linked lists in each bucket (Chaining), Open Addressing stores exactly ONE item per bucket in a flat array.' },
    { index: 1, title: 'Linear Probing', text: 'If a collision occurs (the bucket is full), the algorithm simply steps forward to the NEXT adjacent bucket. If that\'s full, it checks the next, and so on.' },
    { index: null, title: 'Cache Efficiency', text: 'This is incredibly fast for the CPU because arrays have excellent cache locality, whereas following linked list pointers (Chaining) causes cache misses.' },
    { index: null, title: 'Clustering', text: 'The downside is "Primary Clustering". Long blocks of occupied buckets form, increasing search times. "Quadratic Probing" helps solve this.' }
  ],
  'Hash Table-Concurrent Hash': [
    { index: null, title: 'Concurrent Hash Maps', text: 'In multi-threaded applications, if two threads try to write to the exact same bucket simultaneously, data corruption occurs.' },
    { index: 2, title: 'Segment Locking', text: 'A Concurrent Hash Map solves this by locking the specific bucket (or segment of buckets) during a write. The ðŸ”’ icon represents a locked bucket.' },
    { index: null, title: 'High Throughput', text: 'Unlike wrapping the entire table in a single global lock (which forces all threads to wait), segment locking allows thread A to write to bucket 1 while thread B safely writes to bucket 4.' },
    { index: null, title: 'Use Cases', text: 'Essential for high-traffic web servers and modern multi-threaded software architectures.' }
  ],
  'Hash Table': [
    { index: null, title: 'Introduction to Hash Tables', text: 'A Hash Table (or Map/Dictionary) is an associative array. It pairs unique "Keys" to specific "Values", enabling lightning-fast data retrieval.' },
    { index: null, title: 'The Power of O(1)', text: 'Unlike searching a massive array one by one (O(N)), a Hash Table can look up a value among millions of records almost instantly in O(1) time.' },
    { index: null, title: 'The Key', text: 'Data isn\'t placed at sequential indices. Instead, you provide a Key (like a username or email string). This Key will determine where the data is stored.' },
    { index: 3, title: 'The Hash Function', text: 'The secret sauce is the Hash Function. It takes your Key, runs it through a mathematical scrambling algorithm, and outputs a specific integer index.' },
    { index: 3, title: 'Determinism', text: 'A good Hash Function is deterministic: passing "JohnDoe" will ALWAYS return the exact same index. This is how the table instantly knows where to look.' },
    { index: 2, title: 'Buckets', text: 'The output index points to a specific slot in an underlying array, known as a Bucket. The Value is stored in this bucket.' },
    { index: 3, title: 'The Collision Problem', text: 'Because memory is finite, occasionally the Hash Function will take two completely different Keys and accidentally output the exact same Bucket index.' },
    { index: 3, title: 'Resolving Collisions', text: 'A common fix is "Chaining". Instead of storing one value per bucket, each bucket holds a Linked List. If a collision occurs, the new item is just appended to the list.' },
    { index: null, title: 'Load Factor', text: 'If the table gets too full, collisions increase, slowing down lookups. The "Load Factor" triggers the table to automatically resize itself and re-hash everything.' },
    { index: null, title: 'Summary', text: 'Hash Tables are arguably the most used data structure in modern programming. They are the backbone of databases, caching systems (Redis), and JavaScript objects.' }
  ]
};

export default function VisualizerPage({ initialDs, hideUI = false }: { initialDs?: string, hideUI?: boolean } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const paramDs = searchParams.get('ds');
  const planetColor = location.state?.planetColor;
  const [activeDs, setActiveDs] = useState(initialDs || (dsList.includes(paramDs || '') ? paramDs! : 'Heap'));
  const [activeVariant, setActiveVariant] = useState('Static Array');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dsState, setDsState] = useState<DataStructure | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [isUIHidden, setIsUIHidden] = useState(hideUI);
  const [selected, setSelected] = useState<string | null>(null);
  const [cameraRevision, setCameraRevision] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [status, setStatus] = useState('Select a node or an array cell to inspect it.');
  const [busy, setBusy] = useState(false);
  const operationToken = useRef(0);
  useEffect(() => () => { operationToken.current++; }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { if (paramDs && dsList.includes(paramDs)) setActiveDs(paramDs); }, [paramDs]);

  // Fallback to base tutorial if variant tutorial doesn't exist
  const currentTutorials: TutorialStep[] = activeDs === 'Heap' ? [
    { index: null, title: activeVariant, text: `A complete binary tree where every parent is ${activeVariant === 'Min Heap' ? 'less' : 'greater'} than or equal to its children. The root holds the ${activeVariant === 'Min Heap' ? 'minimum' : 'maximum'} value.` },
    { index: dsState?.type === 'heap' ? dsState.root : null, title: 'Root Property', text: 'Peek at the root in O(1). The array is in level order, not sorted order. Click a node to inspect its parent and children.' },
    { index: null, title: 'Insert Operation', text: 'Append a value at the next available leaf. Compare it with its parent and sift upward until the heap property holds. Try Insert above.' },
    { index: null, title: 'Delete Operation', text: 'Delete the selected node, a typed value, or the root when neither is specified. Move the last value into the gap, then restore heap order.' },
    { index: null, title: 'Heapify', text: 'Compare parent and child values, swap when out of order, and continue along one path. Insertion and removal at a known index take O(log N).' },
  ] : tutorials[`${activeDs}-${activeVariant}`] || tutorials[activeDs === 'BST' || activeDs === 'AVL Tree' ? 'Binary Tree' : activeDs] || [];

  const getDsType = (name: string): DataStructureType => {
    switch (name) {
      case 'Array': return 'array';
      case 'Stack': return 'stack';
      case 'Queue': return 'queue';
      case 'Linked List': return 'linked-list';
      case 'Binary Tree': case 'BST': return 'binary-tree';
      case 'AVL Tree': return 'avl-tree';
      case 'Graph': return 'graph';
      case 'Hash Table': return 'hash-table';
      case 'Heap': return 'heap';
      default: return 'array';
    }
  };

  const defaultVariant = (name: string) => ({Array: 'Static Array', Stack: 'Array Stack', Queue: 'Simple Queue', 'Linked List': 'Singly Linked', 'Binary Tree': 'Binary Search Tree', BST: 'Binary Search Tree', 'AVL Tree': 'AVL Tree', Graph: 'Directed Graph', 'Hash Table': 'Chaining', Heap: 'Max Heap'}[name] || 'Static Array');
  useEffect(() => { setActiveVariant(defaultVariant(activeDs)); }, [activeDs]);
  useEffect(() => {
    operationToken.current++;
    setBusy(false); setSelected(null); setCurrentStep(0); setIsPlaying(false);
    setStatus('Select a node or an array cell to inspect it.');
    const next = createDefaultStructure(activeVariant === 'AVL Tree' ? 'avl-tree' : getDsType(activeDs), activeVariant);
    if (next.type === 'heap') {
      next.heapType = activeVariant === 'Min Heap' ? 'min' : 'max';
      const values = next.heapType === 'min' ? [10, 25, 15, 60, 45, 55, 70] : [90, 75, 80, 60, 45, 55, 70];
      next.nodes.forEach((n, i) => { n.value = values[i]; });
    }
    setDsState(next);
  }, [activeDs, activeVariant]);

  // Auto-play logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= currentTutorials.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTutorials.length]);

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (currentStep >= currentTutorials.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  let activeIndex = currentTutorials[currentStep]?.index ?? null;

  // Extract dynamic search highlights from dsState
  let searchHighlights: (string | number)[] = [];
  if (dsState) {
    if (dsState.type === 'array' || dsState.type === 'stack' || dsState.type === 'queue') {
      dsState.elements.forEach((n, i) => { if (n.state?.highlighted) searchHighlights.push(i); });
    } else if (dsState.type === 'linked-list') {
      dsState.nodes.forEach((n, i) => { if (n.state?.highlighted) searchHighlights.push(i); });
    } else if (dsState.type === 'binary-tree' || dsState.type === 'avl-tree' || dsState.type === 'graph' || dsState.type === 'heap') {
      dsState.nodes.forEach((n) => { if (n.state?.highlighted) searchHighlights.push(n.id); });
    } else if (dsState.type === 'hash-table') {
      dsState.buckets.forEach((b, i) => {
        if (b.entries.some(e => e.state?.highlighted)) searchHighlights.push(i);
      });
    }
  }

  // Combine tutorial activeIndex with dynamic search highlights
  if (searchHighlights.length > 0) {
    if (activeIndex === null) {
      activeIndex = searchHighlights;
    } else if (Array.isArray(activeIndex)) {
      activeIndex = [...activeIndex, ...searchHighlights];
    } else {
      activeIndex = [activeIndex, ...searchHighlights];
    }
  }

  const applyOperation = async (kind: 'insert' | 'delete', val: string, idx?: number) => {
    if (!dsState || busy) return;
    if (dsState.type === 'heap' && val.trim() && !Number.isFinite(Number(val))) { setStatus('Enter a finite numeric value.'); return; }
    if (dsState.type === 'heap' && kind === 'insert' && dsState.nodes.length >= 31) { setStatus('This interactive scene supports 31 nodes. Delete a value before inserting another.'); return; }
    const before = structuredClone(dsState);
    const deleteIndex = idx ?? (selected && 'nodes' in before && !val.trim() ? before.nodes.findIndex(n => n.id === selected) : undefined);
    const next = kind === 'insert' ? insertValue(structuredClone(before), val, idx, activeVariant) : deleteValue(structuredClone(before), val, deleteIndex);
    setIsPlaying(false); setSelected(null);
    if (before.type === 'heap' && next.type === 'heap') {
      const frames = heapOperationFrames(before, next, kind, val, deleteIndex);
      const token = ++operationToken.current;
      setBusy(true);
      for (const frame of frames) {
        if (token !== operationToken.current) return;
        setDsState(frame.state); setStatus(frame.message);
        if (!reducedMotion) await new Promise(resolve => setTimeout(resolve, 650));
      }
      if (token !== operationToken.current) return;
      setBusy(false);
    }
    setDsState(next); setStatus(`${kind === 'insert' ? 'Insert' : 'Delete'} complete. ${next.type === 'heap' ? 'Heap order restored.' : 'Structure updated.'}`);
  };
  const handleInsert = (val: string, idx?: number) => { void applyOperation('insert', val, idx); };
  const handleDelete = (val: string, idx?: number) => { void applyOperation('delete', val, idx); };

  // Render the correct 3D component
  const render3DComponent = () => {
    if (!dsState) return null;

    // Extract data array for linear structures
    const linearData = (dsState.type === 'array' || dsState.type === 'stack' || dsState.type === 'queue')
      ? dsState.elements.map(e => Number(e.value))
      : [];

    // Extract for linked list
    const llData = dsState.type === 'linked-list' ? dsState.nodes.map(n => Number(n.value)) : [];

    switch (activeDs) {
      case 'Array': return <Array3D data={linearData} activeIndex={activeIndex as number} variant={activeVariant} capacity={dsState?.type === 'array' ? dsState.capacity : undefined} baseColor={planetColor} />;
      case 'Stack': return <Stack3D data={linearData} activeIndex={activeIndex as number} variant={activeVariant} baseColor={planetColor} />;
      case 'Queue': return <Queue3D data={linearData} activeIndex={activeIndex as number} variant={activeVariant} baseColor={planetColor} />;
      case 'Linked List': return <LinkedList3D reducedMotion={reducedMotion} selectedIndex={dsState.type === 'linked-list' ? dsState.nodes.findIndex(n => n.id === selected) : -1} onNodeSelect={index => {if(dsState.type === 'linked-list') setSelected(dsState.nodes[index].id);}} data={llData} activeIndex={activeIndex as number} variant={activeVariant} baseColor={planetColor} />;
      case 'BST': case 'AVL Tree': case 'Binary Tree': return <BinaryTree3D onNodeSelect={setSelected} selectedId={selected} reducedMotion={reducedMotion} activeIndex={activeIndex as number} variant={activeVariant} dsState={(dsState?.type === 'binary-tree' || dsState?.type === 'avl-tree') ? dsState as any : null} baseColor={planetColor} />;
      case 'Graph': return <Graph3D activeIndex={activeIndex as any} variant={activeVariant} dsState={dsState?.type === 'graph' ? dsState as any : null} baseColor={planetColor} />;
      case 'Hash Table': return <HashTable3D activeIndex={activeIndex as number} activeItem={currentStep === 2 ? 'Key' : null} variant={activeVariant} dsState={dsState?.type === 'hash-table' ? dsState as any : null} baseColor={planetColor} />;
      case 'Heap': return <BinaryTree3D onNodeSelect={setSelected} selectedId={selected} reducedMotion={reducedMotion} activeIndex={activeIndex as number} variant={activeVariant} dsState={dsState?.type === 'heap' ? dsState as any : null} baseColor={planetColor} />;
      default: return null;
    }
  };

  const scene = <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.4, 10], fov: 45 }}>
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
    <pointLight position={[-10, 10, -10]} intensity={0.5} />
    <Environment resolution={128} frames={1}>
      <Lightformer position={[0, 5, -5]} scale={[12, 5, 1]} intensity={3} color="#b7cdff" />
      <Lightformer position={[-5, 1, 3]} rotation={[0, Math.PI / 2, 0]} scale={[5, 8, 1]} intensity={4} color="#7257ff" />
      <Lightformer position={[5, 2, 3]} rotation={[0, -Math.PI / 2, 0]} scale={[5, 8, 1]} intensity={3} color="#55cfff" />
    </Environment>
    <Stars radius={50} depth={50} count={1500} factor={4} saturation={0} fade speed={reducedMotion ? 0 : 1} />
    <Asteroids count={60} reducedMotion={reducedMotion}/>
    <Sparkles count={50} scale={12} size={2} speed={reducedMotion ? 0 : 0.4} opacity={0.2} color="#818cf8" />
    {render3DComponent()}
    <ContactShadows position={[0, -5, 0]} opacity={0.5} scale={20} blur={2} far={4} color="#000000" />
    <OrbitControls makeDefault enablePan={false} minDistance={7} maxDistance={100} minPolarAngle={0.4} maxPolarAngle={Math.PI / 2 + 0.1} target={[0, -1.2, 0]} />
    <CameraReset revision={cameraRevision} module={activeDs} count={dsState && 'nodes' in dsState ? dsState.nodes.length : dsState && 'elements' in dsState ? dsState.elements.length : 0}/>
    <EffectComposer><Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur/><Vignette eskil={false} offset={0.1} darkness={1.1}/></EffectComposer>
  </Canvas>;
  return <>
    {hideUI ? <div style={{height:'100%',minHeight:400}}>{scene}</div> : <StructureLayout
      activeDs={activeDs} activeVariant={activeVariant} modules={dsList} state={dsState}
      onModule={name => { setActiveDs(name); setSearchParams({ds:name}, {replace:true}); }}
      onVariant={setActiveVariant} onCode={() => setShowCodeModal(true)}
      playing={isPlaying} onPlay={togglePlay} step={currentStep} steps={currentTutorials}
      onStep={index => {setCurrentStep(index);setIsPlaying(false);}} onReset={handleReset}
      onCameraReset={() => setCameraRevision(v => v + 1)} guideHidden={isUIHidden} onToggleGuide={() => setIsUIHidden(v => !v)}
      selected={selected} onSelect={setSelected} reducedMotion={reducedMotion} onMotion={() => setReducedMotion(v => !v)} status={status}
      toolbar={<VisualizerToolbar onInsert={handleInsert} onDelete={handleDelete} activeDs={activeDs} disabled={busy}/>}
    ><Suspense fallback={<div role="status" style={{padding:24,color:"#a6b8dc"}}>Loading 3D scene…</div>}>{scene}</Suspense></StructureLayout>}
    <CodeImplementationsModal open={showCodeModal} onClose={() => setShowCodeModal(false)} activeDs={activeDs}/>
  </>;
}
