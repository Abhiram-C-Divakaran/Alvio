export type AlgoType = 
  | 'bubble-sort' 
  | 'selection-sort' 
  | 'insertion-sort' 
  | 'merge-sort' 
  | 'quick-sort' 
  | 'linear-search' 
  | 'binary-search'
  | 'bfs'
  | 'dfs'
  | 'dijkstra'
  | 'bellman-ford'
  | 'floyd-warshall'
  | 'kruskal'
  | 'prim'
  | 'topological-sort'
  | 'knapsack'
  | 'fibonacci'
  | 'lcs'
  | 'activity-selection'
  | 'huffman-coding'
  | 'hanoi'
  | 'inorder-traversal'
  | 'preorder-traversal'
  | 'postorder-traversal'
  | 'two-pointer'
  | 'reverse-array';

export const ALGO_META: Record<AlgoType, { name: string; description: string; type: 'sorting' | 'searching' | 'graph' | 'dp' | 'greedy' | 'recursion' | 'traversal'; difficulty: 'Beginner' | 'Intermediate' | 'Advanced'; timeComplexities: { best: string; average: string; worst: string; space: string } }> = {
  'bubble-sort': {
    name: 'Bubble Sort',
    description: 'Compares adjacent items and swaps them if they are in the wrong order.',
    type: 'sorting',
    difficulty: 'Beginner',
    timeComplexities: { best: 'O(N)', average: 'O(N²)', worst: 'O(N²)', space: 'O(1)' }
  },
  'selection-sort': {
    name: 'Selection Sort',
    description: 'Finds the minimum item in the unsorted part and swaps it with the first unsorted item.',
    type: 'sorting',
    difficulty: 'Beginner',
    timeComplexities: { best: 'O(N²)', average: 'O(N²)', worst: 'O(N²)', space: 'O(1)' }
  },
  'insertion-sort': {
    name: 'Insertion Sort',
    description: 'Builds a sorted array one element at a time by bubbling them down.',
    type: 'sorting',
    difficulty: 'Beginner',
    timeComplexities: { best: 'O(N)', average: 'O(N²)', worst: 'O(N²)', space: 'O(1)' }
  },
  'merge-sort': {
    name: 'Merge Sort',
    description: 'Divides array into halves, sorts them recursively, and merges them.',
    type: 'sorting',
    difficulty: 'Intermediate',
    timeComplexities: { best: 'O(N log N)', average: 'O(N log N)', worst: 'O(N log N)', space: 'O(N)' }
  },
  'quick-sort': {
    name: 'Quick Sort',
    description: 'Picks a pivot and partitions the array into smaller/larger elements.',
    type: 'sorting',
    difficulty: 'Intermediate',
    timeComplexities: { best: 'O(N log N)', average: 'O(N log N)', worst: 'O(N²)', space: 'O(log N)' }
  },
  'linear-search': {
    name: 'Linear Search',
    description: 'Scans elements one by one sequentially to find the target element.',
    type: 'searching',
    difficulty: 'Beginner',
    timeComplexities: { best: 'O(1)', average: 'O(N)', worst: 'O(N)', space: 'O(1)' }
  },
  'binary-search': {
    name: 'Binary Search',
    description: 'Searches a sorted array by repeatedly dividing the search space in half.',
    type: 'searching',
    difficulty: 'Beginner',
    timeComplexities: { best: 'O(1)', average: 'O(log N)', worst: 'O(log N)', space: 'O(1)' }
  },
  'bfs': {
    name: 'Breadth-First Search (BFS)',
    description: 'Explores graph layer-by-layer (ripples outward) using a Queue.',
    type: 'graph',
    difficulty: 'Intermediate',
    timeComplexities: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' }
  },
  'dfs': {
    name: 'Depth-First Search (DFS)',
    description: 'Explores graph paths as deep as possible before backtracking using a Stack.',
    type: 'graph',
    difficulty: 'Intermediate',
    timeComplexities: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' }
  },
  'dijkstra': {
    name: "Dijkstra's Algorithm",
    description: 'Finds the shortest path from a source node to all other nodes in a weighted graph.',
    type: 'graph',
    difficulty: 'Advanced',
    timeComplexities: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)', space: 'O(V)' }
  },
  'bellman-ford': {
    name: 'Bellman-Ford Algorithm',
    description: 'Finds single-source shortest paths. Unlike Dijkstra, it supports negative edge weights.',
    type: 'graph',
    difficulty: 'Advanced',
    timeComplexities: { best: 'O(VE)', average: 'O(VE)', worst: 'O(VE)', space: 'O(V)' }
  },
  'floyd-warshall': {
    name: 'Floyd-Warshall Algorithm',
    description: 'Dynamic programming approach that calculates all-pairs shortest paths.',
    type: 'graph',
    difficulty: 'Advanced',
    timeComplexities: { best: 'O(V³)', average: 'O(V³)', worst: 'O(V³)', space: 'O(V²)' }
  },
  'kruskal': {
    name: "Kruskal's MST",
    description: 'Builds a Minimum Spanning Tree (MST) by sorting edges and avoiding cycles.',
    type: 'graph',
    difficulty: 'Advanced',
    timeComplexities: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)', space: 'O(V)' }
  },
  'prim': {
    name: "Prim's MST",
    description: 'Builds a Minimum Spanning Tree (MST) by greedily connecting nearby cheap vertices.',
    type: 'graph',
    difficulty: 'Advanced',
    timeComplexities: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)', space: 'O(V)' }
  },
  'topological-sort': {
    name: 'Topological Sort',
    description: 'Orders vertices in a DAG such that for every directed edge U -> V, U comes before V.',
    type: 'graph',
    difficulty: 'Intermediate',
    timeComplexities: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' }
  },
  'knapsack': {
    name: '0/1 Knapsack Problem',
    description: 'Computes maximum value using dynamic programming matrix values.',
    type: 'dp',
    difficulty: 'Intermediate',
    timeComplexities: { best: 'O(NW)', average: 'O(NW)', worst: 'O(NW)', space: 'O(NW)' }
  },
  'fibonacci': {
    name: 'Fibonacci (DP)',
    description: 'Calculates Fibonacci sequence using dynamic programming memoization.',
    type: 'dp',
    difficulty: 'Beginner',
    timeComplexities: { best: 'O(N)', average: 'O(N)', worst: 'O(N)', space: 'O(N)' }
  },
  'lcs': {
    name: 'Longest Common Subsequence',
    description: 'Finds the longest common subsequence of two strings using a grid matrix.',
    type: 'dp',
    difficulty: 'Intermediate',
    timeComplexities: { best: 'O(MN)', average: 'O(MN)', worst: 'O(MN)', space: 'O(MN)' }
  },
  'activity-selection': {
    name: 'Activity Selection (Greedy)',
    description: 'Selects the maximum number of mutually compatible activities.',
    type: 'greedy',
    difficulty: 'Beginner',
    timeComplexities: { best: 'O(N log N)', average: 'O(N log N)', worst: 'O(N log N)', space: 'O(N)' }
  },
  'huffman-coding': {
    name: 'Huffman Coding',
    description: 'Constructs optimal prefix codes for characters using a greedy tree.',
    type: 'greedy',
    difficulty: 'Advanced',
    timeComplexities: { best: 'O(N log N)', average: 'O(N log N)', worst: 'O(N log N)', space: 'O(N)' }
  },
  'hanoi': {
    name: 'Tower of Hanoi',
    description: 'Solves the classic mathematical puzzle of moving disks across pegs recursively.',
    type: 'recursion',
    difficulty: 'Intermediate',
    timeComplexities: { best: 'O(2^N)', average: 'O(2^N)', worst: 'O(2^N)', space: 'O(N)' }
  },
  'inorder-traversal': {
    name: 'Inorder Traversal',
    description: 'Visits left child, root, then right child. In a BST, it visits nodes in ascending order.',
    type: 'traversal',
    difficulty: 'Beginner',
    timeComplexities: { best: 'O(N)', average: 'O(N)', worst: 'O(N)', space: 'O(log N)' }
  },
  'preorder-traversal': {
    name: 'Preorder Traversal',
    description: 'Visits root, left child, then right child. Often used to create a copy of the tree.',
    type: 'traversal',
    difficulty: 'Beginner',
    timeComplexities: { best: 'O(N)', average: 'O(N)', worst: 'O(N)', space: 'O(log N)' }
  },
  'postorder-traversal': {
    name: 'Postorder Traversal',
    description: 'Visits left child, right child, then root. Often used to delete a tree.',
    type: 'traversal',
    difficulty: 'Beginner',
    timeComplexities: { best: 'O(N)', average: 'O(N)', worst: 'O(N)', space: 'O(log N)' }
  },
  'two-pointer': {
    name: 'Two-Pointer Target Sum',
    description: 'Uses two moving index markers (left and right) on a sorted array to find a target sum in O(N) time.',
    type: 'searching',
    difficulty: 'Intermediate',
    timeComplexities: { best: 'O(1)', average: 'O(N)', worst: 'O(N)', space: 'O(1)' }
  },
  'reverse-array': {
    name: 'Reverse Array (Two-Pointer)',
    description: 'Reverses the elements of an array (or linked list values) in-place using two pointers.',
    type: 'searching',
    difficulty: 'Beginner',
    timeComplexities: { best: 'O(N)', average: 'O(N)', worst: 'O(N)', space: 'O(1)' }
  },
};
