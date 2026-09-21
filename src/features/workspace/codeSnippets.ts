import type { DataStructureType } from '../../types/dataStructures';

export const codeSnippets: Record<DataStructureType | 'bubble-sort' | 'selection-sort' | 'insertion-sort' | 'merge-sort' | 'quick-sort' | 'linear-search' | 'binary-search', Record<string, string>> = {
  array: {
    python: `class Array:
    def __init__(self, capacity=8):
        self.capacity = capacity
        self.items = []
    def insert(self, value):
        if len(self.items) >= self.capacity:
            raise OverflowError("Array is full")
        self.items.append(value)
    def delete(self, index):
        return self.items.pop(index)
    def search(self, value):
        return self.items.index(value) if value in self.items else -1`,
    javascript: `class ArrayStruct {
    constructor(capacity = 8) {
        this.capacity = capacity;
        this.items = [];
    }
    insert(value) {
        if (this.items.length >= this.capacity) {
            throw new Error("Array is full");
        }
        this.items.push(value);
    }
    delete(index) {
        return this.items.splice(index, 1)[0];
    }
    search(value) {
        return this.items.indexOf(value);
    }
}`,
    java: `class ArrayStruct {
    private int[] items;
    private int capacity;
    private int size;

    public ArrayStruct(int capacity) {
        this.capacity = capacity;
        this.items = new int[capacity];
        this.size = 0;
    }
    public void insert(int value) throws Exception {
        if (size >= capacity) throw new Exception("Array is full");
        items[size++] = value;
    }
    public int search(int value) {
        for (int i = 0; i < size; i++) {
            if (items[i] == value) return i;
        }
        return -1;
    }
}`,
    cpp: `class Array {
private:
    int* items;
    int capacity;
    int size;
public:
    Array(int cap = 8) : capacity(cap), size(0) {
        items = new int[capacity];
    }
    ~Array() { delete[] items; }
    void insert(int value) {
        if (size >= capacity) throw std::overflow_error("Array is full");
        items[size++] = value;
    }
    int search(int value) {
        for (int i = 0; i < size; i++) {
            if (items[i] == value) return i;
        }
        return -1;
    }
};`
  },
  'linked-list': {
    python: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None
class LinkedList:
    def __init__(self):
        self.head = None
    def insert(self, value):
        node = Node(value)
        if not self.head:
            self.head = node
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = node
    def search(self, value):
        cur = self.head
        while cur:
            if cur.value == value:
                return True
            cur = cur.next
        return False`,
    javascript: `class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}
class LinkedList {
    constructor() {
        this.head = null;
    }
    insert(value) {
        const node = new Node(value);
        if (!this.head) {
            this.head = node;
            return;
        }
        let cur = this.head;
        while (cur.next) cur = cur.next;
        cur.next = node;
    }
    search(value) {
        let cur = this.head;
        while (cur) {
            if (cur.value === value) return true;
            cur = cur.next;
        }
        return false;
    }
}`,
    java: `class Node {
    int value;
    Node next;
    Node(int value) { this.value = value; }
}
class LinkedList {
    Node head;
    public void insert(int value) {
        Node node = new Node(value);
        if (head == null) {
            head = node;
            return;
        }
        Node cur = head;
        while (cur.next != null) cur = cur.next;
        cur.next = node;
    }
}`,
    cpp: `struct Node {
    int value;
    Node* next;
    Node(int val) : value(val), next(nullptr) {}
};
class LinkedList {
    Node* head;
public:
    LinkedList() : head(nullptr) {}
    void insert(int value) {
        Node* node = new Node(value);
        if (!head) {
            head = node;
            return;
        }
        Node* cur = head;
        while (cur->next) cur = cur->next;
        cur->next = node;
    }
};`
  },
  stack: {
    python: `class Stack:
    def __init__(self):
        self.items = []
    def push(self, value):
        self.items.append(value)
    def pop(self):
        return self.items.pop() if self.items else None
    def peek(self):
        return self.items[-1] if self.items else None`,
    javascript: `class Stack {
    constructor() {
        this.items = [];
    }
    push(value) {
        this.items.push(value);
    }
    pop() {
        return this.items.pop() || null;
    }
    peek() {
        return this.items.length ? this.items[this.items.length - 1] : null;
    }
}`,
    java: `import java.util.ArrayList;
class Stack {
    private ArrayList<Integer> items = new ArrayList<>();
    public void push(int value) {
        items.add(value);
    }
    public Integer pop() {
        if (items.isEmpty()) return null;
        return items.remove(items.size() - 1);
    }
}`,
    cpp: `#include <vector>
class Stack {
private:
    std::vector<int> items;
public:
    void push(int value) {
        items.push_back(value);
    }
    void pop() {
        if (!items.empty()) items.pop_back();
    }
    int peek() {
        return items.back();
    }
};`
  },
  queue: {
    python: `from collections import deque
class Queue:
    def __init__(self):
        self.items = deque()
    def enqueue(self, value):
        self.items.append(value)
    def dequeue(self):
        return self.items.popleft() if self.items else None`,
    javascript: `class Queue {
    constructor() {
        this.items = [];
    }
    enqueue(value) {
        this.items.push(value);
    }
    dequeue() {
        return this.items.shift() || null;
    }
}`,
    java: `import java.util.LinkedList;
import java.util.Queue;
class QueueStruct {
    private Queue<Integer> items = new LinkedList<>();
    public void enqueue(int value) {
        items.add(value);
    }
    public Integer dequeue() {
        return items.poll();
    }
}`,
    cpp: `#include <queue>
class Queue {
private:
    std::queue<int> items;
public:
    void enqueue(int value) {
        items.push(value);
    }
    void dequeue() {
        if (!items.empty()) items.pop();
    }
};`
  },
  'binary-tree': {
    python: `class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
class BinaryTree:
    def __init__(self):
        self.root = None
    def insert(self, value):
        if not self.root:
            self.root = TreeNode(value)
            return
        self._insert(self.root, value)
    def _insert(self, node, value):
        if value < node.value:
            if node.left: self._insert(node.left, value)
            else: node.left = TreeNode(value)
        else:
            if node.right: self._insert(node.right, value)
            else: node.right = TreeNode(value)`,
    javascript: `class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}
