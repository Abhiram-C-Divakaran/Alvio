import SupplementalAlgorithmLesson from './algorithms/SupplementalAlgorithmLesson';
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import AlgorithmPageLayout from './components/AlgorithmPageLayout';
import { ALGO_META } from './algorithms/metadata';
import type { AlgoType } from './algorithms/metadata';

export default function AlgorithmDetailsPage() {
  const { algo } = useParams<{ algo: string }>();

  if (algo === 'heap-sort' || algo === 'rabin-karp') return <SupplementalAlgorithmLesson id={algo}/>;
  if (!algo || !ALGO_META[algo as AlgoType]) {
    return <Navigate to="/learn/algorithms" replace />;
  }

  const algoId = algo as AlgoType;
  const meta = ALGO_META[algoId];

  const getContent = () => {
    switch (algoId) {
      case 'bubble-sort':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Understanding Bubble Sort</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Bubble Sort is one of the simplest comparison-based sorting algorithms. It gets its name because smaller or larger elements "bubble" to the top (end) of the list with each iteration.
                Although it is not highly efficient for large datasets, it is extremely valuable for educational purposes to understand the fundamentals of sorting logic, loops, and swaps.
              </p>
            </section>

            {/* Bubble Sort Diagram */}
            <section className="space-y-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-6 rounded-2xl flex flex-col items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">Visualization: Comparing & Swapping Adjacent Elements</h3>
              <svg width="400" height="150" className="max-w-full">
                {/* Array slots */}
                <g transform="translate(40, 40)">
                  {/* Item 1 */}
                  <rect x="0" y="0" width="50" height="50" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                  <text x="25" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">14</text>

                  {/* Item 2 */}
                  <rect x="70" y="0" width="50" height="50" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                  <text x="95" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">33</text>

                  {/* Item 3 (Comparing/Swapping) */}
                  <rect x="140" y="0" width="50" height="50" rx="8" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="3" />
                  <text x="165" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">45</text>

                  {/* Item 4 (Comparing/Swapping) */}
                  <rect x="210" y="0" width="50" height="50" rx="8" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="3" />
                  <text x="235" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">19</text>

                  {/* Curved Swap Arrow */}
                  <path d="M 165 -10 Q 200 -30 235 -10" fill="none" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="200" y="-28" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">Swap (45 &gt; 19)</text>

                  {/* Marker definitions */}
                  <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
                    </marker>
                  </defs>

                  {/* Indices */}
                  <text x="25" y="72" fill="#64748b" fontSize="12" textAnchor="middle">idx [0]</text>
                  <text x="95" y="72" fill="#64748b" fontSize="12" textAnchor="middle">idx [1]</text>
                  <text x="165" y="72" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">idx [2]</text>
                  <text x="235" y="72" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">idx [3]</text>
                </g>
              </svg>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Bubble Sort Works (Step-by-Step)</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-3 leading-relaxed">
                <li>
                  <strong>Adjacent Comparison:</strong> The algorithm starts at the beginning of the array and compares the first two elements.
                </li>
                <li>
                  <strong>Conditional Swap:</strong> If the left element is larger than the right element, they swap positions. Otherwise, they stay as they are.
                </li>
                <li>
                  <strong>Iterate Forward:</strong> The pointer moves to the next pair (index 1 and 2), compares them, and swaps if needed. This continues until the end of the unsorted section.
                </li>
                <li>
                  <strong>Placing the Largest Item:</strong> After the first pass, the largest element is guaranteed to reside at the final position in the array. This slot is marked as "sorted".
                </li>
                <li>
                  <strong>Repeat:</strong> The process repeats for the remaining unsorted portion of the array, requiring up to <code className="bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded font-mono">N-1</code> passes.
                </li>
              </ol>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Complexity & Optimization</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                In the worst-case and average-case, Bubble Sort has a time complexity of <strong className="text-white font-mono">O(N²)</strong> because it uses nested loops to compare every element.
                However, it can be optimized by adding a boolean flag <code className="bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded font-mono">swapped</code>. If a full pass completes without any swaps, the array is already sorted, allowing the algorithm to terminate early with a best-case time complexity of <strong className="text-white font-mono">O(N)</strong>.
              </p>
            </section>
          </div>
        );

      case 'selection-sort':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Understanding Selection Sort</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Selection Sort is an intuitive, in-place sorting algorithm. It logically divides the input array into two parts: a sorted subarray built from left to right, and an unsorted subarray containing the rest of the elements.
                With each iteration, it finds the smallest element in the unsorted portion and moves it to the beginning of the unsorted list.
              </p>
            </section>

            {/* Selection Sort Diagram */}
            <section className="space-y-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-6 rounded-2xl flex flex-col items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">Visualization: Finding Min and Swapping</h3>
              <svg width="400" height="150" className="max-w-full">
                <g transform="translate(40, 40)">
                  {/* Sorted Portion (Green) */}
                  <rect x="0" y="0" width="50" height="50" rx="8" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="2" />
                  <text x="25" y="30" fill="#10b981" fontSize="16" fontWeight="bold" textAnchor="middle">3</text>
                  <text x="25" y="-10" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">Sorted</text>

                  {/* Current Index Target (Blue) */}
                  <rect x="70" y="0" width="50" height="50" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="3" />
                  <text x="95" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">18</text>
                  <text x="95" y="-10" fill="#3b82f6" fontSize="10" fontWeight="bold" textAnchor="middle">Current</text>

                  {/* Unsorted Items */}
                  <rect x="140" y="0" width="50" height="50" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  <text x="165" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">45</text>

                  {/* Smallest Found (Orange/Amber) */}
                  <rect x="210" y="0" width="50" height="50" rx="8" fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" strokeWidth="3" />
                  <text x="235" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">5</text>
                  <text x="235" y="-10" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">Min Found</text>

                  {/* Swap Line */}
                  <path d="M 95 60 Q 165 85 235 60" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-selection)" />
                  <defs>
                    <marker id="arrow-selection" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
                    </marker>
                  </defs>
                  <text x="165" y="85" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">Swap Elements</text>
                </g>
              </svg>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">The Selection Process</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-3 leading-relaxed">
                <li>
                  <strong>Assume First is Min:</strong> Start at the first element of the unsorted section and label it as the current minimum.
                </li>
                <li>
                  <strong>Scan the Rest:</strong> Iterate through all remaining unsorted elements, comparing each to the current minimum.
                </li>
                <li>
                  <strong>Update Min Index:</strong> If a smaller element is encountered, update the index of the minimum element to point to this new value.
                </li>
                <li>
                  <strong>Perform Swap:</strong> Once the unsorted section is fully scanned, swap the minimum element with the element at the starting boundary.
                </li>
                <li>
                  <strong>Advance Boundary:</strong> Shift the sorted boundary one index to the right and repeat.
                </li>
              </ol>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Performance Insights</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Unlike Bubble Sort, Selection Sort performs a maximum of <strong className="text-white">O(N)</strong> swaps. However, the time complexity remains <strong className="text-white font-mono">O(N²)</strong> across all cases (best, average, and worst) because the nested loops must always scan the entire unsorted subarray to find the minimum value. It is best used when writing to memory is highly expensive compared to reading.
              </p>
            </section>
          </div>
        );

      case 'insertion-sort':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Understanding Insertion Sort</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Insertion Sort works similarly to how many people sort playing cards in their hands. It processes the array elements one by one, shifting larger sorted elements to the right to make a space for the current item ("key") being inserted.
              </p>
            </section>

            {/* Insertion Sort Diagram */}
            <section className="space-y-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-6 rounded-2xl flex flex-col items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">Visualization: Shifting and Inserting</h3>
              <svg width="400" height="150" className="max-w-full">
                <g transform="translate(40, 40)">
                  {/* Sorted left part */}
                  <rect x="0" y="0" width="50" height="50" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                  <text x="25" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">12</text>

                  <rect x="70" y="0" width="50" height="50" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                  <text x="95" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">35</text>

                  {/* Shift arrow */}
                  <path d="M 95 -10 Q 130 -25 165 -10" fill="none" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrow-red)" />
                  <text x="130" y="-22" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">Shift Right</text>

                  {/* Temporary Slot where key was */}
                  <rect x="140" y="0" width="50" height="50" rx="8" fill="#ef4444" fillOpacity="0.05" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Key lifted above */}
                  <g transform="translate(210, -10)">
                    <rect x="0" y="0" width="50" height="50" rx="8" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x="25" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">14</text>
                    <text x="25" y="-6" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">Key</text>
                  </g>

                  {/* Insertion Path */}
                  <path d="M 235 50 Q 150 90 60 40" fill="none" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow-insert)" />
                  <text x="150" y="80" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">Insert here (12 &lt; 14 &lt; 35)</text>

                  <defs>
                    <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
                    </marker>
                    <marker id="arrow-insert" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#f59e0b" />
                    </marker>
                  </defs>
                </g>
              </svg>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Insertion Sort Operates</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-3 leading-relaxed">
                <li>
                  <strong>Start with Sorted Subarray:</strong> The first element is assumed to be sorted.
                </li>
                <li>
                  <strong>Pick the Key:</strong> Select the next element from the unsorted section (let\'s call this the "key").
                </li>
                <li>
                  <strong>Compare and Shift:</strong> Look at the sorted subarray to its left. Compare the key to each sorted item, starting from the right. If a sorted item is larger than the key, shift that sorted item one slot to the right.
                </li>
                <li>
                  <strong>Insert:</strong> Repeat this shifting process until you find a sorted item smaller than the key (or hit index 0). Insert the key into the empty slot.
                </li>
                <li>
                  <strong>Loop:</strong> Repeat for each remaining item in the array.
                </li>
              </ol>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Practical Advantages</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Insertion Sort is highly efficient for small arrays, and performs exceptionally well on arrays that are already **partially sorted** (with a best-case time complexity of <strong className="text-white">O(N)</strong>). It is also stable, requires no auxiliary memory (<strong className="text-white">O(1) space</strong>), and is online (meaning it can sort a list as it receives it).
              </p>
            </section>
          </div>
        );

      case 'merge-sort':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Understanding Merge Sort</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Merge Sort is a classic, highly efficient divide-and-conquer sorting algorithm. It breaks a large array down into single elements recursively, then builds it back up by sorting and merging the smaller lists.
              </p>
            </section>

            {/* Merge Sort Diagram */}
            <section className="space-y-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-6 rounded-2xl flex flex-col items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">Visualization: Divide & Conquer Tree</h3>
              <svg width="450" height="180" className="max-w-full">
                {/* Level 0 */}
                <g transform="translate(165, 10)">
                  <rect x="0" y="0" width="120" height="24" rx="4" fill="#1e293b" stroke="#6366f1" strokeWidth="1.5" />
                  <text x="60" y="16" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">[38, 27, 43, 3]</text>
                </g>

                {/* Branch Lines */}
                <line x1="225" y1="34" x2="135" y2="60" stroke="#475569" strokeWidth="1.5" />
                <line x1="225" y1="34" x2="315" y2="60" stroke="#475569" strokeWidth="1.5" />

                {/* Level 1 */}
                <g transform="translate(85, 60)">
                  <rect x="0" y="0" width="80" height="24" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
                  <text x="40" y="16" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">[38, 27]</text>
                </g>
                <g transform="translate(285, 60)">
                  <rect x="0" y="0" width="80" height="24" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
                  <text x="40" y="16" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">[43, 3]</text>
                </g>

                {/* Branch Lines */}
                <line x1="125" y1="84" x2="85" y2="110" stroke="#475569" strokeWidth="1.5" />
                <line x1="125" y1="84" x2="165" y2="110" stroke="#475569" strokeWidth="1.5" />
                <line x1="325" y1="84" x2="285" y2="110" stroke="#475569" strokeWidth="1.5" />
                <line x1="325" y1="84" x2="365" y2="110" stroke="#475569" strokeWidth="1.5" />

                {/* Level 2 (Single Elements) */}
                <g transform="translate(65, 110)">
                  <rect x="0" y="0" width="36" height="24" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                  <text x="18" y="16" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">38</text>
                </g>
                <g transform="translate(145, 110)">
                  <rect x="0" y="0" width="36" height="24" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                  <text x="18" y="16" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">27</text>
                </g>
                <g transform="translate(265, 110)">
                  <rect x="0" y="0" width="36" height="24" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                  <text x="18" y="16" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">43</text>
                </g>
                <g transform="translate(345, 110)">
                  <rect x="0" y="0" width="36" height="24" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                  <text x="18" y="16" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">3</text>
                </g>

                {/* Merge and Sort arrow */}
                <path d="M 225 140 L 225 160" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-merge)" />
                <defs>
                  <marker id="arrow-merge" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <polygon points="3 0, 6 6, 0 6" fill="#10b981" />
                  </marker>
                </defs>

                {/* Merge Layer */}
                <g transform="translate(140, 150)">
                  <rect x="0" y="0" width="170" height="24" rx="4" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="2" />
                  <text x="85" y="16" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">Merged Sorted: [3, 27, 38, 43]</text>
                </g>
              </svg>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">The Three Pillars of Merge Sort</h3>
              <ul className="list-disc pl-6 text-[var(--color-text-secondary)] space-y-3 leading-relaxed">
                <li>
                  <strong>Divide:</strong> Find the midpoint of the array, dividing it recursively into two halves until each sub-array contains only one element.
                </li>
                <li>
                  <strong>Conquer:</strong> A subarray of size 1 is trivially sorted. Start merging adjacent single-element arrays into sorted pairs, then sorted groups of four, and so on.
                </li>
                <li>
                  <strong>Combine (Merge):</strong> To merge two sorted subarrays, use a two-pointer technique. Compare the values at each pointer, place the smaller item into a temporary holding array, and move the corresponding pointer forward.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Complexity & Space Tradeoff</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Merge Sort runs with a guaranteed time complexity of <strong className="text-white font-mono">O(N log N)</strong> in all scenarios (best, average, and worst-case). The primary drawback is that merging requires auxiliary array space equal to the size of the original array, meaning it has a space complexity of <strong className="text-white font-mono">O(N)</strong>, making it less suitable for systems with tight memory constraints.
              </p>
            </section>
          </div>
        );

      case 'quick-sort':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Understanding Quick Sort</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Quick Sort is an extremely fast, in-place sorting algorithm based on the divide-and-conquer strategy. It works by partitioning an array around a selected "pivot" element, placing smaller items to the left and larger items to the right.
              </p>
            </section>

            {/* Quick Sort Diagram */}
            <section className="space-y-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-6 rounded-2xl flex flex-col items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">Visualization: Partitioning around Pivot</h3>
              <svg width="400" height="150" className="max-w-full">
                <g transform="translate(45, 40)">
                  {/* Smaller Elements (Blue) */}
                  <rect x="0" y="10" width="40" height="40" rx="6" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
                  <text x="20" y="34" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">12</text>

                  <rect x="50" y="10" width="40" height="40" rx="6" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
                  <text x="70" y="34" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">5</text>
                  <text x="45" y="-8" fill="#3b82f6" fontSize="10" fontWeight="bold" textAnchor="middle">Smaller</text>

                  {/* Pivot Element (Yellow/Amber) */}
                  <rect x="135" y="0" width="50" height="50" rx="8" fill="#eab308" fillOpacity="0.2" stroke="#eab308" strokeWidth="3" />
                  <text x="160" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">15</text>
                  <text x="160" y="-12" fill="#eab308" fontSize="11" fontWeight="bold" textAnchor="middle">PIVOT</text>

                  {/* Greater Elements (Purple) */}
                  <rect x="220" y="10" width="40" height="40" rx="6" fill="#a855f7" fillOpacity="0.2" stroke="#a855f7" strokeWidth="2" />
                  <text x="240" y="34" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">33</text>

                  <rect x="270" y="10" width="40" height="40" rx="6" fill="#a855f7" fillOpacity="0.2" stroke="#a855f7" strokeWidth="2" />
                  <text x="290" y="34" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">24</text>
                  <text x="275" y="-8" fill="#a855f7" fontSize="10" fontWeight="bold" textAnchor="middle">Greater</text>

                  {/* Partition divider lines */}
                  <line x1="105" y1="0" x2="105" y2="60" stroke="#475569" strokeDasharray="3 3" />
                  <line x1="205" y1="0" x2="205" y2="60" stroke="#475569" strokeDasharray="3 3" />
                </g>
              </svg>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Quick Sort Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-3 leading-relaxed">
                <li>
                  <strong>Select Pivot:</strong> Choose an element from the array to act as the pivot (common choices include the first element, last element, middle element, or a random element).
                </li>
                <li>
                  <strong>Partitioning:</strong> Reorder the array so that all elements smaller than the pivot are moved to its left, and all elements larger than the pivot are moved to its right.
                </li>
                <li>
                  <strong>Recursion:</strong> Recursively apply the same steps to the left and right subarrays.
                </li>
              </ol>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Average vs Worst Case Complexities</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                On average, Quick Sort runs in <strong className="text-white font-mono">O(N log N)</strong> time, making it one of the fastest algorithms in practice due to small constant factors. However, if the pivot is chosen poorly (e.g. always picking the smallest or largest element in an already sorted array), the recursion tree becomes skewed, leading to a worst-case time complexity of <strong className="text-white font-mono">O(N²)</strong>. Implementing randomized pivot selection solves this problem.
              </p>
            </section>
          </div>
        );

      case 'linear-search':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Understanding Linear Search</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Linear Search is the most basic search algorithm. It scans elements in sequence one by one, checking if the current element matches the target value.
              </p>
            </section>

            {/* Linear Search Diagram */}
            <section className="space-y-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-6 rounded-2xl flex flex-col items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">Visualization: Sequential Scan</h3>
              <svg width="400" height="150" className="max-w-full">
                <g transform="translate(40, 40)">
                  {/* Checked (Grey/Checked) */}
                  <rect x="0" y="0" width="50" height="50" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                  <text x="25" y="30" fill="#64748b" fontSize="16" fontWeight="bold" textAnchor="middle">12</text>
                  <text x="25" y="65" fill="#64748b" fontSize="10" textAnchor="middle">Checked</text>

                  <rect x="70" y="0" width="50" height="50" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                  <text x="95" y="30" fill="#64748b" fontSize="16" fontWeight="bold" textAnchor="middle">5</text>
                  <text x="95" y="65" fill="#64748b" fontSize="10" textAnchor="middle">Checked</text>

                  {/* Current Active (Pink) */}
                  <rect x="140" y="0" width="50" height="50" rx="8" fill="#ec4899" fillOpacity="0.1" stroke="#ec4899" strokeWidth="3" />
                  <text x="165" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">24</text>
                  <text x="165" y="65" fill="#ec4899" fontSize="10" fontWeight="bold" textAnchor="middle">Comparing</text>

                  {/* Target Match pointer */}
                  <text x="165" y="-12" fill="#ec4899" fontSize="10" fontWeight="bold" textAnchor="middle">MATCH? (24 == 24)</text>

                  {/* Unchecked (Teal) */}
                  <rect x="210" y="0" width="50" height="50" rx="8" fill="#1e293b" stroke="#2dd4bf" strokeWidth="1.5" />
                  <text x="235" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">9</text>
                  <text x="235" y="65" fill="#64748b" fontSize="10" textAnchor="middle">Unchecked</text>
                </g>
              </svg>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Linear Search Operates</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-3 leading-relaxed">
                <li>
                  <strong>Start at Index 0:</strong> Examine the first element of the array.
                </li>
                <li>
                  <strong>Compare:</strong> If the element value equals the target value, return the index.
                </li>
                <li>
                  <strong>Advance:</strong> If it does not match, move the pointer to the next index.
                </li>
                <li>
                  <strong>Terminate:</strong> Repeat until a match is found or the end of the array is reached. If the end is reached without a match, return -1.
                </li>
              </ol>
            </section>
          </div>
        );

      case 'binary-search':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Understanding Binary Search</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Binary Search is an extremely efficient logarithmic search algorithm. However, it requires the input array to be **strictly sorted** beforehand. It repeatedly divides the search space in half by comparing the target to the middle element.
              </p>
            </section>

            {/* Binary Search Diagram */}
            <section className="space-y-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-6 rounded-2xl flex flex-col items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">Visualization: Interval Halving</h3>
              <svg width="400" height="150" className="max-w-full">
                <g transform="translate(40, 40)">
                  {/* Low Boundary */}
                  <rect x="0" y="0" width="50" height="50" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                  <text x="25" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">2</text>
                  <text x="25" y="65" fill="#3b82f6" fontSize="10" fontWeight="bold" textAnchor="middle">Low [0]</text>

                  {/* Discarded lower half */}
                  <line x1="0" y1="25" x2="50" y2="25" stroke="#ef4444" strokeWidth="2" />

                  {/* Mid Element (Pink) */}
                  <rect x="105" y="0" width="50" height="50" rx="8" fill="#ec4899" fillOpacity="0.1" stroke="#ec4899" strokeWidth="3" />
                  <text x="130" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">12</text>
                  <text x="130" y="65" fill="#ec4899" fontSize="10" fontWeight="bold" textAnchor="middle">Mid [2]</text>
                  <text x="130" y="-12" fill="#ec4899" fontSize="11" fontWeight="bold" textAnchor="middle">Mid &lt; Target</text>

                  {/* High Boundary */}
                  <rect x="210" y="0" width="50" height="50" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                  <text x="235" y="30" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">45</text>
                  <text x="235" y="65" fill="#3b82f6" fontSize="10" fontWeight="bold" textAnchor="middle">High [4]</text>
                </g>
              </svg>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Binary Search Operates</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-3 leading-relaxed">
                <li>
                  <strong>Set Boundaries:</strong> Initialize pointers for the lower boundary (<code className="bg-slate-800 text-pink-400 px-1 py-0.5 rounded font-mono">Low = 0</code>) and upper boundary (<code className="bg-slate-800 text-pink-400 px-1 py-0.5 rounded font-mono">High = N-1</code>).
                </li>
                <li>
                  <strong>Calculate Midpoint:</strong> Find the midpoint index: <code className="bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded font-mono">Mid = Low + (High - Low) / 2</code>.
                </li>
                <li>
                  <strong>Check Match:</strong> If the element at the midpoint index equals the target, return its index.
                </li>
                <li>
                  <strong>Halve the Range:</strong>
                  <ul className="list-disc pl-6 mt-1 space-y-1">
                    <li>If the target is smaller than the midpoint value, discard the upper half by updating: <code className="bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded font-mono">High = Mid - 1</code>.</li>
                    <li>If the target is larger than the midpoint value, discard the lower half by updating: <code className="bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded font-mono">Low = Mid + 1</code>.</li>
                  </ul>
                </li>
                <li>
                  <strong>Repeat:</strong> Repeat until a match is found or the pointers overlap (<code className="bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded font-mono">Low &gt; High</code>).
                </li>
              </ol>
            </section>
          </div>
        );

      case 'bfs':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Breadth-First Search (BFS)</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Breadth-First Search is a graph traversal algorithm that explores all vertices at the current depth level before moving to the next level. It uses a **Queue** (First-In, First-Out) to manage the list of vertices to visit.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How BFS Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Enqueue the starting node and mark it as visited.</li>
                <li>While queue is not empty, dequeue a node.</li>
                <li>Visit all unvisited neighbors of the dequeued node, mark them as visited, and enqueue them.</li>
                <li>Repeat until the queue is empty.</li>
              </ol>
            </section>
          </div>
        );

      case 'dfs':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Depth-First Search (DFS)</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Depth-First Search explores paths as deep as possible along each branch before backtracking. It uses a **Stack** (or recursion) to recall path decisions.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How DFS Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Push the starting node onto the stack.</li>
                <li>Pop a node, mark it as visited.</li>
                <li>Push all its unvisited neighbors onto the stack.</li>
                <li>Repeat until the stack is empty (or recursion stack resolves).</li>
              </ol>
            </section>
          </div>
        );

      case 'dijkstra':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Dijkstra's Shortest Path</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Dijkstra's algorithm finds the shortest path from a single source node to all other nodes in a weighted graph. It uses a min-priority queue to greedily extract the closest unvisited node.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Dijkstra Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Set distance to starting node to 0, and all other nodes to infinity.</li>
                <li>Insert all nodes into a priority queue keyed by distance.</li>
                <li>Extract the node with the minimum distance.</li>
                <li>Relax neighbors: update distance if a cheaper path is found through the current node.</li>
                <li>Repeat until the queue is empty.</li>
              </ol>
            </section>
          </div>
        );

      case 'bellman-ford':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Bellman-Ford Algorithm</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Bellman-Ford calculates single-source shortest paths on weighted graphs. Unlike Dijkstra, Bellman-Ford supports negative edge weights and can detect negative weight cycles.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Bellman-Ford Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Initialize distances: source node to 0, others to infinity.</li>
                <li>Iteratively relax all edges V - 1 times.</li>
                <li>Verify negative cycles: run one final pass. If any distance decreases, a negative cycle exists.</li>
              </ol>
            </section>
          </div>
        );

      case 'floyd-warshall':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Floyd-Warshall Algorithm</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Floyd-Warshall is an all-pairs shortest path dynamic programming algorithm. It computes shortest distances between every single pair of nodes in a weighted graph.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Floyd-Warshall Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Initialize a distance matrix matching graph edge weights.</li>
                <li>Iterate intermediate nodes k from 1 to V.</li>
                <li>For each cell (i, j), update distance to min(dist[i][j], dist[i][k] + dist[k][j]).</li>
              </ol>
            </section>
          </div>
        );

      case 'kruskal':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Kruskal's Minimum Spanning Tree</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Kruskal's algorithm finds a Minimum Spanning Tree (MST) for a connected weighted graph. It sorts edges and greedily adds edges if they don't form cycles.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Kruskal Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Sort all edges in non-decreasing order of weight.</li>
                <li>Initialize disjoint sets (Union-Find) for all vertices.</li>
                <li>Pick the cheapest edge. If its endpoints belong to different sets, add to MST and union their sets.</li>
                <li>Repeat until V - 1 edges are added.</li>
              </ol>
            </section>
          </div>
        );

      case 'prim':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Prim's Minimum Spanning Tree</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Prim's algorithm builds a Minimum Spanning Tree starting from an arbitrary node, growing the tree vertex by vertex by choosing the cheapest adjacent edge.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Prim Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Start at any node. Set its key to 0, others to infinity.</li>
                <li>Extract vertex with minimum key and mark as part of MST.</li>
                <li>For each adjacent neighbor, if weight is smaller than current key, update neighbor's parent and key.</li>
                <li>Repeat until all vertices are in the MST.</li>
              </ol>
            </section>
          </div>
        );

      case 'topological-sort':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Topological Sort</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Topological Sort orders vertices of a Directed Acyclic Graph (DAG) linearly such that for every directed edge U {"->"} V, U appears before V.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Topological Sort Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Perform DFS traversal starting at unvisited vertices.</li>
                <li>When a vertex has no unvisited neighbors (fully processed), push it to a stack.</li>
                <li>Reverse the stack elements to obtain the topological ordering.</li>
              </ol>
            </section>
          </div>
        );

      case 'knapsack':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">0/1 Knapsack Problem</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                The 0/1 Knapsack Problem is a classic Dynamic Programming problem. Given weights and values of items, we must select a subset of items to maximize total value without exceeding a maximum weight capacity W.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Knapsack DP Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Create a 2D matrix DP of size (N+1) x (W+1) filled with 0s.</li>
                <li>Iterate through items i from 1 to N, and capacities w from 1 to W.</li>
                <li>If the item's weight is less than or equal to current capacity, choose max of: including it (value + DP[i-1][w-weight]) or excluding it (DP[i-1][w]).</li>
                <li>Else, copy values from the row above: DP[i-1][w].</li>
              </ol>
            </section>
          </div>
        );

      case 'fibonacci':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Fibonacci Sequence (DP)</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Calculating Fibonacci numbers using Dynamic Programming caches previous calculations (memoization or tabulation) to optimize recursive exponential complexity O(2^N) down to linear O(N) time.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Fibonacci DP Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Initialize base cases: F(0) = 0, F(1) = 1.</li>
                <li>Use an array to store calculated values up to N.</li>
                <li>Iterate from 2 to N, filling array cells: F(i) = F(i-1) + F(i-2).</li>
              </ol>
            </section>
          </div>
        );

      case 'lcs':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Longest Common Subsequence (LCS)</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                LCS finds the longest subsequence common to two sequences (order preserved, but not necessarily contiguous). It is widely used in comparison systems like git diff.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How LCS DP Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Initialize an (M+1) x (N+1) DP grid matrix.</li>
                <li>If characters match: set cell to diagonal cell + 1.</li>
                <li>Else: set cell to max of top cell or left cell.</li>
              </ol>
            </section>
          </div>
        );

      case 'activity-selection':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Activity Selection (Greedy)</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Activity Selection is a Greedy algorithm that schedules the maximum number of mutually compatible activities.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Activity Selection Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Sort all activities by their finish times.</li>
                <li>Select the first activity.</li>
                <li>For remaining activities, if start time is greater than or equal to previous activity finish time, select it.</li>
              </ol>
            </section>
          </div>
        );

      case 'huffman-coding':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Huffman Coding (Greedy)</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Huffman Coding assigns variable-length prefix codes to characters based on their frequencies. Most frequent characters get the shortest codes, enabling optimal compression.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Huffman Coding Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Create leaf nodes for each character and insert into a min-priority queue.</li>
                <li>Extract the two lowest-frequency nodes, join under a parent, and insert parent back.</li>
                <li>Repeat until a single root node remains. Traversal paths assign codes (0 for left, 1 for right).</li>
              </ol>
            </section>
          </div>
        );

      case 'hanoi':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white">Tower of Hanoi (Recursion)</h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                The Tower of Hanoi is a classic mathematical puzzle that demonstrates the power of recursive divide-and-conquer solutions. The objective is to move a stack of N disks from a source peg to a target peg using an auxiliary peg, following strict rules.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Rules of the Puzzle</h3>
              <ul className="list-disc pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Only one disk can be moved at a time.</li>
                <li>Each move consists of taking the upper disk from one of the stacks and placing it on top of another stack.</li>
                <li>No larger disk may be placed on top of a smaller disk.</li>
              </ul>
            </section>
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white">How Recursive Solution Works</h3>
              <ol className="list-decimal pl-6 text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>Move N-1 disks from Source peg to Auxiliary peg.</li>
                <li>Move the remaining largest disk from Source peg to Target peg.</li>
                <li>Move the N-1 disks from Auxiliary peg to Target peg.</li>
              </ol>
            </section>
          </div>
        );

      default:
        return <p>Documentation for {meta.name} is coming soon.</p>;
    }
  };

  return (
    <AlgorithmPageLayout
      type={algoId}
      title={meta.name}
      description={meta.description}
      difficulty={meta.difficulty}
      timeComplexities={meta.timeComplexities}
      content={getContent()}
    />
  );
}
