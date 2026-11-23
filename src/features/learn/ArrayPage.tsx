import DataStructurePageLayout from './components/DataStructurePageLayout';
import ArrayCurriculum from './components/ArrayCurriculum';

export default function ArrayPage() {
  return (
    <DataStructurePageLayout
      type="array"
      title="Array"
      visualizerDsName="Array"
      description="A collection of items of the same variable type that are stored at contiguous memory locations. It is one of the most popular and simple data structures used in programming."
      difficulty="Beginner"
      timeComplexities={{"access":"O(1)","search":"O(n)","insert":"O(n)","delete":"O(n)"}}
      content={
        <>
          <section>
            <h2>Basic Terminologies of Array</h2>
            <ul>
              <li><strong>Array Element:</strong> Elements are items stored in an array.</li>
              <li><strong>Array Index:</strong> Elements are accessed by their indexes. Indexes in most programming languages start from 0.</li>
            </ul>
          </section>

          <section>
            <h2>Memory Representation of Array</h2>
            <p>
              In an array, all the elements or their references are stored in contiguous memory locations. This allows for efficient access and manipulation of elements.
            </p>
            
            <div className="not-prose bg-[var(--color-bg-tertiary)] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-around gap-12 shadow-inner my-10 overflow-x-auto w-full border border-[var(--color-border-subtle)]">
              
              <div className="flex flex-col items-center min-w-[300px]">
                 <h3 className="text-white font-bold text-xl mb-6">Primitive Array</h3>
                 <p className="text-gray-300 font-mono text-sm mb-4 bg-black/40 px-3 py-1 rounded">int[] arr = {'{'}10, 20, 30, 40{'}'}</p>
                 <div className="flex items-center">
                   <div className="mr-4 text-gray-400 font-semibold text-right">arr <br/><span className="text-3xl leading-none font-light">↳</span></div>
                   <div className="flex border-2 border-indigo-500/50 bg-[var(--color-surface-glass)] rounded-sm overflow-hidden shadow-sm">
                     <div className="w-16 h-16 border-r-2 border-indigo-500/50 flex items-center justify-center text-white font-bold text-2xl relative">
                       10
                       <span className="absolute -bottom-8 text-xs text-indigo-300 font-mono tracking-tighter">0x1000</span>
                     </div>
                     <div className="w-16 h-16 border-r-2 border-indigo-500/50 flex items-center justify-center text-white font-bold text-2xl relative">
                       20
                       <span className="absolute -bottom-8 text-xs text-indigo-300 font-mono tracking-tighter">0x1004</span>
                     </div>
                     <div className="w-16 h-16 border-r-2 border-indigo-500/50 flex items-center justify-center text-white font-bold text-2xl relative">
                       30
                       <span className="absolute -bottom-8 text-xs text-indigo-300 font-mono tracking-tighter">0x1008</span>
                     </div>
                     <div className="w-16 h-16 flex items-center justify-center text-white font-bold text-2xl relative">
                       40
                       <span className="absolute -bottom-8 text-xs text-indigo-300 font-mono tracking-tighter">0x100C</span>
                     </div>
                   </div>
                 </div>
                 <p className="mt-14 text-sm text-gray-400 text-center max-w-[200px] leading-tight font-medium">Primitive arrays store the values directly in the memory.</p>
              </div>

              <div className="w-px h-64 bg-gray-700 hidden md:block"></div>

              <div className="flex flex-col items-center min-w-[350px]">
                 <h3 className="text-white font-bold text-xl mb-6">Object Array</h3>
                 <div className="text-gray-300 font-mono text-sm mb-4 text-center bg-black/40 px-4 py-2 rounded">
                    <p>String[] arr = new String[3]</p>
                    <p>arr[0] = "Lakshit"</p>
                    <p>arr[1] = "Rahul"</p>
                    <p>arr[2] = "Pankaj"</p>
                 </div>
                 <div className="flex items-center">
                   <div className="mr-4 text-gray-400 font-semibold text-right">arr <br/><span className="text-3xl leading-none font-light">↳</span></div>
                   <div className="flex border-2 border-blue-500/50 bg-[var(--color-surface-glass)] rounded-sm overflow-hidden shadow-sm">
                     <div className="w-20 h-12 border-r-2 border-blue-500/50 flex items-center justify-center relative">
                        <div className="absolute -bottom-7 text-blue-400 text-xl leading-none">↓</div>
                     </div>
                     <div className="w-20 h-12 border-r-2 border-blue-500/50 flex items-center justify-center relative">
                        <div className="absolute -bottom-7 text-blue-400 text-xl leading-none">↓</div>
                     </div>
                     <div className="w-20 h-12 flex items-center justify-center relative">
                        <div className="absolute -bottom-7 text-blue-400 text-xl leading-none">↓</div>
                     </div>
                   </div>
                 </div>
                 <div className="flex gap-4 mt-10 ml-8">
                    <div className="border-2 border-blue-500/50 bg-[var(--color-bg-primary)] px-4 py-1.5 text-white font-medium rounded shadow-sm text-sm">Lakshit</div>
                    <div className="border-2 border-blue-500/50 bg-[var(--color-bg-primary)] px-4 py-1.5 text-white font-medium rounded shadow-sm text-sm">Rahul</div>
                    <div className="border-2 border-blue-500/50 bg-[var(--color-bg-primary)] px-4 py-1.5 text-white font-medium rounded shadow-sm text-sm">Pankaj</div>
                 </div>
                 <p className="mt-8 text-sm text-gray-400 text-center max-w-[280px] leading-tight font-medium">Each element of the object array stores a reference to a separate string object.</p>
              </div>

            </div>
          </section>

          <section>
            <h2>Declaration of Array</h2>
            <p>Arrays can be declared in various ways in different languages. For better illustration, below are some language-specific array declarations:</p>
            <pre><code>{`// In C++\nint arr[5];\n\n// In Java\nint[] arr = new int[5];\n\n// In Python\narr = []\n\n// In JavaScript\nlet arr = [];`}</code></pre>
          </section>

          <section>
            <h2>Initialization of Array</h2>
            <p>Arrays can be initialized in different ways in different languages. Below are some language-specific array initializations:</p>
            <pre><code>{`// In C++\nint arr[5] = {1, 2, 3, 4, 5};\n\n// In Java\nint[] arr = {1, 2, 3, 4, 5};\n\n// In Python\narr = [1, 2, 3, 4, 5]\n\n// In JavaScript\nlet arr = [1, 2, 3, 4, 5];`}</code></pre>
          </section>

          <section>
            <h2>Types of Arrays on the basis of Size</h2>
            
            <h3>1. Fixed Sized Arrays</h3>
            <ul>
              <li>We cannot alter or update the size of this array. Here only a fixed size (i.e. the size that is mentioned in square brackets <strong>[]</strong>) of memory will be allocated for storage.</li>
              <li>In case we don't know the size of the array then if we declare a larger size and store a lesser number of elements, it will result in a wastage of memory.</li>
            </ul>

            <h3>2. Dynamic Sized Arrays</h3>
            <ul>
              <li>The size of the array changes as per user requirements during execution of code so the coders do not have to worry about sizes.</li>
              <li>They can add and remove elements as per the need. The memory is mostly dynamically allocated and de-allocated in these arrays.</li>
            </ul>
          </section>

          <section>
            <h2>Two-Dimensional Array (2-D Array or Matrix)</h2>
            <p>2-D Multidimensional arrays can be considered as an array of arrays or as a matrix consisting of rows and columns.</p>
            
            <div className="not-prose bg-[var(--color-bg-tertiary)] rounded-2xl p-8 flex flex-col items-center shadow-inner my-10 border border-[var(--color-border-subtle)]">
               <h4 className="text-white font-bold text-2xl mb-8 text-center">Two-Dimensional Array<br/>(2-D Array or Matrix)</h4>
               <div className="relative">
                  <div className="flex mb-3">
                     <div className="w-12"></div>
                     <div className="flex gap-2 items-center">
                        <span className="text-sm font-bold text-indigo-400 mr-2 tracking-widest uppercase">Columns</span>
                        <div className="h-0.5 w-32 bg-indigo-500 relative">
                           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-indigo-500"></div>
                        </div>
                     </div>
                  </div>
                  <div className="flex text-center mb-2 font-bold text-xl text-gray-300">
                     <div className="w-14"></div>
                     <div className="w-16">0</div>
                     <div className="w-16">1</div>
                     <div className="w-16">2</div>
                  </div>
                  <div className="flex">
                     <div className="flex flex-col justify-between items-center w-10 mr-4 relative">
                        <span className="text-sm font-bold text-indigo-400 absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 tracking-widest uppercase">Rows</span>
                        <div className="w-0.5 h-full bg-indigo-500 relative ml-4">
                           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-indigo-500"></div>
                        </div>
                     </div>
                     <div className="flex flex-col text-center font-bold text-xl text-gray-300 mr-4">
                        <div className="h-16 flex items-center">0</div>
                        <div className="h-16 flex items-center">1</div>
                        <div className="h-16 flex items-center">2</div>
                     </div>
                     <div className="border-2 border-indigo-500/50 bg-[var(--color-bg-primary)] flex flex-col shadow-sm rounded-sm">
                        <div className="flex border-b border-indigo-500/50">
                           <div className="w-16 h-16 flex items-center justify-center border-r border-indigo-500/50 text-white font-mono text-base bg-indigo-500/20">a<sub>00</sub></div>
                           <div className="w-16 h-16 flex items-center justify-center border-r border-indigo-500/50 text-white font-mono text-base">a<sub>01</sub></div>
                           <div className="w-16 h-16 flex items-center justify-center text-white font-mono text-base bg-indigo-500/20">a<sub>02</sub></div>
                        </div>
                        <div className="flex border-b border-indigo-500/50">
                           <div className="w-16 h-16 flex items-center justify-center border-r border-indigo-500/50 text-white font-mono text-base">a<sub>10</sub></div>
                           <div className="w-16 h-16 flex items-center justify-center border-r border-indigo-500/50 text-white font-mono text-base bg-indigo-500/20">a<sub>11</sub></div>
                           <div className="w-16 h-16 flex items-center justify-center text-white font-mono text-base">a<sub>12</sub></div>
                        </div>
                        <div className="flex">
                           <div className="w-16 h-16 flex items-center justify-center border-r border-indigo-500/50 text-white font-mono text-base bg-indigo-500/20">a<sub>20</sub></div>
                           <div className="w-16 h-16 flex items-center justify-center border-r border-indigo-500/50 text-white font-mono text-base">a<sub>21</sub></div>
                           <div className="w-16 h-16 flex items-center justify-center text-white font-mono text-base bg-indigo-500/20">a<sub>22</sub></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </section>

          <ArrayCurriculum />
        </>
    }
    />
  );
}