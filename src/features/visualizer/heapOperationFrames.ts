import type { HeapStructure } from '../../types/dataStructures';

/** Presentation-only replay. The existing operation functions remain the source of the final state. */
export function heapOperationFrames(before: HeapStructure, after: HeapStructure, kind: 'insert' | 'delete', raw: string, index?: number) {
  const frames: { state: HeapStructure; message: string }[] = [];
  const state = structuredClone(after);
  let values = before.nodes.map(n => Number(n.value));
  const better = (a: number, b: number) => before.heapType === 'min' ? a < b : a > b;
  const emit = (message: string, current: number, compared = -1, swap = false) => {
    const snapshot = structuredClone(state);
    snapshot.nodes.forEach((node, i) => { node.value = values[i]; node.state = { highlighted: i === current, active: i === compared, color: swap && (i === current || i === compared) ? '#b168ff' : undefined }; });
    frames.push({ state: snapshot, message });
  };
  let current: number;
  if (kind === 'insert') {
    if (after.nodes.length === before.nodes.length) return frames;
    values.push(Number(raw)); current = values.length - 1;
    emit(`Append ${raw} at index ${current}.`, current);
  } else {
    current = index ?? (raw ? values.findIndex(v => String(v) === String(raw)) : 0);
    if (current < 0 || after.nodes.length === before.nodes.length) return frames;
    const removed = values[current];
    values[current] = values[values.length - 1]; values.pop();
    emit(`Remove ${removed}. Move the last value into index ${current}.`, current);
  }
  while (current > 0 && current < values.length) {
    const parent = Math.floor((current - 1) / 2);
    emit(`Compare ${values[current]} with parent ${values[parent]}.`, current, parent);
    if (!better(values[current], values[parent])) break;
    [values[current], values[parent]] = [values[parent], values[current]];
    emit(`Swap indices ${current} and ${parent}; move upward.`, parent, current, true);
    current = parent;
  }
  if (kind === 'delete') while (current < values.length) {
    let best = current;
    for (const child of [current * 2 + 1, current * 2 + 2]) {
      if (child >= values.length) continue;
      emit(`Compare ${values[best]} with child ${values[child]}.`, best, child);
      if (better(values[child], values[best])) best = child;
    }
    if (best === current) break;
    [values[current], values[best]] = [values[best], values[current]];
    emit(`Swap indices ${current} and ${best}; move downward.`, best, current, true);
    current = best;
  }
  frames.push({ state: after, message: 'Settled. Every parent satisfies the heap property.' });
  return frames;
}
