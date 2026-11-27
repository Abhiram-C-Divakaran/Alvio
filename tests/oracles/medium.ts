import { buildTree, serializeTree, type BTreeNode } from './helpers';

const MOD = 1_000_000_007;

function outOfBoundaryPaths(m: number, n: number, maxMove: number, startRow: number, startCol: number): number {
  let dp = Array.from({ length: m }, () => Array(n).fill(0));
  dp[startRow][startCol] = 1;
  let ans = 0;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let move = 0; move < maxMove; move++) {
    const next = Array.from({ length: m }, () => Array(n).fill(0));
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        if (dp[r][c] === 0) continue;
        for (const [dr, dc] of dirs) {
          const nr = r + dr; const nc = c + dc;
          if (nr < 0 || nr >= m || nc < 0 || nc >= n) ans = (ans + dp[r][c]) % MOD;
          else next[nr][nc] = (next[nr][nc] + dp[r][c]) % MOD;
        }
      }
    }
    dp = next;
  }
  return ans;
}

function isBipartite(adj: number[][]): boolean {
  const n = adj.length;
  const color = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (color[i] !== 0) continue;
    color[i] = 1;
    const q = [i];
    while (q.length) {
      const u = q.shift()!;
      for (const v of adj[u]) {
        if (color[v] === 0) { color[v] = -color[u]; q.push(v); }
        else if (color[v] === color[u]) return false;
      }
    }
  }
  return true;
}

function validSudoku(board: string[][]): boolean {
  const seen = new Set<string>();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const ch = board[r][c];
      if (ch === '.') continue;
      const rk = `r${r}:${ch}`;
      const ck = `c${c}:${ch}`;
      const bk = `b${Math.floor(r / 3)}${Math.floor(c / 3)}:${ch}`;
      if (seen.has(rk) || seen.has(ck) || seen.has(bk)) return false;
      seen.add(rk); seen.add(ck); seen.add(bk);
    }
  }
  return true;
}

function findAllAnagrams(s: string, p: string): number[] {
  const out: number[] = [];
  if (p.length > s.length) return out;
  const need = Array(26).fill(0);
  const win = Array(26).fill(0);
  for (let i = 0; i < p.length; i++) { need[p.charCodeAt(i) - 97]++; win[s.charCodeAt(i) - 97]++; }
  const eq = () => need.every((v, i) => v === win[i]);
  if (eq()) out.push(0);
  for (let i = p.length; i < s.length; i++) {
    win[s.charCodeAt(i) - 97]++;
    win[s.charCodeAt(i - p.length) - 97]--;
    if (eq()) out.push(i - p.length + 1);
  }
  return out;
}

function generateParentheses(n: number): string[] {
  const out: string[] = [];
  const dfs = (cur: string, open: number, close: number) => {
    if (cur.length === 2 * n) { out.push(cur); return; }
    if (open < n) dfs(cur + '(', open + 1, close);
    if (close < open) dfs(cur + ')', open, close + 1);
  };
  dfs('', 0, 0);
  return out;
}

function houseRobberLinear(nums: number[]): number {
  let p2 = 0; let p1 = 0;
  for (const x of nums) { const c = Math.max(p1, p2 + x); p2 = p1; p1 = c; }
  return p1;
}

