import { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { codeSnippets } from '../workspace/codeSnippets';


interface CodeModalProps {
  open: boolean;
  onClose: () => void;
  activeDs: string;
}

const formatLanguage = (lang: string) => {
  if (lang === 'cplusplus' || lang === 'cpp') return 'C++';
  if (lang === 'javascript') return 'JavaScript';
  return lang.charAt(0).toUpperCase() + lang.slice(1);
};

export default function CodeImplementationsModal({ open, onClose, activeDs }: CodeModalProps) {
  // map activeDs (e.g. 'Linked List') to codeSnippets key (e.g. 'linked-list')
  const mapDsToKey = (ds: string) => {
    const mapping: Record<string, string> = {
      'Bubble Sort': 'bubble-sort',
      'Selection Sort': 'selection-sort',
      'Insertion Sort': 'insertion-sort',
      'Merge Sort': 'merge-sort',
      'Quick Sort': 'quick-sort',
      'Linear Search': 'linear-search',
      'Binary Search': 'binary-search',
      'Array': 'array',
      'Heap': 'heap',
      'BST': 'binary-tree',
      'AVL Tree': 'avl-tree',
      'Linked List': 'linked-list',
      'Stack': 'stack',
      'Queue': 'queue',
      'Binary Tree': 'binary-tree',
      'Graph': 'graph',
      'Hash Table': 'hash-table',
    };
    return mapping[ds] || 'array';
  };

  const key = mapDsToKey(activeDs);
  const snippets = codeSnippets[key as keyof typeof codeSnippets] || {};

  const langs = Object.keys(snippets);
  const [activeLang, setActiveLang] = useState<string>(langs[0] || '');

  // Reset active lang when the data structure changes
  useEffect(() => {
    if (langs.length > 0 && !langs.includes(activeLang)) {
      setActiveLang(langs[0]);
    }
  }, [activeDs, langs, activeLang]);

  return (
    <Modal open={open} onClose={onClose} title={`${activeDs} Implementations`} maxWidth="max-w-4xl">
      <div className="flex flex-col h-[min(600px,75vh)]">
        {activeDs === 'Heap' && <p className="text-sm text-slate-400 mb-3">Min-heap implementations. Reverse the value comparisons to implement a max heap.</p>}
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-[var(--color-border-subtle)] pb-2 overflow-x-auto custom-scrollbar">
          {langs.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
                activeLang === lang
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-white/5'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {formatLanguage(lang)}
            </button>
          ))}
        </div>

        {/* Code Editor (Read Only) */}
        <div className="flex-1 rounded-xl overflow-hidden border border-[var(--color-border-subtle)] bg-[#1e1e1e]">
          {activeLang && snippets[activeLang] ? (
            <pre tabIndex={0} aria-label={`${activeDs} ${formatLanguage(activeLang)} implementation`} style={{height:'100%',overflow:'auto',padding:18,fontSize:13,lineHeight:1.7,color:'#c4d3f5',background:'#061123',whiteSpace:'pre'}}><code>{snippets[activeLang]}</code></pre>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No implementations available for {activeDs}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