class BinaryTree {
    constructor() {
        this.root = null;
    }
    insert(value) {
        if (!this.root) {
            this.root = new TreeNode(value);
            return;
        }
        this._insert(this.root, value);
    }
    _insert(node, value) {
        if (value < node.value) {
            if (node.left) this._insert(node.left, value);
            else node.left = new TreeNode(value);
        } else {
            if (node.right) this._insert(node.right, value);
            else node.right = new TreeNode(value);
        }
    }
}`,
    java: `class TreeNode {
    int value;
    TreeNode left, right;
    TreeNode(int value) { this.value = value; }
}
class BinaryTree {
    TreeNode root;
    public void insert(int value) {
        if (root == null) {
            root = new TreeNode(value);
            return;
        }
        insertRec(root, value);
    }
    private void insertRec(TreeNode node, int value) {
        if (value < node.value) {
            if (node.left != null) insertRec(node.left, value);
            else node.left = new TreeNode(value);
        } else {
            if (node.right != null) insertRec(node.right, value);
            else node.right = new TreeNode(value);
        }
    }
}`,
    cpp: `struct TreeNode {
    int value;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int val) : value(val), left(nullptr), right(nullptr) {}
};
class BinaryTree {
    TreeNode* root;
    void insertRec(TreeNode* node, int value) {
        if (value < node->value) {
            if (node->left) insertRec(node->left, value);
            else node->left = new TreeNode(value);
        } else {
            if (node->right) insertRec(node->right, value);
            else node->right = new TreeNode(value);
        }
    }
public:
    BinaryTree() : root(nullptr) {}
    void insert(int value) {
        if (!root) {
            root = new TreeNode(value);
            return;
        }
        insertRec(root, value);
    }
};`
  },
  'avl-tree': {
    python: `class AVLNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 1`,
    javascript: `class AVLNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}`,
    java: `class AVLNode {
    int value, height;
    AVLNode left, right;
    AVLNode(int value) {
        this.value = value;
        this.height = 1;
    }
}`,
    cpp: `struct AVLNode {
    int value;
    int height;
    AVLNode* left;
    AVLNode* right;
    AVLNode(int val) : value(val), height(1), left(nullptr), right(nullptr) {}
};`
  },
  graph: {
    python: `class Graph:
    def __init__(self, directed=False):
        self.adjacency = {}
        self.directed = directed
    def add_edge(self, u, v):
        self.adjacency.setdefault(u, []).append(v)
        if not self.directed:
            self.adjacency.setdefault(v, []).append(u)`,
    javascript: `class Graph {
    constructor(directed = false) {
        this.adjacency = {};
        this.directed = directed;
    }
    addEdge(u, v) {
        if (!this.adjacency[u]) this.adjacency[u] = [];
        this.adjacency[u].push(v);
        if (!this.directed) {
            if (!this.adjacency[v]) this.adjacency[v] = [];
            this.adjacency[v].push(u);
        }
    }
}`,
    java: `import java.util.*;
