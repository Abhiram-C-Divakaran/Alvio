// ============================================================
// Workspace Page — Data Structure Visualizer
// ============================================================
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useLocation } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Editor from '@monaco-editor/react';
import useVisualizationStore from '../../stores/useVisualizationStore';
import { createDefaultStructure, insertValue, deleteValue, searchValue, structureMeta } from './dataStructureOps';
import Visualization3D from './Visualization3D';
import Visualization2D from './Visualization2D';
import AlgorithmsWorkspace from './AlgorithmsWorkspace';
import TutorialOverlay from './TutorialOverlay';
import { tutorialScripts } from '../../data/tutorialScripts';
import { codeSnippets } from './codeSnippets';
import MemoryProfiler from './MemoryProfiler';
import type { DataStructureType } from '../../types/dataStructures';
import {
  Rows3,
  Link2,
  Layers3,
  ArrowRightLeft,
  GitBranch,
  Network,
  Share2,
  Hash,
  Box,
  Code2,
  RotateCcw,
  GraduationCap,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';

const structureList: { type: DataStructureType; icon: React.ReactNode }[] = [
  { type: 'array', icon: <Rows3 size={20} /> },
  { type: 'linked-list', icon: <Link2 size={20} /> },
  { type: 'stack', icon: <Layers3 size={20} /> },
  { type: 'queue', icon: <ArrowRightLeft size={20} /> },
  { type: 'binary-tree', icon: <GitBranch size={20} /> },
  { type: 'avl-tree', icon: <Network size={20} /> },
  { type: 'graph', icon: <Share2 size={20} /> },
  { type: 'hash-table', icon: <Hash size={20} /> },
];

export default function WorkspacePage() {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');
  const lessonDraft=useRef(useLocation().state as {lessonCode?:string;lessonLanguage?:'python'|'javascript'|'java'|'cpp'}|null);

  const { activeStructureType, setActiveStructure, structure, setStructure } = useVisualizationStore();
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [activeTab, setActiveTab] = useState<'viz' | 'code' | 'split'>(currentTab==='code'?'code':'split');
  const [value, setValue] = useState('');
  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [language, setLanguage] = useState<'python' | 'javascript' | 'java' | 'cpp'>(lessonDraft.current?.lessonLanguage||'python');
  const [editorCode, setEditorCode] = useState('');

  // Sync editor code whenever active tab, structure or language changes
  useEffect(() => {
    const snippet = codeSnippets[activeStructureType]?.[language] || codeSnippets[activeStructureType]?.['python'] || '';
    setEditorCode(lessonDraft.current?.lessonCode||snippet);
    lessonDraft.current=null;
  }, [activeStructureType, language]);

  // Seed a sample structure whenever the active type changes (or on first load)
  useEffect(() => {
    if (!structure || structure.type !== activeStructureType) {
      setStructure(createDefaultStructure(activeStructureType));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStructureType]);

  if (currentTab === 'algorithms') {
    return <AlgorithmsWorkspace viewMode={viewMode} />;
  }

  const meta = structureMeta[activeStructureType];

  const handleInsert = (val: string = value.trim()) => {
    if (!structure || !val) return;
    setStructure(insertValue(structure, val));
    setValue('');
  };

  const handleDelete = (val: string = value.trim()) => {
    if (!structure) return;
    setStructure(deleteValue(structure, val || undefined));
    setValue('');
  };

  const handleSearch = (val: string = value.trim()) => {
    if (!structure || !val) return;
    setStructure(searchValue(structure, val));
  };

  const handleReset = () => setStructure(createDefaultStructure(activeStructureType));

  const handleTutorialAction = (actionType: 'insert' | 'delete' | 'search', val: number) => {
    const stringVal = val.toString();
    if (actionType === 'insert') handleInsert(stringVal);
    if (actionType === 'delete') handleDelete(stringVal);
    if (actionType === 'search') handleSearch(stringVal);
  };

  // Convert types to match script IDs
  const scriptIdMap: Record<string, string> = {
    'array': 'array',
    'stack': 'stack',
    'queue': 'queue',
    'linked-list': 'linked_list',
    'binary-tree': 'tree',
    'avl-tree': 'tree',
    'graph': 'graph'
  };

  const activeScript = tutorialScripts[scriptIdMap[activeStructureType]];

  return (
    <div className="flex h-full">
      {/* Structure Selector Panel */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-shrink-0 overflow-hidden border-r"
            style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg-secondary)' }}
          >
            <div className="p-4 w-72 h-full overflow-y-auto">
              <h2 className="text-sm font-semibold mb-3 tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                DATA STRUCTURES
              </h2>
              <div className="space-y-1.5">
                {structureList.map((s) => {
                  const isActive = s.type === activeStructureType;
                  const m = structureMeta[s.type];
                  return (
                    <button
                      key={s.type}
                      onClick={() => {
                        setActiveStructure(s.type);
                        setIsTutorialMode(false); // Cancel tutorial if switching
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                        isActive ? '' : 'hover:bg-[var(--color-surface-glass-hover)]'
                      }`}
                      style={{
                        background: isActive ? 'var(--color-surface-glass-active)' : undefined,
                        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      <span
                        className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                          background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          color: isActive ? 'var(--color-accent-primary-light)' : 'var(--color-text-muted)',
                        }}
                      >
                        {s.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{m.label}</p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                          {m.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Controls Bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <Button
               variant="ghost"
               size="sm"
               onClick={() => setShowSidebar(!showSidebar)}
               title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
               className="text-[var(--color-text-muted)] hover:text-white"
            >
              {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </Button>
            <Badge variant="accent">
              <Box size={12} className="mr-1" />
              {meta.label}
            </Badge>

            {/* Tab Switch: Visualization / Code / Split */}
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
              {(['viz', 'code', 'split'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                  style={{
                    background: activeTab === tab ? 'var(--color-surface-glass-active)' : 'transparent',
                    color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  }}
                >
                  {tab === 'viz' ? <Box size={13} /> : tab === 'code' ? <Code2 size={13} /> : <div className="flex gap-0.5"><Box size={11}/><Code2 size={11}/></div>}
                  {tab === 'viz' ? 'Visualization' : tab === 'code' ? 'Code' : 'Split View'}
                </button>
              ))}
            </div>

            {(activeTab === 'viz' || activeTab === 'split') && (
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
                {(['3d', '2d'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold uppercase transition-colors"
                    style={{
                      background: viewMode === mode ? 'var(--gradient-accent)' : 'transparent',
                      color: viewMode === mode ? 'white' : 'var(--color-text-muted)',
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}

            {/* Speed Toggle for Data Structures */}
            {(activeTab === 'viz' || activeTab === 'split') && (
              <div className="flex items-center p-1 rounded-lg bg-[var(--color-bg-tertiary)] ml-2">
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => useVisualizationStore.getState().setSpeed(s)}
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors"
                    style={{
                      background: useVisualizationStore(state => state.timeline.speed) === s ? 'var(--gradient-accent)' : 'transparent',
                      color: useVisualizationStore(state => state.timeline.speed) === s ? 'white' : 'var(--color-text-muted)',
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}

            {(activeTab === 'viz' || activeTab === 'split') && activeScript && !isTutorialMode && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                onClick={() => setIsTutorialMode(true)}
              >
                <GraduationCap size={14} className="mr-1.5" />
                Play Tutorial
              </Button>
            )}
          </div>

          {(activeTab === 'viz' || activeTab === 'split') && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
                placeholder="Enter value..."
                className="input-field w-32 text-sm"
                style={{ height: '34px' }}
                disabled={isTutorialMode}
              />
              <Button variant="primary" size="sm" onClick={() => handleInsert()} disabled={isTutorialMode}>Insert</Button>
              <Button variant="secondary" size="sm" onClick={() => handleDelete()} disabled={isTutorialMode}>Delete</Button>
              <Button variant="ghost" size="sm" onClick={() => handleSearch()} disabled={isTutorialMode}>Search</Button>
              <Button variant="ghost" size="icon" onClick={handleReset} title="Reset" disabled={isTutorialMode}>
                <RotateCcw size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'viz' && (
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence>
              <motion.div
                key={`${activeStructureType}-${viewMode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {viewMode === '3d' ? (
                  <Visualization3D structure={structure} />
                ) : (
                  <Visualization2D structure={structure} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Tutorial Overlay inside Viz Tab */}
            {isTutorialMode && activeScript && (
              <TutorialOverlay
                script={activeScript}
                onClose={() => setIsTutorialMode(false)}
                onPerformAction={handleTutorialAction}
                onClearDataStructure={handleReset}
              />
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-end px-4 py-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="input-field text-xs px-2 py-1"
                style={{ width: '120px', height: '28px' }}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <div className="flex-1" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={codeSnippets[activeStructureType]?.[language] || codeSnippets[activeStructureType]?.['python']}
                options={{
                  readOnly: false,
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: { top: 16 },
                  scrollbar: { vertical: 'auto', horizontal: 'hidden' },
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'split' && (
          <div className="flex-1 flex overflow-hidden w-full">
            <div className="flex-1 relative overflow-hidden border-r border-[var(--color-border-subtle)]">
              <AnimatePresence>
                <motion.div
                  key={`${activeStructureType}-${viewMode}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {viewMode === '3d' ? (
                    <Visualization3D structure={structure} />
                  ) : (
                    <Visualization2D structure={structure} />
                  )}
                </motion.div>
              </AnimatePresence>

              {isTutorialMode && activeScript && (
                <TutorialOverlay
                  script={activeScript}
                  onClose={() => setIsTutorialMode(false)}
                  onPerformAction={handleTutorialAction}
                  onClearDataStructure={handleReset}
                />
              )}
            </div>
            <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
              <div className="flex items-center justify-end px-4 py-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] absolute top-0 right-0 z-10 w-full">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="input-field text-xs px-2 py-1"
                  style={{ width: '120px', height: '28px' }}
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div className="mt-10 flex-1 flex flex-col overflow-hidden h-full">
                <div className="flex-1 min-h-[250px]">
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={editorCode}
                    onChange={(val) => setEditorCode(val || '')}
                    options={{
                      readOnly: false,
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: 'JetBrains Mono, monospace',
                      padding: { top: 12 },
                      scrollbar: { vertical: 'auto', horizontal: 'hidden' },
                    }}
                  />
                </div>
                <div className="h-72 border-t border-[var(--color-border-subtle)] overflow-hidden flex-shrink-0">
                  <MemoryProfiler code={editorCode} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
