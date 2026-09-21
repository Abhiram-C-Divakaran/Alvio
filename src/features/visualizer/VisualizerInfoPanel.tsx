import { motion, AnimatePresence } from 'framer-motion';
import { Info, Clock, CheckCircle2, XCircle, ListTree, Code2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface InfoPanelProps {
  activeDs: string;
  activeVariant: string;
  onVariantSelect: (variant: string) => void;
  onViewCode: () => void;
}

export const dsInfo: Record<string, { desc: string, time: { access: string, search: string, insert: string, delete: string }, pros: string[], cons: string[], types: { name: string, desc: string }[] }> = {
  'Array': {
    desc: 'An array stores elements in a single contiguous block of memory. The index acts as a mathematical offset, allowing instantaneous random access to any element.',
    time: { access: 'O(1)', search: 'O(N)', insert: 'O(N)', delete: 'O(N)' },
    pros: ['O(1) instant Random Access', 'Excellent CPU Cache Locality', 'Zero memory overhead (no pointers)'],
    cons: ['O(N) slow insertions and deletions', 'Fixed size memory allocation'],
    types: [
      { name: 'Static Array', desc: 'Fixed size, memory allocated at compile time.' },
      { name: 'Dynamic Array', desc: 'Auto-resizes when full (e.g. ArrayList, std::vector).' },
      { name: '2D Array', desc: 'Array of arrays, often used for matrices/grids.' }
    ]
  },
  'Stack': {
    desc: 'A Stack is a Last-In-First-Out (LIFO) structure. Think of it like a stack of plates: you can only add to the top (Push) and remove from the top (Pop).',
    time: { access: 'O(N)', search: 'O(N)', insert: 'O(1)', delete: 'O(1)' },
    pros: ['O(1) Push and Pop operations', 'Perfect for reversing order', 'Powers recursion and Undo features'],
    cons: ['No Random Access to middle elements', 'Strict LIFO access pattern'],
    types: [
      { name: 'Array Stack', desc: 'Implemented using an array. Fast but fixed size.' },
      { name: 'Linked Stack', desc: 'Implemented using a linked list. Dynamic size.' },
      { name: 'Monotonic Stack', desc: 'Maintains elements in sorted order for specific algorithms.' }
    ]
  },
  'Queue': {
    desc: 'A Queue is a First-In-First-Out (FIFO) structure. It works exactly like a line at a store. Elements join at the Rear and leave from the Front.',
    time: { access: 'O(N)', search: 'O(N)', insert: 'O(1)', delete: 'O(1)' },
    pros: ['O(1) Enqueue and Dequeue', 'Maintains fairness and chronological order', 'Essential for task scheduling (OS)'],
    cons: ['No Random Access', 'Array implementations can waste space'],
    types: [
      { name: 'Simple Queue', desc: 'Standard FIFO queue.' },
      { name: 'Circular Queue', desc: 'Connects the end back to the front to save memory.' },
      { name: 'Priority Queue', desc: 'Elements sorted by priority instead of time.' },
      { name: 'Deque', desc: 'Double-ended queue. Add/remove from both ends.' }
    ]
  },
  'Linked List': {
    desc: 'A Linked List scatters nodes randomly in memory. Each node contains data and a pointer to the next node, chained together starting from a Head pointer.',
    time: { access: 'O(N)', search: 'O(N)', insert: 'O(1)', delete: 'O(1)' },
    pros: ['O(1) instant insertions/deletions at the ends', 'Dynamic size (grows as needed)', 'No shifting elements required'],
    cons: ['O(N) slow traversal', 'No Random Access', 'High memory overhead due to pointers'],
    types: [
      { name: 'Singly Linked', desc: 'Nodes point only to the next node.' },
      { name: 'Doubly Linked', desc: 'Nodes point to both next and previous nodes.' },
      { name: 'Circular Linked', desc: 'The tail node points back to the head.' }
    ]
  },
  'Binary Tree': {
    desc: 'A Binary Tree represents hierarchical data. In a Binary Search Tree (BST), left children are smaller and right children are larger than their parent.',
    time: { access: 'O(log N)', search: 'O(log N)', insert: 'O(log N)', delete: 'O(log N)' },
    pros: ['O(log N) fast lookups and insertions', 'Keeps elements sorted automatically', 'Hierarchical relationship mapping'],
    cons: ['Worst-case O(N) if the tree becomes unbalanced', 'Complex deletion logic'],
    types: [
      { name: 'Binary Search Tree', desc: 'Left child < parent, right child > parent.' },
      { name: 'AVL Tree', desc: 'Strictly self-balancing BST for guaranteed O(log N).' },
      { name: 'Heap', desc: 'Complete tree used for priority queues.' }
    ]
  },
  'Graph': {
    desc: 'A Graph models complex relationships using Vertices (Nodes) and Edges (Connections). It powers social networks, maps, and internet routing.',
    time: { access: 'O(V+E)', search: 'O(V+E)', insert: 'O(1)', delete: 'O(V)' },
    pros: ['Models many-to-many relationships perfectly', 'Enables shortest-path algorithms like Dijkstra', 'Extremely versatile'],
    cons: ['High memory footprint for dense graphs', 'Complex traversal logic (BFS/DFS)'],
    types: [
      { name: 'Directed Graph', desc: 'Edges have a specific direction (one-way).' },
      { name: 'Undirected Graph', desc: 'Edges are bidirectional (two-way).' },
      { name: 'Weighted Graph', desc: 'Edges have a cost or distance value.' }
    ]
  },
  'Hash Table': {
    desc: 'A Hash Table uses a mathematical Hash Function to convert a string Key into an array Index, allowing for instantaneous O(1) lookups.',
    time: { access: 'O(1)', search: 'O(1)', insert: 'O(1)', delete: 'O(1)' },
    pros: ['O(1) instantaneous lookup by Key', 'Extremely fast insertions', 'Powers databases and caching'],
    cons: ['Hash Collisions must be handled', 'Unordered data structure', 'Can consume excess memory'],
    types: [
      { name: 'Chaining', desc: 'Collisions are stored in a Linked List.' },
      { name: 'Open Addressing', desc: 'Collisions find the next empty array slot.' },
      { name: 'Concurrent Hash', desc: 'Thread-safe implementation for multi-threading.' }
    ]
  },
  'Heap': {
    desc: 'A Heap is a specialized complete binary tree that satisfies the heap property. In a Max Heap, parents are greater than children. In a Min Heap, parents are smaller.',
    time: { access: 'O(1)', search: 'O(N)', insert: 'O(log N)', delete: 'O(log N)' },
    pros: ['O(1) access to maximum or minimum element', 'Complete binary tree (guarantees O(log N) depth)', 'Memory efficient (can be mapped directly to an array)'],
    cons: ['O(N) slow search for arbitrary elements', 'No traversal order (not sorted globally)'],
    types: [
      { name: 'Max Heap', desc: 'Parent node is greater than or equal to its children.' },
      { name: 'Min Heap', desc: 'Parent node is less than or equal to its children.' }
    ]
  }
};

export default function VisualizerInfoPanel({ activeDs, activeVariant, onVariantSelect, onViewCode }: InfoPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const info = dsInfo[activeDs] || dsInfo['Array'];

  return (
    <div className="absolute top-20 left-4 z-10 w-80 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDs}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-[#0f172a]/80 backdrop-blur-xl border border-[var(--color-border-subtle)] rounded-2xl p-5 shadow-2xl pointer-events-auto"
        >
          <div className="flex items-center gap-2 mb-3 text-white">
            <Info className="text-blue-400" size={20} />
            <h2 className="text-xl font-bold">{activeDs} Details</h2>
          </div>

          <p className="text-sm text-gray-300 mb-5 leading-relaxed">
            {info.desc}
          </p>

          <div className="mb-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock size={12} /> Time Complexity
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded p-2 border border-white/5">
                <span className="text-gray-400 block mb-1">Access</span>
                <span className="font-mono text-blue-400 font-bold">{info.time.access}</span>
              </div>
              <div className="bg-white/5 rounded p-2 border border-white/5">
                <span className="text-gray-400 block mb-1">Search</span>
                <span className="font-mono text-yellow-400 font-bold">{info.time.search}</span>
              </div>
              <div className="bg-white/5 rounded p-2 border border-white/5">
                <span className="text-gray-400 block mb-1">Insert</span>
                <span className="font-mono text-green-400 font-bold">{info.time.insert}</span>
              </div>
              <div className="bg-white/5 rounded p-2 border border-white/5">
                <span className="text-gray-400 block mb-1">Delete</span>
                <span className="font-mono text-red-400 font-bold">{info.time.delete}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CheckCircle2 size={12} /> Advantages
              </h3>
              <ul className="text-xs text-gray-300 space-y-1.5 pl-4 list-disc marker:text-green-500/50">
                {info.pros.map((pro, i) => <li key={i}>{pro}</li>)}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <XCircle size={12} /> Disadvantages
              </h3>
              <ul className="text-xs text-gray-300 space-y-1.5 pl-4 list-disc marker:text-red-500/50">
                {info.cons.map((con, i) => <li key={i}>{con}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ListTree size={12} /> Common Types
              </h3>
              <div className="flex flex-col gap-2 mt-1">
                {info.types.map((type, i) => (
                  <motion.button
                    key={i}
                    onClick={() => onVariantSelect(type.name)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`text-left border rounded-lg p-2 transition-colors relative overflow-hidden group ${
                      activeVariant === type.name
                        ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                        : 'bg-white/5 border-white/5 hover:border-blue-500/30'
                    }`}
                  >
                    {/* Subtle hover gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className={`relative z-10 text-[11px] font-bold mb-0.5 ${activeVariant === type.name ? 'text-blue-200' : 'text-blue-400 group-hover:text-blue-300'}`}>
                      {type.name}
                    </div>
                    <div className={`relative z-10 text-[10px] leading-tight ${activeVariant === type.name ? 'text-blue-100/80' : 'text-gray-400 group-hover:text-gray-300'}`}>
                      {type.desc}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              onClick={onViewCode}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors pointer-events-auto shadow-lg shadow-blue-500/20"
            >
              <Code2 size={16} />
              View Code Implementations
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
