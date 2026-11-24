import DataStructurePageLayout from './components/DataStructurePageLayout';

export default function HashTablePage() {
  return (
    <DataStructurePageLayout
      type="hash-table"
      title="Hash Table"
      visualizerDsName="Hash Table"
      description="Maps keys to values using a hash function. Provides extremely fast average-case lookups and insertions."
      difficulty="Intermediate"
      timeComplexities={{"access":"N/A","search":"O(1)","insert":"O(1)","delete":"O(1)"}}
      content={
      <>
        <section>
          <h2>What is a Hash Table?</h2>
          <p>Hash Table is a data structure which stores data in an associative manner. Access of data becomes very fast if we know the index of the desired data.</p>
          
          <div className="not-prose bg-[var(--color-bg-tertiary)] rounded-2xl p-8 flex flex-col items-center shadow-inner my-10 overflow-x-auto w-full border border-[var(--color-border-subtle)]">
             <div className="flex items-center gap-8 w-full max-w-3xl justify-center">
                
                {/* Keys */}
                <div className="flex flex-col gap-4">
                   <div className="px-4 py-2 bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/50 rounded text-center">"apple"</div>
                   <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/50 rounded text-center">"banana"</div>
                   <div className="px-4 py-2 bg-rose-500/20 text-rose-300 font-bold border border-rose-500/50 rounded text-center">"grape"</div>
                </div>

                {/* Hash Function */}
                <div className="flex items-center gap-4">
                   <div className="w-12 h-0.5 bg-gray-500"></div>
                   <div className="px-6 py-12 bg-[var(--color-bg-primary)] border-2 border-gray-500 rounded-lg shadow-lg flex flex-col items-center text-gray-300 font-mono text-sm">
                      <span className="font-bold text-white mb-2 text-base">Hash(key)</span>
                      key % n
                   </div>
                   <div className="w-12 h-0.5 bg-gray-500"></div>
                </div>

                {/* Buckets */}
                <div className="flex flex-col border-2 border-gray-600 bg-[var(--color-bg-primary)] rounded">
                   {[0, 1, 2, 3, 4].map(idx => (
                      <div key={idx} className="flex border-b border-gray-600 last:border-b-0 h-12 min-w-[120px]">
                         <div className="w-8 flex items-center justify-center border-r border-gray-600 font-mono text-gray-400 bg-black/40">{idx}</div>
                         <div className="flex-1 flex items-center px-3 font-bold">
                            {idx === 1 && <span className="text-indigo-300">apple</span>}
                            {idx === 3 && <span className="text-emerald-300">banana</span>}
                            {idx === 4 && <span className="text-rose-300">grape</span>}
                         </div>
                      </div>
                   ))}
                </div>

             </div>
          </div>
        </section>

        <section>
          <h2>Collision Handling</h2>
          <ul>
            <li><strong>Chaining:</strong> Make each cell of the hash table point to a linked list.</li>
            <li><strong>Open Addressing:</strong> All elements are stored in the hash table itself (Linear Probing, etc).</li>
          </ul>
        </section>
      </>
    }
    />
  );
}