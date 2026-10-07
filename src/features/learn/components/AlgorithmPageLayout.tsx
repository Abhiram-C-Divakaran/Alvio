import { TopicOrientation, TopicNextStep, topicNavigation } from '../../../navigation/TopicOrientation';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AlgorithmsWorkspace from '../../workspace/AlgorithmsWorkspace';
import Editor from '@monaco-editor/react';
import { Code2, Clock, Maximize2, Minimize2, HelpCircle, Terminal, Activity, ArrowLeft } from 'lucide-react';
import type { AlgoType } from '../../workspace/AlgorithmsWorkspace';

// Hardcode some snippets for algorithms
const algoSnippets: Record<AlgoType, Record<string, string>> = {
  'bubble-sort': {
    python: 'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr',
    javascript: 'function bubbleSort(arr) {\n  const n = arr.length;\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}',
    java: 'public void bubbleSort(int arr[]) {\n    int n = arr.length;\n    for (int i = 0; i < n-1; i++)\n        for (int j = 0; j < n-i-1; j++)\n            if (arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n}',
    cpp: 'void bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++)\n        for (int j = 0; j < n - i - 1; j++)\n            if (arr[j] > arr[j + 1])\n                swap(&arr[j], &arr[j + 1]);\n}'
  },
  'selection-sort': {
    python: 'def selection_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        min_idx = i\n        for j in range(i + 1, n):\n            if arr[j] < arr[min_idx]:\n                min_idx = j\n        arr[i], arr[min_idx] = arr[min_idx], arr[i]\n    return arr',
    javascript: 'function selectionSort(arr) {\n  let n = arr.length;\n  for (let i = 0; i < n; i++) {\n    let minIdx = i;\n    for (let j = i + 1; j < n; j++) {\n      if (arr[j] < arr[minIdx]) minIdx = j;\n    }\n    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];\n  }\n  return arr;\n}',
    java: 'public void selectionSort(int arr[]) {\n    int n = arr.length;\n    for (int i = 0; i < n-1; i++) {\n        int min_idx = i;\n        for (int j = i+1; j < n; j++)\n            if (arr[j] < arr[min_idx])\n                min_idx = j;\n        int temp = arr[min_idx];\n        arr[min_idx] = arr[i];\n        arr[i] = temp;\n    }\n}',
    cpp: 'void selectionSort(int arr[], int n) {\n    for (int i = 0; i < n-1; i++) {\n        int min_idx = i;\n        for (int j = i+1; j < n; j++)\n            if (arr[j] < arr[min_idx])\n                min_idx = j;\n        swap(&arr[min_idx], &arr[i]);\n    }\n}'
  },
  'insertion-sort': {
    python: 'def insertion_sort(arr):\n    for i in range(1, len(arr)):\n        key = arr[i]\n        j = i - 1\n        while j >= 0 and key < arr[j]:\n            arr[j + 1] = arr[j]\n            j -= 1\n        arr[j + 1] = key\n    return arr',
    javascript: 'function insertionSort(arr) {\n  let n = arr.length;\n  for (let i = 1; i < n; i++) {\n    let key = arr[i];\n    let j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j = j - 1;\n    }\n    arr[j + 1] = key;\n  }\n  return arr;\n}',
    java: 'public void insertionSort(int arr[]) {\n    int n = arr.length;\n    for (int i = 1; i < n; ++i) {\n        int key = arr[i];\n        int j = i - 1;\n        while (j >= 0 && arr[j] > key) {\n            arr[j + 1] = arr[j];\n            j = j - 1;\n        }\n        arr[j + 1] = key;\n    }\n}',
    cpp: 'void insertionSort(int arr[], int n) {\n    for (int i = 1; i < n; i++) {\n        int key = arr[i];\n        int j = i - 1;\n        while (j >= 0 && arr[j] > key) {\n            arr[j + 1] = arr[j];\n            j = j - 1;\n        }\n        arr[j + 1] = key;\n    }\n}'
  },
  'merge-sort': {
    python: 'def merge_sort(arr):\n    if len(arr) > 1:\n        mid = len(arr)//2\n        L = arr[:mid]\n        R = arr[mid:]\n        merge_sort(L)\n        merge_sort(R)\n        i = j = k = 0\n        while i < len(L) and j < len(R):\n            if L[i] < R[j]:\n                arr[k] = L[i]\n                i += 1\n            else:\n                arr[k] = R[j]\n                j += 1\n            k += 1\n        while i < len(L):\n            arr[k] = L[i]\n            i += 1\n            k += 1\n        while j < len(R):\n            arr[k] = R[j]\n            j += 1\n            k += 1',
    javascript: 'function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\nfunction merge(left, right) {\n  let res = [], i = 0, j = 0;\n  while (i < left.length && j < right.length) {\n    if (left[i] < right[j]) res.push(left[i++]);\n    else res.push(right[j++]);\n  }\n  return res.concat(left.slice(i)).concat(right.slice(j));\n}',
    java: 'public void mergeSort(int arr[], int l, int r) {\n    if (l < r) {\n        int m = l + (r - l) / 2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n        merge(arr, l, m, r);\n    }\n}',
    cpp: 'void mergeSort(int arr[], int l, int r) {\n    if (l < r) {\n        int m = l + (r - l) / 2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n        merge(arr, l, m, r);\n    }\n}'
  },
  'quick-sort': {
    python: 'def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)',
    javascript: 'function quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  let pivot = arr[arr.length - 1];\n  let left = [], right = [];\n  for (let i = 0; i < arr.length - 1; i++) {\n    if (arr[i] < pivot) left.push(arr[i]);\n    else right.push(arr[i]);\n  }\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}',
    java: 'public void quickSort(int arr[], int begin, int end) {\n    if (begin < end) {\n        int partitionIndex = partition(arr, begin, end);\n        quickSort(arr, begin, partitionIndex-1);\n        quickSort(arr, partitionIndex+1, end);\n    }\n}',
    cpp: 'void quickSort(int arr[], int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}'
  },
  'linear-search': {
    python: 'def linear_search(arr, x):\n    for i in range(len(arr)):\n        if arr[i] == x:\n            return i\n    return -1',
    javascript: 'function linearSearch(arr, x) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === x) return i;\n  }\n  return -1;\n}',
    java: 'public int linearSearch(int arr[], int x) {\n    int n = arr.length;\n    for (int i = 0; i < n; i++) {\n        if (arr[i] == x)\n            return i;\n    }\n    return -1;\n}',
    cpp: 'int linearSearch(int arr[], int n, int x) {\n    for (int i = 0; i < n; i++)\n        if (arr[i] == x)\n            return i;\n    return -1;\n}'
  },
  'binary-search': {
    python: 'def binary_search(arr, low, high, x):\n    if high >= low:\n        mid = (high + low) // 2\n        if arr[mid] == x:\n            return mid\n        elif arr[mid] > x:\n            return binary_search(arr, low, mid - 1, x)\n        else:\n            return binary_search(arr, mid + 1, high, x)\n    else:\n        return -1',
    javascript: 'function binarySearch(arr, x, low = 0, high = arr.length - 1) {\n  if (high >= low) {\n    let mid = low + Math.floor((high - low) / 2);\n    if (arr[mid] === x) return mid;\n    if (arr[mid] > x) return binarySearch(arr, x, low, mid - 1);\n    return binarySearch(arr, x, mid + 1, high);\n  }\n  return -1;\n}',
    java: 'int binarySearch(int arr[], int l, int r, int x) {\n    if (r >= l) {\n        int mid = l + (r - l) / 2;\n        if (arr[mid] == x) return mid;\n        if (arr[mid] > x) return binarySearch(arr, l, mid - 1, x);\n        return binarySearch(arr, mid + 1, r, x);\n    }\n    return -1;\n}',
    cpp: 'int binarySearch(int arr[], int l, int r, int x) {\n    if (r >= l) {\n        int mid = l + (r - l) / 2;\n        if (arr[mid] == x) return mid;\n        if (arr[mid] > x) return binarySearch(arr, l, mid - 1, x);\n        return binarySearch(arr, mid + 1, r, x);\n    }\n    return -1;\n}'
  },
  'bfs': {
    python: 'from collections import deque\ndef bfs(graph, start):\n    visited = set([start])\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        print(node)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)',
    javascript: 'function bfs(graph, start) {\n  let visited = new Set([start]);\n  let queue = [start];\n  while (queue.length > 0) {\n    let node = queue.shift();\n    console.log(node);\n    for (let neighbor of graph[node]) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n}',
    java: 'public void bfs(int start, List<List<Integer>> adj) {\n    boolean[] visited = new boolean[adj.size()];\n    Queue<Integer> q = new LinkedList<>();\n    visited[start] = true;\n    q.add(start);\n    while (!q.isEmpty()) {\n        int node = q.poll();\n        for (int n : adj.get(node)) {\n            if (!visited[n]) {\n                visited[n] = true;\n                q.add(n);\n            }\n        }\n    }\n}',
    cpp: 'void bfs(int start, vector<vector<int>>& adj) {\n    vector<bool> visited(adj.size(), false);\n    queue<int> q;\n    visited[start] = true;\n    q.push(start);\n    while (!q.empty()) {\n        int u = q.front(); q.pop();\n        for (int v : adj[u]) {\n            if (!visited[v]) {\n                visited[v] = true;\n                q.push(v);\n            }\n        }\n    }\n}'
  },
  'dfs': {
    python: 'def dfs(graph, start, visited=None):\n    if visited is None:\n        visited = set()\n    visited.add(start)\n    print(start)\n    for neighbor in graph[start]:\n        if neighbor not in visited:\n            dfs(graph, neighbor, visited)',
    javascript: 'function dfs(graph, start, visited = new Set()) {\n  visited.add(start);\n  console.log(start);\n  for (let neighbor of graph[start]) {\n    if (!visited.has(neighbor)) {\n      dfs(graph, neighbor, visited);\n    }\n  }\n}',
    java: 'public void dfs(int start, List<List<Integer>> adj, boolean[] visited) {\n    visited[start] = true;\n    for (int n : adj.get(start)) {\n        if (!visited[n]) {\n            dfs(n, adj, visited);\n        }\n    }\n}',
    cpp: 'void dfs(int u, vector<vector<int>>& adj, vector<bool>& visited) {\n    visited[u] = true;\n    for (int v : adj[u]) {\n        if (!visited[v]) {\n            dfs(v, adj, visited);\n        }\n    }\n}'
  },
  'dijkstra': {
    python: 'import heapq\ndef dijkstra(graph, start):\n    distances = {node: float(\'inf\') for node in graph}\n    distances[start] = 0\n    queue = [(0, start)]\n    while queue:\n        dist, node = heapq.heappop(queue)\n        if dist > distances[node]:\n            continue\n        for neighbor, weight in graph[node].items():\n            new_dist = dist + weight\n            if new_dist < distances[neighbor]:\n                distances[neighbor] = new_dist\n                heapq.heappush(queue, (new_dist, neighbor))\n    return distances',
    javascript: 'function dijkstra(graph, start) {\n  let dist = {};\n  for (let node in graph) dist[node] = Infinity;\n  dist[start] = 0;\n  let queue = [[0, start]];\n  while (queue.length > 0) {\n    queue.sort((a, b) => a[0] - b[0]);\n    let [d, u] = queue.shift();\n    if (d > dist[u]) continue;\n    for (let [v, w] of Object.entries(graph[u])) {\n      let nextD = d + w;\n      if (nextD < dist[v]) {\n        dist[v] = nextD;\n        queue.push([nextD, v]);\n      }\n    }\n  }\n  return dist;\n}',
    java: 'public void dijkstra(int start, List<List<Node>> adj) {\n    int[] dist = new int[adj.size()];\n    Arrays.fill(dist, Integer.MAX_VALUE);\n    dist[start] = 0;\n    PriorityQueue<Node> pq = new PriorityQueue<>((a, b) -> a.cost - b.cost);\n    pq.add(new Node(start, 0));\n    while (!pq.isEmpty()) {\n        int u = pq.poll().node;\n        for (Node n : adj.get(u)) {\n            if (dist[u] + n.cost < dist[n.node]) {\n                dist[n.node] = dist[u] + n.cost;\n                pq.add(new Node(n.node, dist[n.node]));\n            }\n        }\n    }\n}',
    cpp: 'void dijkstra(int start, vector<vector<pair<int, int>>>& adj) {\n    vector<int> dist(adj.size(), INT_MAX);\n    dist[start] = 0;\n    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;\n    pq.push({0, start});\n    while (!pq.empty()) {\n        int u = pq.top().second;\n        int d = pq.top().first;\n        pq.pop();\n        if (d > dist[u]) continue;\n        for (auto edge : adj[u]) {\n            int v = edge.first;\n            int w = edge.second;\n            if (dist[u] + w < dist[v]) {\n                dist[v] = dist[u] + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n}'
  },
  'bellman-ford': {
    python: 'def bellman_ford(vertices, edges, start):\n    dist = {v: float(\'inf\') for v in vertices}\n    dist[start] = 0\n    for _ in range(len(vertices) - 1):\n        for u, v, w in edges:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n    for u, v, w in edges:\n        if dist[u] + w < dist[v]:\n            print("Graph contains negative cycle")\n    return dist',
    javascript: 'function bellmanFord(vertices, edges, start) {\n  let dist = {};\n  for (let v of vertices) dist[v] = Infinity;\n  dist[start] = 0;\n  for (let i = 0; i < vertices.length - 1; i++) {\n    for (let [u, v, w] of edges) {\n      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n    }\n  }\n  return dist;\n}',
    java: 'public boolean bellmanFord(int start, Edge[] edges, int vCount) {\n    int[] dist = new int[vCount];\n    Arrays.fill(dist, Integer.MAX_VALUE);\n    dist[start] = 0;\n    for (int i = 1; i < vCount; ++i) {\n        for (Edge e : edges) {\n            if (dist[e.u] != Integer.MAX_VALUE && dist[e.u] + e.w < dist[e.v]) {\n                dist[e.v] = dist[e.u] + e.w;\n            }\n        }\n    }\n    return true;\n}',
    cpp: 'bool bellmanFord(int start, vector<Edge>& edges, int vCount) {\n    vector<int> dist(vCount, INT_MAX);\n    dist[start] = 0;\n    for (int i = 1; i < vCount; i++) {\n        for (auto e : edges) {\n            if (dist[e.u] != INT_MAX && dist[e.u] + e.w < dist[e.v])\n                dist[e.v] = dist[e.u] + e.w;\n        }\n    }\n    return true;\n}'
  },
  'floyd-warshall': {
    python: 'def floyd_warshall(graph):\n    dist = {u: {v: float(\'inf\') for v in graph} for u in graph}\n    for u in graph:\n        dist[u][u] = 0\n        for v, w in graph[u].items():\n            dist[u][v] = w\n    for k in graph:\n        for i in graph:\n            for j in graph:\n                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])\n    return dist',
    javascript: 'function floydWarshall(graph) {\n  let dist = {};\n  for (let u in graph) {\n    dist[u] = {};\n    for (let v in graph) dist[u][v] = u === v ? 0 : (graph[u][v] || Infinity);\n  }\n  for (let k in graph) {\n    for (let i in graph) {\n      for (let j in graph) {\n        dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);\n      }\n    }\n  }\n  return dist;\n}',
    java: 'public void floydWarshall(int[][] dist, int vCount) {\n    for (int k = 0; k < vCount; k++) {\n        for (int i = 0; i < vCount; i++) {\n            for (int j = 0; j < vCount; j++) {\n                if (dist[i][k] != Integer.MAX_VALUE && dist[k][j] != Integer.MAX_VALUE)\n                    dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);\n            }\n        }\n    }\n}',
    cpp: 'void floydWarshall(vector<vector<int>>& dist, int vCount) {\n    for (int k = 0; k < vCount; k++) {\n        for (int i = 0; i < vCount; i++) {\n            for (int j = 0; j < vCount; j++) {\n                if (dist[i][k] != INT_MAX && dist[k][j] != INT_MAX)\n                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);\n            }\n        }\n    }\n}'
  },
  'kruskal': {
    python: 'def kruskal(vertices, edges):\n    parent = {v: v for v in vertices}\n    def find(i):\n        if parent[i] == i: return i\n        return find(parent[i])\n    def union(i, j):\n        root_i, root_j = find(i), find(j)\n        parent[root_i] = root_j\n    mst = []\n    for u, v, w in sorted(edges, key=lambda x: x[2]):\n        if find(u) != find(v):\n            union(u, v)\n            mst.append((u, v, w))\n    return mst',
    javascript: 'function kruskal(vertices, edges) {\n  let parent = {};\n  for (let v of vertices) parent[v] = v;\n  function find(i) {\n    return parent[i] === i ? i : (parent[i] = find(parent[i]));\n  }\n  function union(i, j) {\n    parent[find(i)] = find(j);\n  }\n  edges.sort((a, b) => a[2] - b[2]);\n  let mst = [];\n  for (let [u, v, w] of edges) {\n    if (find(u) !== find(v)) {\n      union(u, v);\n      mst.push([u, v, w]);\n    }\n  }\n  return mst;\n}',
    java: 'public List<Edge> kruskal(List<Edge> edges, int vCount) {\n    DisjointSet ds = new DisjointSet(vCount);\n    Collections.sort(edges, (a, b) -> a.w - b.w);\n    List<Edge> mst = new ArrayList<>();\n    for (Edge e : edges) {\n        if (ds.find(e.u) != ds.find(e.v)) {\n            ds.union(e.u, e.v);\n            mst.add(e);\n        }\n    }\n    return mst;\n}',
    cpp: 'vector<Edge> kruskal(vector<Edge>& edges, int vCount) {\n    DisjointSet ds(vCount);\n    sort(edges.begin(), edges.end(), [](Edge a, Edge b) { return a.w < b.w; });\n    vector<Edge> mst;\n    for (auto e : edges) {\n        if (ds.find(e.u) != ds.find(e.v)) {\n            ds.union_sets(e.u, e.v);\n            mst.push_back(e);\n        }\n    }\n    return mst;\n}'
  },
  'prim': {
    python: 'import heapq\ndef prim(graph, start):\n    mst = []\n    visited = set([start])\n    edges = [(w, start, to) for to, w in graph[start].items()]\n    heapq.heapify(edges)\n    while edges:\n        w, frm, to = heapq.heappop(edges)\n        if to not in visited:\n            visited.add(to)\n            mst.append((frm, to, w))\n            for neighbor, weight in graph[to].items():\n                if neighbor not in visited:\n                    heapq.heappush(edges, (weight, to, neighbor))\n    return mst',
    javascript: 'function prim(graph, start) {\n  let mst = [], visited = new Set([start]);\n  let edges = [];\n  for (let [to, w] of Object.entries(graph[start])) edges.push([w, start, to]);\n  while (edges.length > 0) {\n    edges.sort((a, b) => a[0] - b[0]);\n    let [w, frm, to] = edges.shift();\n    if (!visited.has(to)) {\n      visited.add(to);\n      mst.push([frm, to, w]);\n      for (let [nextTo, nextW] of Object.entries(graph[to])) {\n        if (!visited.has(nextTo)) edges.push([nextW, to, nextTo]);\n      }\n    }\n  }\n  return mst;\n}',
    java: 'public void prim(int start, List<List<Node>> adj) {\n    boolean[] inMST = new boolean[adj.size()];\n    PriorityQueue<Node> pq = new PriorityQueue<>((a, b) -> a.cost - b.cost);\n    pq.add(new Node(start, 0));\n    while (!pq.isEmpty()) {\n        int u = pq.poll().node;\n        inMST[u] = true;\n        for (Node n : adj.get(u)) {\n            if (!inMST[n.node]) {\n                pq.add(new Node(n.node, n.cost));\n            }\n        }\n    }\n}',
    cpp: 'void prim(int start, vector<vector<pair<int, int>>>& adj) {\n    vector<bool> inMST(adj.size(), false);\n    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;\n    pq.push({0, start});\n    while (!pq.empty()) {\n        int u = pq.top().second;\n        pq.pop();\n        inMST[u] = true;\n        for (auto edge : adj[u]) {\n            int v = edge.first;\n            int w = edge.second;\n            if (!inMST[v]) pq.push({w, v});\n        }\n    }\n}'
  },
  'topological-sort': {
    python: 'def topo_sort(graph):\n    visited = set()\n    stack = []\n    def dfs(node):\n        visited.add(node)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                dfs(neighbor)\n        stack.append(node)\n    for node in graph:\n        if node not in visited:\n            dfs(node)\n    return stack[::-1]',
    javascript: 'function topoSort(graph) {\n  let visited = new Set(), stack = [];\n  function dfs(node) {\n    visited.add(node);\n    for (let neighbor of graph[node]) {\n      if (!visited.has(neighbor)) dfs(neighbor);\n    }\n    stack.push(node);\n  }\n  for (let node in graph) {\n    if (!visited.has(node)) dfs(node);\n  }\n  return stack.reverse();\n}',
    java: 'public void topoSort(int u, List<List<Integer>> adj, boolean[] visited, Stack<Integer> s) {\n    visited[u] = true;\n    for (int v : adj.get(u)) {\n        if (!visited[v]) topoSort(v, adj, visited, s);\n    }\n    s.push(u);\n}',
    cpp: 'void topoSort(int u, vector<vector<int>>& adj, vector<bool>& visited, stack<int>& s) {\n    visited[u] = true;\n    for (int v : adj[u]) {\n        if (!visited[v]) topoSort(v, adj, visited, s);\n    }\n    s.push(u);\n}'
  },
  'knapsack': {
    python: 'def knapsack(weights, values, W):\n    n = len(weights)\n    dp = [[0] * (W + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        for w in range(1, W + 1):\n            if weights[i-1] <= w:\n                dp[i][w] = max(values[i-1] + dp[i-1][w-weights[i-1]], dp[i-1][w])\n            else:\n                dp[i][w] = dp[i-1][w]\n    return dp[n][W]',
    javascript: 'function knapsack(weights, values, W) {\n  const n = weights.length;\n  let dp = Array(n + 1).fill(null).map(() => Array(W + 1).fill(0));\n  for (let i = 1; i <= n; i++) {\n    for (let w = 1; w <= W; w++) {\n      if (weights[i-1] <= w) {\n        dp[i][w] = Math.max(values[i-1] + dp[i-1][w-weights[i-1]], dp[i-1][w]);\n      } else {\n        dp[i][w] = dp[i-1][w];\n      }\n    }\n  }\n  return dp[n][W];\n}',
    java: 'public int knapsack(int[] wt, int[] val, int W) {\n    int n = wt.length;\n    int[][] dp = new int[n + 1][W + 1];\n    for (int i = 1; i <= n; i++) {\n        for (int w = 1; w <= W; w++) {\n            if (wt[i-1] <= w)\n                dp[i][w] = Math.max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w]);\n            else\n                dp[i][w] = dp[i-1][w];\n        }\n    }\n    return dp[n][W];\n}',
    cpp: 'int knapsack(int wt[], int val[], int W, int n) {\n    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));\n    for (int i = 1; i <= n; i++) {\n        for (int w = 1; w <= W; w++) {\n            if (wt[i-1] <= w)\n                dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w]);\n            else\n                dp[i][w] = dp[i-1][w];\n        }\n    }\n    return dp[n][W];\n}'
  },
  'fibonacci': {
    python: 'def fib(n, memo={}):\n    if n <= 1: return n\n    if n in memo: return memo[n]\n    memo[n] = fib(n-1, memo) + fib(n-2, memo)\n    return memo[n]',
    javascript: 'function fib(n, memo = {}) {\n  if (n <= 1) return n;\n  if (n in memo) return memo[n];\n  memo[n] = fib(n-1, memo) + fib(n-2, memo);\n  return memo[n];\n}',
    java: 'public int fib(int n) {\n    int[] dp = new int[n + 2];\n    dp[0] = 0; dp[1] = 1;\n    for (int i = 2; i <= n; i++) {\n        dp[i] = dp[i-1] + dp[i-2];\n    }\n    return dp[n];\n}',
    cpp: 'int fib(int n) {\n    vector<int> dp(n + 2);\n    dp[0] = 0; dp[1] = 1;\n    for (int i = 2; i <= n; i++) {\n        dp[i] = dp[i-1] + dp[i-2];\n    }\n    return dp[n];\n}'
  },
  'lcs': {
    python: 'def lcs(X, Y):\n    m, n = len(X), len(Y)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if X[i-1] == Y[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    return dp[m][n]',
    javascript: 'function lcs(X, Y) {\n  let m = X.length, n = Y.length;\n  let dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (X[i-1] === Y[j-1]) dp[i][j] = dp[i-1][j-1] + 1;\n      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n    }\n  }\n  return dp[m][n];\n}',
    java: 'public int lcs(String X, String Y) {\n    int m = X.length(), n = Y.length();\n    int[][] dp = new int[m + 1][n + 1];\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (X.charAt(i-1) == Y.charAt(j-1)) dp[i][j] = dp[i-1][j-1] + 1;\n            else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n        }\n    }\n    return dp[m][n];\n}',
    cpp: 'int lcs(string X, string Y) {\n    int m = X.length(), n = Y.length();\n    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (X[i-1] == Y[j-1]) dp[i][j] = dp[i-1][j-1] + 1;\n            else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);\n        }\n    }\n    return dp[m][n];\n}'
  },
  'activity-selection': {
    python: 'def select_activities(start, end):\n    activities = sorted(zip(start, end), key=lambda x: x[1])\n    selected = [activities[0]]\n    prev_end = activities[0][1]\n    for s, e in activities[1:]:\n        if s >= prev_end:\n            selected.append((s, e))\n            prev_end = e\n    return selected',
    javascript: 'function selectActivities(start, end) {\n  let acts = start.map((s, i) => [s, end[i]]).sort((a, b) => a[1] - b[1]);\n  let selected = [acts[0]], prevEnd = acts[0][1];\n  for (let i = 1; i < acts.length; i++) {\n    if (acts[i][0] >= prevEnd) {\n      selected.push(acts[i]);\n      prevEnd = acts[i][1];\n    }\n  }\n  return selected;\n}',
    java: 'public void selectActivities(int[] start, int[] end) {\n    // Assumes activities sorted by end times\n    int i = 0;\n    System.out.print(i + " ");\n    for (int j = 1; j < start.length; j++) {\n        if (start[j] >= end[i]) {\n            System.out.print(j + " ");\n            i = j;\n        }\n    }\n}',
    cpp: 'void selectActivities(vector<int>& start, vector<int>& end) {\n    // Assumes activities sorted by end times\n    int i = 0;\n    cout << i << " ";\n    for (int j = 1; j < start.size(); j++) {\n        if (start[j] >= end[i]) {\n            cout << j << " ";\n            i = j;\n        }\n    }\n}'
  },
  'huffman-coding': {
    python: 'def huffman_coding(freqs):\n    heap = [[wt, [sym, ""]] for sym, wt in freqs.items()]\n    heapify(heap)\n    while len(heap) > 1:\n        lo = heappop(heap)\n        hi = heappop(heap)\n        for pair in lo[1:]:\n            pair[1] = "0" + pair[1]\n        for pair in hi[1:]:\n            pair[1] = "1" + pair[1]\n        heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])\n    return sorted(heappop(heap)[1:])',
    javascript: 'function huffmanCoding(freqs) {\n  // Implementation using priority queue tree assembly\n  return freqs;\n}',
    java: 'public void buildHuffmanTree(char[] charArray, int[] charfreq) {\n    PriorityQueue<HuffmanNode> q = new PriorityQueue<>((a, b) -> a.data - b.data);\n    for (int i = 0; i < charArray.length; i++) {\n        HuffmanNode hn = new HuffmanNode(charfreq[i], charArray[i]);\n        q.add(hn);\n    }\n    HuffmanNode root = null;\n    while (q.size() > 1) {\n        HuffmanNode x = q.poll();\n        HuffmanNode y = q.poll();\n        HuffmanNode f = new HuffmanNode(x.data + y.data, \'-\');\n        f.left = x; f.right = y;\n        root = f;\n        q.add(f);\n    }\n}',
    cpp: 'void printCodes(struct MinHeapNode* root, string str) {\n    if (!root) return;\n    if (root->data != \'$\') cout << root->data << ": " << str << "\\n";\n    printCodes(root->left, str + "0");\n    printCodes(root->right, str + "1");\n}'
  },
  'hanoi': {
    python: 'def hanoi(n, source, target, aux):\n    if n > 0:\n        hanoi(n-1, source, aux, target)\n        print(f"Move disk from {source} to {target}")\n        hanoi(n-1, aux, target, source)',
    javascript: 'function hanoi(n, source, target, aux) {\n  if (n > 0) {\n    hanoi(n - 1, source, aux, target);\n    console.log(`Move disk from ${source} to ${target}`);\n    hanoi(n - 1, aux, target, source);\n  }\n}',
    java: 'public void hanoi(int n, char source, char target, char aux) {\n    if (n > 0) {\n        hanoi(n-1, source, aux, target);\n        System.out.println("Move disk from " + source + " to " + target);\n        hanoi(n-1, aux, target, source);\n    }\n}',
    cpp: 'void hanoi(int n, char source, char target, char aux) {\n    if (n > 0) {\n        hanoi(n-1, source, aux, target);\n        cout << "Move disk from " << source << " to " << target << endl;\n        hanoi(n-1, aux, target, source);\n    }\n}'
  }
};

