// ============================================================
// Data Structure Factories & Operations
//
// Pure functions that create a sample instance of each
// DataStructure type, and that apply insert / delete / search
// operations to produce a new (immutable) structure state.
// Positions are pre-computed for both the 2D and 3D renderers.
// ============================================================
import type {
  DataStructure,
  DataStructureType,
  DSANode,
  LinkedListNode,
  TreeNode,
} from '../../types/dataStructures';

let idCounter = 0;
const nextId = () => `n${++idCounter}-${Math.random().toString(36).slice(2, 6)}`;

const makeNode = (value: number | string, position = { x: 0, y: 0, z: 0 }): DSANode => ({
  id: nextId(),
  value,
  position,
  state: { highlighted: false, active: false },
});

// ---- Layout helpers (shared by 2D + 3D renderers) ----

const ARRAY_GAP = 1.2;
const centerX = (count: number, gap: number) => -((count - 1) * gap) / 2;

function layoutArray(values: number[]): DSANode[] {
  const start = centerX(values.length, ARRAY_GAP);
  return values.map((v, i) => makeNode(v, { x: start + i * ARRAY_GAP, y: 0, z: 0 }));
}

function layoutLinear(values: number[]): DSANode[] {
  // Stack/queue share the array layout but render differently
  return layoutArray(values);
}

// Tree layout recalculation
function layoutTree(nodes: TreeNode[], rootId: string | null): TreeNode[] {
  if (!rootId) return nodes;
  const newNodes = [...nodes];

  const updatePosition = (id: string, x: number, y: number, depth: number) => {
    const idx = newNodes.findIndex(n => n.id === id);
    if (idx === -1) return;

    newNodes[idx] = { ...newNodes[idx], position: { x, y, z: 0 } };
    const node = newNodes[idx];

    // Horizontal spacing gets tighter at lower depths
    const hOffset = 2.5 / Math.pow(1.8, depth);
    const vOffset = 1.4;

    if (node.left) updatePosition(node.left, x - hOffset, y - vOffset, depth + 1);
    if (node.right) updatePosition(node.right, x + hOffset, y - vOffset, depth + 1);
  };

  updatePosition(rootId, 0, 1.8, 0);
  return newNodes;
}

function rebuildHeapRelations(nodes: TreeNode[]): TreeNode[] {
  nodes.forEach((n) => {
    n.left = null;
    n.right = null;
  });
  nodes.forEach((n, i) => {
    const li = 2 * i + 1;
    const ri = 2 * i + 2;
    n.left = li < nodes.length ? nodes[li].id : null;
    n.right = ri < nodes.length ? nodes[ri].id : null;
  });
  return nodes;
}

// ---- Factories ----

