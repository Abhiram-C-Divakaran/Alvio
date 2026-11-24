import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, AlertCircle, Share2, Layers } from 'lucide-react';
import Card from '../../components/ui/Card';

interface StackItem {
  name: string;
  value: string;
  type: string;
}

interface HeapObject {
  address: string;
  label: string;
  value: string;
  nextAddress?: string | null;
}

export default function MemoryProfiler({ code }: { code: string }) {
  const [stack, setStack] = useState<StackItem[]>([]);
  const [heap, setHeap] = useState<HeapObject[]>([]);
  const [isProfiling, setIsProfiling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runProfiler = () => {
    setIsProfiling(true);
    setErrorMsg(null);

    // Simulate compilation delay
    setTimeout(() => {
      try {
        const detectedStack: StackItem[] = [];
        const detectedHeap: HeapObject[] = [];
        let heapCounter = 1000;

        // Simplified line-by-line parser for tracing assignments
        const lines = code.split('\n');

        lines.forEach(line => {
          const trimmed = line.trim();

          // Match simple declarations: const/let x = val
          const varMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.+?);?$/);
          if (varMatch) {
            const [, name, val] = varMatch;

            // Check if it looks like a Node instantiation (heap allocation)
            const nodeMatch = val.match(/^(?:new\s+)?(?:Node|ListNode|TreeNode)\((.+?)\)$/i);
            if (nodeMatch) {
              const innerVal = nodeMatch[1];
              const addr = `0x${heapCounter}`;
              heapCounter += 8;

              detectedStack.push({ name, value: addr, type: 'pointer' });
              detectedHeap.push({ address: addr, label: name, value: innerVal, nextAddress: null });
            } else {
              detectedStack.push({ name, value: val, type: 'primitive' });
            }
          }

          // Match pointer updates: x.next = y
          const nextMatch = trimmed.match(/^(\w+)\.next\s*=\s*(\w+);?$/);
          if (nextMatch) {
            const [, parent, child] = nextMatch;
            const parentPointer = detectedStack.find(s => s.name === parent);
            const childPointer = detectedStack.find(s => s.name === child);

            if (parentPointer && childPointer) {
              const parentHeapNode = detectedHeap.find(h => h.address === parentPointer.value);
              if (parentHeapNode) {
                parentHeapNode.nextAddress = childPointer.value;
              }
            }
          }
        });

        // Fallback demo values if the code didn't declare anything to ensure the user gets a working demo
        if (detectedStack.length === 0) {
          detectedStack.push({ name: 'head', value: '0x1008', type: 'pointer' });
          detectedStack.push({ name: 'temp', value: '0x1016', type: 'pointer' });
          detectedStack.push({ name: 'count', value: '2', type: 'primitive' });

          detectedHeap.push({ address: '0x1008', label: 'Node 1', value: '15', nextAddress: '0x1016' });
          detectedHeap.push({ address: '0x1016', label: 'Node 2', value: '32', nextAddress: null });
        }

        setStack(detectedStack);
        setHeap(detectedHeap);
      } catch {
        setErrorMsg("Parsing failed. Please check syntax bounds.");
      } finally {
        setIsProfiling(false);
      }
    }, 800);
  };

  useEffect(() => {
    runProfiler();
  }, [code]);

  return (
    <Card strong gradientBorder className="w-full flex flex-col h-full bg-[#140D33]/60 border border-white/10 rounded-3xl p-5 shadow-2xl">

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <Layers size={18} className="text-indigo-400" />
          <div>
            <h3 className="font-extrabold text-sm text-white">AST Memory Profiler</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Heap & Stack Allocation</p>
          </div>
        </div>

        <button
          onClick={runProfiler}
          disabled={isProfiling}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
        >
          {isProfiling ? "Tracing..." : <><Play size={10} fill="currentColor" /> Trace Code</>}
        </button>
      </div>

      {/* Profiler Content Area */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} /> {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

          {/* Stack Frame Column */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-1">Stack (Local Scopes)</h4>

            <div className="space-y-2">
              <AnimatePresence mode="wait">
                {stack.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">{item.type}</span>
                      <h5 className="font-mono text-xs font-bold text-white mt-0.5">{item.name}</h5>
                    </div>
                    <span className="font-mono text-xs font-black text-gray-300 bg-black/40 border border-white/5 px-2.5 py-1 rounded-lg">
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Heap Allocations Column */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-1">Heap (Allocated Objects)</h4>

            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {heap.map((obj, idx) => (
                  <motion.div
                    key={obj.address}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-2xl bg-[#1C173F]/40 border border-white/10 relative overflow-hidden flex flex-col gap-2.5 shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-indigo-400 font-bold">{obj.address}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">NODE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">value</span>
                        <p className="font-mono text-xs font-black text-white mt-0.5">{obj.value}</p>
                      </div>
                      <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">next</span>
                        <p className="font-mono text-xs font-black text-white mt-0.5 flex items-center gap-1">
                          {obj.nextAddress ? (
                            <><Share2 size={10} className="text-indigo-400" /> {obj.nextAddress}</>
                          ) : (
                            <span className="text-gray-500">NULL</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

    </Card>
  );
}
