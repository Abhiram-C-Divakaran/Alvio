import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import DataStructurePageLayout from './components/DataStructurePageLayout';

export default function BinaryTreePage() {
  return (
    <DataStructurePageLayout
      type="binary-tree"
      title="Binary Tree"
      visualizerDsName="Binary Tree"
      description="A hierarchical data structure where each node has at most two children (left and right). Used for efficient searching and sorting."
      difficulty="Intermediate"
      timeComplexities={{"access":"O(log n)*","search":"O(log n)*","insert":"O(log n)*","delete":"O(log n)*"}}
      content={
      <>
        <section>
          <h2>What is a Binary Tree?</h2>
          <p>A tree whose elements have at most 2 children is called a binary tree. We typically name them the left and right child.</p>

          <div className="not-prose bg-[var(--color-bg-tertiary)] rounded-2xl p-8 flex flex-col items-center shadow-inner my-10 overflow-x-auto w-full border border-[var(--color-border-subtle)]">
             <div className="flex flex-col items-center relative mt-4 w-[400px]">

                {/* Root */}
                <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] border-2 border-indigo-500/80 shadow-lg flex items-center justify-center text-xl font-bold text-white z-10 relative">
                   1
                   <span className="absolute -left-12 top-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Root</span>
                </div>

                {/* Edges Lvl 1 */}
                <svg className="absolute top-8 left-0 w-full h-24" style={{ zIndex: 0 }}>
                   <line x1="200" y1="0" x2="100" y2="80" stroke="var(--color-border-strong)" strokeWidth="2" />
                   <line x1="200" y1="0" x2="300" y2="80" stroke="var(--color-border-strong)" strokeWidth="2" />
                </svg>

                <div className="flex justify-between w-[200px] mt-8 z-10">
                   {/* Left Child */}
                   <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] border-2 border-emerald-500/80 shadow-lg flex items-center justify-center text-xl font-bold text-white relative">
                      2
                      <span className="absolute -left-16 top-4 text-xs font-bold text-emerald-400 uppercase tracking-wider">L-Child</span>
                   </div>
                   {/* Right Child */}
                   <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] border-2 border-rose-500/80 shadow-lg flex items-center justify-center text-xl font-bold text-white relative">
                      3
                      <span className="absolute -right-16 top-4 text-xs font-bold text-rose-400 uppercase tracking-wider">R-Child</span>
                   </div>
                </div>

                {/* Edges Lvl 2 */}
                <svg className="absolute top-28 left-0 w-full h-24" style={{ zIndex: 0 }}>
                   <line x1="100" y1="0" x2="50" y2="80" stroke="var(--color-border-strong)" strokeWidth="2" />
                   <line x1="100" y1="0" x2="150" y2="80" stroke="var(--color-border-strong)" strokeWidth="2" />
                </svg>

                <div className="flex justify-start w-[300px] mt-8 z-10 pl-6 gap-[36px]">
                   <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] border-2 border-gray-500/80 shadow-lg flex items-center justify-center text-xl font-bold text-white relative">
                      4
                      <span className="absolute -bottom-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Leaf</span>
                   </div>
                   <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] border-2 border-gray-500/80 shadow-lg flex items-center justify-center text-xl font-bold text-white relative">
                      5
                      <span className="absolute -bottom-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Leaf</span>
                   </div>
                </div>

             </div>
          </div>
        </section>

        <section>
          <h2 id="bst" tabIndex={-1}>Binary Search Tree (BST)</h2>
          <p>A special type of binary tree where the left child is always less than the root, and the right child is always greater.</p>
        </section>

        <section className="mt-12 mb-20">
          <h2>Tree Traversals</h2>
          <p className="text-[var(--color-text-secondary)] mb-8">Traversing a tree means visiting every node in the tree. Because trees are non-linear, there are multiple ways to traverse them:</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-subtle)] p-8 rounded-2xl hover:border-blue-500/50 transition-colors flex flex-col items-center text-center shadow-lg group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-2xl font-bold mb-2 text-white">Inorder</h3>
              <p className="text-sm text-blue-400 mb-6 font-mono font-bold tracking-wider">(Left, Root, Right)</p>
              <p className="text-sm text-[var(--color-text-secondary)] mb-8 flex-1">Visits the nodes in ascending order in a BST. Commonly used to flatten the tree back into its original sequence.</p>
              <a href="/learn/algorithms/inorder-traversal" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]">
                View 3D Animation
                <ArrowRightLeft size={16} />
              </a>
            </div>

            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-subtle)] p-8 rounded-2xl hover:border-indigo-500/50 transition-colors flex flex-col items-center text-center shadow-lg group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-2xl font-bold mb-2 text-white">Preorder</h3>
              <p className="text-sm text-indigo-400 mb-6 font-mono font-bold tracking-wider">(Root, Left, Right)</p>
              <p className="text-sm text-[var(--color-text-secondary)] mb-8 flex-1">Used to create a copy of the tree. It visits the parent first before delving into the sub-trees.</p>
              <a href="/learn/algorithms/preorder-traversal" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]">
                View 3D Animation
                <ArrowRightLeft size={16} />
              </a>
            </div>

            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-subtle)] p-8 rounded-2xl hover:border-rose-500/50 transition-colors flex flex-col items-center text-center shadow-lg group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-2xl font-bold mb-2 text-white">Postorder</h3>
              <p className="text-sm text-rose-400 mb-6 font-mono font-bold tracking-wider">(Left, Right, Root)</p>
              <p className="text-sm text-[var(--color-text-secondary)] mb-8 flex-1">Used to delete the tree. It visits all children before visiting the parent node.</p>
              <a href="/learn/algorithms/postorder-traversal" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-500 transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] group-hover:shadow-[0_0_25px_rgba(244,63,94,0.6)]">
                View 3D Animation
                <ArrowRightLeft size={16} />
              </a>
            </div>
          </div>
        </section>
      </>
    }
    />
  );
}