export function createDefaultStructure(type: DataStructureType, variant?: string): DataStructure {
  switch (type) {
    case 'array':
      return { type: 'array', elements: layoutArray([5, 3, 8, 1, 9]), capacity: 8 };

    case 'stack':
      if (variant === 'Monotonic Stack') {
        return { type: 'stack', elements: layoutLinear([2, 4, 7, 9]), maxSize: 8 };
      }
      return { type: 'stack', elements: layoutLinear([4, 7, 2, 9]), maxSize: 8 };

    case 'queue':
      return { type: 'queue', elements: layoutLinear([6, 1, 8, 3]), maxSize: 8 };

    case 'linked-list': {
      const values = [12, 5, 9, 3];
      const start = centerX(values.length, 2.1);
      const nodes: LinkedListNode[] = values.map((v, i) => ({
        ...makeNode(v, { x: start + i * 2.1, y: 0, z: 0 }),
        next: null,
      }));
      nodes.forEach((n, i) => {
        n.next = i < nodes.length - 1 ? nodes[i + 1].id : null;
      });
      return { type: 'linked-list', head: nodes[0]?.id ?? null, nodes };
    }

    case 'binary-tree':
    case 'avl-tree': {
      // Small balanced 7-node tree, matches visualizer exactly
      const values = [50, 30, 70, 20, 40, 60, 80];
      const nodes: TreeNode[] = values.map((v, i) => ({
        ...makeNode(v),
        id: String(i + 1), // Use "1" through "7" as IDs
        left: null,
        right: null,
        height: i === 0 ? 3 : i < 3 ? 2 : 1,
        balanceFactor: 0,
      }));
      // Complete binary tree relationships
      nodes.forEach((n, i) => {
        const li = 2 * i + 1;
        const ri = 2 * i + 2;
        n.left = li < nodes.length ? nodes[li].id : null;
        n.right = ri < nodes.length ? nodes[ri].id : null;
      });
      const rootId = nodes[0]?.id ?? null;
      return { type, root: rootId, nodes: layoutTree(nodes, rootId) };
    }

    case 'heap': {
      const values = [90, 75, 80, 60, 45, 55, 70];
      const nodes: TreeNode[] = values.map((v, i) => ({
        ...makeNode(v),
        id: String(i + 1),
        left: null,
        right: null,
        height: i === 0 ? 3 : i < 3 ? 2 : 1,
        balanceFactor: 0,
      }));
      nodes.forEach((n, i) => {
        const li = 2 * i + 1;
        const ri = 2 * i + 2;
        n.left = li < nodes.length ? nodes[li].id : null;
        n.right = ri < nodes.length ? nodes[ri].id : null;
      });
      const rootId = nodes[0]?.id ?? null;
      return { type: 'heap', root: rootId, nodes: layoutTree(nodes, rootId), heapType: 'max' };
    }

    case 'graph': {
      // Exact nodes to match Graph3D tutorial
      const layout: { id: string; v: string; x: number; y: number; z: number }[] = [
        { id: 'A', v: 'A', x: 0, y: 2, z: 0 },
        { id: 'B', v: 'B', x: -2, y: -1, z: 1 },
        { id: 'C', v: 'C', x: 2, y: -1, z: -1 },
        { id: 'D', v: 'D', x: -1, y: -2, z: -2 },
        { id: 'E', v: 'E', x: 2, y: 1, z: 2 },
      ];
      const nodes = layout.map((n) => ({
        ...makeNode(n.v, { x: n.x, y: n.y, z: n.z }),
        id: n.id // Override with predictable ID
      }));

      const pairs: [number, number, number][] = [
        [0, 1, 4], // A -> B
        [0, 2, 2], // A -> C
        [0, 4, 7], // A -> E
        [1, 3, 1], // B -> D
        [2, 3, 3], // C -> D
        [2, 4, 5]  // C -> E
      ];

      const edges = pairs.map(([a, b, weight]) => ({
        id: nextId(),
        from: nodes[a].id,
        to: nodes[b].id,
        directed: true,
        weight: weight,
        state: { highlighted: false, active: false },
      }));
      return { type: 'graph', nodes, edges, directed: true, weighted: true };
    }

    case 'hash-table': {
      const size = 7;
      const seed: number[] = [23, 5, 19, 8, 12];
      const buckets = Array.from({ length: size }, (_, index) => ({ index, entries: [] as DSANode[] }));
      seed.forEach((v) => {
        const idx = v % size;
        buckets[idx].entries.push(makeNode(v, { x: 0, y: 0, z: 0 }));
      });
      return { type: 'hash-table', buckets, size, hashFunction: 'key % size' };
    }
  }
}

// ---- Operations ----

function relayout(values: DSANode[]): DSANode[] {
  const start = centerX(values.length, ARRAY_GAP);
  return values.map((n, i) => ({ ...n, position: { x: start + i * ARRAY_GAP, y: 0, z: 0 } }));
}

// Helper to get random coord near center
const randCoord = () => (Math.random() * 4) - 2;