class Graph {
    private Map<Integer, List<Integer>> adjacency = new HashMap<>();
    private boolean directed;
    public Graph(boolean directed) { this.directed = directed; }
    public void addEdge(int u, int v) {
        adjacency.computeIfAbsent(u, k -> new ArrayList<>()).add(v);
        if (!directed) {
            adjacency.computeIfAbsent(v, k -> new ArrayList<>()).add(u);
        }
    }
}`,
    cpp: `#include <map>
#include <vector>
class Graph {
    std::map<int, std::vector<int>> adjacency;
    bool directed;
public:
    Graph(bool dir = false) : directed(dir) {}
    void addEdge(int u, int v) {
        adjacency[u].push_back(v);
        if (!directed) adjacency[v].push_back(u);
    }
};`
  },
  'hash-table': {
    python: `class HashTable:
    def __init__(self, size=7):
        self.size = size
        self.buckets = [[] for _ in range(size)]
    def _hash(self, key):
        return key % self.size if isinstance(key, int) else sum(map(ord, str(key))) % self.size
    def insert(self, key, value):
        idx = self._hash(key)
        self.buckets[idx].append((key, value))`,
    javascript: `class HashTable {
    constructor(size = 7) {
        this.size = size;
        this.buckets = Array.from({ length: size }, () => []);
    }
    _hash(key) {
        return typeof key === 'number' ? key % this.size :
            key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % this.size;
    }
    insert(key, value) {
        const idx = this._hash(key);
        this.buckets[idx].push([key, value]);
    }
}`,
    java: `import java.util.*;
class HashTable {
    private int size;
    private List<List<int[]>> buckets;
    public HashTable(int size) {
        this.size = size;
        this.buckets = new ArrayList<>(size);
        for (int i = 0; i < size; i++) buckets.add(new ArrayList<>());
    }
    private int hash(int key) {
        return key % size;
    }
    public void insert(int key, int value) {
        int idx = hash(key);
        buckets.get(idx).add(new int[]{key, value});
    }
}`,
    cpp: `#include <vector>
class HashTable {
    int size;
    std::vector<std::vector<std::pair<int, int>>> buckets;
    int hash(int key) {
        return key % size;
    }
public:
    HashTable(int s = 7) : size(s) {
        buckets.resize(size);
    }
    void insert(int key, int value) {
        int idx = hash(key);
        buckets[idx].push_back({key, value});
    }
};`
  },
  heap: {
    python: `class MinHeap:
    def __init__(self):
        self.heap = []
    def insert(self, val):
        self.heap.append(val)
        self._sift_up(len(self.heap) - 1)
    def extract_min(self):
        if not self.heap: return None
        if len(self.heap) == 1: return self.heap.pop()
        root = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._sift_down(0)
        return root
    def _sift_up(self, idx):
        parent = (idx - 1) // 2
        if idx > 0 and self.heap[idx] < self.heap[parent]:
            self.heap[idx], self.heap[parent] = self.heap[parent], self.heap[idx]
            self._sift_up(parent)
    def _sift_down(self, idx):
        best = idx
        left = 2 * idx + 1
        right = 2 * idx + 2
        if left < len(self.heap) and self.heap[left] < self.heap[best]: best = left
        if right < len(self.heap) and self.heap[right] < self.heap[best]: best = right
        if best != idx:
            self.heap[idx], self.heap[best] = self.heap[best], self.heap[idx]
            self._sift_down(best)`,
    javascript: `class MinHeap {
    constructor() {
        this.heap = [];
    }
    insert(val) {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }
    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.siftDown(0);
        return root;
    }
    siftUp(idx) {
        let parent = Math.floor((idx - 1) / 2);
        if (idx > 0 && this.heap[idx] < this.heap[parent]) {
            [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
            this.siftUp(parent);
        }
    }
    siftDown(idx) {
        let best = idx;
        let left = 2 * idx + 1;
        let right = 2 * idx + 2;
        if (left < this.heap.length && this.heap[left] < this.heap[best]) best = left;
        if (right < this.heap.length && this.heap[right] < this.heap[best]) best = right;
        if (best !== idx) {
            [this.heap[idx], this.heap[best]] = [this.heap[best], this.heap[idx]];
            this.siftDown(best);
        }
    }
}`,
    java: `import java.util.ArrayList;
