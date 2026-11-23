import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Clock, CheckCircle2, XCircle, Code2 } from 'lucide-react';
import { ALGO_META } from '../workspace/AlgorithmsWorkspace';
import type { AlgoType } from '../workspace/AlgorithmsWorkspace';

interface AlgorithmInfoPanelProps {
  activeAlgo: AlgoType;
  onViewCode: () => void;
}

export default function AlgorithmInfoPanel({ activeAlgo, onViewCode }: AlgorithmInfoPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const info = ALGO_META[activeAlgo];

  // Derive pros/cons based on time complexities or general knowledge
  // Since ALGO_META doesn't have pros/cons, we'll hardcode some for the immersive view.
  const getProsCons = (algo: AlgoType) => {
    switch (algo) {
      case 'bubble-sort': return { pros: ['Simple to understand and implement', 'In-place sorting (O(1) space)'], cons: ['Very inefficient for large lists (O(N²))'] };
      case 'selection-sort': return { pros: ['In-place sorting', 'Fewer swaps than Bubble Sort'], cons: ['Always O(N²) even if sorted'] };
      case 'insertion-sort': return { pros: ['Efficient for small or mostly sorted lists', 'Stable sort'], cons: ['Inefficient for large lists'] };
      case 'merge-sort': return { pros: ['Consistent O(N log N) performance', 'Stable sort'], cons: ['Requires O(N) extra space'] };
      case 'quick-sort': return { pros: ['Extremely fast in practice', 'In-place (mostly, O(log N) stack)'], cons: ['Unstable sort', 'O(N²) worst-case'] };
      case 'linear-search': return { pros: ['Works on unsorted arrays', 'Simple implementation'], cons: ['Slow for large datasets'] };
      case 'binary-search': return { pros: ['Very fast (O(log N))'], cons: ['Requires array to be sorted first'] };
      case 'bfs': return { pros: ['Guarantees shortest path in unweighted graphs', 'Traverses layer by layer'], cons: ['High memory consumption for high branching factor'] };
      case 'dfs': return { pros: ['Uses less memory than BFS', 'Useful for cycle detection & topological sorts'], cons: ['Not guaranteed to find shortest path'] };
      case 'dijkstra': return { pros: ['Guarantees shortest path in weighted graphs', 'Very fast with priority queues'], cons: ['Does not support negative edge weights'] };
      case 'bellman-ford': return { pros: ['Supports negative edge weights', 'Detects negative weight cycles'], cons: ['Higher time complexity than Dijkstra (O(VE))'] };
      case 'floyd-warshall': return { pros: ['Calculates shortest paths between all pairs of nodes', 'Simple to implement'], cons: ['Very high cubic time complexity (O(V³))'] };
      case 'kruskal': return { pros: ['Simple implementation using Disjoint Set Union', 'Efficient for sparse graphs'], cons: ['Requires sorting all edges first'] };
      case 'prim': return { pros: ['Efficient for dense graphs', 'Grows MST incrementally from a starting node'], cons: ['More complex to implement than Kruskal'] };
      case 'topological-sort': return { pros: ['Solves dependency scheduling problems', 'Runs in linear O(V + E) time'], cons: ['Only works on Directed Acyclic Graphs (DAGs)'] };
      case 'knapsack': return { pros: ['Guarantees optimal value selection', 'Solves 0/1 item choice constraint'], cons: ['High memory requirements for large capacities'] };
      case 'fibonacci': return { pros: ['Optimizes recursive runtime to linear time', 'Simple example of memoization'], cons: ['Requires auxiliary memory to cache values'] };
      case 'lcs': return { pros: ['Finds absolute longest matches in sequences', 'Extremely useful in diff systems'], cons: ['Runs in quadratic time O(MN)'] };
      case 'activity-selection': return { pros: ['Extremely fast greedily sorted resolution', 'No extra memory needed'], cons: ['Only works if greedy choice property holds'] };
      case 'huffman-coding': return { pros: ['Generates mathematically optimal prefix codes', 'Saves significant data space'], cons: ['Must transmit tree alongside compressed data'] };
      case 'hanoi': return { pros: ['Clear illustration of recursive divide-and-conquer strategy', 'Simple logic for complex movement rules'], cons: ['Exponential time complexity O(2^N) makes large N impossible to solve'] };
      default: return { pros: [], cons: [] };
    }
  };

  const { pros, cons } = getProsCons(activeAlgo);

  return (
    <div className="absolute top-28 left-6 bottom-6 z-10 w-[340px] pointer-events-none flex flex-col gap-4">
      <div className="pointer-events-auto bg-[#0B1120]/95 backdrop-blur-xl border border-[var(--color-border-subtle)] rounded-2xl flex flex-col h-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div 
          className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center gap-2 text-white">
            <Info size={18} className="text-blue-400" />
            <h3 className="font-bold text-lg">Algorithm Details</h3>
          </div>
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-secondary)]">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </motion.div>
        </div>

        {/* Scrollable Content */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-y-auto flex-1 custom-scrollbar"
            >
              <div className="p-5 space-y-6">
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {info.description}
                </p>

                {/* Time Complexity Grid */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-wider">
                    <Clock size={14} /> Time Complexity
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                      <div className="text-[10px] text-[var(--color-text-muted)] mb-1 uppercase">Best</div>
                      <div className="font-mono text-sm font-bold text-green-400">{info.timeComplexities.best}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                      <div className="text-[10px] text-[var(--color-text-muted)] mb-1 uppercase">Average</div>
                      <div className="font-mono text-sm font-bold text-yellow-400">{info.timeComplexities.average}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                      <div className="text-[10px] text-[var(--color-text-muted)] mb-1 uppercase">Worst</div>
                      <div className="font-mono text-sm font-bold text-red-400">{info.timeComplexities.worst}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                      <div className="text-[10px] text-[var(--color-text-muted)] mb-1 uppercase">Space</div>
                      <div className="font-mono text-sm font-bold text-blue-400">{info.timeComplexities.space}</div>
                    </div>
                  </div>
                </div>

                {/* Advantages */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 size={14} /> Advantages
                  </div>
                  <ul className="space-y-2">
                    {pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                        <span className="text-green-500/50 mt-1">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disadvantages */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                    <XCircle size={14} /> Disadvantages
                  </div>
                  <ul className="space-y-2">
                    {cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                        <span className="text-red-500/50 mt-1">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer actions */}
        <div className="p-4 border-t border-[var(--color-border-subtle)] bg-white/[0.02]">
          <button 
            onClick={onViewCode}
            className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-blue-500/30"
          >
            <Code2 size={16} /> View Implementation
          </button>
        </div>
      </div>
    </div>
  );
}