/** Insert a value; returns the updated structure. */
export function insertValue(structure: DataStructure, rawValue: string, idx?: number, variant?: string): DataStructure {
  const value = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);

  switch (structure.type) {
    case 'array': {
      let newElements = [...structure.elements];
      if (idx !== undefined && idx >= 0 && idx <= newElements.length) {
        newElements.splice(idx, 0, makeNode(value));
      } else {
        newElements.push(makeNode(value));
      }
      return { ...structure, elements: relayout(newElements) };
    }
    case 'stack': {
      let elements = [...structure.elements];
      if (variant === 'Monotonic Stack') {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          // Strictly increasing: pop elements that are >= value
          while (elements.length > 0 && Number(elements[elements.length - 1].value) >= numValue) {
            elements.pop();
          }
        }
      }
      return { ...structure, elements: relayout([...elements, makeNode(value)]) };
    }
    case 'queue': {
      let newElements = [...structure.elements];
      if (idx !== undefined && idx >= 0 && idx <= newElements.length) {
        newElements.splice(idx, 0, makeNode(value));
      } else {
        newElements.push(makeNode(value));
      }
      return { ...structure, elements: relayout(newElements) };
    }

    case 'linked-list': {
      const newNode: LinkedListNode = { ...makeNode(value), next: null };
      let newNodes = [...structure.nodes];
      if (idx !== undefined && idx >= 0 && idx <= newNodes.length) {
        newNodes.splice(idx, 0, newNode);
      } else {
        newNodes.push(newNode);
      }
      const start = centerX(newNodes.length, 2.1);
      const laidOut = newNodes.map((n, i) => ({ ...n, position: { x: start + i * 2.1, y: 0, z: 0 } }));
      laidOut.forEach((n, i) => {
        n.next = i < laidOut.length - 1 ? laidOut[i + 1].id : null;
      });
      return { ...structure, head: laidOut[0]?.id ?? null, nodes: laidOut };
    }

    case 'hash-table': {
      const numeric = typeof value === 'number' ? value : Array.from(String(value)).reduce((a, c) => a + c.charCodeAt(0), 0);
      const idx = numeric % structure.size;
      const buckets = structure.buckets.map((b) =>
        b.index === idx ? { ...b, entries: [...b.entries, makeNode(value)] } : b
      );
      return { ...structure, buckets };
    }

    case 'graph': {
      const newNode = makeNode(value, { x: randCoord(), y: randCoord(), z: 0 });
      let newEdges = [...structure.edges];
      // Connect to a random existing node to keep the graph connected
      if (structure.nodes.length > 0) {
        const targetNode = structure.nodes[Math.floor(Math.random() * structure.nodes.length)];
        newEdges.push({
          id: nextId(),
          from: newNode.id,
          to: targetNode.id,
          directed: structure.directed,
          weight: undefined,
          state: { highlighted: false, active: false }
        });
      }
      return { ...structure, nodes: [...structure.nodes, newNode], edges: newEdges };
    }

    case 'binary-tree':
    case 'avl-tree': {
      // Must be a number for BST logic
      const numVal = Number(value);
      if (isNaN(numVal)) return structure;

      const newNode: TreeNode = {
        ...makeNode(numVal),
        left: null,
        right: null,
        height: 1,
        balanceFactor: 0
      };

      if (!structure.root || structure.nodes.length === 0) {
        const newNodes = [newNode];
        return { ...structure, root: newNode.id, nodes: layoutTree(newNodes, newNode.id) };
      }

      let newNodes = [...structure.nodes, newNode];

      // Insert logic
      const insertRecursive = (nodeId: string): string => {
        const idx = newNodes.findIndex(n => n.id === nodeId);
        if (idx === -1) return nodeId;

        const node = newNodes[idx];
        const nValue = Number(node.value);

        if (numVal < nValue) {
          if (!node.left) {
            newNodes[idx] = { ...node, left: newNode.id };
          } else {
            newNodes[idx] = { ...node, left: insertRecursive(node.left) };
          }
        } else if (numVal > nValue) {
          if (!node.right) {
            newNodes[idx] = { ...node, right: newNode.id };
          } else {
            newNodes[idx] = { ...node, right: insertRecursive(node.right) };
          }
        } else {
          // Duplicate ignore
          return nodeId;
        }

        // Return updated node if AVL balancing is enabled
        if (structure.type === 'avl-tree') {
          return balanceNode(newNodes, newNodes[idx].id);
        }
        return newNodes[idx].id;
      };

      const newRoot = insertRecursive(structure.root);
      return { ...structure, root: newRoot, nodes: layoutTree(newNodes, newRoot) };
    }

    case 'heap': {
      const numVal = Number(value);
      if (isNaN(numVal)) return structure;

      const newNode: TreeNode = {
        ...makeNode(numVal),
        left: null,
        right: null,
        height: 1,
        balanceFactor: 0
      };

      const newNodes = [...structure.nodes, newNode];
      
      // Heapify up
      let currIdx = newNodes.length - 1;
      const isMinHeap = structure.heapType === 'min';

      while (currIdx > 0) {
        const parentIdx = Math.floor((currIdx - 1) / 2);
        const currVal = Number(newNodes[currIdx].value);
        const parentVal = Number(newNodes[parentIdx].value);

        const shouldSwap = isMinHeap ? (currVal < parentVal) : (currVal > parentVal);

        if (shouldSwap) {
          const temp = newNodes[currIdx].value;
          newNodes[currIdx].value = newNodes[parentIdx].value;
          newNodes[parentIdx].value = temp;
          currIdx = parentIdx;
        } else {
          break;
        }
      }

      const rebuiltNodes = rebuildHeapRelations(newNodes);
      const rootId = rebuiltNodes[0]?.id ?? null;
      return { ...structure, root: rootId, nodes: layoutTree(rebuiltNodes, rootId) };
    }
  }
}

