import DataStructurePageLayout from './components/DataStructurePageLayout';

export default function StackPage() {
  return (
    <DataStructurePageLayout
      type="stack"
      title="Stack"
      visualizerDsName="Stack"
      description="A LIFO (Last-In-First-Out) data structure where elements are added and removed from the top. Think of a stack of plates."
      difficulty="Beginner"
      timeComplexities={{"access":"O(n)","search":"O(n)","insert":"O(1)","delete":"O(1)"}}
      content={
      <>
        <section>
          <h2>What is a Stack?</h2>
          <p>Stack is a linear data structure which follows a particular order in which the operations are performed. The order is LIFO(Last In First Out).</p>
          
          <div className="not-prose bg-[var(--color-bg-tertiary)] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-around gap-12 shadow-inner my-10 overflow-x-auto w-full border border-[var(--color-border-subtle)]">
            <div className="relative pt-12 pb-4 px-12 border-x-4 border-b-4 border-indigo-500/50 rounded-b-xl flex flex-col-reverse gap-2 min-w-[200px]">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 flex justify-between">
                  <div className="flex flex-col items-center text-emerald-400 -translate-x-12 -translate-y-6">
                     <span className="font-bold mb-1">PUSH</span>
                     <div className="w-0.5 h-8 bg-emerald-400"></div>
                     <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-emerald-400"></div>
                  </div>
                  <div className="flex flex-col items-center text-rose-400 translate-x-12 -translate-y-6">
                     <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-rose-400"></div>
                     <div className="w-0.5 h-8 bg-rose-400"></div>
                     <span className="font-bold mt-1">POP</span>
                  </div>
               </div>
               
               {[10, 20, 30].map((val, idx) => (
                  <div key={idx} className={`w-full py-4 text-center font-bold text-xl rounded shadow bg-[var(--color-bg-primary)] border border-indigo-500/30 ${idx === 2 ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400' : 'text-gray-300'}`}>
                     {val}
                     {idx === 2 && <span className="absolute left-[calc(100%+1rem)] top-[6.5rem] flex items-center text-indigo-400 text-sm font-bold tracking-widest uppercase"><div className="w-8 h-0.5 bg-indigo-400 mr-2 relative"><div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-indigo-400"></div></div>TOP</span>}
                  </div>
               ))}
            </div>
          </div>
        </section>

        <section>
          <h2>Basic Operations</h2>
          <ul>
            <li><strong>Push:</strong> Adds an item in the stack.</li>
            <li><strong>Pop:</strong> Removes an item from the stack.</li>
            <li><strong>Peek or Top:</strong> Returns top element of stack.</li>
            <li><strong>isEmpty:</strong> Returns true if stack is empty, else false.</li>
          </ul>
        </section>
      </>
    }
    />
  );
}