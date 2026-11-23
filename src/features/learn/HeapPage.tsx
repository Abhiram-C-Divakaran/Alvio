import DataStructurePageLayout from './components/DataStructurePageLayout';

export default function HeapPage() {
  return (
    <DataStructurePageLayout
      type="heap"
      title="Heap"
      visualizerDsName="Heap"
      description="A specialized complete binary tree that satisfies the heap property. In a Max Heap, every node is larger than its children, while in a Min Heap, every node is smaller."
      difficulty="Intermediate"
      timeComplexities={{"access":"O(1)","search":"O(N)","insert":"O(log N)","delete":"O(log N)"}}
      content={
        <>
          <section>
            <h2>What is a Heap?</h2>
            <p>A Heap is a complete binary tree-based data structure. This means all levels of the tree are completely filled except possibly the lowest level, which is filled from left to right. Heaps are primarily used to implement priority queues.</p>
            
            <div className="not-prose bg-[var(--color-bg-tertiary)] rounded-2xl p-8 flex flex-col items-center shadow-inner my-10 overflow-x-auto w-full border border-[var(--color-border-subtle)]">
              <svg width="400" height="240" viewBox="0 0 400 240" className="w-[400px] h-[240px]">
                {/* Edges */}
                <line x1="200" y1="40" x2="100" y2="120" stroke="var(--color-border-strong)" strokeWidth="2.5" />
                <line x1="200" y1="40" x2="300" y2="120" stroke="var(--color-border-strong)" strokeWidth="2.5" />
                <line x1="100" y1="120" x2="50" y2="200" stroke="var(--color-border-strong)" strokeWidth="2.5" />
                <line x1="100" y1="120" x2="150" y2="200" stroke="var(--color-border-strong)" strokeWidth="2.5" />
                <line x1="300" y1="120" x2="250" y2="200" stroke="var(--color-border-strong)" strokeWidth="2.5" />
                <line x1="300" y1="120" x2="350" y2="200" stroke="var(--color-border-strong)" strokeWidth="2.5" />

                {/* Root Node */}
                <circle cx="200" cy="40" r="22" fill="var(--color-bg-primary)" stroke="#6366f1" strokeWidth="2.5" />
                <text x="200" y="46" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">90</text>
                <text x="200" y="12" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold" letterSpacing="0.05em">MAX ROOT</text>

                {/* Left Child Node */}
                <circle cx="100" cy="120" r="22" fill="var(--color-bg-primary)" stroke="#10b981" strokeWidth="2.5" />
                <text x="100" y="126" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">75</text>
                <text x="65" y="124" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold" letterSpacing="0.05em">PARENT</text>

                {/* Right Child Node */}
                <circle cx="300" cy="120" r="22" fill="var(--color-bg-primary)" stroke="#f43f5e" strokeWidth="2.5" />
                <text x="300" y="126" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">80</text>
                <text x="338" y="124" textAnchor="middle" fill="#fb7185" fontSize="9" fontWeight="bold" letterSpacing="0.05em">PARENT</text>

                {/* Leaf Node 1 */}
                <circle cx="50" cy="200" r="20" fill="var(--color-bg-primary)" stroke="#94a3b8" strokeWidth="2" />
                <text x="50" y="205" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">60</text>
                <text x="50" y="234" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="0.05em">LEAF</text>

                {/* Leaf Node 2 */}
                <circle cx="150" cy="200" r="20" fill="var(--color-bg-primary)" stroke="#94a3b8" strokeWidth="2" />
                <text x="150" y="205" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">45</text>
                <text x="150" y="234" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="0.05em">LEAF</text>

                {/* Leaf Node 3 */}
                <circle cx="250" cy="200" r="20" fill="var(--color-bg-primary)" stroke="#94a3b8" strokeWidth="2" />
                <text x="250" y="205" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">55</text>
                <text x="250" y="234" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="0.05em">LEAF</text>

                {/* Leaf Node 4 */}
                <circle cx="350" cy="200" r="20" fill="var(--color-bg-primary)" stroke="#94a3b8" strokeWidth="2" />
                <text x="350" y="205" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">70</text>
                <text x="350" y="234" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="0.05em">LEAF</text>
              </svg>
            </div>
          </section>

          <section>
            <h2>Heap Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="p-5 rounded-xl bg-slate-900/50 border border-[var(--color-border-subtle)]">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">Max Heap</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  The value of each node is less than or equal to the value of its parent node. The largest key is at the root node.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-slate-900/50 border border-[var(--color-border-subtle)]">
                <h3 className="text-lg font-bold text-indigo-400 mb-2">Min Heap</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  The value of each node is greater than or equal to the value of its parent node. The smallest key is at the root node.
                </p>
              </div>
            </div>
          </section>
        </>
      }
    />
  );
}
