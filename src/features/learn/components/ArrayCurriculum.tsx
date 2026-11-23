import { Link } from 'react-router-dom';
import { Book, Code, Trophy, Star, ChevronRight, Zap, Target } from 'lucide-react';

const curriculum = [
  {
    category: "Basics",
    icon: <Book className="text-blue-400" size={24} />,
    color: "blue",
    topics: [
      "Introduction", "Applications", "In Different Language", "Arrays in C", 
      "Vector in C++ STL", "Arrays in Java", "ArrayList in Java", "List in Python", 
      "Arrays in C#", "Arrays in JavaScript"
    ]
  },
  {
    category: "Basic Problems",
    icon: <Target className="text-emerald-400" size={24} />,
    color: "emerald",
    topics: [
      "Print Alternates", "Leaders in an array", "Remove Duplicates from Sorted", 
      "Generate all Subarrays", "Reverse an Array", "Rotate an Array", "Zeroes to End", 
      "Min Increments to Make Equal", "Min Cost to Make Size 1"
    ]
  },
  {
    category: "Easy Problems",
    icon: <Star className="text-yellow-400" size={24} />,
    color: "yellow",
    topics: [
      "Duplicate within K Distance", "Make Even Positioned Greater", "Sum of all Subarrays", 
      "Stock Buy and Sell – Multiple Transactions", "Single Among Doubles", "Missing Number", 
      "Missing and Repeating", "Only Repeating from 1 to n-1", "Sorted Subsequence of Size 3", 
      "Max Subarray Sum", "Equilibrium index", "Split array into three equals"
    ]
  },
  {
    category: "Prerequisite for the Remaining Problems",
    icon: <Book className="text-indigo-400" size={24} />,
    color: "indigo",
    topics: [
      "Binary Search", "Selection Sort, Insertion Sort, Binary Search, QuickSort, MergeSort, CycleSort, and HeapSort", 
      "Sort in C++ / Sort in Java / Sort in Python / Sort in JavaScript", "Two Pointers Technique", 
      "Prefix Sum Technique", "Basics of Hashing", "Window Sliding Technique"
    ]
  },
  {
    category: "Medium Problems",
    icon: <Zap className="text-orange-400" size={24} />,
    color: "orange",
    topics: [
      "Make arr[i] = i", "Maximum Circular Subarray Sum", "Reorder according to given indexes", 
      "Product Except Self", "K-th Largest Sum Subarray", "Smallest subarray with sum greater than x", 
      "Majority Element", "Count possible triangles", "Construct an array from its pair-sums", "Next Permutation"
    ]
  },
  {
    category: "Hard Problems",
    icon: <Code className="text-rose-400" size={24} />,
    color: "rose",
    topics: [
      "Surpasser Count", "Trapping Rain Water", "Top K Frequent Elements", 
      "Kth Missing Positive Number in a Sorted Array", "Stock Buy and Sell - At Most K Transactions", 
      "Stock Buy and Sell - At Most 2 Transactions", "Median in a Stream", 
      "Smallest Difference Triplet from 3 arrays", "Max occurred in n ranges"
    ]
  },
  {
    category: "Expert Problems for Competitive Programmers",
    icon: <Trophy className="text-fuchsia-400" size={24} />,
    color: "fuchsia",
    topics: [
      "MO’s Algorithm", "Square Root (Sqrt) Decomposition", "Sparse Table", 
      "Range sum query using Sparse Table", "Range Minimum Query", "Range LCM Queries", 
      "Merge Sort Tree for Range Order Statistics", "Minimum jumps to reach end", 
      "Space optimization using bit manipulations", "Max value of Sum( i*arr[i]) with only rotations"
    ]
  }
];

// Helper to safely slugify topics into URL paths
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')        // Remove all non-word chars
    .replace(/--+/g, '-')           // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

export default function ArrayCurriculum() {
  return (
    <div className="mt-16 space-y-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-white mb-4">Complete Array Curriculum</h2>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          Master Arrays from the ground up. Work your way through these foundational concepts and challenging problems to become an expert.
        </p>
      </div>

      <div className="space-y-8">
        {curriculum.map((section, idx) => (
          <div 
            key={idx} 
            className="bg-[var(--color-surface-glass)] border border-[var(--color-border-subtle)] rounded-3xl overflow-hidden shadow-lg"
          >
            {/* Section Header */}
            <div className={`p-6 border-b border-[var(--color-border-subtle)] bg-gradient-to-r from-${section.color}-500/10 to-transparent flex items-center gap-4`}>
              <div className={`p-3 bg-${section.color}-500/20 rounded-xl`}>
                {section.icon}
              </div>
              <h3 className="text-2xl font-bold text-white m-0">{section.category}</h3>
              <div className="ml-auto bg-[var(--color-bg-primary)] px-3 py-1 rounded-full text-sm font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
                {section.topics.length} topics
              </div>
            </div>

            {/* Topics Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.topics.map((topic, tIdx) => (
                  <Link 
                    key={tIdx} 
                    to={`/learn/topic/${slugify(topic)}`}
                    className="group flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
                  >
                    <span className="text-[var(--color-text-secondary)] group-hover:text-white transition-colors font-medium text-sm">
                      {topic}
                    </span>
                    <ChevronRight size={16} className="text-[var(--color-text-muted)] group-hover:text-indigo-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