/** Delete/pop a value; returns the updated structure. */
export function deleteValue(structure: DataStructure, rawValue?: string, idx?: number): DataStructure {
  switch (structure.type) {
    case 'array': {
      if (structure.elements.length === 0) return structure;
      let filtered = [...structure.elements];
      if (idx !== undefined && idx >= 0 && idx < filtered.length) {
        filtered.splice(idx, 1);
      } else if (rawValue) {
        filtered = removeFirstMatch(filtered, rawValue);
      } else {
        filtered.pop();
      }
      return { ...structure, elements: relayout(filtered) };
    }
    case 'stack': {
      if (structure.elements.length === 0) return structure;
      return { ...structure, elements: relayout(structure.elements.slice(0, -1)) };
    }
    case 'queue': {
      if (structure.elements.length === 0) return structure;
      let filtered = [...structure.elements];
      if (idx !== undefined && idx >= 0 && idx < filtered.length) {
        filtered.splice(idx, 1);
      } else if (rawValue) {
        filtered = removeFirstMatch(filtered, rawValue);
      } else {
        filtered.shift();
      }
      return { ...structure, elements: relayout(filtered) };
    }
    case 'linked-list': {
      if (structure.nodes.length === 0) return structure;
      let remaining = [...structure.nodes];
      if (idx !== undefined && idx >= 0 && idx < remaining.length) {
        remaining.splice(idx, 1);
      } else if (rawValue) {
        remaining = removeFirstMatch(remaining, rawValue);
      } else {
        remaining.pop();
      }
      const start = centerX(remaining.length, 2.1);
      const laidOut = remaining.map((n, i) => ({ ...n, position: { x: start + i * 2.1, y: 0, z: 0 } })) as LinkedListNode[];
      laidOut.forEach((n, i) => {
        n.next = i < laidOut.length - 1 ? laidOut[i + 1].id : null;
      });
      return { ...structure, head: laidOut[0]?.id ?? null, nodes: laidOut };
    }
    case 'hash-table': {
      if (!rawValue) return structure;
      const target = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);
      const buckets = structure.buckets.map((b) => ({
        ...b,
        entries: b.entries.filter((e) => String(e.value) !== String(target)),
      }));
      return { ...structure, buckets };
    }
    case 'graph': {
      if (!rawValue) return structure;
      const target = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);
      const nodeToDelete = structure.nodes.find(n => String(n.value) === String(target));
      if (!nodeToDelete) return structure;

      return {
        ...structure,
        nodes: structure.nodes.filter(n => n.id !== nodeToDelete.id),
        edges: structure.edges.filter(e => e.from !== nodeToDelete.id && e.to !== nodeToDelete.id)
      };
    }
    case 'binary-tree':
    case 'avl-tree': {
      if (!rawValue || !structure.root) return structure;
      const numVal = Number(rawValue);
      if (isNaN(numVal)) return structure;

      let newNodes = [...structure.nodes];

      const deleteRecursive = (nodeId: string | null, targetVal: number): string | null => {
        if (!nodeId) return null;
        const idx = newNodes.findIndex(n => n.id === nodeId);
        if (idx === -1) return null;

        let node = newNodes[idx];
        const nValue = Number(node.value);

        if (targetVal < nValue) {
          node.left = deleteRecursive(node.left, targetVal);
        } else if (targetVal > nValue) {
          node.right = deleteRecursive(node.right, targetVal);
        } else {
          // Found node to delete
          if (!node.left) return node.right;
          if (!node.right) return node.left;

          // 2 children: get inorder successor (smallest in right subtree)
          let minNodeId = node.right;
          let minNodeIdx = newNodes.findIndex(n => n.id === minNodeId);
          while (newNodes[minNodeIdx].left) {
            minNodeId = newNodes[minNodeIdx].left!;
            minNodeIdx = newNodes.findIndex(n => n.id === minNodeId);
          }

          node.value = newNodes[minNodeIdx].value;
          node.right = deleteRecursive(node.right, Number(node.value));
        }

        newNodes[idx] = node;

        if (structure.type === 'avl-tree') {
          return balanceNode(newNodes, node.id);
        }
        return node.id;
      };

      const newRoot = deleteRecursive(structure.root, numVal);
      // Filter out orphaned nodes
      const reachables = new Set<string>();
      const trace = (id: string | null) => {
        if (!id) return;
        reachables.add(id);
        const node = newNodes.find(n => n.id === id);
        if (node) { trace(node.left); trace(node.right); }
      };
      trace(newRoot);
      newNodes = newNodes.filter(n => reachables.has(n.id));

      return { ...structure, root: newRoot, nodes: layoutTree(newNodes, newRoot) };
    }

    case 'heap': {
      if (structure.nodes.length === 0) return structure;
      
      let targetIdx = 0;
      if (idx !== undefined && idx >= 0 && idx < structure.nodes.length) {
        targetIdx = idx;
      } else if (rawValue) {
        targetIdx = structure.nodes.findIndex(n => String(n.value) === String(rawValue));
      }

      if (targetIdx === -1) return structure;

      let newNodes = [...structure.nodes];
      if (newNodes.length === 1) {
        return { ...structure, root: null, nodes: [] };
      }

      const lastIdx = newNodes.length - 1;
      // Move last item to target slot
      newNodes[targetIdx].value = newNodes[lastIdx].value;
      newNodes.pop(); // Pop off the last slot

      // Heapify down
      const size = newNodes.length;
      let curr = targetIdx;
      const isMinHeap = structure.heapType === 'min';

      while (true) {
        let best = curr;
        const left = 2 * curr + 1;
        const right = 2 * curr + 2;

        if (left < size) {
          const valLeft = Number(newNodes[left].value);
          const valBest = Number(newNodes[best].value);
          const shouldSwap = isMinHeap ? (valLeft < valBest) : (valLeft > valBest);
          if (shouldSwap) best = left;
        }

        if (right < size) {
          const valRight = Number(newNodes[right].value);
          const valBest = Number(newNodes[best].value);
          const shouldSwap = isMinHeap ? (valRight < valBest) : (valRight > valBest);
          if (shouldSwap) best = right;
        }

        if (best !== curr) {
          const temp = newNodes[curr].value;
          newNodes[curr].value = newNodes[best].value;
          newNodes[best].value = temp;
          curr = best;
        } else {
          break;
        }
      }

      const rebuiltNodes = rebuildHeapRelations(newNodes);
      const rootId = rebuiltNodes[0]?.id ?? null;
      return { ...structure, root: rootId, nodes: layoutTree(rebuiltNodes, rootId) };
    }
  }
}

