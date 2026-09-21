import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createDefaultStructure, insertValue, deleteValue, searchValue } from '../../workspace/dataStructureOps';
import Visualization3D from '../../workspace/Visualization3D';
import Visualization2D from '../../workspace/Visualization2D';
import VisualizerToolbar from '../../visualizer/VisualizerToolbar';
import Editor from '@monaco-editor/react';
import { codeSnippets } from '../../workspace/codeSnippets';
import type { DataStructureType, DataStructure } from '../../../types/dataStructures';
import { Box, Code2, Clock, CheckCircle2, XCircle, Maximize2, Minimize2, HelpCircle, Terminal } from 'lucide-react';

interface DataStructurePageLayoutProps {
  type: DataStructureType;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeComplexities: {
    access?: string;
    search: string;
    insert: string;
    delete: string;
  };
  visualizerDsName: string;
  content: React.ReactNode;
}

export default function DataStructurePageLayout({
  type,
  title,
  description,
  difficulty,
  timeComplexities,
  visualizerDsName,
  content,
}: DataStructurePageLayoutProps) {
  const navigate = useNavigate();
  const {hash}=useLocation();
  useEffect(()=>{if(!hash)return;const timer=requestAnimationFrame(()=>{const target=document.getElementById(hash.slice(1));target?.scrollIntoView({block:'start'});target?.focus({preventScroll:true});});return()=>cancelAnimationFrame(timer);},[hash]);
  const [structure, setStructure] = useState<DataStructure | null>(null);
  const [language, setLanguage] = useState<'python' | 'javascript' | 'java' | 'cpp'>('python');
  const [isVisualizerExpanded, setIsVisualizerExpanded] = useState(false);

  useEffect(() => {
    setStructure(createDefaultStructure(type));
  }, [type]);

  const handleInsert = (val: string) => {
    if (!structure || !val) return;
    setStructure(insertValue(structure, val));
  };

  const handleDelete = (val: string) => {
    if (!structure || !val) return;
    setStructure(deleteValue(structure, val));
  };

  const handleSearch = (val: string) => {
    if (!structure || !val) return;
    setStructure(searchValue(structure, val));
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Intermediate': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Advanced': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const snippets = codeSnippets[type] || {};
  const currentCode = snippets[language] || '// Code snippet not available';

  const navigateToComplexity = (rawVal: string) => {
    let cleanVal = rawVal.replace(/\*/g, '').trim();
    if (cleanVal.toLowerCase().includes('log') && cleanVal.toLowerCase().includes('n') && !cleanVal.toLowerCase().includes('n log')) {
      cleanVal = 'O(log N)';
    } else if (cleanVal.toLowerCase() === 'o(1)') {
      cleanVal = 'O(1)';
    } else if (cleanVal.toLowerCase() === 'o(n)') {
      cleanVal = 'O(N)';
    } else if (cleanVal.toLowerCase().includes('n log')) {
      cleanVal = 'O(N log N)';
    } else if (cleanVal.toLowerCase().includes('n2') || cleanVal.includes('N²') || cleanVal.toLowerCase().includes('n^2')) {
      cleanVal = 'O(N²)';
    } else if (cleanVal.toLowerCase().includes('2^n')) {
      cleanVal = 'O(2^N)';
    }
    navigate(`/learn/complexity?highlight=${encodeURIComponent(cleanVal)}`);
  };

  return (
    <div className="w-full min-h-full bg-[var(--color-bg-primary)] p-4 md:p-8 lg:p-12 text-white font-sans overflow-y-auto selection:bg-blue-500/30">

      <div className="max-w-[1000px] mx-auto space-y-16 pb-24">

        {/* Header */}
        <header className="space-y-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--color-border-subtle)] pb-8 pt-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {title}
              </h1>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            </div>
            <p className="text-[var(--color-text-secondary)] text-xl max-w-3xl leading-relaxed">
              {description}
            </p>
          </div>

          <button
            onClick={() => navigate(`/3d-visualizer?ds=${encodeURIComponent(visualizerDsName)}`)}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <Box size={20} />
            Open in 3D Visualizer
          </button>
        </header>

        {/* 2D Visualization (Big and Prominent) */}
        <div className={`bg-[var(--color-surface-glass)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden flex flex-col shadow-xl ${isVisualizerExpanded ? 'fixed inset-4 z-50 shadow-2xl bg-[var(--color-bg-primary)] border-indigo-500/50' : 'h-[600px] w-full'}`}>
           <div className="border-b border-[var(--color-border-subtle)] bg-black/20 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2 m-0">
              <Box className="text-blue-400" size={24} />
              Interactive {type === 'heap' ? '2D' : '3D'} Visualization
            </h2>
            <button
              onClick={() => setIsVisualizerExpanded(!isVisualizerExpanded)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[var(--color-text-secondary)] hover:text-white"
              title={isVisualizerExpanded ? "Minimize" : "Expand Fullscreen"}
            >
              {isVisualizerExpanded ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          </div>
          <div className="w-full flex-1 flex flex-col p-6 bg-[var(--color-bg-primary)] relative">
             <div className="flex justify-center mb-6">
              <VisualizerToolbar
                onInsert={(val) => handleInsert(val)}
                onDelete={(val) => handleDelete(val)}
              />
            </div>
            <div className="flex-1 flex items-center justify-center overflow-hidden relative min-h-[400px]">
              {structure ? (
                <div className={`transition-all duration-300 ease-in-out ${isVisualizerExpanded ? 'w-full h-full flex items-center justify-center scale-150 origin-center' : 'w-full h-full scale-110 origin-center'}`}>
                  {type === 'heap' ? <Visualization2D structure={structure} /> : <Visualization3D structure={structure} />}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Backdrop for expanded view */}
        {isVisualizerExpanded && (
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={() => setIsVisualizerExpanded(false)}
          />
        )}

        {/* Complexity Table */}
        <div className="bg-[var(--color-surface-glass)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden shadow-xl max-w-4xl mx-auto">
          <div className="border-b border-[var(--color-border-subtle)] bg-black/20 p-4">
            <h2 className="text-xl font-bold flex items-center gap-2 m-0">
              <Clock className="text-green-400" size={24} />
              Time & Space Complexity
            </h2>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {timeComplexities.access && (
              <div
                onClick={() => navigateToComplexity(timeComplexities.access)}
                className="flex flex-col p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-blue-500 hover:scale-[1.03] transition-all cursor-pointer shadow-sm group"
              >
                <span className="font-semibold text-[var(--color-text-secondary)] mb-2 text-center text-sm uppercase tracking-wider group-hover:text-blue-300">Access</span>
                <span className="font-mono font-bold text-white bg-blue-500/20 px-3 py-2 rounded-lg text-center text-lg group-hover:bg-blue-500/30">{timeComplexities.access}</span>
              </div>
            )}
            <div
              onClick={() => navigateToComplexity(timeComplexities.search)}
              className="flex flex-col p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-blue-500 hover:scale-[1.03] transition-all cursor-pointer shadow-sm group"
            >
              <span className="font-semibold text-[var(--color-text-secondary)] mb-2 text-center text-sm uppercase tracking-wider group-hover:text-blue-300">Search</span>
              <span className="font-mono font-bold text-white bg-blue-500/20 px-3 py-2 rounded-lg text-center text-lg group-hover:bg-blue-500/30">{timeComplexities.search}</span>
            </div>
            <div
              onClick={() => navigateToComplexity(timeComplexities.insert)}
              className="flex flex-col p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-blue-500 hover:scale-[1.03] transition-all cursor-pointer shadow-sm group"
            >
              <span className="font-semibold text-[var(--color-text-secondary)] mb-2 text-center text-sm uppercase tracking-wider group-hover:text-blue-300">Insertion</span>
              <span className="font-mono font-bold text-white bg-blue-500/20 px-3 py-2 rounded-lg text-center text-lg group-hover:bg-blue-500/30">{timeComplexities.insert}</span>
            </div>
            <div
              onClick={() => navigateToComplexity(timeComplexities.delete)}
              className="flex flex-col p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-blue-500 hover:scale-[1.03] transition-all cursor-pointer shadow-sm group"
            >
              <span className="font-semibold text-[var(--color-text-secondary)] mb-2 text-center text-sm uppercase tracking-wider group-hover:text-blue-300">Deletion</span>
              <span className="font-mono font-bold text-white bg-blue-500/20 px-3 py-2 rounded-lg text-center text-lg group-hover:bg-blue-500/30">{timeComplexities.delete}</span>
            </div>
          </div>
        </div>

        {/* Main Article Content */}
        <div className="bg-[var(--color-surface-glass)] rounded-2xl border border-[var(--color-border-subtle)] shadow-xl p-8 md:p-12">
          <article className="prose prose-invert prose-blue max-w-none prose-headings:text-indigo-300 prose-a:text-blue-400 prose-lg prose-img:rounded-xl">
            {content}
          </article>
        </div>

        {/* Code Implementations */}
        <section id="code-examples" tabIndex={-1} className="bg-[var(--color-surface-glass)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden shadow-xl">
          <div className="border-b border-[var(--color-border-subtle)] bg-black/20 p-4">
            <h2 className="text-xl font-bold flex items-center gap-2 m-0">
              <Code2 className="text-indigo-400" size={24} />
              Implementation
            </h2>
          </div>

          <div className="flex border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)] overflow-x-auto custom-scrollbar">
            {(['python', 'javascript', 'java', 'cpp'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  language === lang
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                    : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                {lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>

          <div className="h-[500px]">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={currentCode}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                fontFamily: "'JetBrains Mono', monospace",
                readOnly: true,
                padding: { top: 24, bottom: 24 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <button
            onClick={() => navigate(`/quiz?topic=${encodeURIComponent(title === 'Array' ? 'Arrays' : title === 'Stack' ? 'Stacks' : title === 'Linked List' ? 'Linked Lists' : title === 'Binary Tree' ? 'Binary Trees' : title === 'AVL Tree' ? 'AVL Trees' : title === 'Graph' ? 'Graphs' : title === 'Queue' ? 'Queues' : title === 'Hash Table' ? 'Hash Tables' : title)}`)}
            className="flex items-center justify-between p-8 bg-gradient-to-br from-[var(--color-surface-glass)] to-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group shadow-xl"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-inner">
                <HelpCircle size={32} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Take a Quiz</h3>
                <p className="text-base text-[var(--color-text-muted)]">Test your knowledge on {title}s.</p>
              </div>
            </div>
            <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-x-[-15px] group-hover:translate-x-0 transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </div>
          </button>
          <button
            onClick={() => navigate(`/coding?topic=${encodeURIComponent(title)}`)}
            className="flex items-center justify-between p-8 bg-gradient-to-br from-[var(--color-surface-glass)] to-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group shadow-xl"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-inner">
                <Terminal size={32} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Practice Coding</h3>
                <p className="text-base text-[var(--color-text-muted)]">Solve {title} coding problems.</p>
              </div>
            </div>
            <div className="text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-[-15px] group-hover:translate-x-0 transition-all">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
