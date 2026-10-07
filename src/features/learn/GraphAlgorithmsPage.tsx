import {CategoryBreadcrumb} from '../../navigation/TopicOrientation';
import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';
import { ALGO_META } from '../workspace/AlgorithmsWorkspace';

export default function GraphAlgorithmsPage() {
  const navigate = useNavigate();

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Intermediate': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Advanced': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const graphAlgos = Object.keys(ALGO_META)
    .filter(k => ALGO_META[k as keyof typeof ALGO_META].type === 'graph')
    .map(k => ({
      id: k,
      ...ALGO_META[k as keyof typeof ALGO_META]
    }));

  return (
    <div className="app-lesson text-white">
      <div className="app-lesson-body"><CategoryBreadcrumb/>
        <header className="space-y-6">
          <button
            onClick={() => navigate('/learn/algorithms')}
            className="px-4 py-2 bg-[var(--color-surface-glass)] text-[var(--color-text-secondary)] hover:text-white rounded-xl text-sm font-semibold border border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)] transition-all flex items-center gap-2 w-fit"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Algorithms
          </button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-4">
            <Network size={40} className="text-blue-400" />
            Graph Algorithms
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-3xl leading-relaxed">
            Graph algorithms are fundamental operations to traverse networks, locate shortest routes (like GPS navigation), schedule tasks based on dependencies, and calculate minimum spanning trees.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {graphAlgos.map((algo, i) => (
            <motion.div
              key={algo.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/learn/algorithms/${algo.id}`} className="block group">
                <div className="bg-[var(--color-surface-glass)] p-6 rounded-2xl border border-[var(--color-border-subtle)] hover:border-amber-500/50 transition-all h-full hover:-translate-y-1 shadow-sm flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{algo.name}</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-6 flex-1">
                    {algo.description}
                  </p>
                  <div className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg border w-fit ${getDifficultyColor(algo.difficulty || 'Beginner')}`}>
                    {algo.difficulty || 'Beginner'}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