function removeFirstMatch<T extends DSANode>(list: T[], rawValue: string): T[] {
  const target = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);
  const idx = list.findIndex((n) => String(n.value) === String(target));
  if (idx === -1) return list;
  return [...list.slice(0, idx), ...list.slice(idx + 1)];
}

// AVL Balancing Helpers
function getHeight(nodes: TreeNode[], id: string | null): number {
  if (!id) return 0;
  const n = nodes.find(node => node.id === id);
  return n ? n.height ?? (1 + Math.max(getHeight(nodes, n.left), getHeight(nodes, n.right))) : 0;
}

function updateHeight(nodes: TreeNode[], id: string) {
  const idx = nodes.findIndex(n => n.id === id);
  if (idx === -1) return;
  const hLeft = getHeight(nodes, nodes[idx].left);
  const hRight = getHeight(nodes, nodes[idx].right);
  nodes[idx].height = 1 + Math.max(hLeft, hRight);
  nodes[idx].balanceFactor = hLeft - hRight;
}

function rotateRight(nodes: TreeNode[], yId: string): string {
  const yIdx = nodes.findIndex(n => n.id === yId);
  const xId = nodes[yIdx].left!;
  const xIdx = nodes.findIndex(n => n.id === xId);

  const T2Id = nodes[xIdx].right;

  nodes[xIdx].right = yId;
  nodes[yIdx].left = T2Id;

  updateHeight(nodes, yId);
  updateHeight(nodes, xId);

  return xId; // new root
}

