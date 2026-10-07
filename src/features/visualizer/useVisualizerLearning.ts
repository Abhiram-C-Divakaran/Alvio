import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useProgressStore from '../../stores/useProgressStore';
import { visualizerKey, type VisualizerUpdate } from '../../services/visualizerProgress';
import { activeLearningSeconds } from '../../services/progressActivity';

/** Flush small real-time deltas. Blur/hidden time and idle gaps are never accrued. */
export function useVisualizerLearning(owner: string, name: string, variant: string, totalSteps: number, step: number, enabled: boolean) {
  const save = useProgressStore(s => s.saveVisualizerProgress);
  // Time flushes update the dashboard, not the expensive scene tree.
  const module = useProgressStore(useShallow(s => {
    const value = s.progress?.userId === owner ? s.progress.visualizerModules?.[visualizerKey(name, variant)] : undefined;
    return { completed: !!value?.completed, totalSteps: value?.totalSteps || totalSteps, completedStepCount: value?.completedSteps.length || 0 };
  }));
  const latest = useRef({ name, variant, totalSteps });
  latest.current = { name, variant, totalSteps };
  useEffect(() => {
    if (enabled) void save(owner, { name, variant, totalSteps, step });
  }, [enabled, owner, name, variant, totalSteps, step, save]);
  useEffect(() => {
    if (!enabled) return;
    let last = performance.now(), interacted = last, pending = 0;
    let active = !document.hidden && document.hasFocus();
    const sample = () => {
      const now = performance.now();
      // A stalled/suspended process cannot turn a long scheduling gap into study time.
      pending += activeLearningSeconds(last, now, interacted, active);
      last = now;
    };
    const flush = () => {
      sample();
      if (pending > 0) { void save(owner, { ...latest.current, seconds: pending }); pending = 0; }
    };
    const activity = () => { sample(); interacted = performance.now(); };
    const visibility = () => { flush(); active = !document.hidden && document.hasFocus(); last = performance.now(); };
    const tick = setInterval(() => { sample(); if (pending >= 10) flush(); }, 1000);
    for (const event of ['pointerdown', 'pointermove', 'keydown', 'wheel']) window.addEventListener(event, activity, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('focus', visibility); window.addEventListener('blur', visibility);
    window.addEventListener('pagehide', flush);
    return () => {
      clearInterval(tick); flush();
      for (const event of ['pointerdown', 'pointermove', 'keydown', 'wheel']) window.removeEventListener(event, activity);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('focus', visibility); window.removeEventListener('blur', visibility);
      window.removeEventListener('pagehide', flush);
    };
  }, [enabled, owner, save]);
  const record = (event: Partial<VisualizerUpdate>) => { if (enabled) void save(owner, { name, variant, totalSteps, ...event }); };
  return { module, record };
}
