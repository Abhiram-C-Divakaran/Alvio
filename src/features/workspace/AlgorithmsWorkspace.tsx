import useReducedMotion from '../visualizer/useReducedMotion';
// ============================================================
// Algorithms Workspace Component
// Step-by-step interactive animations for sorting & searching
// ============================================================
import { useState, useEffect, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Lightformer, ContactShadows, Stars, Sparkles as DreiSparkles, Billboard, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Array3D from '../visualizer/Array3D';
import Algorithms3D from './Algorithms3D';
import GraphAlgorithms3D from './GraphAlgorithms3D';
import BinaryTree3D from '../visualizer/BinaryTree3D';
import DpGreedyAlgorithms3D from './DpGreedyAlgorithms3D';
import Visualization2D from './Visualization2D';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import useProgressStore from '../../stores/useProgressStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RefreshCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

import {ALGO_META, type AlgoType} from '../learn/algorithms/metadata';
export {ALGO_META};
export type {AlgoType};

interface Step {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  currentIndex: number;
  foundIndex: number; // Also used to track 'pivot' in Quick Sort
  low: number;
  high: number;
  description: string;
  codeLine: number;

  // Graph-specific step tracking:
  activeNodes?: string[];
  visitedNodes?: string[];
  activeEdges?: string[][];

  // DP & Greedy specific tracking:
  dpTable?: number[][];
  dpArray?: number[];
  selectedItems?: number[];
  intervals?: { id: string; start: number; end: number; selected: boolean; color?: string }[];
  huffmanNodes?: { id: string; label: string; freq: number; code?: string; x?: number; y?: number; left?: string; right?: string }[];

  // Recursion specific tracking:
  pegs?: number[][];
}



const CODE_TEMPLATES: Record<AlgoType, string[]> = {
  'bubble-sort': [
    'def bubble_sort(arr):',
    '    n = len(arr)',
    '    for i in range(n):',
    '        for j in range(0, n - i - 1):',
    '            if arr[j] > arr[j + 1]:',
    '                arr[j], arr[j + 1] = arr[j + 1], arr[j]',
    '    return arr',
  ],
  'selection-sort': [
    'def selection_sort(arr):',
    '    n = len(arr)',
    '    for i in range(n):',
    '        min_idx = i',
    '        for j in range(i + 1, n):',
    '            if arr[j] < arr[min_idx]:',
    '                min_idx = j',
    '        arr[i], arr[min_idx] = arr[min_idx], arr[i]',
    '    return arr',
  ],
  'insertion-sort': [
    'def insertion_sort(arr):',
    '    for i in range(1, len(arr)):',
    '        key = arr[i]',
    '        j = i - 1',
    '        while j >= 0 and arr[j] > key:',
    '            arr[j + 1] = arr[j]',
    '            j -= 1',
    '        arr[j + 1] = key',
    '    return arr',
  ],
  'merge-sort': [
    'def merge_sort(arr):',
    '    if len(arr) > 1:',
    '        mid = len(arr) // 2',
    '        L = arr[:mid]',
    '        R = arr[mid:]',
    '        merge_sort(L)',
    '        merge_sort(R)',
    '        i = j = k = 0',
    '        while i < len(L) and j < len(R):',
    '            if L[i] < R[j]:',
    '                arr[k] = L[i]',
    '                i += 1',
    '            else:',
    '                arr[k] = R[j]',
    '                j += 1',
    '            k += 1',
    '        # copy remaining elements...',
    '    return arr',
  ],
  'quick-sort': [
    'def quick_sort(arr, low, high):',
    '    if low < high:',
    '        pi = partition(arr, low, high)',
    '        quick_sort(arr, low, pi - 1)',
    '        quick_sort(arr, pi + 1, high)',
    '',
    'def partition(arr, low, high):',
    '    pivot = arr[high]',
    '    i = low - 1',
    '    for j in range(low, high):',
    '        if arr[j] <= pivot:',
    '            i += 1',
    '            arr[i], arr[j] = arr[j], arr[i]',
    '    arr[i + 1], arr[high] = arr[high], arr[i + 1]',
    '    return i + 1',
  ],
  'linear-search': [
    'def linear_search(arr, target):',
    '    for i in range(len(arr)):',
    '        if arr[i] == target:',
    '            return i  # Found',
    '    return -1  # Not found',
  ],
  'binary-search': [
    'def binary_search(arr, target):',
    '    low = 0',
    '    high = len(arr) - 1',
    '    while low <= high:',
    '        mid = (low + high) // 2',
    '        if arr[mid] == target:',
    '            return mid',
    '        elif arr[mid] < target:',
    '            low = mid + 1',
    '        else:',
    '            high = mid - 1',
    '    return -1',
  ],
  'bfs': [
    'def bfs(graph, start):',
    '    visited = {start}',
    '    queue = deque([start])',
    '    while queue:',
    '        vertex = queue.popleft()',
    '        for neighbor in graph[vertex]:',
    '            if neighbor not in visited:',
    '                visited.add(neighbor)',
    '                queue.append(neighbor)'
  ],
  'dfs': [
    'def dfs(graph, start, visited=None):',
    '    if visited is None: visited = set()',
    '    visited.add(start)',
    '    for neighbor in graph[start]:',
    '        if neighbor not in visited:',
    '            dfs(graph, neighbor, visited)'
  ],
  'dijkstra': [
    'def dijkstra(graph, start):',
    '    distances = {node: float(\'inf\') for node in graph}',
    '    distances[start] = 0',
    '    pq = [(0, start)]',
    '    while pq:',
    '        dist, node = heapq.heappop(pq)',
    '        for neighbor, weight in graph[node].items():',
    '            new_dist = dist + weight',
    '            if new_dist < distances[neighbor]:',
    '                distances[neighbor] = new_dist',
    '                heapq.heappush(pq, (new_dist, neighbor))'
  ],
  'bellman-ford': [
    'def bellman_ford(vertices, edges, start):',
    '    dist = {v: float(\'inf\') for v in vertices}',
    '    dist[start] = 0',
    '    for _ in range(len(vertices) - 1):',
    '        for u, v, w in edges:',
    '            if dist[u] + w < dist[v]:',
    '                dist[v] = dist[u] + w'
  ],
  'floyd-warshall': [
    'def floyd_warshall(graph):',
    '    dist = list(graph.adj_matrix)',
    '    for k in range(V):',
    '        for i in range(V):',
    '            for j in range(V):',
    '                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])'
  ],
  'kruskal': [
    'def kruskal(vertices, edges):',
    '    mst = []',
    '    edges.sort(key=lambda e: e.weight)',
    '    ds = DisjointSet(vertices)',
    '    for e in edges:',
    '        if ds.find(e.u) != ds.find(e.v):',
    '            ds.union(e.u, e.v)',
    '            mst.append(e)'
  ],
  'prim': [
    'def prim(graph, start):',
    '    mst = []',
    '    visited = {start}',
    '    pq = [(w, start, dest) for dest, w in graph[start]]',
    '    while pq:',
    '        w, u, v = heappop(pq)',
    '        if v not in visited:',
    '            visited.add(v)',
    '            mst.append((u, v, w))',
    '            for neighbor, weight in graph[v]:',
    '                heappush(pq, (weight, v, neighbor))'
  ],
  'topological-sort': [
    'def topo_sort(graph):',
    '    visited = set()',
    '    stack = []',
    '    def dfs(node):',
    '        visited.add(node)',
    '        for neighbor in graph[node]:',
    '            if neighbor not in visited: dfs(neighbor)',
    '        stack.append(node)',
    '    for node in graph:',
    '        if node not in visited: dfs(node)',
    '    return stack[::-1]'
  ],
  'knapsack': [
    'def knapsack(weights, values, W):',
    '    n = len(weights)',
    '    dp = [[0] * (W + 1) for _ in range(n + 1)]',
    '    for i in range(1, n + 1):',
    '        for w in range(1, W + 1):',
    '            if weights[i-1] <= w:',
    '                dp[i][w] = max(values[i-1] + dp[i-1][w-weights[i-1]], dp[i-1][w])',
    '            else:',
    '                dp[i][w] = dp[i-1][w]',
    '    return dp[n][W]'
  ],
  'fibonacci': [
    'def fib(n, memo={}):',
    '    if n <= 1: return n',
    '    if n in memo: return memo[n]',
    '    memo[n] = fib(n-1, memo) + fib(n-2, memo)',
    '    return memo[n]'
  ],
  'lcs': [
    'def lcs(X, Y):',
    '    m, n = len(X), len(Y)',
    '    dp = [[0] * (n + 1) for _ in range(m + 1)]',
    '    for i in range(1, m + 1):',
    '        for j in range(1, n + 1):',
    '            if X[i-1] == Y[j-1]:',
    '                dp[i][j] = dp[i-1][j-1] + 1',
    '            else:',
    '                dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
    '    return dp[m][n]'
  ],
  'activity-selection': [
    'def select_activities(start, end):',
    '    activities = sorted(zip(start, end), key=lambda x: x[1])',
    '    selected = [activities[0]]',
    '    prev_end = activities[0][1]',
    '    for s, e in activities[1:]:',
    '        if s >= prev_end:',
    '            selected.append((s, e))',
    '            prev_end = e',
    '    return selected'
  ],
  'huffman-coding': [
    'def huffman_coding(freqs):',
    '    heap = [[wt, [sym, ""]] for sym, wt in freqs.items()]',
    '    heapify(heap)',
    '    while len(heap) > 1:',
    '        lo = heappop(heap)',
    '        hi = heappop(heap)',
    '        for pair in lo[1:]:',
    '            pair[1] = "0" + pair[1]',
    '        for pair in hi[1:]:',
    '            pair[1] = "1" + pair[1]',
    '        heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])',
  ],
  'hanoi': [
    'def hanoi(n, source, target, auxiliary):',
    '    if n > 0:',
    '        # Move n-1 disks from source to auxiliary',
    '        hanoi(n-1, source, auxiliary, target)',
    '        # Move the remaining disk from source to target',
    '        print(f"Move disk {n} from {source} to {target}")',
    '        # Move the n-1 disks from auxiliary to target',
    '        hanoi(n-1, auxiliary, target, source)'
  ],
  'inorder-traversal': [
    'def inorder(node):',
    '    if node is None: return',
    '    inorder(node.left)',
    '    print(node.value)',
    '    inorder(node.right)'
  ],
  'preorder-traversal': [
    'def preorder(node):',
    '    if node is None: return',
    '    print(node.value)',
    '    preorder(node.left)',
    '    preorder(node.right)'
  ],
  'postorder-traversal': [
    'def postorder(node):',
    '    if node is None: return',
    '    postorder(node.left)',
    '    postorder(node.right)',
    '    print(node.value)'
  ],
  'two-pointer': [
    'def two_sum_sorted(arr, target):',
    '    left = 0',
    '    right = len(arr) - 1',
    '    while left < right:',
    '        curr_sum = arr[left] + arr[right]',
    '        if curr_sum == target:',
    '            return [left, right]',
    '        elif curr_sum < target:',
    '            left += 1',
    '        else:',
    '            right -= 1',
    '    return [-1, -1]'
  ],
  'reverse-array': [
    'def reverse_array(arr):',
    '    left = 0',
    '    right = len(arr) - 1',
    '    while left < right:',
    '        # Swap elements at left and right',
    '        arr[left], arr[right] = arr[right], arr[left]',
    '        left += 1',
    '        right -= 1',
    '    return arr'
  ],
};

import AlgorithmInfoPanel from '../visualizer/AlgorithmInfoPanel';
import CodeImplementationsModal from '../visualizer/CodeImplementationsModal';
import AlgorithmModuleLayout, {AlgorithmCamera} from '../visualizer/AlgorithmModuleLayout';
export default function AlgorithmsWorkspace({ viewMode: initialViewMode = '2d', filterType, initialAlgo, hideSidebar = false, hideCode = false, immersive = false, hideViewModeToggle = false }: { viewMode?: '3d' | '2d', filterType?: 'sorting' | 'searching' | 'all', initialAlgo?: AlgoType, hideSidebar?: boolean, hideCode?: boolean, immersive?: boolean, hideViewModeToggle?: boolean }) {
  const normalizeAlgo = (algo?: string): AlgoType => {
    if (!algo) return 'bubble-sort';
    const lower = algo.toLowerCase().replace(/\s+/g, '-');
    if (lower in ALGO_META) return lower as AlgoType;
    return 'bubble-sort';
  };

  const reducedMotion=useReducedMotion();
  const [viewMode, setViewMode] = useState<'3d' | '2d'>(initialViewMode);
  const [activeAlgo, setActiveAlgo] = useState<AlgoType>(() => normalizeAlgo(initialAlgo));
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [cameraRevision,setCameraRevision] = useState(0);
  useEffect(() => {
    if (initialAlgo) setActiveAlgo(normalizeAlgo(initialAlgo));
    else if (filterType === 'searching') setActiveAlgo('linear-search');
    else if (filterType === 'sorting') setActiveAlgo('bubble-sort');
  }, [filterType, initialAlgo]);
  const [array, setArray] = useState<number[]>([]);
  const [target, setTarget] = useState<string>('35');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1 = 1000ms, 2 = 500ms, 0.5 = 2000ms

  const timerRef = useRef<any>(null);
  const { addXp, addTimeSpent } = useProgressStore();

  // Generate random data
  const generateNewData = () => {
    setIsPlaying(false);
    let newArr: number[] = [];
    const getUniqueRandom = (arr: number[]) => {
      let r = Math.floor(Math.random() * 80) + 15;
      while (arr.includes(r)) {
        r = Math.floor(Math.random() * 80) + 15;
      }
      return r;
    };
    if (ALGO_META[activeAlgo].type === 'graph') {
      setArray([1, 2, 3, 4, 5, 6]);
      setCurrentStepIdx(0);
      return;
    }
    if (ALGO_META[activeAlgo].type === 'sorting') {
      for(let i=0; i<12; i++) newArr.push(getUniqueRandom(newArr));
    } else {
      for(let i=0; i<11; i++) newArr.push(getUniqueRandom(newArr));
      newArr.sort((a, b) => a - b);

      if (Math.random() > 0.3 && newArr.length > 0) {
        setTarget(String(newArr[Math.floor(Math.random() * newArr.length)]));
      } else {
        let rTarget = Math.floor(Math.random() * 80) + 15;
        while(newArr.includes(rTarget)) {
           rTarget = Math.floor(Math.random() * 80) + 15;
        }
        setTarget(String(rTarget));
      }
    }
    setArray(newArr);
    setCurrentStepIdx(0);
  };

  // Generate steps based on algorithm
  useEffect(() => {
    if (array.length === 0) return;

    const currentTarget = Number(target) || 0;
    const generatedSteps: Step[] = [];
    const currentArray = [...array];

    const addStep = (overrides: Partial<Step>) => {
      generatedSteps.push({
        array: [...currentArray],
        comparing: [],
        swapping: [],
        sorted: [],
        currentIndex: -1,
        foundIndex: -1,
        low: -1,
        high: -1,
        description: '',
        codeLine: 0,
        ...overrides,
      });
    };

    if (activeAlgo === 'bubble-sort') {
      const temp = currentArray;
      const n = temp.length;
      addStep({
        description: 'Initialize Bubble Sort. We will scan the array multiple times, swap adjacent elements if unsorted.',
        codeLine: 1,
      });

      for (let i = 0; i < n; i++) {
        addStep({
          description: `Outer loop iteration ${i + 1}: bubbles the next largest element to the end.`,
          codeLine: 3,
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
        });

        for (let j = 0; j < n - i - 1; j++) {
          addStep({
            comparing: [j, j + 1],
            description: `Comparing elements at index ${j} (${temp[j]}) and index ${j + 1} (${temp[j + 1]})`,
            codeLine: 5,
            sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
          });

          if (temp[j] > temp[j + 1]) {
            const val1 = temp[j];
            temp[j] = temp[j + 1];
            temp[j + 1] = val1;

            addStep({
              array: [...temp],
              swapping: [j, j + 1],
              description: `Swap ${temp[j + 1]} and ${temp[j]} since ${temp[j + 1]} > ${temp[j]}`,
              codeLine: 6,
              sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
            });
          }
        }
      }
      addStep({
        description: 'Bubble sort is complete! The array is fully sorted.',
        codeLine: 7,
        sorted: Array.from({ length: n }, (_, k) => k),
      });

    } else if (activeAlgo === 'selection-sort') {
      const temp = currentArray;
      const n = temp.length;
      addStep({
        description: 'Initialize Selection Sort. We will locate the minimum value in the unsorted portion and swap it.',
        codeLine: 1,
      });

      for (let i = 0; i < n; i++) {
        let minIdx = i;
        addStep({
          currentIndex: i,
          description: `Iteration ${i + 1}: Find the minimum element in unsorted section. Current min: ${temp[i]} at index ${i}.`,
          codeLine: 4,
          sorted: Array.from({ length: i }, (_, k) => k),
        });

        for (let j = i + 1; j < n; j++) {
          addStep({
            comparing: [j, minIdx],
            currentIndex: i,
            description: `Compare unsorted element ${temp[j]} with current min ${temp[minIdx]}.`,
            codeLine: 6,
            sorted: Array.from({ length: i }, (_, k) => k),
          });

          if (temp[j] < temp[minIdx]) {
            minIdx = j;
            addStep({
              comparing: [j],
              currentIndex: i,
              description: `New minimum value is ${temp[minIdx]} at index ${minIdx}.`,
              codeLine: 7,
              sorted: Array.from({ length: i }, (_, k) => k),
            });
          }
        }

        if (minIdx !== i) {
          const swapTemp = temp[i];
          temp[i] = temp[minIdx];
          temp[minIdx] = swapTemp;

          addStep({
            array: [...temp],
            swapping: [i, minIdx],
            description: `Swap element at index ${i} with minimum element ${temp[i]}.`,
            codeLine: 8,
            sorted: Array.from({ length: i + 1 }, (_, k) => k),
          });
        } else {
          addStep({
            description: `Minimum element is already at index ${i}. No swap needed.`,
            codeLine: 8,
            sorted: Array.from({ length: i + 1 }, (_, k) => k),
          });
        }
      }
      addStep({
        description: 'Selection sort complete! The array is fully sorted.',
        codeLine: 9,
        sorted: Array.from({ length: n }, (_, k) => k),
      });

    } else if (activeAlgo === 'insertion-sort') {
      const temp = currentArray;
      addStep({ description: 'Start Insertion Sort. We assume the first element is already sorted.', codeLine: 1 });
      const sorted = [0];

      for (let i = 1; i < temp.length; i++) {
        let key = temp[i];
        let j = i - 1;
        addStep({
          description: `Current element to insert: ${key}`,
          comparing: [i],
          sorted: [...sorted],
          codeLine: 3,
        });

        while (j >= 0 && temp[j] > key) {
          addStep({
            description: `Compare ${key} with ${temp[j]}. ${temp[j]} is larger, shift it right.`,
            comparing: [j, j + 1],
            sorted: [...sorted],
            codeLine: 5,
          });
          temp[j + 1] = temp[j];
          addStep({
            array: [...temp],
            swapping: [j, j + 1],
            sorted: [...sorted],
            codeLine: 6,
          });
          j = j - 1;
        }
        temp[j + 1] = key;
        sorted.push(i); // Add original index to sorted conceptually
        addStep({
          array: [...temp],
          description: `Inserted ${key} into its correct sorted position.`,
          sorted: Array.from({ length: i + 1 }, (_, k) => k),
          codeLine: 8,
        });
      }
      addStep({ description: 'Insertion sort is complete!', sorted: temp.map((_, i) => i), codeLine: 9 });

    } else if (activeAlgo === 'merge-sort') {
      const temp = currentArray;

      const merge = (low: number, mid: number, high: number) => {
        let left = temp.slice(low, mid + 1);
        let right = temp.slice(mid + 1, high + 1);
        let i = 0, j = 0, k = low;

        addStep({
          array: [...temp],
          description: `Merging subarrays: [${left.join(', ')}] and [${right.join(', ')}]`,
          low, high, currentIndex: mid,
          codeLine: 8
        });

        while (i < left.length && j < right.length) {
          if (left[i] <= right[j]) {
            temp[k] = left[i];
            i++;
          } else {
            temp[k] = right[j];
            j++;
          }
          addStep({
            array: [...temp],
            comparing: [k],
            description: `Placed ${temp[k]} into the merged array at index ${k}.`,
            low, high, currentIndex: mid,
            codeLine: 11
          });
          k++;
        }

        while (i < left.length) {
          temp[k] = left[i];
          addStep({ array: [...temp], comparing: [k], description: `Placed remaining ${temp[k]} from left subarray.`, low, high, currentIndex: mid, codeLine: 18 });
          i++; k++;
        }
        while (j < right.length) {
          temp[k] = right[j];
          addStep({ array: [...temp], comparing: [k], description: `Placed remaining ${temp[k]} from right subarray.`, low, high, currentIndex: mid, codeLine: 18 });
          j++; k++;
        }
      };

      const mergeSort = (low: number, high: number) => {
        if (low < high) {
          const mid = Math.floor((low + high) / 2);
          addStep({ description: `Dividing array from index ${low} to ${high}`, low, high, currentIndex: mid, codeLine: 3 });
          mergeSort(low, mid);
          mergeSort(mid + 1, high);
          merge(low, mid, high);
        }
      };

      addStep({ description: 'Start Merge Sort', codeLine: 1 });
      mergeSort(0, temp.length - 1);
      addStep({ description: 'Merge sort complete! Array is fully sorted.', sorted: temp.map((_, i) => i), codeLine: 19 });

    } else if (activeAlgo === 'quick-sort') {
      const temp = currentArray;
      const sortedList: number[] = [];

      const partition = (low: number, high: number) => {
        const pivot = temp[high];
        let i = low - 1;

        addStep({ array: [...temp], description: `Selected pivot ${pivot} at index ${high}`, low, high, foundIndex: high, sorted: [...sortedList], codeLine: 7 });

        for (let j = low; j < high; j++) {
          addStep({ array: [...temp], comparing: [j, high], description: `Comparing ${temp[j]} with pivot ${pivot}`, low, high, foundIndex: high, sorted: [...sortedList], codeLine: 10 });
          if (temp[j] <= pivot) {
            i++;
            const t = temp[i];
            temp[i] = temp[j];
            temp[j] = t;
            if (i !== j) {
              addStep({ array: [...temp], swapping: [i, j], description: `Swapped ${temp[i]} and ${temp[j]} (smaller than pivot)`, low, high, foundIndex: high, sorted: [...sortedList], codeLine: 12 });
            }
          }
        }
        const t = temp[i + 1];
        temp[i + 1] = temp[high];
        temp[high] = t;

        sortedList.push(i + 1);
        addStep({ array: [...temp], swapping: [i + 1, high], description: `Moved pivot ${pivot} into its correct sorted position`, low, high, foundIndex: -1, sorted: [...sortedList], codeLine: 13 });
        return i + 1;
      };

      const quickSort = (low: number, high: number) => {
        if (low < high) {
          const pi = partition(low, high);
          quickSort(low, pi - 1);
          quickSort(pi + 1, high);
        } else if (low === high) {
          sortedList.push(low);
        }
      };

      addStep({ description: 'Start Quick Sort', codeLine: 1 });
      quickSort(0, temp.length - 1);
      addStep({ description: 'Quick sort complete! Array is fully sorted.', sorted: temp.map((_, i) => i), codeLine: 5 });

    } else if (activeAlgo === 'linear-search') {
      addStep({
        description: `Start linear search for target ${currentTarget}. We will inspect elements from index 0.`,
        codeLine: 1,
      });

      let found = false;
      for (let i = 0; i < array.length; i++) {
        addStep({
          currentIndex: i,
          description: `Compare element at index ${i} (${array[i]}) with target ${currentTarget}.`,
          codeLine: 3,
        });

        if (array[i] === currentTarget) {
          addStep({
            currentIndex: i,
            foundIndex: i,
            description: `Match found! Element at index ${i} matches target ${currentTarget}. Return index ${i}.`,
            codeLine: 4,
          });
          found = true;
          break;
        }
      }

      if (!found) {
        addStep({
          foundIndex: -2, // not found
          description: `Target ${currentTarget} not found in the array. Returning -1.`,
          codeLine: 5,
        });
      }

    } else if (activeAlgo === 'binary-search') {
      const sorted = [...array].sort((a, b) => a - b);
      let low = 0;
      let high = sorted.length - 1;

      addStep({
        array: sorted,
        low,
        high,
        description: `Start binary search for target ${currentTarget}. Initial bounds: Low = 0, High = ${high}`,
        codeLine: 1,
      });

      let found = false;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        addStep({
          array: sorted,
          low,
          high,
          currentIndex: mid,
          description: `Calculate midpoint. Mid = (${low} + ${high}) / 2 = index ${mid}. Value at mid is ${sorted[mid]}.`,
          codeLine: 5,
        });

        if (sorted[mid] === currentTarget) {
          addStep({
            array: sorted,
            low,
            high,
            currentIndex: mid,
            foundIndex: mid,
            description: `Target ${currentTarget} matches midpoint value! Return index ${mid}.`,
            codeLine: 6,
          });
          found = true;
          break;
        }

        if (sorted[mid] < currentTarget) {
          low = mid + 1;
          addStep({
            array: sorted,
            low,
            high,
            currentIndex: mid,
            description: `mid value ${sorted[mid]} < target ${currentTarget}, target is in the right subarray. Adjust Low to mid + 1 = ${low}`,
            codeLine: 9,
          });
        } else {
          high = mid - 1;
          addStep({
            array: sorted,
            low,
            high,
            currentIndex: mid,
            description: `mid value ${sorted[mid]} > target ${currentTarget}, target is in the left subarray. Adjust High to mid - 1 = ${high}`,
            codeLine: 11,
          });
        }
      }

      if (!found) {
        addStep({
          array: sorted,
          low,
          high,
          foundIndex: -2,
          description: `Search space exhausted. Target ${currentTarget} is not in the array. Returning -1.`,
          codeLine: 12,
        });
      }
    } else if (activeAlgo === 'reverse-array') {
      const arr = [...array];
      let left = 0;
      let right = arr.length - 1;
      const sortedList: number[] = [];

      addStep({
        array: [...arr],
        comparing: [left, right],
        description: `Initialize pointers. Left at 0, Right at ${right}.`,
        codeLine: 2,
      });

      while (left < right) {
        addStep({
          array: [...arr],
          comparing: [left, right],
          description: `Compare and swap elements at Left (${arr[left]}) and Right (${arr[right]}).`,
          codeLine: 4,
        });

        const tempVal = arr[left];
        arr[left] = arr[right];
        arr[right] = tempVal;

        addStep({
          array: [...arr],
          swapping: [left, right],
          sorted: [...sortedList, left, right],
          description: `Swapped. Array is now partially reversed.`,
          codeLine: 6,
        });

        sortedList.push(left);
        sortedList.push(right);

        left++;
        right--;
      }

      if (left === right) sortedList.push(left);

      addStep({
        array: [...arr],
        sorted: sortedList,
        description: `Pointers met. Reversal complete!`,
        codeLine: 9,
      });

    } else if (activeAlgo === 'two-pointer') {
      const sorted = [...array].sort((a, b) => a - b);
      let left = 0;
      let right = sorted.length - 1;
      // Force a valid target if currentTarget is arbitrary, to make the animation meaningful
      const tSum = sorted[1] + sorted[sorted.length - 2];

      addStep({
        array: sorted,
        comparing: [left, right],
        description: `Start Two-Pointer search for target sum ${tSum}. Left pointer at 0 (${sorted[left]}), Right pointer at ${right} (${sorted[right]}).`,
        codeLine: 2,
      });

      let found = false;
      while (left < right) {
        const sum = sorted[left] + sorted[right];
        addStep({
          array: sorted,
          comparing: [left, right],
          description: `Check sum: ${sorted[left]} + ${sorted[right]} = ${sum}. Target is ${tSum}.`,
          codeLine: 5,
        });

        if (sum === tSum) {
          addStep({
            array: sorted,
            comparing: [left, right],
            foundIndex: left, // visual hack: highlight
            sorted: [left, right],
            description: `Match found! Sum ${sum} equals target ${tSum}. Return indices [${left}, ${right}].`,
            codeLine: 7,
          });
          found = true;
          break;
        }

        if (sum < tSum) {
          left++;
          addStep({
            array: sorted,
            comparing: [left, right],
            description: `Sum ${sum} is less than target ${tSum}. Since array is sorted, we must increase sum by moving Left pointer right.`,
            codeLine: 9,
          });
        } else {
          right--;
          addStep({
            array: sorted,
            comparing: [left, right],
            description: `Sum ${sum} is greater than target ${tSum}. Since array is sorted, we must decrease sum by moving Right pointer left.`,
            codeLine: 11,
          });
        }
      }

      if (!found) {
        addStep({
          array: sorted,
          description: `Pointers crossed. Target sum ${tSum} not found. Returning [-1, -1].`,
          codeLine: 12,
        });
      }
    } else if (activeAlgo === 'bfs') {
      addStep({ description: 'Initialize BFS queue starting at source node A.', activeNodes: ['A'], visitedNodes: ['A'], codeLine: 1 });
      addStep({ description: 'Visit neighbors of A: B and C. Add them to Queue.', activeNodes: ['A'], visitedNodes: ['A', 'B', 'C'], activeEdges: [['A', 'B'], ['A', 'C']], codeLine: 5 });
      addStep({ description: 'Dequeue node B. Traverse B\'s unvisited neighbor: D.', activeNodes: ['B'], visitedNodes: ['A', 'B', 'C', 'D'], activeEdges: [['B', 'D']], codeLine: 5 });
      addStep({ description: 'Dequeue node C. Traverse C\'s unvisited neighbor: E.', activeNodes: ['C'], visitedNodes: ['A', 'B', 'C', 'D', 'E'], activeEdges: [['C', 'E']], codeLine: 5 });
      addStep({ description: 'Dequeue node D. Traverse D\'s unvisited neighbor: F.', activeNodes: ['D'], visitedNodes: ['A', 'B', 'C', 'D', 'E', 'F'], activeEdges: [['D', 'F']], codeLine: 5 });
      addStep({ description: 'Dequeue node E. All neighbors already visited.', activeNodes: ['E'], visitedNodes: ['A', 'B', 'C', 'D', 'E', 'F'], codeLine: 4 });
      addStep({ description: 'Dequeue node F. Queue empty. BFS traversal complete!', activeNodes: [], visitedNodes: ['A', 'B', 'C', 'D', 'E', 'F'], codeLine: 10 });
    } else if (activeAlgo === 'dfs') {
      addStep({ description: 'Start DFS at root vertex A. Push to Stack.', activeNodes: ['A'], visitedNodes: ['A'], codeLine: 2 });
      addStep({ description: 'Deepest path: Visit neighbor B. Push B to Stack.', activeNodes: ['B'], visitedNodes: ['A', 'B'], activeEdges: [['A', 'B']], codeLine: 4 });
      addStep({ description: 'Deepest path: Visit neighbor D. Push D to Stack.', activeNodes: ['D'], visitedNodes: ['A', 'B', 'D'], activeEdges: [['B', 'D']], codeLine: 4 });
      addStep({ description: 'Deepest path: Visit neighbor C. Push C to Stack.', activeNodes: ['C'], visitedNodes: ['A', 'B', 'D', 'C'], activeEdges: [['D', 'C']], codeLine: 4 });
      addStep({ description: 'Node C has no unvisited neighbors. Backtrack to D.', activeNodes: ['D'], visitedNodes: ['A', 'B', 'D', 'C'], codeLine: 1 });
      addStep({ description: 'From D, visit unvisited neighbor E. Push E to Stack.', activeNodes: ['E'], visitedNodes: ['A', 'B', 'D', 'C', 'E'], activeEdges: [['D', 'E']], codeLine: 4 });
      addStep({ description: 'From E, visit unvisited neighbor F. Push F to Stack.', activeNodes: ['F'], visitedNodes: ['A', 'B', 'D', 'C', 'E', 'F'], activeEdges: [['E', 'F']], codeLine: 4 });
      addStep({ description: 'DFS traversal complete! All nodes visited.', activeNodes: [], visitedNodes: ['A', 'B', 'D', 'C', 'E', 'F'], codeLine: 6 });
    } else if (activeAlgo === 'dijkstra') {
      addStep({ description: 'Initialize Dijkstra shortest paths. Distances: A=0, all others=∞.', activeNodes: ['A'], visitedNodes: [], codeLine: 2 });
      addStep({ description: 'Relax edges from A: B (cost 4) and C (cost 2). Shortest path to C is 2.', activeNodes: ['A'], visitedNodes: ['A'], activeEdges: [['A', 'C']], codeLine: 6 });
      addStep({ description: 'Pick minimum distance unvisited node: C (cost 2).', activeNodes: ['C'], visitedNodes: ['A', 'C'], codeLine: 5 });
      addStep({ description: 'Relax edges from C: E (cost 2+3=5), B (cost 2+1=3). Shortest to B drops from 4 to 3.', activeNodes: ['C'], visitedNodes: ['A', 'C', 'B'], activeEdges: [['C', 'B']], codeLine: 6 });
      addStep({ description: 'Pick next min unvisited node: B (cost 3). Relax B to D (cost 3+5=8).', activeNodes: ['B'], visitedNodes: ['A', 'C', 'B'], activeEdges: [['B', 'D']], codeLine: 6 });
      addStep({ description: 'Pick next min unvisited: E (cost 5). Relax E to D (cost 5+2=7), F (cost 5+3=8).', activeNodes: ['E'], visitedNodes: ['A', 'C', 'B', 'E'], activeEdges: [['E', 'D']], codeLine: 6 });
      addStep({ description: 'Pick next min unvisited: D (cost 7). Relax D to F (cost 7+4=11). F remains 8.', activeNodes: ['D'], visitedNodes: ['A', 'C', 'B', 'E', 'D'], activeEdges: [['E', 'D']], codeLine: 6 });
      addStep({ description: 'Pick next min unvisited: F (cost 8). Pathfinding complete!', activeNodes: [], visitedNodes: ['A', 'C', 'B', 'E', 'D', 'F'], codeLine: 10 });
    } else if (activeAlgo === 'bellman-ford') {
      addStep({ description: 'Bellman-Ford initial state. Source A = 0, others = ∞.', activeNodes: ['A'], visitedNodes: [], codeLine: 2 });
      addStep({ description: 'Relaxing all edges. Round 1: A-B (4), A-C (2) relaxed.', activeNodes: ['A'], visitedNodes: ['A'], activeEdges: [['A', 'B'], ['A', 'C']], codeLine: 4 });
      addStep({ description: 'Round 1 (cont): B-C (1) relaxed. C is already 2, so path B->C is 4+1=5 > 2 (no change).', activeNodes: ['B'], visitedNodes: ['A', 'B'], codeLine: 5 });
      addStep({ description: 'Round 1 (cont): C-E (3) relaxed. E distance = 2+3=5.', activeNodes: ['C'], visitedNodes: ['A', 'B', 'C'], activeEdges: [['C', 'E']], codeLine: 5 });
      addStep({ description: 'Round 1 (cont): E-F (3) relaxed. F distance = 5+3=8.', activeNodes: ['E'], visitedNodes: ['A', 'B', 'C', 'E'], activeEdges: [['E', 'F']], codeLine: 5 });
      addStep({ description: 'Round 2: No more distances change. Final short paths found.', activeNodes: [], visitedNodes: ['A', 'B', 'C', 'D', 'E', 'F'], codeLine: 6 });
    } else if (activeAlgo === 'floyd-warshall') {
      addStep({ description: 'Initialize Floyd-Warshall distance matrix with direct weights.', activeNodes: [], visitedNodes: [], codeLine: 2 });
      addStep({ description: 'Iterate intermediate node k = A. Check shortcut paths through A.', activeNodes: ['A'], visitedNodes: [], codeLine: 3 });
      addStep({ description: 'Iterate intermediate node k = B. Shortcut A-B-C cost 4+1=5 is greater than A-C cost 2 (no change).', activeNodes: ['B'], visitedNodes: [], codeLine: 4 });
      addStep({ description: 'Iterate intermediate node k = C. Path A-C-E cost 2+3=5 is cheaper than A-E cost ∞. Relax path.', activeNodes: ['C'], visitedNodes: [], activeEdges: [['A', 'C'], ['C', 'E']], codeLine: 5 });
      addStep({ description: 'All pairs shortest paths computation complete!', activeNodes: [], visitedNodes: ['A', 'B', 'C', 'D', 'E', 'F'], codeLine: 5 });
    } else if (activeAlgo === 'kruskal') {
      addStep({ description: 'Kruskal MST: Sort all edges by weight. Disjoint set initialized.', activeNodes: [], visitedNodes: [], codeLine: 2 });
      addStep({ description: 'Evaluate edge B-C (weight 1). B and C are in disjoint sets. Add to MST.', activeNodes: ['B', 'C'], visitedNodes: ['B', 'C'], activeEdges: [['B', 'C']], codeLine: 5 });
      addStep({ description: 'Evaluate edge A-C (weight 2). A and C disjoint. Add to MST.', activeNodes: ['A', 'C'], visitedNodes: ['A', 'B', 'C'], activeEdges: [['B', 'C'], ['A', 'C']], codeLine: 5 });
      addStep({ description: 'Evaluate edge D-E (weight 2). D and E disjoint. Add to MST.', activeNodes: ['D', 'E'], visitedNodes: ['A', 'B', 'C', 'D', 'E'], activeEdges: [['B', 'C'], ['A', 'C'], ['D', 'E']], codeLine: 5 });
      addStep({ description: 'Evaluate edge C-E (weight 3). C and E disjoint. Add to MST.', activeNodes: ['C', 'E'], visitedNodes: ['A', 'B', 'C', 'D', 'E'], activeEdges: [['B', 'C'], ['A', 'C'], ['D', 'E'], ['C', 'E']], codeLine: 5 });
      addStep({ description: 'Evaluate edge E-F (weight 3). E and F disjoint. Add to MST. MST holds V-1 edges. Done!', activeNodes: ['E', 'F'], visitedNodes: ['A', 'B', 'C', 'D', 'E', 'F'], activeEdges: [['B', 'C'], ['A', 'C'], ['D', 'E'], ['C', 'E'], ['E', 'F']], codeLine: 5 });
    } else if (activeAlgo === 'prim') {
      addStep({ description: 'Prim MST: Start at vertex A. Visited = {A}.', activeNodes: ['A'], visitedNodes: ['A'], codeLine: 3 });
      addStep({ description: 'Check adjacent edges: A-C (cost 2) is cheapest. Add edge A-C, visit C.', activeNodes: ['C'], visitedNodes: ['A', 'C'], activeEdges: [['A', 'C']], codeLine: 6 });
      addStep({ description: 'Check adjacent edges to {A, C}: C-B (cost 1) is cheapest. Add edge C-B, visit B.', activeNodes: ['B'], visitedNodes: ['A', 'C', 'B'], activeEdges: [['A', 'C'], ['C', 'B']], codeLine: 6 });
      addStep({ description: 'Check adjacent edges to {A, C, B}: C-E (cost 3) is cheapest. Add edge C-E, visit E.', activeNodes: ['E'], visitedNodes: ['A', 'C', 'B', 'E'], activeEdges: [['A', 'C'], ['C', 'B'], ['C', 'E']], codeLine: 6 });
      addStep({ description: 'Check adjacent edges: E-D (cost 2) is cheapest. Add edge E-D, visit D.', activeNodes: ['D'], visitedNodes: ['A', 'C', 'B', 'E', 'D'], activeEdges: [['A', 'C'], ['C', 'B'], ['C', 'E'], ['E', 'D']], codeLine: 6 });
      addStep({ description: 'Check adjacent: E-F (cost 3) is cheapest. Add edge E-F, visit F. MST complete!', activeNodes: ['F'], visitedNodes: ['A', 'C', 'B', 'E', 'D', 'F'], activeEdges: [['A', 'C'], ['C', 'B'], ['C', 'E'], ['E', 'D'], ['E', 'F']], codeLine: 6 });
    } else if (activeAlgo === 'topological-sort') {
      addStep({ description: 'Initialize Topological Sort stack for DAG.', activeNodes: [], visitedNodes: [], codeLine: 1 });
      addStep({ description: 'DFS from A. Visited: A.', activeNodes: ['A'], visitedNodes: ['A'], codeLine: 5 });
      addStep({ description: 'DFS path: A -> B. Visited: A, B.', activeNodes: ['B'], visitedNodes: ['A', 'B'], activeEdges: [['A', 'B']], codeLine: 5 });
      addStep({ description: 'DFS path: B -> D. Visited: A, B, D.', activeNodes: ['D'], visitedNodes: ['A', 'B', 'D'], activeEdges: [['B', 'D']], codeLine: 5 });
      addStep({ description: 'DFS path: D -> F. Visited: A, B, D, F.', activeNodes: ['F'], visitedNodes: ['A', 'B', 'D', 'F'], activeEdges: [['D', 'F']], codeLine: 5 });
      addStep({ description: 'F has no neighbors. Push F to topological ordering stack.', activeNodes: ['F'], visitedNodes: ['A', 'B', 'D', 'F'], codeLine: 7 });
      addStep({ description: 'Pop back to D. Visit D\'s other neighbor E. Push E to stack.', activeNodes: ['E'], visitedNodes: ['A', 'B', 'D', 'F', 'E'], activeEdges: [['D', 'E']], codeLine: 7 });
      addStep({ description: 'Topological sort completed. Result: [A, B, D, E, C, F].', activeNodes: [], visitedNodes: ['A', 'B', 'D', 'E', 'C', 'F'], codeLine: 10 });
    } else if (activeAlgo === 'inorder-traversal') {
      addStep({ description: 'Start Inorder Traversal (Left, Root, Right). Initial node is Root (50).', activeNodes: [50], visitedNodes: [], codeLine: 1 });
      addStep({ description: 'Traverse Left Child (30).', activeNodes: [30], visitedNodes: [], codeLine: 3 });
      addStep({ description: 'Traverse Left Child (20).', activeNodes: [20], visitedNodes: [], codeLine: 3 });
      addStep({ description: '20 has no left child. Visit 20. Print 20.', activeNodes: [20], visitedNodes: [20], codeLine: 4 });
      addStep({ description: 'Backtrack to 30. Visit 30. Print 30.', activeNodes: [30], visitedNodes: [20, 30], codeLine: 4 });
      addStep({ description: 'Traverse Right Child of 30 (40).', activeNodes: [40], visitedNodes: [20, 30], codeLine: 5 });
      addStep({ description: '40 has no left child. Visit 40. Print 40.', activeNodes: [40], visitedNodes: [20, 30, 40], codeLine: 4 });
      addStep({ description: 'Backtrack to Root 50. Visit 50. Print 50.', activeNodes: [50], visitedNodes: [20, 30, 40, 50], codeLine: 4 });
      addStep({ description: 'Traverse Right Child of 50 (70).', activeNodes: [70], visitedNodes: [20, 30, 40, 50], codeLine: 5 });
      addStep({ description: 'Traverse Left Child of 70 (60).', activeNodes: [60], visitedNodes: [20, 30, 40, 50], codeLine: 3 });
      addStep({ description: '60 has no left child. Visit 60. Print 60.', activeNodes: [60], visitedNodes: [20, 30, 40, 50, 60], codeLine: 4 });
      addStep({ description: 'Backtrack to 70. Visit 70. Print 70.', activeNodes: [70], visitedNodes: [20, 30, 40, 50, 60, 70], codeLine: 4 });
      addStep({ description: 'Traverse Right Child of 70 (80).', activeNodes: [80], visitedNodes: [20, 30, 40, 50, 60, 70], codeLine: 5 });
      addStep({ description: '80 has no left child. Visit 80. Print 80. Traversal Complete!', activeNodes: [], visitedNodes: [20, 30, 40, 50, 60, 70, 80], codeLine: 4 });
    } else if (activeAlgo === 'preorder-traversal') {
      addStep({ description: 'Start Preorder Traversal (Root, Left, Right). Initial node is Root (50).', activeNodes: [50], visitedNodes: [], codeLine: 1 });
      addStep({ description: 'Visit Root (50). Print 50.', activeNodes: [50], visitedNodes: [50], codeLine: 3 });
      addStep({ description: 'Traverse Left Child (30). Visit 30. Print 30.', activeNodes: [30], visitedNodes: [50, 30], codeLine: 4 });
      addStep({ description: 'Traverse Left Child (20). Visit 20. Print 20.', activeNodes: [20], visitedNodes: [50, 30, 20], codeLine: 4 });
      addStep({ description: '20 has no children. Backtrack to 30. Traverse Right Child (40). Visit 40. Print 40.', activeNodes: [40], visitedNodes: [50, 30, 20, 40], codeLine: 5 });
      addStep({ description: '40 has no children. Backtrack to 50. Traverse Right Child (70). Visit 70. Print 70.', activeNodes: [70], visitedNodes: [50, 30, 20, 40, 70], codeLine: 5 });
      addStep({ description: 'Traverse Left Child (60). Visit 60. Print 60.', activeNodes: [60], visitedNodes: [50, 30, 20, 40, 70, 60], codeLine: 4 });
      addStep({ description: 'Traverse Right Child (80). Visit 80. Print 80. Traversal Complete!', activeNodes: [], visitedNodes: [50, 30, 20, 40, 70, 60, 80], codeLine: 5 });
    } else if (activeAlgo === 'postorder-traversal') {
      addStep({ description: 'Start Postorder Traversal (Left, Right, Root). Initial node is Root (50).', activeNodes: [50], visitedNodes: [], codeLine: 1 });
      addStep({ description: 'Traverse Left Child (30), then to its Left Child (20).', activeNodes: [20], visitedNodes: [], codeLine: 3 });
      addStep({ description: '20 has no children. Visit 20. Print 20.', activeNodes: [20], visitedNodes: [20], codeLine: 5 });
      addStep({ description: 'Backtrack to 30. Traverse Right Child (40).', activeNodes: [40], visitedNodes: [20], codeLine: 4 });
      addStep({ description: '40 has no children. Visit 40. Print 40.', activeNodes: [40], visitedNodes: [20, 40], codeLine: 5 });
      addStep({ description: 'Both children of 30 visited. Visit 30. Print 30.', activeNodes: [30], visitedNodes: [20, 40, 30], codeLine: 5 });
      addStep({ description: 'Backtrack to Root (50). Traverse Right Child (70).', activeNodes: [70], visitedNodes: [20, 40, 30], codeLine: 4 });
      addStep({ description: 'Traverse Left Child of 70 (60). 60 has no children. Visit 60. Print 60.', activeNodes: [60], visitedNodes: [20, 40, 30, 60], codeLine: 5 });
      addStep({ description: 'Traverse Right Child of 70 (80). 80 has no children. Visit 80. Print 80.', activeNodes: [80], visitedNodes: [20, 40, 30, 60, 80], codeLine: 5 });
      addStep({ description: 'Both children of 70 visited. Visit 70. Print 70.', activeNodes: [70], visitedNodes: [20, 40, 30, 60, 80, 70], codeLine: 5 });
      addStep({ description: 'Both children of 50 visited. Visit 50. Print 50. Traversal Complete!', activeNodes: [], visitedNodes: [20, 40, 30, 60, 80, 70, 50], codeLine: 5 });
    } else if (activeAlgo === 'fibonacci') {
      addStep({ description: 'Initialize Fibonacci DP base cases. F(0) = 0, F(1) = 1.', dpArray: [0, 1, 0, 0, 0, 0, 0], codeLine: 1 });
      addStep({ description: 'Calculate F(2) = F(1) + F(0) = 1 + 0 = 1.', dpArray: [0, 1, 1, 0, 0, 0, 0], codeLine: 3 });
      addStep({ description: 'Calculate F(3) = F(2) + F(1) = 1 + 1 = 2.', dpArray: [0, 1, 1, 2, 0, 0, 0], codeLine: 3 });
      addStep({ description: 'Calculate F(4) = F(3) + F(2) = 2 + 1 = 3.', dpArray: [0, 1, 1, 2, 3, 0, 0], codeLine: 3 });
      addStep({ description: 'Calculate F(5) = F(4) + F(3) = 3 + 2 = 5.', dpArray: [0, 1, 1, 2, 3, 5, 0], codeLine: 3 });
      addStep({ description: 'Calculate F(6) = F(5) + F(4) = 5 + 3 = 8. Computation complete.', dpArray: [0, 1, 1, 2, 3, 5, 8], codeLine: 4 });
    } else if (activeAlgo === 'knapsack') {
      const emptyGrid = Array(4).fill(null).map(() => Array(6).fill(0));
      addStep({ description: 'Initialize Knapsack DP grid. Rows = Items, Cols = Weight Capacity.', dpTable: emptyGrid, codeLine: 2 });

      const grid1 = emptyGrid.map((r, ri) => ri === 1 ? r.map((c, ci) => ci >= 2 ? 3 : 0) : [...r]);
      addStep({ description: 'Process Item 1 (Wt: 2, Val: 3). If capacity >= 2, we can select it.', dpTable: grid1, codeLine: 6 });

      const grid2 = grid1.map((r, ri) => ri === 2 ? r.map((c, ci) => ci === 3 ? 4 : ci === 4 ? 4 : ci === 5 ? 7 : grid1[1][ci]) : [...r]);
      addStep({ description: 'Process Item 2 (Wt: 3, Val: 4). At cap 5, combining Item 1 & 2 yields 3+4=7.', dpTable: grid2, codeLine: 6 });

      const grid3 = grid2.map((r, ri) => ri === 3 ? r.map((c, ci) => ci === 4 ? 5 : grid2[2][ci]) : [...r]);
      addStep({ description: 'Process Item 3 (Wt: 4, Val: 5). Optimal Knapsack value remains 7.', dpTable: grid3, codeLine: 9 });
    } else if (activeAlgo === 'lcs') {
      const emptyGrid = Array(4).fill(null).map(() => Array(4).fill(0));
      addStep({ description: 'Initialize LCS grid comparing X="BAT" and Y="CAT".', dpTable: emptyGrid, codeLine: 2 });

      const grid1 = emptyGrid.map((r, ri) => ri === 1 ? r.map(() => 0) : [...r]);
      addStep({ description: 'Compare X[0] ("B") with Y ("C", "A", "T"). No matches found.', dpTable: grid1, codeLine: 6 });

      const grid2 = grid1.map((r, ri) => ri === 2 ? r.map((c, ci) => ci >= 2 ? 1 : 0) : [...r]);
      addStep({ description: 'Compare X[1] ("A") with Y[1] ("A"). Match found! Set cell to 1.', dpTable: grid2, codeLine: 5 });

      const grid3 = grid2.map((r, ri) => ri === 3 ? r.map((c, ci) => ci === 3 ? 2 : grid2[2][ci]) : [...r]);
      addStep({ description: 'Compare X[2] ("T") with Y[2] ("T"). Match found! Set cell to 2. LCS length is 2.', dpTable: grid3, codeLine: 5 });
    } else if (activeAlgo === 'activity-selection') {
      const items = [
        { id: 'Act A', start: 1, end: 3, selected: false, color: 'rgba(59, 130, 246, 0.4)' },
        { id: 'Act B', start: 2, end: 5, selected: false, color: 'rgba(59, 130, 246, 0.4)' },
        { id: 'Act C', start: 4, end: 6, selected: false, color: 'rgba(59, 130, 246, 0.4)' },
        { id: 'Act D', start: 5, end: 7, selected: false, color: 'rgba(59, 130, 246, 0.4)' }
      ];
      addStep({ description: 'Sort activities by finish times.', intervals: items, codeLine: 1 });

      const s1 = items.map(t => t.id === 'Act A' ? { ...t, selected: true, color: 'rgba(34, 197, 94, 0.8)' } : t);
      addStep({ description: 'Select first activity A (1-3) greedily.', intervals: s1, codeLine: 3 });

      const s2 = s1.map(t => t.id === 'Act B' ? { ...t, color: 'rgba(239, 68, 68, 0.5)' } : t);
      addStep({ description: 'Evaluate B (2-5). Overlaps with A (start 2 < finish 3). Reject B.', intervals: s2, codeLine: 5 });

      const s3 = s2.map(t => t.id === 'Act C' ? { ...t, selected: true, color: 'rgba(34, 197, 94, 0.8)' } : t);
      addStep({ description: 'Evaluate C (4-6). Compatible (start 4 >= finish 3). Select C.', intervals: s3, codeLine: 5 });

      const s4 = s3.map(t => t.id === 'Act D' ? { ...t, color: 'rgba(239, 68, 68, 0.5)' } : t);
      addStep({ description: 'Evaluate D (5-7). Overlaps with C. Greedy selection complete!', intervals: s4, codeLine: 7 });
    } else if (activeAlgo === 'huffman-coding') {
      const nodes = [
        { id: 'A', label: 'A', freq: 5, x: -2, y: -1 },
        { id: 'B', label: 'B', freq: 9, x: -1, y: -1 },
        { id: 'C', label: 'C', freq: 12, x: 0, y: -1 },
        { id: 'D', label: 'D', freq: 13, x: 1, y: -1 },
        { id: 'E', label: 'E', freq: 16, x: 2, y: -1 }
      ];
      addStep({ description: 'Initialize priority queue with leaf nodes.', huffmanNodes: nodes, codeLine: 1 });

      const s1 = [
        ...nodes.filter(n => n.id !== 'A' && n.id !== 'B'),
        { id: 'AB', label: 'AB', freq: 14, x: -1.5, y: 0, left: 'A', right: 'B' },
        { id: 'A', label: 'A', freq: 5, x: -2, y: -1, code: '0' },
        { id: 'B', label: 'B', freq: 9, x: -1, y: -1, code: '1' }
      ];
      addStep({ description: 'Combine lowest frequencies A(5) and B(9) to AB(14).', huffmanNodes: s1, codeLine: 5 });

      const s2 = [
        ...s1.filter(n => n.id !== 'C' && n.id !== 'D'),
        { id: 'CD', label: 'CD', freq: 25, x: 0.5, y: 0.5, left: 'C', right: 'D' },
        { id: 'C', label: 'C', freq: 12, x: 0, y: -1, code: '0' },
        { id: 'D', label: 'D', freq: 13, x: 1, y: -1, code: '1' }
      ];
      addStep({ description: 'Combine next lowest C(12) and D(13) to CD(25).', huffmanNodes: s2, codeLine: 5 });

      const s3 = [
        ...s2.filter(n => n.id !== 'AB' && n.id !== 'E'),
        { id: 'ABE', label: 'ABE', freq: 30, x: -1, y: 1, left: 'AB', right: 'E' },
        { id: 'E', label: 'E', freq: 16, x: 2, y: -1, code: '1' }
      ];
      addStep({ description: 'Combine AB(14) and E(16) to ABE(30).', huffmanNodes: s3, codeLine: 5 });

      const s4 = [
        ...s3.filter(n => n.id !== 'CD' && n.id !== 'ABE'),
        { id: 'ROOT', label: 'ROOT', freq: 55, x: 0, y: 2, left: 'ABE', right: 'CD' }
      ];
      addStep({ description: 'Combine ABE(30) and CD(25) into Root(55). Tree complete!', huffmanNodes: s4, codeLine: 10 });
    } else if (activeAlgo === 'hanoi') {
      addStep({ description: 'Start state: Peg A has 3 disks stacked by size. Peg B & C empty.', pegs: [[3, 2, 1], [], []], codeLine: 1 });
      addStep({ description: 'Move disk 1 from Peg A to Peg C.', pegs: [[3, 2], [], [1]], codeLine: 4 });
      addStep({ description: 'Move disk 2 from Peg A to Peg B.', pegs: [[3], [2], [1]], codeLine: 8 });
      addStep({ description: 'Move disk 1 from Peg C to Peg B.', pegs: [[3], [2, 1], []], codeLine: 10 });
      addStep({ description: 'Move disk 3 from Peg A to Peg C.', pegs: [[], [2, 1], [3]], codeLine: 8 });
      addStep({ description: 'Move disk 1 from Peg B to Peg A.', pegs: [[1], [2], [3]], codeLine: 4 });
      addStep({ description: 'Move disk 2 from Peg B to Peg C.', pegs: [[1], [], [3, 2]], codeLine: 8 });
      addStep({ description: 'Move disk 1 from Peg A to Peg C. All disks moved successfully!', pegs: [[], [], [3, 2, 1]], codeLine: 10 });
    }

    setSteps(generatedSteps);
  }, [array, activeAlgo, target]);

  // Initial trigger
  useEffect(() => {
    generateNewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAlgo]);

  // Animation player effect
  useEffect(() => {
    if (isPlaying) {
      const delay = 1000 / speed;
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((idx) => {
          if (idx + 1 >= steps.length) {
            setIsPlaying(false);
            // Award XP on successful walkthrough completion
            addXp(50);
            addTimeSpent(2);
            return idx;
          }
          return idx + 1;
        });
      }, delay);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length, speed, addXp, addTimeSpent]);

  const step = steps[currentStepIdx] || null;

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStepIdx((idx) => Math.max(0, idx - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStepIdx((idx) => Math.min(steps.length - 1, idx + 1));
  };

  const handlePlayToggle = () => {
    if (currentStepIdx + 1 >= steps.length) {
      setCurrentStepIdx(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };


  if (immersive) {
    return <AlgorithmModuleLayout activeAlgo={activeAlgo} onAlgorithm={setActiveAlgo} playing={isPlaying} onPlay={handlePlayToggle}
      current={currentStepIdx} total={steps.length} onPrevious={handlePrev} onNext={handleNext} onReset={handleReset}
      onSeek={value=>{setCurrentStepIdx(value);setIsPlaying(false);}} speed={speed} onSpeed={setSpeed}
      showGuide={showUI} onGuide={()=>setShowUI(v=>!v)} onCamera={()=>setCameraRevision(v=>v+1)}
      target={target} onTarget={value=>{setTarget(value);setCurrentStepIdx(0);setIsPlaying(false);}}
      onShuffle={generateNewData} description={step?.description || 'Preparing algorithm steps…'}
      values={step?.array || []} active={step?.comparing || []} sorted={step?.sorted || []}
      code={CODE_TEMPLATES[activeAlgo]} codeLine={step?.codeLine}>
      <Suspense fallback={<p className="am-loading" role="status">Loading 3D scene…</p>}>
<Canvas dpr={[1,1.5]} camera={{ position: [0, 4, 16], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <pointLight position={[-10, 10, -10]} intensity={0.5} />
            <Environment resolution={128} frames={1}><Lightformer position={[0,5,-5]} scale={[12,5,1]} intensity={3} color="#b7cdff"/><Lightformer position={[-5,1,3]} rotation={[0,Math.PI/2,0]} scale={[5,8,1]} intensity={4} color="#7257ff"/></Environment>
            <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={reducedMotion ? 0 : 1} />
            <DreiSparkles count={50} scale={12} size={2} speed={reducedMotion ? 0 : 0.4} opacity={0.2} color="#818cf8" />

            {step && (
              ALGO_META[activeAlgo].type === 'traversal' ? (
                <BinaryTree3D reducedMotion={reducedMotion}
                  activeIndex={step.activeNodes}
                  visitedIndex={step.visitedNodes}
                />
              ) : ALGO_META[activeAlgo].type === 'graph' ? (
                <GraphAlgorithms3D
                  algoType={activeAlgo}
                  activeNodes={step.activeNodes as string[]}
                  visitedNodes={step.visitedNodes as string[]}
                  activeEdges={step.activeEdges}
                />
              ) : (ALGO_META[activeAlgo].type === 'dp' || ALGO_META[activeAlgo].type === 'greedy' || ALGO_META[activeAlgo].type === 'recursion') ? (
                <DpGreedyAlgorithms3D
                  algoType={activeAlgo}
                  dpTable={step.dpTable}
                  dpArray={step.dpArray}
                  intervals={step.intervals}
                  huffmanNodes={step.huffmanNodes}
                  pegs={step.pegs}
                />
              ) : (
                <Algorithms3D step={step} algoType={activeAlgo} />
              )
            )}

            <ContactShadows
              position={[0, -2, 0]}
              opacity={0.5}
              scale={20}
              blur={2}
              far={4}
              color="#000000"
            />
            <OrbitControls
              makeDefault
              enabled={true}
              enablePan={false}
              minDistance={5}
              maxDistance={65}
              minPolarAngle={0.35}
              maxPolarAngle={Math.PI / 2 + 0.1}
            />
            <EffectComposer>
              <Bloom
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                intensity={1.5}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
            <AlgorithmCamera revision={cameraRevision} algorithm={activeAlgo}/>
          </Canvas>
      </Suspense>
    </AlgorithmModuleLayout>;
  }

  return (
    <div className="flex h-full w-full">
      {/* Algorithms List Left Panel */}
      {!hideSidebar && (
      <div
        className="w-72 flex-shrink-0 p-4 overflow-y-auto border-r"
        style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg-secondary)' }}
      >
        <h2 className="text-sm font-semibold mb-3 tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          ALGORITHMS
        </h2>
        <div className="space-y-1.5">
          {(Object.keys(ALGO_META) as AlgoType[]).filter(key => !filterType || filterType === 'all' || ALGO_META[key].type === filterType).map((key) => {
            const isActive = activeAlgo === key;
            const meta = ALGO_META[key];
            return (
              <button
                key={key}
                onClick={() => setActiveAlgo(key)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                  isActive ? '' : 'hover:bg-[var(--color-surface-glass-hover)]'
                }`}
                style={{
                  background: isActive ? 'var(--color-surface-glass-active)' : undefined,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}
              >
                <span
                  className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? 'var(--color-accent-primary-light)' : 'var(--color-text-muted)',
                  }}
                >
                  <BookOpen size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{meta.name}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {meta.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* Main Visualizer Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Visualizer Toolbar */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <Badge variant="accent">
              <Sparkles size={12} className="mr-1" />
              {ALGO_META[activeAlgo].name}
            </Badge>

            {ALGO_META[activeAlgo].type === 'searching' && (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Search Target:</span>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => {
                    setTarget(e.target.value);
                    setIsPlaying(false);
                    setCurrentStepIdx(0);
                  }}
                  className="input-field w-16 text-center text-sm"
                  style={{ height: '30px', background: 'var(--color-bg-tertiary)' }}
                  placeholder="35"
                />
              </div>
            )}

            {/* View Mode Toggle */}
            {!hideViewModeToggle && (
              <div className="flex items-center gap-1 p-1 rounded-lg ml-2" style={{ background: 'var(--color-bg-tertiary)' }}>
                {(['3d', '2d'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold uppercase transition-colors"
                    style={{
                      background: viewMode === mode ? 'var(--gradient-accent)' : 'transparent',
                      color: viewMode === mode ? 'white' : 'var(--color-text-muted)',
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleReset} title="Reset">
              <RotateCcw size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentStepIdx === 0}>
              <SkipBack size={16} />
            </Button>
            <Button variant="primary" size="sm" onClick={handlePlayToggle}>
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentStepIdx + 1 >= steps.length}>
              <SkipForward size={16} />
            </Button>

            {/* Speed Multiplier Toggle */}
            <div className="flex items-center p-1 rounded-lg bg-[var(--color-bg-tertiary)] ml-2">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors"
                  style={{
                    background: speed === s ? 'var(--gradient-accent)' : 'transparent',
                    color: speed === s ? 'white' : 'var(--color-text-muted)',
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            <Button variant="secondary" size="sm" onClick={generateNewData} className="ml-2">
              Shuffle Data
            </Button>
          </div>
        </div>

        {/* Workspace Display Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Visual Elements Area */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {/* Array Bars / Cells render */}
            <div className="flex-1 flex items-center justify-center min-h-[300px] border border-[var(--color-border-subtle)] rounded-2xl bg-[var(--color-bg-secondary)] relative overflow-hidden px-10">
              {viewMode === '3d' ? (
                <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
                  <Canvas camera={{ position: [0, 4, 12], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                    <pointLight position={[-10, 10, -10]} intensity={0.5} />
                    <OrbitControls makeDefault enablePan={false} minDistance={5} maxDistance={20} maxPolarAngle={Math.PI / 2 + 0.1} />
                    <Environment preset="city" />

                    <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={reducedMotion ? 0 : 1} />
                    <DreiSparkles count={50} scale={12} size={2} speed={reducedMotion ? 0 : 0.4} opacity={0.2} color="#818cf8" />

                    {step && (
                      ALGO_META[activeAlgo].type === 'traversal' ? (
                        <BinaryTree3D reducedMotion={reducedMotion}
                          activeIndex={step.activeNodes}
                          visitedIndex={step.visitedNodes}
                        />
                      ) : ALGO_META[activeAlgo].type === 'graph' ? (
                        <GraphAlgorithms3D
                          algoType={activeAlgo}
                          activeNodes={step.activeNodes as string[]}
                          visitedNodes={step.visitedNodes as string[]}
                          activeEdges={step.activeEdges}
                        />
                      ) : (ALGO_META[activeAlgo].type === 'dp' || ALGO_META[activeAlgo].type === 'greedy' || ALGO_META[activeAlgo].type === 'recursion') ? (
                        <DpGreedyAlgorithms3D
                          algoType={activeAlgo}
                          dpTable={step.dpTable}
                          dpArray={step.dpArray}
                          intervals={step.intervals}
                          huffmanNodes={step.huffmanNodes}
                          pegs={step.pegs}
                        />
                      ) : (
                        <Algorithms3D step={step} algoType={activeAlgo} />
                      )
                    )}

                    <ContactShadows
                      position={[0, -2, 0]}
                      opacity={0.5}
                      scale={20}
                      blur={2}
                      far={4}
                      color="#000000"
                    />
                    <EffectComposer>
                      <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur />
                      <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                  </Canvas>
                </div>
              ) : (
                <>
                  {/* Pointer labels */}
                  {step && (activeAlgo === 'binary-search' || activeAlgo === 'merge-sort' || activeAlgo === 'quick-sort') && (
                    <div className="absolute top-4 left-6 flex flex-col gap-1 text-[11px] font-mono text-[var(--color-text-muted)]">
                      {step.low !== -1 && <div>Low index: <span className="text-blue-400 font-bold">{step.low}</span></div>}
                      {step.high !== -1 && <div>High index: <span className="text-purple-400 font-bold">{step.high}</span></div>}
                      {step.currentIndex !== -1 && activeAlgo === 'binary-search' && (
                        <div>Mid index: <span className="text-yellow-500 font-bold">{step.currentIndex}</span></div>
                      )}
                      {step.foundIndex !== -1 && activeAlgo === 'quick-sort' && (
                        <div>Pivot index: <span className="text-fuchsia-400 font-bold">{step.foundIndex}</span></div>
                      )}
                    </div>
                  )}

                  {/* Rendering for Sorting */}
                  {step && ALGO_META[activeAlgo].type === 'sorting' && (
                    <div className="flex items-end justify-center gap-2.5 h-64 w-full max-w-2xl px-6 relative">
                      {step.array.map((val, idx) => {
                        const isComparing = step.comparing.includes(idx);
                        const isSwapping = step.swapping.includes(idx);
                        const isSorted = step.sorted.includes(idx);
                        const isPivot = step.foundIndex === idx && activeAlgo === 'quick-sort';
                        const inRange = (activeAlgo === 'merge-sort' || activeAlgo === 'quick-sort') && idx >= step.low && idx <= step.high;

                        let barColor = 'rgba(59, 130, 246, 0.4)'; // blue transparent
                        let border = '1px solid rgba(59, 130, 246, 0.6)';
                        let shadow = '';
                        let opacity = 1;

                        if (isPivot) {
                          barColor = 'var(--color-accent-primary)';
                          border = '1px solid #d946ef';
                          shadow = '0 0 15px rgba(217, 70, 239, 0.5)';
                        } else if (isComparing) {
                          barColor = 'var(--color-warning)';
                          border = '1px solid #f59e0b';
                          shadow = '0 0 15px rgba(245, 158, 11, 0.5)';
                        } else if (isSwapping) {
                          barColor = 'var(--color-error)';
                          border = '1px solid #ef4444';
                          shadow = '0 0 15px rgba(239, 68, 68, 0.6)';
                        } else if (isSorted) {
                          barColor = 'var(--color-success)';
                          border = '1px solid #22c55e';
                        } else if ((activeAlgo === 'merge-sort' || activeAlgo === 'quick-sort') && !inRange && step.low !== -1) {
                          opacity = 0.2; // Dim elements outside current recursion range
                        }

                        return (
                          <motion.div key={val} className="flex-1 flex flex-col items-center gap-2 h-full justify-end" style={{ opacity }} layout transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                            <div
                              className="w-full rounded-t-lg relative transition-colors duration-200"
                              style={{
                                height: `${(val / 100) * 100}%`,
                                background: barColor,
                                border,
                                boxShadow: shadow,
                              }}
                            >
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold">
                                {val}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{idx}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Rendering for Searching */}
                  {step && ALGO_META[activeAlgo].type === 'searching' && (
                    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-3xl">
                      {/* Array Blocks */}
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {step.array.map((val, idx) => {
                          const isCurrent = step.currentIndex === idx;
                          const isFound = step.foundIndex === idx;
                          const inRange = activeAlgo === 'binary-search' && idx >= step.low && idx <= step.high;

                          let bg = 'var(--color-surface-glass)';
                          let border = '1px solid var(--color-border-default)';
                          let textColor = 'var(--color-text-primary)';
                          let glow = '';

                          if (isFound) {
                            bg = 'var(--color-success)';
                            border = '1px solid #22c55e';
                            textColor = 'white';
                            glow = '0 0 20px rgba(34, 197, 94, 0.5)';
                          } else if (isCurrent) {
                            bg = 'var(--color-warning)';
                            border = '1px solid #f59e0b';
                            textColor = 'black';
                            glow = '0 0 20px rgba(245, 158, 11, 0.5)';
                          } else if (activeAlgo === 'binary-search') {
                            if (!inRange) {
                              bg = 'rgba(255, 255, 255, 0.01)';
                              border = '1px dashed var(--color-border-subtle)';
                              textColor = 'var(--color-text-muted)';
                            } else {
                              bg = 'rgba(236, 72, 153, 0.2)';
                              border = '1px solid rgba(236, 72, 153, 0.5)';
                            }
                          }

                          return (
                            <div key={idx} className="flex flex-col items-center gap-1.5">
                              <motion.div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-base font-bold transition-all relative"
                                style={{
                                  background: bg,
                                  border,
                                  color: textColor,
                                  boxShadow: glow,
                                }}
                                layout
                              >
                                {val}
                                {/* Low/High indicators */}
                                {activeAlgo === 'binary-search' && idx === step.low && (
                                  <span className="absolute -top-5 text-[9px] font-mono font-bold text-blue-400">L</span>
                                )}
                                {activeAlgo === 'binary-search' && idx === step.high && (
                                  <span className="absolute -top-5 text-[9px] font-mono font-bold text-purple-400">H</span>
                                )}
                                {isCurrent && (
                                  <span className="absolute -bottom-5 text-[9px] font-mono font-bold text-yellow-500">M</span>
                                )}
                              </motion.div>
                              <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{idx}</span>
                            </div>
                          );
                        })}
                      </div>

                      {step.foundIndex === -2 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 px-5 rounded-xl border text-sm text-red-300 font-semibold"
                          style={{ background: 'var(--color-error-muted)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        >
                          Target element not found in the array!
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Rendering for Graph & Traversal Algorithms */}
                  {(ALGO_META[activeAlgo].type === 'graph' || ALGO_META[activeAlgo].type === 'traversal') && (
                    <div className="w-full h-full flex items-center justify-center scale-110 origin-center">
                      <Visualization2D structure={{
                        type: 'graph',
                        nodes: [
                          { id: 'A', value: 'A', position: { x: 0, y: 1.8, z: 0 }, state: { highlighted: step.activeNodes?.includes('A') } },
                          { id: 'B', value: 'B', position: { x: -2, y: 0.5, z: 0 }, state: { highlighted: step.activeNodes?.includes('B') } },
                          { id: 'C', value: 'C', position: { x: 2, y: 0.5, z: 0 }, state: { highlighted: step.activeNodes?.includes('C') } },
                          { id: 'D', value: 'D', position: { x: -1.5, y: -1, z: 0 }, state: { highlighted: step.activeNodes?.includes('D') } },
                          { id: 'E', value: 'E', position: { x: 1.5, y: -1, z: 0 }, state: { highlighted: step.activeNodes?.includes('E') } },
                          { id: 'F', value: 'F', position: { x: 0, y: -2.2, z: 0 }, state: { highlighted: step.activeNodes?.includes('F') } }
                        ],
                        edges: [
                          { id: 'e1', from: 'A', to: 'B', weight: 4 },
                          { id: 'e2', from: 'A', to: 'C', weight: 2 },
                          { id: 'e3', from: 'B', to: 'C', weight: 1 },
                          { id: 'e4', from: 'B', to: 'D', weight: 5 },
                          { id: 'e5', from: 'C', to: 'E', weight: 3 },
                          { id: 'e6', from: 'D', to: 'E', weight: 2 },
                          { id: 'e7', from: 'D', to: 'F', weight: 4 },
                          { id: 'e8', from: 'E', to: 'F', weight: 3 }
                        ]
                      }} />
                    </div>
                  )}

                  {/* Rendering for DP, Greedy & Recursion Algorithms */}
                  {step && (ALGO_META[activeAlgo].type === 'dp' || ALGO_META[activeAlgo].type === 'greedy' || ALGO_META[activeAlgo].type === 'recursion') && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 overflow-y-auto">
                      {/* Fibonacci: simple row of boxes */}
                      {activeAlgo === 'fibonacci' && step.dpArray && (
                        <div className="flex items-center gap-3">
                          {step.dpArray.map((val, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <div
                                className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                  (val > 0 || idx === 0)
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-500/10'
                                    : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)]'
                                }`}
                              >
                                <span className="text-[10px] text-[var(--color-text-muted)]">F({idx})</span>
                                <span className="text-base font-bold">{(val > 0 || idx === 0) ? val : '?'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Knapsack & LCS DP Tables */}
                      {(activeAlgo === 'knapsack' || activeAlgo === 'lcs') && step.dpTable && (
                        <div className="bg-[var(--color-surface-glass)] p-4 rounded-2xl border border-[var(--color-border-subtle)] overflow-x-auto max-w-full">
                          <table className="border-collapse">
                            <tbody>
                              {step.dpTable.map((row, ri) => (
                                <tr key={ri}>
                                  {row.map((val, ci) => (
                                    <td key={ci} className="p-1">
                                      <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono font-bold border transition-colors ${
                                          val > 0
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                            : 'bg-white/5 border-white/10 text-white/40'
                                        }`}
                                      >
                                        {val}
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Activity Selection intervals */}
                      {activeAlgo === 'activity-selection' && step.intervals && (
                        <div className="flex flex-col gap-2 w-full max-w-md">
                          {step.intervals.map((act) => (
                            <div
                              key={act.id}
                              className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                              style={{
                                background: act.selected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                borderColor: act.selected ? '#22c55e' : 'var(--color-border-subtle)'
                              }}
                            >
                              <span className="font-bold text-xs w-16 text-white">{act.id}</span>
                              <div className="flex-1 bg-white/5 h-2 rounded-full relative overflow-hidden">
                                <div
                                  className="absolute h-full rounded-full"
                                  style={{
                                    left: `${(act.start / 8) * 100}%`,
                                    width: `${((act.end - act.start) / 8) * 100}%`,
                                    background: act.selected ? '#22c55e' : act.color?.includes('239') ? '#ef4444' : '#3b82f6'
                                  }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-[var(--color-text-muted)] w-12 text-right">
                                {act.start} - {act.end}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Huffman Tree */}
                      {activeAlgo === 'huffman-coding' && step.huffmanNodes && (
                        <div className="w-full h-64 scale-90 origin-center flex items-center justify-center">
                          <Visualization2D structure={{
                            type: 'binary-tree',
                            nodes: step.huffmanNodes.map(n => ({
                              id: n.id,
                              value: `${n.label}\n(${n.freq})`,
                              left: n.left,
                              right: n.right,
                              state: { highlighted: !!n.code }
                            }))
                          }} />
                        </div>
                      )}

                      {/* Tower of Hanoi: 3 pegs with stacked disks */}
                      {activeAlgo === 'hanoi' && step.pegs && (
                        <div className="flex flex-col items-center justify-center h-80 w-full max-w-lg bg-[#0B1120]/40 p-6 rounded-3xl border border-white/5 relative">
                          {/* Pegs and Disks Container */}
                          <div className="flex-1 w-full flex justify-around items-end relative pb-4">
                            {step.pegs.map((pegDisks, pIdx) => (
                              <div key={pIdx} className="flex flex-col items-center relative w-32 h-full justify-end">
                                {/* Peg Shaft - Rounded Top Cap */}
                                <div className="w-3.5 h-44 bg-slate-500/80 rounded-t-full absolute bottom-0 shadow-inner" />

                                {/* Disks stacked on this peg */}
                                <div className="flex flex-col-reverse items-center z-10 w-full mb-0 gap-0.5">
                                  {pegDisks.map((diskSize) => {
                                    const colors = ['#eab308', '#3b82f6', '#f43f5e'];
                                    const diskWidth = diskSize * 28 + 32;
                                    return (
                                      <div
                                        key={diskSize}
                                        className="h-7 rounded-full shadow-lg border border-black/40 font-bold text-xs flex items-center justify-center text-white transition-all transform hover:scale-105"
                                        style={{
                                          width: `${diskWidth}px`,
                                          background: colors[diskSize - 1] || '#a855f7'
                                        }}
                                      >
                                        {diskSize === 1 ? 'Smallest' : diskSize === 3 ? 'Largest' : diskSize}
                                      </div>
                                    );
                                  })}
                                </div>

                                <span className="absolute -bottom-8 text-xs font-mono font-bold text-[var(--color-text-muted)]">
                                  {pIdx === 0 ? 'Peg A' : pIdx === 1 ? 'Peg B' : 'Peg C'}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* One single unified Base Board spanning across all 3 pegs */}
                          <div className="w-full h-4 bg-slate-600 rounded-full shadow-md border-b-2 border-slate-700/60 z-0" />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Step Explanation Card */}
            {step && (
              <Card padding="md" className="mt-4 border-l-4" style={{ borderLeftColor: 'var(--color-accent-primary)' }}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-primary-light)] mb-1">
                  Step {currentStepIdx + 1} of {steps.length}
                </h4>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                  {step.description}
                </p>
              </Card>
            )}
          </div>

          {/* Reference Code Right Panel */}
          {!hideCode && (
          <div
            className="w-80 flex-shrink-0 border-l overflow-y-auto flex flex-col"
            style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg-secondary)' }}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <h3 className="text-xs font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">
                REFERENCE CODE
              </h3>
              <Badge variant="success">Python</Badge>
            </div>

            <div className="flex-1 p-4 font-mono text-xs leading-6 overflow-x-auto select-none bg-[rgba(0,0,0,0.2)]">
              {CODE_TEMPLATES[activeAlgo].map((line, idx) => {
                const lineNum = idx + 1;
                const isCurrentLine = step?.codeLine === lineNum;

                return (
                  <div
                    key={idx}
                    className={`flex items-center px-2 py-0.5 rounded transition-all ${
                      isCurrentLine
                        ? 'bg-[var(--color-surface-glass-active)] text-white font-bold border-l-2 border-[var(--color-accent-primary)]'
                        : 'text-[var(--color-text-secondary)]'
                    }`}
                  >
                    <span
                      className="w-6 text-right mr-4 select-none font-mono font-medium"
                      style={{ color: isCurrentLine ? 'var(--color-accent-primary-light)' : 'var(--color-text-muted)' }}
                    >
                      {lineNum}
                    </span>
                    <pre className="whitespace-pre">{line}</pre>
                  </div>
                );
              })}
            </div>
          </div>
          )}
        </div>
      </div>
          <CodeImplementationsModal
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        activeDs={ALGO_META[activeAlgo].name}
      />
    </div>
  );
}
