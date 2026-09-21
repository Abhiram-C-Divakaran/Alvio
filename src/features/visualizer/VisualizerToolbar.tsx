import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface VisualizerToolbarProps {
  onInsert: (val: string, idx?: number) => void;
  onDelete: (val: string, idx?: number) => void;
  disabled?: boolean;
  activeDs: string;
}

export default function VisualizerToolbar({ onInsert, onDelete, disabled = false, activeDs }: VisualizerToolbarProps) {
  const [inputValue, setInputValue] = useState('');
  const [idxValue, setIdxValue] = useState('');

  const handleAction = (action: 'insert' | 'delete') => {
    if (!inputValue.trim() && action === 'insert') return;

    const idx = idxValue.trim() !== '' ? parseInt(idxValue, 10) : undefined;

    if (action === 'insert') onInsert(inputValue, idx);
    if (action === 'delete') onDelete(inputValue || '', idx);

    setInputValue('');
    setIdxValue('');
  };

  let insertLabel = 'Insert';
  let deleteLabel = 'Delete';
  let showIdx = false;

  switch (activeDs) {
    case 'Stack':
      insertLabel = 'Push';
      deleteLabel = 'Pop';
      break;
    case 'Queue':
      insertLabel = 'Enqueue';
      deleteLabel = 'Dequeue';
      break;
    case 'Array':
    case 'Linked List':
      showIdx = true;
      break;
    case 'Graph':
      insertLabel = 'Add Node';
      deleteLabel = 'Rem Node';
      break;
  }

  return (
    <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-md border border-[var(--color-border-subtle)] rounded-xl p-3 shadow-xl">
      <input
        type="text"
        aria-label="Operation value"
        placeholder="Value (e.g. 42)"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={disabled}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 w-32 placeholder:text-gray-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAction('insert');
        }}
      />

      {showIdx && (
        <input
          type="text"
          aria-label="Operation index (optional)"
          placeholder="Idx (opt)"
          value={idxValue}
          onChange={(e) => setIdxValue(e.target.value)}
          disabled={disabled}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 w-24 placeholder:text-gray-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAction('insert');
          }}
        />
      )}

      <div className="h-6 w-px bg-white/10 mx-1" />

      <button
        onClick={() => handleAction('insert')}
        disabled={disabled || !inputValue.trim()}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50 text-sm font-medium"
      >
        <Plus size={16} /> {insertLabel}
      </button>

      <button
        onClick={() => handleAction('delete')}
        disabled={disabled}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm font-medium"
      >
        <Minus size={16} /> {deleteLabel}
      </button>
    </div>
  );
}
