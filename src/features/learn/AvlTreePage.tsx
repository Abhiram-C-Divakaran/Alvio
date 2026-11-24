import DataStructurePageLayout from './components/DataStructurePageLayout';

export default function AVLTreePage() {
  return (
    <DataStructurePageLayout
      type="avl-tree"
      title="AVL Tree"
      visualizerDsName="Binary Tree"
      description="A self-balancing binary search tree. The heights of the two child subtrees of any node differ by at most one, ensuring O(log n) operations."
      difficulty="Advanced"
      timeComplexities={{"access":"O(log n)","search":"O(log n)","insert":"O(log n)","delete":"O(log n)"}}
      content={
      <>
        <section>
          <h2>What is an AVL Tree?</h2>
          <p>AVL tree is a self-balancing Binary Search Tree (BST) where the difference between heights of left and right subtrees cannot be more than one for all nodes. This difference is called the Balance Factor.</p>
          <p className="font-mono bg-black/30 p-4 rounded text-center text-indigo-300">Balance Factor = Height(Left) - Height(Right)</p>
          
          <div className="not-prose bg-[var(--color-bg-tertiary)] rounded-2xl p-8 flex flex-col items-center shadow-inner my-10 overflow-x-auto w-full border border-[var(--color-border-subtle)]">
             <h3 className="text-white font-bold text-xl mb-8">Balanced AVL Tree</h3>
             <div className="flex flex-col items-center relative w-[300px]">
                
                {/* Root */}
                <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] border-2 border-indigo-500/80 shadow-lg flex items-center justify-center text-xl font-bold text-white z-10 relative">
                   10
                   <span className="absolute -top-8 text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 rounded-full border border-emerald-500/30">BF: 0</span>
                </div>

                <svg className="absolute top-8 left-0 w-full h-24" style={{ zIndex: 0 }}>
                   <line x1="150" y1="0" x2="75" y2="80" stroke="var(--color-border-strong)" strokeWidth="2" />
                   <line x1="150" y1="0" x2="225" y2="80" stroke="var(--color-border-strong)" strokeWidth="2" />
                </svg>

                <div className="flex justify-between w-[150px] mt-8 z-10">
                   <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] border-2 border-indigo-500/80 shadow-lg flex items-center justify-center text-xl font-bold text-white relative">
                      5
                      <span className="absolute -left-14 top-4 text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 rounded-full border border-emerald-500/30">BF: 0</span>
                   </div>
                   <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] border-2 border-indigo-500/80 shadow-lg flex items-center justify-center text-xl font-bold text-white relative">
                      15
                      <span className="absolute -right-14 top-4 text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 rounded-full border border-emerald-500/30">BF: 0</span>
                   </div>
                </div>

             </div>
          </div>
        </section>

        <section>
          <h2>Rotations</h2>
          <p>To make sure that the given tree remains AVL after every insertion, we must augment the standard BST insert operation to perform some re-balancing. We perform rotations to balance the tree.</p>
        </section>
      </>
    }
    />
  );
}