function rotateLeft(nodes: TreeNode[], xId: string): string {
  const xIdx = nodes.findIndex(n => n.id === xId);
  const yId = nodes[xIdx].right!;
  const yIdx = nodes.findIndex(n => n.id === yId);

  const T2Id = nodes[yIdx].left;

  nodes[yIdx].left = xId;
  nodes[xIdx].right = T2Id;

  updateHeight(nodes, xId);
  updateHeight(nodes, yId);

  return yId; // new root
}

function balanceNode(nodes: TreeNode[], id: string): string {
  updateHeight(nodes, id);
  const idx = nodes.findIndex(n => n.id === id);
  const node = nodes[idx];
  const bf = node.balanceFactor ?? 0;

  // Left Heavy
  if (bf > 1 && node.left) {
    const leftIdx = nodes.findIndex(n => n.id === node.left);
    if ((nodes[leftIdx].balanceFactor ?? 0) < 0) {
      nodes[idx].left = rotateLeft(nodes, node.left);
    }
    return rotateRight(nodes, id);
  }

  // Right Heavy
  if (bf < -1 && node.right) {
    const rightIdx = nodes.findIndex(n => n.id === node.right);
    if ((nodes[rightIdx].balanceFactor ?? 0) > 0) {
      nodes[idx].right = rotateRight(nodes, node.right);
    }
    return rotateLeft(nodes, id);
  }

  return id;
}

/** Search for a value; returns a structure with the matching node(s) highlighted. */
export function searchValue(structure: DataStructure, rawValue: string): DataStructure {
  const target = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);
  const markNode = (n: DSANode): DSANode => ({
    ...n,
    state: { ...n.state, highlighted: String(n.value) === String(target) },
  });

  switch (structure.type) {
    case 'array':
    case 'stack':
    case 'queue':
      return { ...structure, elements: structure.elements.map(markNode) };
    case 'linked-list':
      return { ...structure, nodes: structure.nodes.map((n) => ({ ...markNode(n), next: n.next })) as LinkedListNode[] };
    case 'binary-tree':
    case 'avl-tree':
    case 'heap':
      return { ...structure, nodes: structure.nodes.map((n) => ({ ...n, ...markNode(n) })) as TreeNode[] };
    case 'graph':
      return { ...structure, nodes: structure.nodes.map(markNode) };
    case 'hash-table':
      return { ...structure, buckets: structure.buckets.map((b) => ({ ...b, entries: b.entries.map(markNode) })) };
  }
}

export const structureMeta: Record<DataStructureType, { label: string; description: string }> = {
  'array': { label: 'Array', description: 'Contiguous indexed elements' },
  'linked-list': { label: 'Linked List', description: 'Chained nodes via pointers' },
  'stack': { label: 'Stack', description: 'LIFO — push/pop from the top' },
  'queue': { label: 'Queue', description: 'FIFO — enqueue/dequeue' },
  'binary-tree': { label: 'Binary Tree', description: 'Hierarchical left/right nodes' },
  'avl-tree': { label: 'AVL Tree', description: 'Self-balancing binary tree' },
  'graph': { label: 'Graph', description: 'Nodes connected by edges' },
  'hash-table': { label: 'Hash Table', description: 'Key-value buckets via hashing' },
  'heap': { label: 'Heap', description: 'Complete binary tree-based priority queue (Min/Max)' },
};