class MinHeap {
    private ArrayList<Integer> heap = new ArrayList<>();
    public void insert(int val) {
        heap.add(val);
        siftUp(heap.size() - 1);
    }
    public int extractMin() {
        int root = heap.get(0);
        int last = heap.remove(heap.size() - 1);
        if (!heap.isEmpty()) {
            heap.set(0, last);
            siftDown(0);
        }
        return root;
    }
    private void siftUp(int idx) {
        int parent = (idx - 1) / 2;
        if (idx > 0 && heap.get(idx) < heap.get(parent)) {
            int temp = heap.get(idx);
            heap.set(idx, heap.get(parent));
            heap.set(parent, temp);
            siftUp(parent);
        }
    }
    private void siftDown(int idx) {
        int best = idx;
        int left = 2 * idx + 1;
        int right = 2 * idx + 2;
        if (left < heap.size() && heap.get(left) < heap.get(best)) best = left;
        if (right < heap.size() && heap.get(right) < heap.get(best)) best = right;
        if (best != idx) {
            int temp = heap.get(idx);
            heap.set(idx, heap.get(best));
            heap.set(best, temp);
            siftDown(best);
        }
    }
}`,
    cpp: `#include <vector>
#include <algorithm>
class MinHeap {
    std::vector<int> heap;
    void siftUp(int idx) {
        int p = (idx - 1) / 2;
        if (idx > 0 && heap[idx] < heap[p]) {
            std::swap(heap[idx], heap[p]);
            siftUp(p);
        }
    }
    void siftDown(int idx) {
        int best = idx, l = 2 * idx + 1, r = 2 * idx + 2;
        if (l < heap.size() && heap[l] < heap[best]) best = l;
        if (r < heap.size() && heap[r] < heap[best]) best = r;
        if (best != idx) {
            std::swap(heap[idx], heap[best]);
            siftDown(best);
        }
    }
public:
    void insert(int val) {
        heap.push_back(val);
        siftUp(heap.size() - 1);
    }
    int extractMin() {
        int root = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty()) siftDown(0);
        return root;
    }
};`
  },
  'bubble-sort': {
    python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    javascript: `function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}`,
    java: `public class BubbleSort {
    void bubbleSort(int arr[]) {
        int n = arr.length;
        for (int i = 0; i < n-1; i++)
            for (int j = 0; j < n-i-1; j++)
                if (arr[j] > arr[j+1]) {
                    int temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
    }
}`,
    cpp: `#include <vector>
void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
            }
        }
    }
}`
  },
  'selection-sort': {
    python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    javascript: `function selectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n; i++) {
        let min_idx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        let temp = arr[i];
        arr[i] = arr[min_idx];
        arr[min_idx] = temp;
    }
    return arr;
}`,
    java: `public class SelectionSort {
    void selectionSort(int arr[]) {
        int n = arr.length;
        for (int i = 0; i < n-1; i++) {
            int min_idx = i;
            for (int j = i+1; j < n; j++)
                if (arr[j] < arr[min_idx])
                    min_idx = j;
            int temp = arr[min_idx];
            arr[min_idx] = arr[i];
            arr[i] = temp;
        }
    }
}`,
    cpp: `#include <vector>
void selectionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx])
                min_idx = j;
        }
        std::swap(arr[min_idx], arr[i]);
    }
}`
  },
  'insertion-sort': {
    python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    javascript: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
    return arr;
}`,
    java: `public class InsertionSort {
    void insertionSort(int arr[]) {
        int n = arr.length;
        for (int i = 1; i < n; ++i) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = key;
        }
    }
}`,
    cpp: `#include <vector>
void insertionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`
  },
  'merge-sort': {
    python: `def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        L = arr[:mid]
        R = arr[mid:]
        merge_sort(L)
        merge_sort(R)
        i = j = k = 0
        while i < len(L) and j < len(R):
            if L[i] < R[j]:
                arr[k] = L[i]
                i += 1
            else:
                arr[k] = R[j]
                j += 1
            k += 1
        while i < len(L):
            arr[k] = L[i]
            i += 1
            k += 1
        while j < len(R):
            arr[k] = R[j]
            j += 1
            k += 1
    return arr`,
    javascript: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);
    return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
    let result = [], i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}`,
    java: `public class MergeSort {
    void merge(int arr[], int l, int m, int r) {
        int n1 = m - l + 1;
        int n2 = r - m;
        int L[] = new int[n1];
        int R[] = new int[n2];
        for (int i = 0; i < n1; ++i) L[i] = arr[l + i];
        for (int j = 0; j < n2; ++j) R[j] = arr[m + 1 + j];
        int i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            if (L[i] <= R[j]) {
                arr[k] = L[i]; i++;
            } else {
                arr[k] = R[j]; j++;
            }
            k++;
        }
        while (i < n1) { arr[k] = L[i]; i++; k++; }
        while (j < n2) { arr[k] = R[j]; j++; k++; }
    }
    void sort(int arr[], int l, int r) {
        if (l < r) {
            int m = l + (r - l) / 2;
            sort(arr, l, m);
            sort(arr, m + 1, r);
            merge(arr, l, m, r);
        }
    }
}`,
    cpp: `#include <vector>
void merge(std::vector<int>& arr, int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    std::vector<int> L(n1), R(n2);
    for(int i = 0; i < n1; i++) L[i] = arr[l + i];
    for(int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while(i < n1 && j < n2) {
        if(L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while(i < n1) arr[k++] = L[i++];
    while(j < n2) arr[k++] = R[j++];
}

void mergeSort(std::vector<int>& arr, int l, int r) {
    if(l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}`
  },
  'quick-sort': {
    python: `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i = i + 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr`,
    javascript: `function partition(arr, low, high) {
    let pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        let pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}`,
    java: `public class QuickSort {
    int partition(int arr[], int low, int high) {
        int pivot = arr[high];
        int i = (low-1);
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
            }
        }
        int temp = arr[i+1]; arr[i+1] = arr[high]; arr[high] = temp;
        return i+1;
    }
    void sort(int arr[], int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            sort(arr, low, pi-1);
            sort(arr, pi+1, high);
        }
    }
}`,
    cpp: `#include <vector>
int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] <= pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
  },
  'linear-search': {
    python: `def linear_search(arr, x):
    for i in range(len(arr)):
        if arr[i] == x:
            return i
    return -1`,
    javascript: `function linearSearch(arr, x) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === x) return i;
    }
    return -1;
}`,
    java: `public class LinearSearch {
    public static int search(int arr[], int x) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == x)
                return i;
        }
        return -1;
    }
}`,
    cpp: `#include <vector>
int linearSearch(std::vector<int>& arr, int x) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == x) return i;
    }
    return -1;
}`
  },
  'binary-search': {
    python: `def binary_search(arr, low, high, x):
    if high >= low:
        mid = (high + low) // 2
        if arr[mid] == x:
            return mid
        elif arr[mid] > x:
            return binary_search(arr, low, mid - 1, x)
        else:
            return binary_search(arr, mid + 1, high, x)
    else:
        return -1`,
    javascript: `function binarySearch(arr, x) {
    let low = 0;
    let high = arr.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (arr[mid] === x) return mid;
        if (arr[mid] > x) high = mid - 1;
        else low = mid + 1;
    }
    return -1;
}`,
    java: `public class BinarySearch {
    int binarySearch(int arr[], int x) {
        int l = 0, r = arr.length - 1;
        while (l <= r) {
            int m = l + (r - l) / 2;
            if (arr[m] == x) return m;
            if (arr[m] < x) l = m + 1;
            else r = m - 1;
        }
        return -1;
    }
}`,
    cpp: `#include <vector>
int binarySearch(std::vector<int>& arr, int x) {
    int l = 0, r = arr.size() - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (arr[m] == x) return m;
        if (arr[m] < x) l = m + 1;
        else r = m - 1;
    }
    return -1;
}`
  }

};