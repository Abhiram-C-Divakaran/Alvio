import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronRight, X, GraduationCap, Info } from 'lucide-react';
import type { TutorialScript } from '../../data/tutorialScripts';
import Button from '../../components/ui/Button';
import useVisualizationStore from '../../stores/useVisualizationStore';

interface TutorialOverlayProps {
  script: TutorialScript;
  onClose: () => void;
  onPerformAction: (actionType: 'insert' | 'delete' | 'search', value: number) => void;
  onClearDataStructure: () => void;
}

export default function TutorialOverlay({ script, onClose, onPerformAction, onClearDataStructure }: TutorialOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Clear DS when starting tutorial
  useEffect(() => {
    onClearDataStructure();
  }, [script.id]); // re-run if script id changes

  const executeStep = (index: number) => {
    const step = script.steps[index];
    if (step.actionType !== 'info' && step.value !== undefined) {
      onPerformAction(step.actionType, step.value);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < script.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      executeStep(nextIndex);
    } else {
      setIsFinished(true);
      setAutoPlay(false);
    }
  };

  useEffect(() => {
    // If autoPlay is on, advance automatically after 3.5 seconds
    let timer: ReturnType<typeof setTimeout>;
    if (autoPlay && !isFinished) {
      timer = setTimeout(() => {
        handleNext();
      }, 3500 / (useVisualizationStore.getState().timeline.speed || 1));
    }
    return () => clearTimeout(timer);
  }, [currentStepIndex, autoPlay, isFinished]);

  const step = script.steps[currentStepIndex];

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl"
        >
          <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-strong)] rounded-2xl shadow-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
            {/* Progress Bar background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-surface-glass-hover)]">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / script.steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                    {script.title} Tutorial
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Step {currentStepIndex + 1} of {script.steps.length}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-white transition-colors rounded-lg hover:bg-[var(--color-surface-glass-hover)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-subtle)] p-4 rounded-xl flex items-start gap-3 min-h-[5rem]">
              <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                {step.text}
              </p>
            </div>

            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className="text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-glass)] hover:bg-[var(--color-surface-glass-hover)] text-[var(--color-text-secondary)] transition-colors"
              >
                {autoPlay ? <Pause size={14} className="text-rose-400" /> : <Play size={14} className="text-emerald-400" />}
                {autoPlay ? 'Pause Auto-Play' : 'Auto-Play Tutorial'}
              </button>
              
              <Button 
                variant="primary" 
                onClick={handleNext}
                className="px-5 py-2 text-sm shadow-lg shadow-indigo-500/20"
              >
                Next Step
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
      
      {isFinished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--color-bg-primary)] border border-emerald-500/30 rounded-2xl p-8 text-center max-w-sm shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Tutorial Complete!</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            You've completed the interactive tutorial for {script.title}. You can now experiment freely!
          </p>
          <Button variant="primary" onClick={onClose} className="w-full">
            Return to Workspace
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