export const MEDIUM_ORACLES: Record<string, (...args: any[]) => any> = {
  'eulerian-path-and-circuit': (V: number, adj: number[][]) => {
    const start = adj.findIndex((nbrs) => nbrs.length > 0);
    if (start === -1) return 2;
    const vis = Array(V).fill(false);
    const q = [start]; vis[start] = true;
    while (q.length) {
      const u = q.shift()!;
      for (const v of adj[u]) if (!vis[v]) { vis[v] = true; q.push(v); }
    }
    for (let i = 0; i < V; i++) if (adj[i].length > 0 && !vis[i]) return 0;
    let odd = 0;
    for (let i = 0; i < V; i++) if (adj[i].length % 2 === 1) odd++;
    return odd === 0 ? 2 : odd === 2 ? 1 : 0;
  },
  'construct-binary-tree-from-inorder-and-postorder-traversal': (inorder: number[], postorder: number[]) => {
    const idx = new Map<number, number>();
    inorder.forEach((v, i) => idx.set(v, i));
    let p = postorder.length - 1;
    const build = (l: number, r: number): BTreeNode | null => {
      if (l > r) return null;
      const val = postorder[p--];
      const mid = idx.get(val)!;
      const right = build(mid + 1, r);
      const left = build(l, mid - 1);
      return { val, left, right };
    };
    return serializeTree(build(0, inorder.length - 1));
  },
  '01-matrix': (mat: number[][]) => {
    const m = mat.length; const n = mat[0].length;
    const dist = Array.from({ length: m }, () => Array(n).fill(Infinity));
    const q: Array<[number, number]> = [];
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (mat[r][c] === 0) { dist[r][c] = 0; q.push([r, c]); }
    let head = 0;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (head < q.length) {
      const [r, c] = q[head++];
      for (const [dr, dc] of dirs) {
        const nr = r + dr; const nc = c + dc;
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && dist[nr][nc] > dist[r][c] + 1) {
          dist[nr][nc] = dist[r][c] + 1;
          q.push([nr, nc]);
        }
      }
    }
    return dist;
  },
  'binary-tree-level-order-traversal': (root: Array<number | null>) => {
    const r = buildTree(root);
    if (!r) return [];
    const out: number[][] = [];
    let level: BTreeNode[] = [r];
    while (level.length) {
      out.push(level.map((n) => n.val));
      const next: BTreeNode[] = [];
      for (const n of level) { if (n.left) next.push(n.left); if (n.right) next.push(n.right); }
      level = next;
    }
    return out;
  },
  '4sum': (nums: number[], target: number) => {
    const a = [...nums].sort((x, y) => x - y);
    const out: number[][] = [];
    for (let i = 0; i < a.length - 3; i++) {
      if (i > 0 && a[i] === a[i - 1]) continue;
      for (let j = i + 1; j < a.length - 2; j++) {
        if (j > i + 1 && a[j] === a[j - 1]) continue;
        let l = j + 1; let r = a.length - 1;
        while (l < r) {
          const s = a[i] + a[j] + a[l] + a[r];
          if (s === target) {
            out.push([a[i], a[j], a[l], a[r]]);
            while (l < r && a[l] === a[l + 1]) l++;
            while (l < r && a[r] === a[r - 1]) r--;
            l++; r--;
          } else if (s < target) l++;
          else r--;
        }
      }
    }
    return out;
  },
  'graph-coloring': (graph: number[][], m: number, V: number) => {
    const color = Array(V).fill(0);
    const dfs = (u: number): boolean => {
      if (u === V) return true;
      for (let c = 1; c <= m; c++) {
        let ok = true;
        for (let v = 0; v < V; v++) if (graph[u][v] === 1 && color[v] === c) { ok = false; break; }
        if (ok) { color[u] = c; if (dfs(u + 1)) return true; color[u] = 0; }
      }
      return false;
    };
    return dfs(0);
  },
  'pacific-atlantic-water-flow': (heights: number[][]) => {
    const m = heights.length; const n = heights[0].length;
    const pac = Array.from({ length: m }, () => Array(n).fill(false));
    const atl = Array.from({ length: m }, () => Array(n).fill(false));
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const dfs = (r: number, c: number, vis: boolean[][]) => {
      vis[r][c] = true;
      for (const [dr, dc] of dirs) {
        const nr = r + dr; const nc = c + dc;
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc] && heights[nr][nc] >= heights[r][c]) dfs(nr, nc, vis);
      }
    };
    for (let r = 0; r < m; r++) { dfs(r, 0, pac); dfs(r, n - 1, atl); }
    for (let c = 0; c < n; c++) { dfs(0, c, pac); dfs(m - 1, c, atl); }
    const out: number[][] = [];
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (pac[r][c] && atl[r][c]) out.push([r, c]);
    return out;
  },
  'lowest-common-ancestor-of-a-binary-tree': (root: Array<number | null>, p: number, q: number) => {
    const dfs = (n: BTreeNode | null): BTreeNode | null => {
      if (!n || n.val === p || n.val === q) return n;
      const l = dfs(n.left); const r = dfs(n.right);
      if (l && r) return n;
      return l || r;
    };
    return dfs(buildTree(root))!.val;
  },
  'string-to-integer-atoi': (s: string) => {
    let i = 0;
    while (i < s.length && s[i] === ' ') i++;
    let sign = 1;
    if (s[i] === '+' || s[i] === '-') { if (s[i] === '-') sign = -1; i++; }
    let val = 0;
    while (i < s.length && s[i] >= '0' && s[i] <= '9') {
      val = val * 10 + (s.charCodeAt(i) - 48);
      if (sign * val > 2147483647) return 2147483647;
      if (sign * val < -2147483648) return -2147483648;
      i++;
    }
    return val === 0 ? 0 : sign * val;
  },
  '3sum-closest': (nums: number[], target: number) => {
    const a = [...nums].sort((x, y) => x - y);
    let best = a[0] + a[1] + a[2];
    for (let i = 0; i < a.length - 2; i++) {
      let l = i + 1; let r = a.length - 1;
      while (l < r) {
        const s = a[i] + a[l] + a[r];
        if (Math.abs(s - target) < Math.abs(best - target)) best = s;
        if (s < target) l++; else if (s > target) r--; else return s;
      }
    }
    return best;
  },
  'ones-and-zeroes': (strs: string[], m: number, n: number) => {
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (const s of strs) {
      let z = 0; let o = 0;
      for (const ch of s) if (ch === '0') z++; else o++;
      for (let i = m; i >= z; i--) for (let j = n; j >= o; j--) dp[i][j] = Math.max(dp[i][j], dp[i - z][j - o] + 1);
    }
    return dp[m][n];
  },
  'remove-duplicates-from-sorted-array-ii': (nums: number[]) => {
    const out: number[] = [];
    for (const x of nums) if (out.length < 2 || out[out.length - 2] !== x) out.push(x);
    return out;
  },
  'add-two-numbers-ii': (l1: number[], l2: number[]) =>
    (BigInt(l1.join('')) + BigInt(l2.join(''))).toString().split('').map(Number),
  'design-add-and-search-words-data-structure': (ops: string[], args: string[][]) => {
    const words: string[] = [];
    return ops.map((op, i) => {
      if (op === 'WordDictionary') return null;
      if (op === 'addWord') { words.push(args[i][0]); return null; }
      const pat = args[i][0];
      return words.some((w) => w.length === pat.length && [...pat].every((ch, k) => ch === '.' || ch === w[k]));
    });
  },
  'reverse-linked-list-ii': (head: number[], left: number, right: number) => {
    const arr = [...head];
    const sub = arr.slice(left - 1, right).reverse();
    arr.splice(left - 1, right - left + 1, ...sub);
    return arr;
  },
  'longest-arithmetic-subsequence': (nums: number[]) => {
    const n = nums.length;
    if (n <= 2) return n;
    const dp: Array<Map<number, number>> = Array.from({ length: n }, () => new Map());
    let best = 2;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < i; j++) {
        const d = nums[i] - nums[j];
        const len = (dp[j].get(d) || 1) + 1;
        dp[i].set(d, len);
        if (len > best) best = len;
      }
    }
    return best;
  },
  'maximal-square': (mat: string[][]) => {
    const m = mat.length; const n = mat[0].length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    let best = 0;
    for (let r = 1; r <= m; r++) {
      for (let c = 1; c <= n; c++) {
        if (mat[r - 1][c - 1] === '1') {
          dp[r][c] = 1 + Math.min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]);
          if (dp[r][c] > best) best = dp[r][c];
        }
      }
    }
    return best * best;
  },
  'binary-tree-zigzag-level-order-traversal': (root: Array<number | null>) => {
    const r = buildTree(root);
    if (!r) return [];
    const out: number[][] = [];
    let level: BTreeNode[] = [r];
    let rev = false;
    while (level.length) {
      const vals = level.map((n) => n.val);
      out.push(rev ? vals.reverse() : vals);
      rev = !rev;
      const next: BTreeNode[] = [];
      for (const n of level) { if (n.left) next.push(n.left); if (n.right) next.push(n.right); }
      level = next;
    }
    return out;
  },
  'reorder-list': (head: number[]) => {
    const out: number[] = [];
    let l = 0; let r = head.length - 1;
    while (l <= r) { out.push(head[l++]); if (l <= r) out.push(head[r--]); }
    return out;
  },
  'out-of-boundary-paths': outOfBoundaryPaths,
  'is-graph-bipartite': (graph: number[][]) => isBipartite(graph),
  'bridge-edge-in-graph': (V: number, adj: number[][], c: number, d: number) => {
    const vis = Array(V).fill(false);
    const q = [c]; vis[c] = true;
    while (q.length) {
      const u = q.shift()!;
      for (const v of adj[u]) {
        if ((u === c && v === d) || (u === d && v === c)) continue;
        if (!vis[v]) { vis[v] = true; q.push(v); }
      }
    }
    return vis[d] ? 0 : 1;
  },
  'count-numbers-with-unique-digits': (n: number) => {
    if (n === 0) return 1;
    let total = 10; let cur = 9; let avail = 9;
    for (let k = 2; k <= n && avail > 0; k++) { cur *= avail--; total += cur; }
    return total;
  },
  'combination-sum-iv': (nums: number[], target: number) => {
    const dp = Array(target + 1).fill(0);
    dp[0] = 1;
    for (let s = 1; s <= target; s++) for (const x of nums) if (s >= x) dp[s] += dp[s - x];
    return dp[target];
  },
  'multiply-strings': (a: string, b: string) => (BigInt(a) * BigInt(b)).toString(),
  'open-the-lock': (deadends: string[], target: string) => {
    const dead = new Set(deadends);
    if (dead.has('0000')) return -1;
    if (target === '0000') return 0;
    const vis = new Set(['0000']);
    const q: Array<[string, number]> = [['0000', 0]];
    let head = 0;
    while (head < q.length) {
      const [cur, steps] = q[head++];
      for (let i = 0; i < 4; i++) {
        const d = Number(cur[i]);
        for (const delta of [-1, 1]) {
          const nd = (d + delta + 10) % 10;
          const next = cur.slice(0, i) + nd + cur.slice(i + 1);
          if (next === target) return steps + 1;
          if (!dead.has(next) && !vis.has(next)) { vis.add(next); q.push([next, steps + 1]); }
        }
      }
    }
    return -1;
  },
  'kth-smallest-element-in-a-bst': (root: Array<number | null>, k: number) => {
    const vals: number[] = [];
    const dfs = (n: BTreeNode | null) => { if (!n) return; dfs(n.left); vals.push(n.val); dfs(n.right); };
    dfs(buildTree(root));
    return vals[k - 1];
  },
  'keys-and-rooms': (rooms: number[][]) => {
    const vis = new Set<number>([0]);
    const q = [0];
    while (q.length) {
      const u = q.shift()!;
      for (const v of rooms[u]) if (!vis.has(v)) { vis.add(v); q.push(v); }
    }
    return vis.size === rooms.length;
  },
  'flatten-binary-tree-to-linked-list': (root: Array<number | null>) => {
    const pre: number[] = [];
    const dfs = (n: BTreeNode | null) => { if (!n) return; pre.push(n.val); dfs(n.left); dfs(n.right); };
    dfs(buildTree(root));
    if (pre.length === 0) return [];
    const out: Array<number | null> = [pre[0]];
    for (let i = 1; i < pre.length; i++) out.push(null, pre[i]);
    return out;
  },
  'ugly-number-ii': (n: number) => {
    const dp = [1];
    let i2 = 0; let i3 = 0; let i5 = 0;
    while (dp.length < n) {
      const next = Math.min(dp[i2] * 2, dp[i3] * 3, dp[i5] * 5);
      dp.push(next);
      if (next === dp[i2] * 2) i2++;
      if (next === dp[i3] * 3) i3++;
      if (next === dp[i5] * 5) i5++;
    }
    return dp[n - 1];
  },
  'path-sum-ii': (root: Array<number | null>, targetSum: number) => {
    const out: number[][] = [];
    const dfs = (n: BTreeNode | null, rem: number, path: number[]) => {
      if (!n) return;
      path.push(n.val);
      if (!n.left && !n.right && n.val === rem) out.push([...path]);
      else { dfs(n.left, rem - n.val, path); dfs(n.right, rem - n.val, path); }
      path.pop();
    };
    dfs(buildTree(root), targetSum, []);
    return out;
  },
  'can-i-win': (maxInt: number, desired: number) => {
    if (desired <= 0) return true;
    if ((maxInt * (maxInt + 1)) / 2 < desired) return false;
    const memo = new Map<number, boolean>();
    const dfs = (mask: number, rem: number): boolean => {
      if (memo.has(mask)) return memo.get(mask)!;
      for (let i = 1; i <= maxInt; i++) {
        const bit = 1 << i;
        if (mask & bit) continue;
        if (i >= rem || !dfs(mask | bit, rem - i)) { memo.set(mask, true); return true; }
      }
      memo.set(mask, false);
      return false;
    };
    return dfs(0, desired);
  },
  '3sum': (nums: number[]) => {
    const a = [...nums].sort((x, y) => x - y);
    const out: number[][] = [];
    for (let i = 0; i < a.length - 2; i++) {
      if (i > 0 && a[i] === a[i - 1]) continue;
      let l = i + 1; let r = a.length - 1;
      while (l < r) {
        const s = a[i] + a[l] + a[r];
        if (s === 0) {
          out.push([a[i], a[l], a[r]]);
          while (l < r && a[l] === a[l + 1]) l++;
          while (l < r && a[r] === a[r - 1]) r--;
          l++; r--;
        } else if (s < 0) l++;
        else r--;
      }
    }
    return out;
  },
  'maximum-length-of-repeated-subarray': (a: number[], b: number[]) => {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    let best = 0;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; if (dp[i][j] > best) best = dp[i][j]; }
      }
    }
    return best;
  },
  'add-two-numbers': (l1: number[], l2: number[]) => {
    const out: number[] = [];
    let i = 0; let carry = 0;
    while (i < l1.length || i < l2.length || carry) {
      const s = (l1[i] || 0) + (l2[i] || 0) + carry;
      out.push(s % 10);
      carry = Math.floor(s / 10);
      i++;
    }
    return out;
  },
  'detect-cycle-in-undirected-graph': (V: number, adj: number[][]) => {
    const vis = Array(V).fill(false);
    const dfs = (u: number, parent: number): boolean => {
      vis[u] = true;
      for (const v of adj[u]) {
        if (!vis[v]) { if (dfs(v, u)) return true; }
        else if (v !== parent) return true;
      }
      return false;
    };
    for (let i = 0; i < V; i++) if (!vis[i] && dfs(i, -1)) return true;
    return false;
  },
  'minimum-height-trees': (n: number, edges: number[][]) => {
    if (n <= 2) return Array.from({ length: n }, (_, i) => i);
    const adj: Array<Set<number>> = Array.from({ length: n }, () => new Set());
    for (const [u, v] of edges) { adj[u].add(v); adj[v].add(u); }
    let leaves: number[] = [];
    for (let i = 0; i < n; i++) if (adj[i].size === 1) leaves.push(i);
    let rem = n;
    while (rem > 2) {
      rem -= leaves.length;
      const next: number[] = [];
      for (const leaf of leaves) {
        const nbr = [...adj[leaf]][0];
        adj[nbr].delete(leaf);
        if (adj[nbr].size === 1) next.push(nbr);
      }
      leaves = next;
    }
    return leaves.sort((a, b) => a - b);
  },
  'number-of-provinces': (isConnected: number[][]) => {
    const n = isConnected.length;
    const vis = Array(n).fill(false);
    let cnt = 0;
    const dfs = (u: number) => {
      vis[u] = true;
      for (let v = 0; v < n; v++) if (isConnected[u][v] === 1 && !vis[v]) dfs(v);
    };
    for (let i = 0; i < n; i++) if (!vis[i]) { cnt++; dfs(i); }
    return cnt;
  },
  'subset-sum-problem': (arr: number[], sum: number) => {
    const dp = Array(sum + 1).fill(false);
    dp[0] = true;
    for (const x of arr) for (let s = sum; s >= x; s--) if (dp[s - x]) dp[s] = true;
    return dp[sum];
  },
  'topological-sort': (V: number, adj: number[][]) => {
    const indeg = Array(V).fill(0);
    for (let u = 0; u < V; u++) for (const v of adj[u]) indeg[v]++;
    const q: number[] = [];
    for (let i = 0; i < V; i++) if (indeg[i] === 0) q.push(i);
    const out: number[] = [];
    while (q.length) {
      const u = q.shift()!;
      out.push(u);
      for (const v of adj[u]) if (--indeg[v] === 0) q.push(v);
    }
    return out;
  },
  'bellman-ford-algorithm': (V: number, edges: number[][], S: number) => {
    const INF = 100000000;
    const dist = Array(V).fill(INF);
    dist[S] = 0;
    for (let i = 0; i < V - 1; i++) {
      for (const [u, v, w] of edges) if (dist[u] !== INF && dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
    for (const [u, v, w] of edges) if (dist[u] !== INF && dist[u] + w < dist[v]) return [-1];
    return dist;
  },
  'insert-interval': (intervals: number[][], newInt: number[]) => {
    const out: number[][] = [];
    let [ns, ne] = newInt;
    let placed = false;
    for (const [s, e] of intervals) {
      if (e < ns) out.push([s, e]);
      else if (s > ne) { if (!placed) { out.push([ns, ne]); placed = true; } out.push([s, e]); }
      else { ns = Math.min(ns, s); ne = Math.max(ne, e); }
    }
    if (!placed) out.push([ns, ne]);
    return out;
  },
  'construct-binary-tree-from-preorder-and-inorder-traversal': (preorder: number[], inorder: number[]) => {
    const idx = new Map<number, number>();
    inorder.forEach((v, i) => idx.set(v, i));
    let p = 0;
    const build = (l: number, r: number): BTreeNode | null => {
      if (l > r) return null;
      const val = preorder[p++];
      const mid = idx.get(val)!;
      return { val, left: build(l, mid - 1), right: build(mid + 1, r) };
    };
    return serializeTree(build(0, inorder.length - 1));
  },
  'palindromic-substrings': (s: string) => {
    let cnt = 0;
    const exp = (l: number, r: number) => { while (l >= 0 && r < s.length && s[l] === s[r]) { cnt++; l--; r++; } };
    for (let i = 0; i < s.length; i++) { exp(i, i); exp(i, i + 1); }
    return cnt;
  },
  'generate-parentheses': generateParentheses,
  'delete-and-earn': (nums: number[]) => {
    if (nums.length === 0) return 0;
    const maxV = Math.max(...nums);
    const pts = Array(maxV + 1).fill(0);
    for (const x of nums) pts[x] += x;
    return houseRobberLinear(pts);
  },
  '4c3a5c79-df8a-4335-b73f-e895b87fa20b': (target: number, pos: number[], speed: number[]) => {
    const cars = pos.map((p, i) => [p, (target - p) / speed[i]]).sort((a, b) => b[0] - a[0]);
    let fleets = 0; let slow = 0;
    for (const [, t] of cars) if (t > slow) { fleets++; slow = t; }
    return fleets;
  },
  '69d3ccb2-8a3d-49c7-8c39-58c3c0eb6561': generateParentheses,
  'triangle': (tri: number[][]) => {
    const dp = [...tri[tri.length - 1]];
    for (let r = tri.length - 2; r >= 0; r--) {
      for (let c = 0; c <= r; c++) dp[c] = tri[r][c] + Math.min(dp[c], dp[c + 1]);
    }
    return dp[0];
  },
  'partition-equal-subset-sum': (nums: number[]) => {
    const sum = nums.reduce((a, b) => a + b, 0);
    if (sum % 2 !== 0) return false;
    const half = sum / 2;
    const dp = Array(half + 1).fill(false);
    dp[0] = true;
    for (const x of nums) for (let s = half; s >= x; s--) if (dp[s - x]) dp[s] = true;
    return dp[half];
  },
  'knight-dialer': (n: number) => {
    const moves = [[4, 6], [6, 8], [7, 9], [4, 8], [0, 3, 9], [], [0, 1, 7], [2, 6], [1, 3], [2, 4]];
    let dp = Array(10).fill(1);
    for (let step = 1; step < n; step++) {
      const next = Array(10).fill(0);
      for (let d = 0; d < 10; d++) for (const nb of moves[d]) next[nb] = (next[nb] + dp[d]) % MOD;
      dp = next;
    }
    return dp.reduce((a, b) => (a + b) % MOD, 0);
  },
  'lowest-common-ancestor-of-a-binary-search-tree': (root: Array<number | null>, p: number, q: number) => {
    let cur = buildTree(root);
    while (cur) {
      if (p < cur.val && q < cur.val) cur = cur.left;
      else if (p > cur.val && q > cur.val) cur = cur.right;
      else return cur.val;
    }
    return -1;
  },
  'guess-number-higher-or-lower-ii': (n: number) => {
    const dp = Array.from({ length: n + 2 }, () => Array(n + 2).fill(0));
    for (let len = 2; len <= n; len++) {
      for (let l = 1; l + len - 1 <= n; l++) {
        const r = l + len - 1;
        let best = Infinity;
        for (let k = l; k <= r; k++) best = Math.min(best, k + Math.max(dp[l][k - 1], dp[k + 1][r]));
        dp[l][r] = best;
      }
    }
    return dp[1][n];
  },
  'max-area-of-island': (grid: number[][]) => {
    const m = grid.length; const n = grid[0].length;
    const g = grid.map((r) => [...r]);
    const dfs = (r: number, c: number): number => {
      if (r < 0 || r >= m || c < 0 || c >= n || g[r][c] !== 1) return 0;
      g[r][c] = 0;
      return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);
    };
    let best = 0;
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (g[r][c] === 1) best = Math.max(best, dfs(r, c));
    return best;
  },
  'swap-nodes-in-pairs': (head: number[]) => {
    const out = [...head];
    for (let i = 0; i + 1 < out.length; i += 2) [out[i], out[i + 1]] = [out[i + 1], out[i]];
    return out;
  },
  'unique-paths': (m: number, n: number) => {
    const dp = Array(n).fill(1);
    for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) dp[c] += dp[c - 1];
    return dp[n - 1];
  },
  'number-of-longest-increasing-subsequence': (nums: number[]) => {
    const n = nums.length;
    if (n === 0) return 0;
    const len = Array(n).fill(1);
    const cnt = Array(n).fill(1);
    let maxLen = 1;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (nums[j] < nums[i]) {
          if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; cnt[i] = cnt[j]; }
          else if (len[j] + 1 === len[i]) cnt[i] += cnt[j];
        }
      }
      if (len[i] > maxLen) maxLen = len[i];
    }
    let ans = 0;
    for (let i = 0; i < n; i++) if (len[i] === maxLen) ans += cnt[i];
    return ans;
  },
  'sort-list': (head: number[]) => [...head].sort((a, b) => a - b),
  'integer-break': (n: number) => {
    const dp = Array(n + 1).fill(0);
    dp[1] = 1;
    for (let i = 2; i <= n; i++) {
      for (let j = 1; j < i; j++) dp[i] = Math.max(dp[i], j * Math.max(i - j, dp[i - j]));
    }
    return dp[n];
  },
  'e748fa34-22b6-4ab6-8a97-73644137a2a9': (ops: string[], args: number[][]) => {
    const st: number[] = [];
    const mins: number[] = [];
    return ops.map((op, i) => {
      if (op === 'MinStack') return null;
      if (op === 'push') {
        const v = args[i][0];
        st.push(v);
        mins.push(mins.length ? Math.min(mins[mins.length - 1], v) : v);
        return null;
      }
      if (op === 'pop') { st.pop(); mins.pop(); return null; }
      if (op === 'top') return st[st.length - 1];
      return mins[mins.length - 1];
    });
  },
  '27c8cbf2-b010-47f4-97ac-ce718e5f1dd6': validSudoku,
  'e38d2a7c-1b88-4682-bce7-627aea732946': (mat: number[][], target: number) =>
    mat.some((row) => row.includes(target)),
  'remove-duplicates-from-sorted-list-ii': (head: number[]) => {
    const freq = new Map<number, number>();
    for (const x of head) freq.set(x, (freq.get(x) || 0) + 1);
    return head.filter((x) => freq.get(x) === 1);
  },
  'split-linked-list-in-parts': (head: number[], k: number) => {
    const base = Math.floor(head.length / k);
    const extra = head.length % k;
    const out: number[][] = [];
    let idx = 0;
    for (let i = 0; i < k; i++) {
      const sz = base + (i < extra ? 1 : 0);
      out.push(head.slice(idx, idx + sz));
      idx += sz;
    }
    return out;
  },
  'linked-list-cycle-ii': (head: number[], pos: number) => (pos >= 0 && pos < head.length ? pos : -1),
  'unbounded-knapsack': (wt: number[], val: number[], W: number) => {
    const dp = Array(W + 1).fill(0);
    for (let i = 0; i < wt.length; i++) {
      for (let w = wt[i]; w <= W; w++) dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
    }
    return dp[W];
  },
  'redundant-connection': (edges: number[][]) => {
    const n = edges.length;
    const parent = Array.from({ length: n + 1 }, (_, i) => i);
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    for (const [u, v] of edges) {
      const pu = find(u); const pv = find(v);
      if (pu === pv) return [u, v];
      parent[pu] = pv;
    }
    return [];
  },
  'shortest-path-in-binary-matrix': (grid: number[][]) => {
    const n = grid.length;
    if (grid[0][0] !== 0 || grid[n - 1][n - 1] !== 0) return -1;
    if (n === 1) return 1;
    const vis = Array.from({ length: n }, () => Array(n).fill(false));
    vis[0][0] = true;
    const q: Array<[number, number, number]> = [[0, 0, 1]];
    let head = 0;
    while (head < q.length) {
      const [r, c, d] = q[head++];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr; const nc = c + dc;
          if (nr === n - 1 && nc === n - 1) return d + 1;
          if (nr >= 0 && nr < n && nc >= 0 && nc < n && !vis[nr][nc] && grid[nr][nc] === 0) {
            vis[nr][nc] = true;
            q.push([nr, nc, d + 1]);
          }
        }
      }
    }
    return -1;
  },
  'strongly-connected-components': (V: number, adj: number[][]) => {
    const vis = Array(V).fill(false);
    const order: number[] = [];
    const dfs1 = (u: number) => { vis[u] = true; for (const v of adj[u]) if (!vis[v]) dfs1(v); order.push(u); };
    for (let i = 0; i < V; i++) if (!vis[i]) dfs1(i);
    const rev: number[][] = Array.from({ length: V }, () => []);
    for (let u = 0; u < V; u++) for (const v of adj[u]) rev[v].push(u);
    vis.fill(false);
    const dfs2 = (u: number) => { vis[u] = true; for (const v of rev[u]) if (!vis[v]) dfs2(v); };
    let scc = 0;
    for (let i = order.length - 1; i >= 0; i--) {
      if (!vis[order[i]]) { scc++; dfs2(order[i]); }
    }
    return scc;
  },
  'last-stone-weight-ii': (stones: number[]) => {
    const total = stones.reduce((a, b) => a + b, 0);
    const half = Math.floor(total / 2);
    const dp = Array(half + 1).fill(false);
    dp[0] = true;
    for (const s of stones) for (let j = half; j >= s; j--) if (dp[j - s]) dp[j] = true;
    for (let j = half; j >= 0; j--) if (dp[j]) return total - 2 * j;
    return total;
  },
  'lru-cache': (ops: string[], args: number[][]) => {
    let cap = 0;
    const map = new Map<number, number>();
    return ops.map((op, i) => {
      if (op === 'LRUCache') { cap = args[i][0]; return null; }
      if (op === 'get') {
        const k = args[i][0];
        if (!map.has(k)) return -1;
        const v = map.get(k)!;
        map.delete(k); map.set(k, v);
        return v;
      }
      const [k, v] = args[i];
      if (map.has(k)) map.delete(k);
      map.set(k, v);
      if (map.size > cap) map.delete(map.keys().next().value!);
      return null;
    });
  },
  'course-schedule-ii': (numCourses: number, prereqs: number[][]) => {
    const adj: number[][] = Array.from({ length: numCourses }, () => []);
    const indeg = Array(numCourses).fill(0);
    for (const [a, b] of prereqs) { adj[b].push(a); indeg[a]++; }
    const q: number[] = [];
    for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);
    const out: number[] = [];
    while (q.length) {
      const u = q.shift()!;
      out.push(u);
      for (const v of adj[u]) if (--indeg[v] === 0) q.push(v);
    }
    return out.length === numCourses ? out : [];
  },
  'zigzag-conversion': (s: string, numRows: number) => {
    if (numRows <= 1 || numRows >= s.length) return s;
    const rows = Array.from({ length: numRows }, () => '');
    let r = 0; let dir = 1;
    for (const ch of s) {
      rows[r] += ch;
      if (r === 0) dir = 1; else if (r === numRows - 1) dir = -1;
      r += dir;
    }
    return rows.join('');
  },
  'house-robber-iii': (root: Array<number | null>) => {
    const dfs = (n: BTreeNode | null): [number, number] => {
      if (!n) return [0, 0];
      const [lr, ls] = dfs(n.left);
      const [rr, rs] = dfs(n.right);
      return [n.val + ls + rs, Math.max(lr, ls) + Math.max(rr, rs)];
    };
    const [rob, skip] = dfs(buildTree(root));
    return Math.max(rob, skip);
  },
  'walls-and-gates': (rooms: number[][]) => {
    const INF = 2147483647;
    const m = rooms.length; const n = rooms[0].length;
    const out = rooms.map((r) => [...r]);
    const q: Array<[number, number]> = [];
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (out[r][c] === 0) q.push([r, c]);
    let head = 0;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (head < q.length) {
      const [r, c] = q[head++];
      for (const [dr, dc] of dirs) {
        const nr = r + dr; const nc = c + dc;
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && out[nr][nc] === INF) {
          out[nr][nc] = out[r][c] + 1;
          q.push([nr, nc]);
        }
      }
    }
    return out;
  },
  'longest-arithmetic-subsequence-of-given-difference': (arr: number[], diff: number) => {
    const dp = new Map<number, number>();
    let best = 0;
    for (const x of arr) {
      const len = (dp.get(x - diff) || 0) + 1;
      dp.set(x, len);
      if (len > best) best = len;
    }
    return best;
  },
  'delete-operation-for-two-strings': (w1: string, w2: string) => {
    const dp = Array.from({ length: w1.length + 1 }, () => Array(w2.length + 1).fill(0));
    for (let i = 1; i <= w1.length; i++) {
      for (let j = 1; j <= w2.length; j++) {
        dp[i][j] = w1[i - 1] === w2[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return w1.length + w2.length - 2 * dp[w1.length][w2.length];
  },
  'rotate-image': (mat: number[][]) => {
    const n = mat.length;
    return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => mat[n - 1 - c][r]));
  },
  'design-linked-list': (ops: string[], args: number[][]) => {
    const list: number[] = [];
    return ops.map((op, i) => {
      if (op === 'MyLinkedList') return null;
      if (op === 'get') { const idx = args[i][0]; return idx >= 0 && idx < list.length ? list[idx] : -1; }
      if (op === 'addAtHead') { list.unshift(args[i][0]); return null; }
      if (op === 'addAtTail') { list.push(args[i][0]); return null; }
      if (op === 'addAtIndex') {
        const [idx, val] = args[i];
        if (idx <= 0) list.unshift(val);
        else if (idx <= list.length) list.splice(idx, 0, val);
        return null;
      }
      if (op === 'deleteAtIndex') {
        const idx = args[i][0];
        if (idx >= 0 && idx < list.length) list.splice(idx, 1);
        return null;
      }
      return null;
    });
  },
  'combination-sum': (cands: number[], target: number) => {
    const sorted = [...cands].sort((a, b) => a - b);
    const out: number[][] = [];
    const dfs = (start: number, rem: number, path: number[]) => {
      if (rem === 0) { out.push([...path]); return; }
      for (let i = start; i < sorted.length && sorted[i] <= rem; i++) {
        path.push(sorted[i]); dfs(i, rem - sorted[i], path); path.pop();
      }
    };
    dfs(0, target, []);
    return out;
  },
  'validate-binary-search-tree': (root: Array<number | null>) => {
    const dfs = (n: BTreeNode | null, lo: number, hi: number): boolean => {
      if (!n) return true;
      if (n.val <= lo || n.val >= hi) return false;
      return dfs(n.left, lo, n.val) && dfs(n.right, n.val, hi);
    };
    return dfs(buildTree(root), -Infinity, Infinity);
  },
  'rotting-oranges': (grid: number[][]) => {
    const m = grid.length; const n = grid[0].length;
    const g = grid.map((r) => [...r]);
    const q: Array<[number, number, number]> = [];
    let fresh = 0;
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
      if (g[r][c] === 2) q.push([r, c, 0]);
      else if (g[r][c] === 1) fresh++;
    }
    let mins = 0; let head = 0;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (head < q.length) {
      const [r, c, t] = q[head++];
      for (const [dr, dc] of dirs) {
        const nr = r + dr; const nc = c + dc;
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && g[nr][nc] === 1) {
          g[nr][nc] = 2; fresh--; mins = Math.max(mins, t + 1); q.push([nr, nc, t + 1]);
        }
      }
    }
    return fresh === 0 ? mins : -1;
  },
  'maximum-product-subarray': (nums: number[]) => {
    let maxP = nums[0]; let minP = nums[0]; let best = nums[0];
    for (let i = 1; i < nums.length; i++) {
      const x = nums[i];
      const candidates = [x, maxP * x, minP * x];
      maxP = Math.max(...candidates);
      minP = Math.min(...candidates);
      if (maxP > best) best = maxP;
    }
    return best;
  },
  'stone-game': (_piles: number[]) => true,
  'detect-cycle-in-directed-graph': (V: number, adj: number[][]) => {
    const state = Array(V).fill(0);
    const dfs = (u: number): boolean => {
      state[u] = 1;
      for (const v of adj[u]) {
        if (state[v] === 1) return true;
        if (state[v] === 0 && dfs(v)) return true;
      }
      state[u] = 2;
      return false;
    };
    for (let i = 0; i < V; i++) if (state[i] === 0 && dfs(i)) return true;
    return false;
  },
  'course-schedule': (numCourses: number, prereqs: number[][]) => {
    const adj: number[][] = Array.from({ length: numCourses }, () => []);
    const indeg = Array(numCourses).fill(0);
    for (const [a, b] of prereqs) { adj[b].push(a); indeg[a]++; }
    const q: number[] = [];
    for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);
    let visited = 0;
    while (q.length) {
      const u = q.shift()!; visited++;
      for (const v of adj[u]) if (--indeg[v] === 0) q.push(v);
    }
    return visited === numCourses;
  },
  'network-delay-time': (times: number[][], n: number, k: number) => {
    const dist = Array(n + 1).fill(Infinity);
    dist[k] = 0;
    for (let i = 0; i < n - 1; i++) {
      for (const [u, v, w] of times) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
    let ans = 0;
    for (let i = 1; i <= n; i++) { if (dist[i] === Infinity) return -1; ans = Math.max(ans, dist[i]); }
    return ans;
  },
  'longest-common-substring': (s1: string, s2: string) => {
    const dp = Array.from({ length: s1.length + 1 }, () => Array(s2.length + 1).fill(0));
    let best = 0;
    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        if (s1[i - 1] === s2[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; if (dp[i][j] > best) best = dp[i][j]; }
      }
    }
    return best;
  },
  'perfect-squares': (n: number) => {
    const dp = Array(n + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= n; i++) for (let j = 1; j * j <= i; j++) dp[i] = Math.min(dp[i], dp[i - j * j] + 1);
    return dp[n];
  },
  'surrounded-regions': (board: string[][]) => {
    const m = board.length; const n = board[0].length;
    const g = board.map((r) => [...r]);
    const dfs = (r: number, c: number) => {
      if (r < 0 || r >= m || c < 0 || c >= n || g[r][c] !== 'O') return;
      g[r][c] = '#';
      dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
    };
    for (let r = 0; r < m; r++) { dfs(r, 0); dfs(r, n - 1); }
    for (let c = 0; c < n; c++) { dfs(0, c); dfs(m - 1, c); }
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) g[r][c] = g[r][c] === '#' ? 'O' : 'X';
    return g;
  },
  'set-matrix-zeroes': (mat: number[][]) => {
    const m = mat.length; const n = mat[0].length;
    const rows = new Set<number>(); const cols = new Set<number>();
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (mat[r][c] === 0) { rows.add(r); cols.add(c); }
    return mat.map((row, r) => row.map((v, c) => (rows.has(r) || cols.has(c) ? 0 : v)));
  },
  '1ccfb906-f92a-4dc6-b447-ad47e6a981a9': (tokens: string[]) => {
    const st: number[] = [];
    for (const t of tokens) {
      if (t === '+' || t === '-' || t === '*' || t === '/') {
        const b = st.pop()!; const a = st.pop()!;
        st.push(t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : Math.trunc(a / b));
      } else st.push(Number(t));
    }
    return st[0];
  },
  'valid-sudoku': validSudoku,
  'integer-replacement': (n: number) => {
    const memo = new Map<number, number>([[1, 0]]);
    const dfs = (x: number): number => {
      if (memo.has(x)) return memo.get(x)!;
      const res = x % 2 === 0 ? 1 + dfs(x / 2) : 1 + Math.min(dfs(x - 1), dfs(x + 1));
      memo.set(x, res);
      return res;
    };
    return dfs(n);
  },
  'house-robber-ii': (nums: number[]) => {
    if (nums.length === 1) return nums[0];
    return Math.max(houseRobberLinear(nums.slice(0, -1)), houseRobberLinear(nums.slice(1)));
  },
  'letter-combinations-of-a-phone-number': (digits: string) => {
    if (!digits) return [];
    const map: Record<string, string> = { '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz' };
    let res = [''];
    for (const d of digits) res = res.flatMap((p) => [...map[d]].map((ch) => p + ch));
    return res;
  },
  'longest-substring-without-repeating-characters': (s: string) => {
    const last = new Map<string, number>();
    let l = 0; let best = 0;
    for (let r = 0; r < s.length; r++) {
      if (last.has(s[r]) && last.get(s[r])! >= l) l = last.get(s[r])! + 1;
      last.set(s[r], r);
      best = Math.max(best, r - l + 1);
    }
    return best;
  },
  'implement-trie-prefix-tree': (ops: string[], args: string[][]) => {
    const set = new Set<string>();
    return ops.map((op, i) => {
      if (op === 'Trie') return null;
      if (op === 'insert') { set.add(args[i][0]); return null; }
      if (op === 'search') return set.has(args[i][0]);
      const pref = args[i][0];
      return [...set].some((w) => w.startsWith(pref));
    });
  },
  'find-first-and-last-position-of-element-in-sorted-array': (nums: number[], target: number) =>
    [nums.indexOf(target), nums.lastIndexOf(target)],
  'number-of-islands': (grid: string[][]) => {
    const m = grid.length; const n = grid[0].length;
    const g = grid.map((r) => [...r]);
    const dfs = (r: number, c: number) => {
      if (r < 0 || r >= m || c < 0 || c >= n || g[r][c] !== '1') return;
      g[r][c] = '0';
      dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
    };
    let cnt = 0;
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (g[r][c] === '1') { cnt++; dfs(r, c); }
    return cnt;
  },
  'minimum-ascii-delete-sum-for-two-strings': (s1: string, s2: string) => {
    const m = s1.length; const n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) dp[i][0] = dp[i - 1][0] + s1.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) dp[0][j] = dp[0][j - 1] + s2.charCodeAt(j - 1);
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = s1[i - 1] === s2[j - 1]
          ? dp[i - 1][j - 1]
          : Math.min(dp[i - 1][j] + s1.charCodeAt(i - 1), dp[i][j - 1] + s2.charCodeAt(j - 1));
      }
    }
    return dp[m][n];
  },
  'target-sum': (nums: number[], target: number) => {
    let dp = new Map<number, number>([[0, 1]]);
    for (const x of nums) {
      const next = new Map<number, number>();
      for (const [s, c] of dp) {
        next.set(s + x, (next.get(s + x) || 0) + c);
        next.set(s - x, (next.get(s - x) || 0) + c);
      }
      dp = next;
    }
    return dp.get(target) || 0;
  },
  'dijkstra-shortest-path': (V: number, adj: number[][][], S: number) => {
    const dist = Array(V).fill(Infinity);
    const used = Array(V).fill(false);
    dist[S] = 0;
    for (let step = 0; step < V; step++) {
      let u = -1;
      for (let i = 0; i < V; i++) if (!used[i] && (u === -1 || dist[i] < dist[u])) u = i;
      if (u === -1 || dist[u] === Infinity) break;
      used[u] = true;
      for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
    return dist;
  },
  'bipartite-graph-bfs': (_V: number, adj: number[][]) => isBipartite(adj),
  'binary-tree-right-side-view': (root: Array<number | null>) => {
    const r = buildTree(root);
    if (!r) return [];
    const out: number[] = [];
    let level: BTreeNode[] = [r];
    while (level.length) {
      out.push(level[level.length - 1].val);
      const next: BTreeNode[] = [];
      for (const n of level) { if (n.left) next.push(n.left); if (n.right) next.push(n.right); }
      level = next;
    }
    return out;
  },
  'divide-two-integers': (a: number, b: number) => {
    const res = Math.trunc(a / b);
    return Math.max(-2147483648, Math.min(2147483647, res === 0 ? 0 : res));
  },
  'path-sum-iii': (root: Array<number | null>, targetSum: number) => {
    let total = 0;
    const prefix = new Map<number, number>([[0, 1]]);
    const dfs = (n: BTreeNode | null, sum: number) => {
      if (!n) return;
      const cur = sum + n.val;
      total += prefix.get(cur - targetSum) || 0;
      prefix.set(cur, (prefix.get(cur) || 0) + 1);
      dfs(n.left, cur); dfs(n.right, cur);
      prefix.set(cur, prefix.get(cur)! - 1);
    };
    dfs(buildTree(root), 0);
    return total;
  },
  'longest-palindromic-substring': (s: string) => {
    let bestL = 0; let bestLen = 1;
    const exp = (l: number, r: number) => {
      while (l >= 0 && r < s.length && s[l] === s[r]) {
        if (r - l + 1 > bestLen) { bestL = l; bestLen = r - l + 1; }
        l--; r++;
      }
    };
    for (let i = 0; i < s.length; i++) { exp(i, i); exp(i, i + 1); }
    return s.slice(bestL, bestL + bestLen);
  },
  'spiral-matrix-ii': (n: number) => {
    const mat = Array.from({ length: n }, () => Array(n).fill(0));
    let top = 0; let bottom = n - 1; let left = 0; let right = n - 1; let v = 1;
    while (top <= bottom && left <= right) {
      for (let c = left; c <= right; c++) mat[top][c] = v++;
      top++;
      for (let r = top; r <= bottom; r++) mat[r][right] = v++;
      right--;
      for (let c = right; c >= left; c--) mat[bottom][c] = v++;
      bottom--;
      for (let r = bottom; r >= top; r--) mat[r][left] = v++;
      left++;
    }
    return mat;
  },
  'jump-game': (nums: number[]) => {
    let reach = 0;
    for (let i = 0; i < nums.length; i++) {
      if (i > reach) return false;
      reach = Math.max(reach, i + nums[i]);
    }
    return true;
  },
  'cheapest-flights-within-k-stops': (n: number, flights: number[][], src: number, dst: number, k: number) => {
    let dist = Array(n).fill(Infinity);
    dist[src] = 0;
    for (let step = 0; step <= k; step++) {
      const next = [...dist];
      for (const [u, v, w] of flights) if (dist[u] + w < next[v]) next[v] = dist[u] + w;
      dist = next;
    }
    return dist[dst] === Infinity ? -1 : dist[dst];
  },
  'two-sum-ii': (nums: number[], target: number) => {
    let l = 0; let r = nums.length - 1;
    while (l < r) {
      const s = nums[l] + nums[r];
      if (s === target) return [l + 1, r + 1];
      if (s < target) l++; else r--;
    }
    return [];
  },
  'snakes-and-ladders': (board: number[][]) => {
    const n = board.length;
    const coord = (sq: number): [number, number] => {
      const idx = sq - 1;
      const rowFromBottom = Math.floor(idx / n);
      const r = n - 1 - rowFromBottom;
      const col = idx % n;
      const c = rowFromBottom % 2 === 0 ? col : n - 1 - col;
      return [r, c];
    };
    const vis = Array(n * n + 1).fill(false);
    vis[1] = true;
    const q: Array<[number, number]> = [[1, 0]];
    let head = 0;
    while (head < q.length) {
      const [sq, moves] = q[head++];
      for (let d = 1; d <= 6 && sq + d <= n * n; d++) {
        let next = sq + d;
        const [r, c] = coord(next);
        if (board[r][c] !== -1) next = board[r][c];
        if (next === n * n) return moves + 1;
        if (!vis[next]) { vis[next] = true; q.push([next, moves + 1]); }
      }
    }
    return -1;
  },
  'minimum-falling-path-sum': (mat: number[][]) => {
    const n = mat.length;
    let dp = [...mat[0]];
    for (let r = 1; r < n; r++) {
      const next = Array(n).fill(Infinity);
      for (let c = 0; c < n; c++) {
        let best = dp[c];
        if (c > 0) best = Math.min(best, dp[c - 1]);
        if (c + 1 < n) best = Math.min(best, dp[c + 1]);
        next[c] = mat[r][c] + best;
      }
      dp = next;
    }
    return Math.min(...dp);
  },
  'word-search': (board: string[][], word: string) => {
    const m = board.length; const n = board[0].length;
    const g = board.map((r) => [...r]);
    const dfs = (r: number, c: number, k: number): boolean => {
      if (k === word.length) return true;
      if (r < 0 || r >= m || c < 0 || c >= n || g[r][c] !== word[k]) return false;
      const tmp = g[r][c]; g[r][c] = '#';
      const ok = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
      g[r][c] = tmp;
      return ok;
    };
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (dfs(r, c, 0)) return true;
    return false;
  },
  'arithmetic-slices': (nums: number[]) => {
    let cur = 0; let total = 0;
    for (let i = 2; i < nums.length; i++) {
      if (nums[i] - nums[i - 1] === nums[i - 1] - nums[i - 2]) { cur++; total += cur; }
      else cur = 0;
    }
    return total;
  },
  'sort-colors': (nums: number[]) => [...nums].sort((a, b) => a - b),
  'hamiltonian-path': (N: number, _M: number, edges: number[][]) => {
    const adj = Array.from({ length: N }, () => new Set<number>());
    for (const [u, v] of edges) { adj[u - 1].add(v - 1); adj[v - 1].add(u - 1); }
    const full = (1 << N) - 1;
    const dp = Array.from({ length: 1 << N }, () => Array(N).fill(false));
    for (let i = 0; i < N; i++) dp[1 << i][i] = true;
    for (let mask = 1; mask <= full; mask++) {
      for (let u = 0; u < N; u++) {
        if (!dp[mask][u]) continue;
        for (const v of adj[u]) if (!(mask & (1 << v))) dp[mask | (1 << v)][v] = true;
      }
    }
    return dp[full].some(Boolean);
  },
  'longest-increasing-subsequence': (nums: number[]) => {
    const tails: number[] = [];
    for (const x of nums) {
      let l = 0; let r = tails.length;
      while (l < r) { const m = (l + r) >> 1; if (tails[m] < x) l = m + 1; else r = m; }
      tails[l] = x;
    }
    return tails.length;
  },
  'decode-ways': (s: string) => {
    if (!s || s[0] === '0') return 0;
    const dp = Array(s.length + 1).fill(0);
    dp[0] = 1; dp[1] = 1;
    for (let i = 2; i <= s.length; i++) {
      if (s[i - 1] !== '0') dp[i] += dp[i - 1];
      const two = Number(s.slice(i - 2, i));
      if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
    }
    return dp[s.length];
  },
  'search-in-rotated-sorted-array-ii': (nums: number[], target: number) => nums.includes(target),
  '4d9b945b-f679-4a29-b6ca-0fc7524cea1a': (temps: number[]) => {
    const ans = Array(temps.length).fill(0);
    const st: number[] = [];
    for (let i = 0; i < temps.length; i++) {
      while (st.length && temps[i] > temps[st[st.length - 1]]) { const prev = st.pop()!; ans[prev] = i - prev; }
      st.push(i);
    }
    return ans;
  },
  'next-permutation': (nums: number[]) => {
    const a = [...nums];
    let i = a.length - 2;
    while (i >= 0 && a[i] >= a[i + 1]) i--;
    if (i >= 0) {
      let j = a.length - 1;
      while (a[j] <= a[i]) j--;
      [a[i], a[j]] = [a[j], a[i]];
    }
    let l = i + 1; let r = a.length - 1;
    while (l < r) { [a[l], a[r]] = [a[r], a[l]]; l++; r--; }
    return a;
  },
  'search-a-2d-matrix': (mat: number[][], target: number) => mat.some((row) => row.includes(target)),
  'predict-the-winner': (nums: number[]) => {
    const n = nums.length;
    const dp = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? nums[i] : 0)));
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i + len - 1 < n; i++) {
        const j = i + len - 1;
        dp[i][j] = Math.max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]);
      }
    }
    return dp[0][n - 1] >= 0;
  },
  'combination-sum-ii': (cands: number[], target: number) => {
    const a = [...cands].sort((x, y) => x - y);
    const out: number[][] = [];
    const dfs = (start: number, rem: number, path: number[]) => {
      if (rem === 0) { out.push([...path]); return; }
      for (let i = start; i < a.length && a[i] <= rem; i++) {
        if (i > start && a[i] === a[i - 1]) continue;
        path.push(a[i]); dfs(i + 1, rem - a[i], path); path.pop();
      }
    };
    dfs(0, target, []);
    return out;
  },
  'find-all-anagrams-in-a-string': findAllAnagrams,
  'find-and-replace-pattern': (words: string[], pattern: string) => {
    const match = (w: string) => {
      if (w.length !== pattern.length) return false;
      const m1 = new Map<string, string>(); const m2 = new Map<string, string>();
      for (let i = 0; i < w.length; i++) {
        if ((m1.has(w[i]) && m1.get(w[i]) !== pattern[i]) || (m2.has(pattern[i]) && m2.get(pattern[i]) !== w[i])) return false;
        m1.set(w[i], pattern[i]); m2.set(pattern[i], w[i]);
      }
      return true;
    };
    return words.filter(match);
  },
  'longest-word-in-dictionary-through-deleting': (s: string, dict: string[]) => {
    const isSub = (w: string) => {
      let i = 0;
      for (let j = 0; j < s.length && i < w.length; j++) if (s[j] === w[i]) i++;
      return i === w.length;
    };
    let best = '';
    for (const w of dict) {
      if (isSub(w) && (w.length > best.length || (w.length === best.length && w < best))) best = w;
    }
    return best;
  },
  'find-all-anagrams': findAllAnagrams,
  'minimum-operations-to-make-array-equal': (n: number) => Math.floor((n * n) / 4),
  'minimum-number-of-operations-to-reinitialize-permutation': (n: number) => {
    if (n <= 2) return 1;
    let pos = 1; let steps = 0;
    do { pos = pos % 2 === 0 ? pos / 2 : n / 2 + (pos - 1) / 2; steps++; } while (pos !== 1);
    return steps;
  },
  'minimum-length-of-string-after-deleting-similar-ends': (s: string) => {
    let l = 0; let r = s.length - 1;
    while (l < r && s[l] === s[r]) {
      const ch = s[l];
      while (l <= r && s[l] === ch) l++;
      while (l <= r && s[r] === ch) r--;
    }
    return r - l + 1;
  },
  'longest-consecutive-sequence': (nums: number[]) => {
    const set = new Set(nums);
    let best = 0;
    for (const x of set) {
      if (!set.has(x - 1)) {
        let len = 1;
        while (set.has(x + len)) len++;
        if (len > best) best = len;
      }
    }
    return best;
  },
  'coin-change-2': (amount: number, coins: number[]) => {
    const dp = Array(amount + 1).fill(0);
    dp[0] = 1;
    for (const c of coins) for (let a = c; a <= amount; a++) dp[a] += dp[a - c];
    return dp[amount];
  },
};
