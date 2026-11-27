export interface BTreeNode {
  val: number;
  left: BTreeNode | null;
  right: BTreeNode | null;
}

/**
 * Builds a binary tree from standard LeetCode BFS level-order array representation
 * (null denotes an absent child; trailing nulls omitted).
 */
export function buildTree(arr: Array<number | null>): BTreeNode | null {
  if (!arr || arr.length === 0 || arr[0] === null || arr[0] === undefined) return null;
  const root: BTreeNode = { val: arr[0], left: null, right: null };
  const queue: BTreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;
    if (i < arr.length) {
      const lv = arr[i++];
      if (lv !== null && lv !== undefined) {
        node.left = { val: lv, left: null, right: null };
        queue.push(node.left);
      }
    }
    if (i < arr.length) {
      const rv = arr[i++];
      if (rv !== null && rv !== undefined) {
        node.right = { val: rv, left: null, right: null };
        queue.push(node.right);
      }
    }
  }
  return root;
}

/**
 * Serializes a binary tree back to canonical LeetCode BFS level-order array
 * with trailing nulls trimmed.
 */
export function serializeTree(root: BTreeNode | null): Array<number | null> {
  if (!root) return [];
  const out: Array<number | null> = [];
  const queue: Array<BTreeNode | null> = [root];
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node) {
      out.push(node.val);
      queue.push(node.left, node.right);
    } else {
      out.push(null);
    }
  }
  while (out.length > 0 && out[out.length - 1] === null) out.pop();
  return out;
}

export interface NaryNode {
  val: number;
  children: NaryNode[];
}

/**
 * Builds an N-ary tree from LeetCode level-order array where null separates sibling groups.
 */
export function buildNaryTree(arr: Array<number | null>): NaryNode | null {
  if (!arr || arr.length === 0 || arr[0] === null || arr[0] === undefined) return null;
  const root: NaryNode = { val: arr[0], children: [] };
  const queue: NaryNode[] = [root];
  let i = 2; // skip root and first null separator
  while (queue.length > 0 && i < arr.length) {
    const parent = queue.shift()!;
    while (i < arr.length && arr[i] !== null) {
      const child: NaryNode = { val: arr[i] as number, children: [] };
      parent.children.push(child);
      queue.push(child);
      i++;
    }
    i++; // skip null separator
  }
  return root;
}
