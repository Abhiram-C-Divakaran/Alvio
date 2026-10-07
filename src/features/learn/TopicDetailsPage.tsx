import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, ArrowRight, Code } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopicDetailsPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  // Format the topic ID into a readable title (e.g. 'print-alternates' -> 'Print Alternates')
  const formatTitle = (id: string) => {
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const title = topicId ? formatTitle(topicId) : 'Topic Details';

  return (
    <div className="app-lesson text-white">
      <div className="app-lesson-body">
        <nav className="app-breadcrumb" aria-label="Breadcrumb"><Link to="/learn">Learn</Link><span>›</span><Link to="/learn/data-structures">Data Structures</Link><span>›</span><span aria-current="page">{title}</span></nav><header className="space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[var(--color-surface-glass)] text-[var(--color-text-secondary)] hover:text-white rounded-xl text-sm font-semibold border border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)] transition-all flex items-center gap-2 w-fit"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-4">
            <BookOpen size={40} className="text-indigo-400" />
            {title}
          </h1>
          <p className="text-[var(--color-text-secondary)] text-xl max-w-3xl leading-relaxed">
            This is a placeholder page for the <strong>{title}</strong> topic. Detailed explanations, interactive examples, and coding exercises for this specific topic are currently under development.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--color-surface-glass)] p-8 rounded-3xl border border-[var(--color-border-subtle)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Code size={100} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Practice in Workspace</h3>
            <p className="text-[var(--color-text-secondary)] mb-8 max-w-md relative z-10">
              Ready to write some code? Head over to the interactive coding workspace to try implementing this on your own.
            </p>
            <button
              onClick={() => navigate('/coding')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
            >
              Go to Workspace <ArrowRight size={18} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--color-surface-glass)] p-8 rounded-3xl border border-[var(--color-border-subtle)]"
          >
            <h3 className="text-2xl font-bold mb-4">Coming Soon</h3>
            <ul className="space-y-4 text-[var(--color-text-secondary)]">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                Detailed step-by-step tutorial
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                Time & Space Complexity analysis
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-fuchsia-500"></div>
                Multiple language implementations (C++, Java, Python)
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Interactive 3D Visualizations
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
