import DataStructurePageLayout from './components/DataStructurePageLayout';

export default function QueuePage() {
  return (
    <DataStructurePageLayout
      type="queue"
      title="Queue"
      visualizerDsName="Queue"
      description="A FIFO (First-In-First-Out) data structure. Elements are added to the back (enqueue) and removed from the front (dequeue)."
      difficulty="Beginner"
      timeComplexities={{"access":"O(n)","search":"O(n)","insert":"O(1)","delete":"O(1)"}}
      content={
      <>
        <section>
          <h2>What is a Queue?</h2>
          <p>A Queue is a linear structure which follows a particular order in which the operations are performed. The order is First In First Out (FIFO).</p>
          
          <div className="not-prose bg-[var(--color-bg-tertiary)] rounded-2xl p-8 flex flex-col items-center justify-around gap-12 shadow-inner my-10 overflow-x-auto w-full border border-[var(--color-border-subtle)]">
             <div className="flex items-center gap-2 mt-8">
                
                {/* Enqueue */}
                <div className="flex flex-col items-center text-emerald-400 mr-4">
                   <span className="font-bold mb-2">ENQUEUE</span>
                   <div className="flex items-center">
                      <div className="w-12 h-1 bg-emerald-400"></div>
                      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-emerald-400"></div>
                   </div>
                </div>

                {/* Queue Body */}
                <div className="flex border-y-4 border-indigo-500/50 py-2 gap-2 relative min-w-[300px] justify-center px-4">
                   <div className="absolute -top-10 left-6 text-indigo-400 font-bold text-sm tracking-widest uppercase flex flex-col items-center">
                     REAR
                     <div className="w-0.5 h-4 bg-indigo-400 mt-1"></div>
                   </div>
                   <div className="absolute -top-10 right-6 text-indigo-400 font-bold text-sm tracking-widest uppercase flex flex-col items-center">
                     FRONT
                     <div className="w-0.5 h-4 bg-indigo-400 mt-1"></div>
                   </div>

                   {[40, 30, 20, 10].map((val, idx) => (
                      <div key={idx} className="w-16 h-16 flex items-center justify-center font-bold text-xl rounded shadow bg-[var(--color-bg-primary)] border border-indigo-500/30 text-gray-200">
                         {val}
                      </div>
                   ))}
                </div>

                {/* Dequeue */}
                <div className="flex flex-col items-center text-rose-400 ml-4">
                   <span className="font-bold mb-2">DEQUEUE</span>
                   <div className="flex items-center">
                      <div className="w-12 h-1 bg-rose-400"></div>
                      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-rose-400"></div>
                   </div>
                </div>

             </div>
          </div>
        </section>

        <section>
          <h2>Basic Operations</h2>
          <ul>
            <li><strong>Enqueue:</strong> Adds an item to the queue.</li>
            <li><strong>Dequeue:</strong> Removes an item from the queue.</li>
            <li><strong>Front:</strong> Get the front item from queue.</li>
            <li><strong>Rear:</strong> Get the last item from queue.</li>
          </ul>
        </section>
      </>
    }
    />
  );
}