interface AlgorithmPageLayoutProps {
  type: AlgoType;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeComplexities: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
  content: React.ReactNode;
}

export default function AlgorithmPageLayout({
  type,
  title,
  description,
  difficulty,
  timeComplexities,
  content,
}: AlgorithmPageLayoutProps) {
  const navigate = useNavigate();
  const topicLinks=topicNavigation(useLocation().pathname);
  const [language, setLanguage] = useState<'python' | 'javascript' | 'java' | 'cpp'>('python');
  const [isVisualizerExpanded, setIsVisualizerExpanded] = useState(false);

  const currentCode = algoSnippets[type]?.[language] || '// Code snippet coming soon';

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Intermediate': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Advanced': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const navigateToComplexity = (rawVal: string, isSpace = false) => {
    let cleanVal = rawVal.replace(/\*/g, '').trim();
    if (cleanVal.toLowerCase().includes('log') && cleanVal.toLowerCase().includes('n') && !cleanVal.toLowerCase().includes('n log')) {
      cleanVal = 'O(log N)';
    } else if (cleanVal.toLowerCase() === 'o(1)') {
      cleanVal = 'O(1)';
    } else if (cleanVal.toLowerCase() === 'o(n)') {
      cleanVal = 'O(N)';
    } else if (cleanVal.toLowerCase().includes('n log')) {
      cleanVal = 'O(N log N)';
    } else if (cleanVal.toLowerCase().includes('n2') || cleanVal.includes('N²') || cleanVal.toLowerCase().includes('n^2')) {
      cleanVal = 'O(N²)';
    } else if (cleanVal.toLowerCase().includes('2^n')) {
      cleanVal = 'O(2^N)';
    }
    const modeQuery = isSpace ? '&mode=space' : '';
    navigate(`/learn/complexity?highlight=${encodeURIComponent(cleanVal)}${modeQuery}`);
  };

  return (
    <div className="app-lesson text-white">
      <div className="app-lesson-body">
        <TopicOrientation/>
        {/* Header Section */}
        <header className="space-y-6">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <button
              onClick={() => navigate('/learn/algorithms')}
              className="px-4 py-2 bg-[var(--color-surface-glass)] text-[var(--color-text-secondary)] hover:text-white rounded-xl text-sm font-semibold border border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)] transition-all flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back to Algorithms
            </button>

            <button
              onClick={() => navigate(`/algorithms-visualizer?algo=${type}`)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Activity size={16} />
              Open in 3D Workspace
            </button>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {title}
            </h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm max-w-3xl leading-relaxed">
            {description}
          </p>
        </header>

        {/* Visualizer Section */}
        <div className="relative">
          <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden shadow-2xl flex flex-col h-full">
            {/* Visualizer Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)] bg-black/20">
              <div className="flex items-center gap-3">
                <Activity className="text-blue-400" size={24} />
                <h2 className="text-xl font-bold m-0 text-white">Interactive Visualizer</h2>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden relative min-h-[500px]">
                <div className="w-full h-full">
                  <AlgorithmsWorkspace
                    initialAlgo={type}
                    hideSidebar
                    hideCode
                    viewMode="3d"
                    hideViewModeToggle={true}
                  />
                </div>
            </div>
          </div>
        </div>

        {/* Complexity Table */}
        <div className="bg-[var(--color-surface-glass)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden shadow-xl max-w-4xl mx-auto">
          <div className="border-b border-[var(--color-border-subtle)] bg-black/20 p-4">
            <h2 className="text-xl font-bold flex items-center gap-2 m-0">
              <Clock className="text-green-400" size={24} />
              Time & Space Complexity
            </h2>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              onClick={() => navigateToComplexity(timeComplexities.best)}
              className="flex flex-col p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-blue-500 hover:scale-[1.03] transition-all cursor-pointer shadow-sm group"
            >
              <span className="font-semibold text-[var(--color-text-secondary)] mb-2 text-center text-sm uppercase tracking-wider group-hover:text-blue-300">Best</span>
              <span className="font-mono font-bold text-white bg-blue-500/20 px-3 py-2 rounded-lg text-center text-lg group-hover:bg-blue-500/30">{timeComplexities.best}</span>
            </div>
            <div
              onClick={() => navigateToComplexity(timeComplexities.average)}
              className="flex flex-col p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-blue-500 hover:scale-[1.03] transition-all cursor-pointer shadow-sm group"
            >
              <span className="font-semibold text-[var(--color-text-secondary)] mb-2 text-center text-sm uppercase tracking-wider group-hover:text-blue-300">Average</span>
              <span className="font-mono font-bold text-white bg-blue-500/20 px-3 py-2 rounded-lg text-center text-lg group-hover:bg-blue-500/30">{timeComplexities.average}</span>
            </div>
            <div
              onClick={() => navigateToComplexity(timeComplexities.worst)}
              className="flex flex-col p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-blue-500 hover:scale-[1.03] transition-all cursor-pointer shadow-sm group"
            >
              <span className="font-semibold text-[var(--color-text-secondary)] mb-2 text-center text-sm uppercase tracking-wider group-hover:text-blue-300">Worst</span>
              <span className="font-mono font-bold text-white bg-blue-500/20 px-3 py-2 rounded-lg text-center text-lg group-hover:bg-blue-500/30">{timeComplexities.worst}</span>
            </div>
            <div
              onClick={() => navigateToComplexity(timeComplexities.space, true)}
              className="flex flex-col p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-blue-500 hover:scale-[1.03] transition-all cursor-pointer shadow-sm group"
            >
              <span className="font-semibold text-[var(--color-text-secondary)] mb-2 text-center text-sm uppercase tracking-wider group-hover:text-blue-300">Space</span>
              <span className="font-mono font-bold text-white bg-blue-500/20 px-3 py-2 rounded-lg text-center text-lg group-hover:bg-blue-500/30">{timeComplexities.space}</span>
            </div>
          </div>
        </div>

        {/* Main Article Content */}
        <div className="bg-[var(--color-surface-glass)] rounded-2xl border border-[var(--color-border-subtle)] shadow-xl p-8 md:p-12">
          <article className="prose prose-invert prose-blue max-w-none prose-headings:text-indigo-300 prose-a:text-blue-400 prose-lg prose-img:rounded-xl">
            {content}
          </article>
        </div>

        {/* Code Implementations */}
        <section className="bg-[var(--color-surface-glass)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden shadow-xl">
          <div className="border-b border-[var(--color-border-subtle)] bg-black/20 p-4">
            <h2 className="text-xl font-bold flex items-center gap-2 m-0">
              <Code2 className="text-indigo-400" size={24} />
              Implementation
            </h2>
          </div>

          <div className="flex border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)] overflow-x-auto custom-scrollbar">
            {(['python', 'javascript', 'java', 'cpp'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  language === lang
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                    : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                {lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>

          <div className="h-[500px]">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={currentCode}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                fontFamily: "'JetBrains Mono', monospace",
                readOnly: true,
                padding: { top: 24, bottom: 24 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          {topicLinks?.quiz && <button
            disabled={!topicLinks?.quiz} onClick={() => topicLinks?.quiz && navigate(`/quiz?topic=${encodeURIComponent(topicLinks.quiz)}`)}
            className="flex items-center justify-between p-8 bg-gradient-to-br from-[var(--color-surface-glass)] to-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group shadow-xl"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-inner">
                <HelpCircle size={32} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{topicLinks?.quiz?'Take a Quiz':'Quiz unavailable'}</h3>
                <p className="text-base text-[var(--color-text-muted)]">Test your knowledge on {title}.</p>
              </div>
            </div>
            <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-x-[-15px] group-hover:translate-x-0 transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </div>
          </button>}
          <button
            onClick={() => navigate(`/coding?topic=${encodeURIComponent(title)}`)}
            className="flex items-center justify-between p-8 bg-gradient-to-br from-[var(--color-surface-glass)] to-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group shadow-xl"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-inner">
                <Terminal size={32} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Practice Coding</h3>
                <p className="text-base text-[var(--color-text-muted)]">Solve {title} coding problems.</p>
              </div>
            </div>
            <div className="text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-[-15px] group-hover:translate-x-0 transition-all">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </div>
          </button>
        </div>
        <TopicNextStep/>
      </div>
    </div>
  );
}
