import DataStructurePageLayout from './components/DataStructurePageLayout';

export default function GraphPage() {
  return (
    <DataStructurePageLayout
      type="graph"
      title="Graph"
      visualizerDsName="Graph"
      description="A non-linear data structure consisting of nodes (vertices) and edges. Essential for modeling networks, social connections, and maps."
      difficulty="Advanced"
      timeComplexities={{"access":"O(V + E)","search":"O(V + E)","insert":"O(1)","delete":"O(V + E)"}}
      content={
      <>
        <section>
          <h2>What is a Graph?</h2>
          <p>A Graph is a non-linear data structure consisting of nodes and edges. The nodes are sometimes also referred to as vertices and the edges are lines or arcs that connect any two nodes in the graph.</p>
          
          <div className="not-prose bg-[var(--color-bg-tertiary)] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-around gap-12 shadow-inner my-10 overflow-x-auto w-full border border-[var(--color-border-subtle)]">
             <div className="flex flex-col items-center">
                <h3 className="text-white font-bold text-xl mb-6">Undirected Graph</h3>
                <div className="relative w-48 h-48">
                   <svg className="absolute inset-0 w-full h-full">
                      <line x1="24" y1="24" x2="168" y2="24" stroke="var(--color-border-strong)" strokeWidth="3" />
                      <line x1="168" y1="24" x2="96" y2="168" stroke="var(--color-border-strong)" strokeWidth="3" />
                      <line x1="96" y1="168" x2="24" y2="24" stroke="var(--color-border-strong)" strokeWidth="3" />
                   </svg>
                   <div className="absolute top-0 left-0 w-12 h-12 bg-[var(--color-bg-primary)] border-2 border-indigo-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">A</div>
                   <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--color-bg-primary)] border-2 border-indigo-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">B</div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-[var(--color-bg-primary)] border-2 border-indigo-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">C</div>
                </div>
             </div>

             <div className="w-px h-64 bg-gray-700 hidden md:block"></div>

             <div className="flex flex-col items-center">
                <h3 className="text-white font-bold text-xl mb-6">Directed Graph</h3>
                <div className="relative w-48 h-48">
                   <svg className="absolute inset-0 w-full h-full">
                      <defs>
                        <marker id="arrow" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-border-strong)" />
                        </marker>
                      </defs>
                      <line x1="24" y1="24" x2="168" y2="24" stroke="var(--color-border-strong)" strokeWidth="3" markerEnd="url(#arrow)" />
                      <line x1="168" y1="24" x2="96" y2="168" stroke="var(--color-border-strong)" strokeWidth="3" markerEnd="url(#arrow)" />
                      <line x1="96" y1="168" x2="24" y2="24" stroke="var(--color-border-strong)" strokeWidth="3" markerEnd="url(#arrow)" />
                   </svg>
                   <div className="absolute top-0 left-0 w-12 h-12 bg-[var(--color-bg-primary)] border-2 border-rose-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">X</div>
                   <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--color-bg-primary)] border-2 border-rose-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">Y</div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-[var(--color-bg-primary)] border-2 border-rose-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">Z</div>
                </div>
             </div>
          </div>
        </section>

        <section>
          <h2>Representations</h2>
          <ul>
            <li><strong>Adjacency Matrix:</strong> A 2D array of size V x V.</li>
            <li><strong>Adjacency List:</strong> An array of lists representing connections.</li>
          </ul>
        </section>
      </>
    }
    />
  );
}