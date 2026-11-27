import { buildNaryTree, buildTree, serializeTree, type BTreeNode, type NaryNode } from './helpers';

const MORSE = [
  '.-', '-...', '-.-.', '-..', '.', '..-.', '--.', '....', '..', '.---', '-.-', '.-..', '--',
  '-.', '---', '.--.', '--.-', '.-.', '...', '-', '..-', '...-', '.--', '-..-', '-.--', '--..',
];

function isSameTree(a: BTreeNode | null, b: BTreeNode | null): boolean {
  if (!a && !b) return true;
  if (!a || !b || a.val !== b.val) return false;
  return isSameTree(a.left, b.left) && isSameTree(a.right, b.right);
}

function mergeTrees(a: BTreeNode | null, b: BTreeNode | null): BTreeNode | null {
  if (!a) return b;
  if (!b) return a;
  return { val: a.val + b.val, left: mergeTrees(a.left, b.left), right: mergeTrees(a.right, b.right) };
}

function imageSmoother(img: number[][]): number[][] {
  const m = img.length;
  const n = img[0].length;
  return Array.from({ length: m }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      let sum = 0;
      let cnt = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
            sum += img[nr][nc];
            cnt++;
          }
        }
      }
      return Math.floor(sum / cnt);
    })
  );
}

function positionsOfLargeGroups(s: string): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < s.length; ) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    if (j - i >= 3) out.push([i, j - 1]);
    i = j;
  }
  return out;
}

function subtreeOfAnother(rootArr: Array<number | null>, subArr: Array<number | null>): boolean {
  const root = buildTree(rootArr);
  const sub = buildTree(subArr);
  if (!sub) return true;
  const dfs = (node: BTreeNode | null): boolean => {
    if (!node) return false;
    return isSameTree(node, sub) || dfs(node.left) || dfs(node.right);
  };
  return dfs(root);
}

function minCostClimbingStairs(cost: number[]): number {
  let a = 0;
  let b = 0;
  for (let i = 2; i <= cost.length; i++) {
    const next = Math.min(b + cost[i - 1], a + cost[i - 2]);
    a = b;
    b = next;
  }
  return b;
}

function reshapeMatrix(mat: number[][], r: number, c: number): number[][] {
  const flat = mat.flat();
  if (flat.length !== r * c) return mat.map((row) => [...row]);
  return Array.from({ length: r }, (_, i) => flat.slice(i * c, (i + 1) * c));
}

function canPlaceFlowers(flowerbed: number[], n: number): boolean {
  const arr = [...flowerbed];
  let rem = n;
  for (let i = 0; i < arr.length && rem > 0; i++) {
    if (arr[i] === 0 && (i === 0 || arr[i - 1] === 0) && (i === arr.length - 1 || arr[i + 1] === 0)) {
      arr[i] = 1;
      rem--;
    }
  }
  return rem <= 0;
}

function diameterOfBinaryTree(rootArr: Array<number | null>): number {
  let best = 0;
  const depth = (node: BTreeNode | null): number => {
    if (!node) return 0;
    const l = depth(node.left);
    const r = depth(node.right);
    best = Math.max(best, l + r);
    return 1 + Math.max(l, r);
  };
  depth(buildTree(rootArr));
  return best;
}

function maxProductOfThree(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const n = s.length;
  return Math.max(s[n - 1] * s[n - 2] * s[n - 3], s[0] * s[1] * s[n - 1]);
}

function flipAndInvertImage(image: number[][]): number[][] {
  return image.map((row) => [...row].reverse().map((v) => v ^ 1));
}

function outOfBoundaryPaths(m: number, n: number, maxMove: number, startRow: number, startCol: number): number {
  const MOD = 1_000_000_007;
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
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= m || nc < 0 || nc >= n) ans = (ans + dp[r][c]) % MOD;
          else next[nr][nc] = (next[nr][nc] + dp[r][c]) % MOD;
        }
      }
    }
    dp = next;
  }
  return ans;
}

export const EASY_ORACLES: Record<string, (...args: any[]) => any> = {
  'sort-array-by-parity': (nums: number[]) => [
    ...nums.filter((x) => Math.abs(x) % 2 === 0),
    ...nums.filter((x) => Math.abs(x) % 2 === 1),
  ],
  'binary-tree-postorder-traversal': (root: Array<number | null>) => {
    const out: number[] = [];
    const dfs = (n: BTreeNode | null) => { if (!n) return; dfs(n.left); dfs(n.right); out.push(n.val); };
    dfs(buildTree(root));
    return out;
  },
  'climbing-stairs-2': (n: number) => {
    let a = 1; let b = 1;
    for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c; }
    return b;
  },
  'keyboard-row': (words: string[]) => {
    const rows = [new Set('qwertyuiop'), new Set('asdfghjkl'), new Set('zxcvbnm')];
    return words.filter((w) => {
      const lower = w.toLowerCase();
      return rows.some((row) => [...lower].every((ch) => row.has(ch)));
    });
  },
  'image-smoother': imageSmoother,
  'invert-binary-tree': (root: Array<number | null>) => {
    const inv = (n: BTreeNode | null): BTreeNode | null => (!n ? null : { val: n.val, left: inv(n.right), right: inv(n.left) });
    return serializeTree(inv(buildTree(root)));
  },
  'relative-ranks': (score: number[]) => {
    const sorted = [...score].sort((a, b) => b - a);
    const rankMap = new Map<number, string>();
    sorted.forEach((s, idx) => {
      rankMap.set(s, idx === 0 ? 'Gold Medal' : idx === 1 ? 'Silver Medal' : idx === 2 ? 'Bronze Medal' : String(idx + 1));
    });
    return score.map((s) => rankMap.get(s)!);
  },
  'license-key-formatting': (s: string, k: number) => {
    const clean = s.replace(/-/g, '').toUpperCase();
    const groups: string[] = [];
    for (let i = clean.length; i > 0; i -= k) groups.push(clean.slice(Math.max(0, i - k), i));
    return groups.reverse().join('-');
  },
  'minimum-distance-between-bst-nodes': (root: Array<number | null>) => {
    const vals: number[] = [];
    const inorder = (n: BTreeNode | null) => { if (!n) return; inorder(n.left); vals.push(n.val); inorder(n.right); };
    inorder(buildTree(root));
    let best = Infinity;
    for (let i = 1; i < vals.length; i++) best = Math.min(best, vals[i] - vals[i - 1]);
    return best;
  },
  'unique-morse-code-words': (words: string[]) =>
    new Set(words.map((w) => [...w].map((ch) => MORSE[ch.charCodeAt(0) - 97]).join(''))).size,
  'intersection-of-two-arrays-easy': (a: number[], b: number[]) => {
    const sb = new Set(b);
    return [...new Set(a.filter((x) => sb.has(x)))];
  },
  'merge-sorted-array': (nums1: number[], m: number, nums2: number[], n: number) =>
    [...nums1.slice(0, m), ...nums2.slice(0, n)].sort((a, b) => a - b),
  'binary-tree-preorder-traversal': (root: Array<number | null>) => {
    const out: number[] = [];
    const dfs = (n: BTreeNode | null) => { if (!n) return; out.push(n.val); dfs(n.left); dfs(n.right); };
    dfs(buildTree(root));
    return out;
  },
  'sort-array-by-parity-ii': (nums: number[]) => {
    const evens = nums.filter((x) => Math.abs(x) % 2 === 0);
    const odds = nums.filter((x) => Math.abs(x) % 2 === 1);
    const out: number[] = [];
    for (let i = 0; i < evens.length; i++) out.push(evens[i], odds[i]);
    return out;
  },
  'image-smoother-easy': imageSmoother,
  'subtree-of-another-tree': subtreeOfAnother,
  'search-in-a-binary-search-tree': (root: Array<number | null>, val: number) => {
    let cur = buildTree(root);
    while (cur && cur.val !== val) cur = val < cur.val ? cur.left : cur.right;
    return serializeTree(cur);
  },
  'shift-2d-grid': (grid: number[][], k: number) => {
    const m = grid.length; const n = grid[0].length;
    const flat = grid.flat();
    const shift = k % flat.length;
    const rotated = shift === 0 ? flat : [...flat.slice(-shift), ...flat.slice(0, -shift)];
    return Array.from({ length: m }, (_, i) => rotated.slice(i * n, (i + 1) * n));
  },
  'positions-of-large-groups': positionsOfLargeGroups,
  'binary-tree-tilt': (root: Array<number | null>) => {
    let total = 0;
    const sum = (n: BTreeNode | null): number => {
      if (!n) return 0;
      const l = sum(n.left); const r = sum(n.right);
      total += Math.abs(l - r);
      return n.val + l + r;
    };
    sum(buildTree(root));
    return total;
  },
  'intersection-of-two-arrays': (a: number[], b: number[]) => {
    const sb = new Set(b);
    return [...new Set(a.filter((x) => sb.has(x)))];
  },
  'count-complete-tree-nodes': (root: Array<number | null>) => {
    const cnt = (n: BTreeNode | null): number => (!n ? 0 : 1 + cnt(n.left) + cnt(n.right));
    return cnt(buildTree(root));
  },
  'out-of-boundary-paths-easy': outOfBoundaryPaths,
  'minimum-absolute-difference': (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    let best = Infinity;
    for (let i = 1; i < s.length; i++) best = Math.min(best, s[i] - s[i - 1]);
    const out: number[][] = [];
    for (let i = 1; i < s.length; i++) if (s[i] - s[i - 1] === best) out.push([s[i - 1], s[i]]);
    return out;
  },
  'set-mismatch': (nums: number[]) => {
    const seen = new Set<number>();
    let dup = -1;
    for (const x of nums) { if (seen.has(x)) dup = x; seen.add(x); }
    for (let i = 1; i <= nums.length; i++) if (!seen.has(i)) return [dup, i];
    return [dup, -1];
  },
  'longest-continuous-increasing-subsequence': (nums: number[]) => {
    if (nums.length === 0) return 0;
    let best = 1; let cur = 1;
    for (let i = 1; i < nums.length; i++) {
      cur = nums[i] > nums[i - 1] ? cur + 1 : 1;
      if (cur > best) best = cur;
    }
    return best;
  },
  'positions-of-large-groups-easy': positionsOfLargeGroups,
  'find-mode-in-binary-search-tree': (root: Array<number | null>) => {
    const freq = new Map<number, number>();
    let maxF = 0;
    const dfs = (n: BTreeNode | null) => {
      if (!n) return;
      const f = (freq.get(n.val) || 0) + 1;
      freq.set(n.val, f);
      if (f > maxF) maxF = f;
      dfs(n.left); dfs(n.right);
    };
    dfs(buildTree(root));
    return [...freq.entries()].filter(([, f]) => f === maxF).map(([v]) => v).sort((a, b) => a - b);
  },
  'day-of-the-week': (day: number, month: number, year: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  },
  'contains-duplicate-iii': (nums: number[], k: number) => {
    const last = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
      if (last.has(nums[i]) && i - last.get(nums[i])! <= k) return true;
      last.set(nums[i], i);
    }
    return false;
  },
  'maximum-product-of-three-numbers': maxProductOfThree,
  'longest-common-prefix': (strs: string[]) => {
    if (strs.length === 0) return '';
    let prefix = strs[0];
    for (let i = 1; i < strs.length; i++) {
      while (!strs[i].startsWith(prefix)) {
        prefix = prefix.slice(0, -1);
        if (!prefix) return '';
      }
    }
    return prefix;
  },
  'nim-game': (n: number) => n % 4 !== 0,
  'leaf-similar-trees': (r1: Array<number | null>, r2: Array<number | null>) => {
    const leaves = (n: BTreeNode | null, out: number[] = []): number[] => {
      if (!n) return out;
      if (!n.left && !n.right) out.push(n.val);
      else { leaves(n.left, out); leaves(n.right, out); }
      return out;
    };
    return JSON.stringify(leaves(buildTree(r1))) === JSON.stringify(leaves(buildTree(r2)));
  },
  'plus-one': (digits: number[]) => {
    const out = [...digits];
    for (let i = out.length - 1; i >= 0; i--) {
      if (out[i] < 9) { out[i]++; return out; }
      out[i] = 0;
    }
    return [1, ...out];
  },
  'find-the-highest-altitude': (gain: number[]) => {
    let alt = 0; let best = 0;
    for (const g of gain) { alt += g; if (alt > best) best = alt; }
    return best;
  },
  'find-pivot-index': (nums: number[]) => {
    const total = nums.reduce((a, b) => a + b, 0);
    let left = 0;
    for (let i = 0; i < nums.length; i++) {
      if (left === total - left - nums[i]) return i;
      left += nums[i];
    }
    return -1;
  },
  'minimum-depth-of-binary-tree': (root: Array<number | null>) => {
    const dfs = (n: BTreeNode | null): number => {
      if (!n) return 0;
      if (!n.left) return 1 + dfs(n.right);
      if (!n.right) return 1 + dfs(n.left);
      return 1 + Math.min(dfs(n.left), dfs(n.right));
    };
    return dfs(buildTree(root));
  },
  'uncommon-words-from-two-sentences': (s1: string, s2: string) => {
    const freq = new Map<string, number>();
    for (const w of `${s1} ${s2}`.trim().split(/\s+/).filter(Boolean)) freq.set(w, (freq.get(w) || 0) + 1);
    return [...freq.entries()].filter(([, c]) => c === 1).map(([w]) => w);
  },
  'subtree-of-another-tree-easy': subtreeOfAnother,
  'min-cost-climbing-stairs-easy': minCostClimbingStairs,
  'next-greater-element-i': (nums1: number[], nums2: number[]) => {
    const nextMap = new Map<number, number>();
    const stack: number[] = [];
    for (const x of nums2) {
      while (stack.length && stack[stack.length - 1] < x) nextMap.set(stack.pop()!, x);
      stack.push(x);
    }
    return nums1.map((x) => nextMap.get(x) ?? -1);
  },
  'reshape-the-matrix-easy': reshapeMatrix,
  'path-sum': (root: Array<number | null>, targetSum: number) => {
    const dfs = (n: BTreeNode | null, rem: number): boolean => {
      if (!n) return false;
      if (!n.left && !n.right) return n.val === rem;
      return dfs(n.left, rem - n.val) || dfs(n.right, rem - n.val);
    };
    return dfs(buildTree(root), targetSum);
  },
  'move-zeroes': (nums: number[]) => {
    const nz = nums.filter((x) => x !== 0);
    return [...nz, ...Array(nums.length - nz.length).fill(0)];
  },
  'linked-list-cycle': (head: number[], pos: number) => pos >= 0 && pos < head.length,
  'remove-duplicates-from-sorted-list': (head: number[]) => head.filter((v, i) => i === 0 || v !== head[i - 1]),
  'maximum-depth-of-binary-tree': (root: Array<number | null>) => {
    const dfs = (n: BTreeNode | null): number => (!n ? 0 : 1 + Math.max(dfs(n.left), dfs(n.right)));
    return dfs(buildTree(root));
  },
  'base-7': (num: number) => num.toString(7),
  'binary-tree-inorder-traversal': (root: Array<number | null>) => {
    const out: number[] = [];
    const dfs = (n: BTreeNode | null) => { if (!n) return; dfs(n.left); out.push(n.val); dfs(n.right); };
    dfs(buildTree(root));
    return out;
  },
  'find-the-index-of-the-first-occurrence-in-a-string': (haystack: string, needle: string) => haystack.indexOf(needle),
  'height-checker': (heights: number[]) => {
    const sorted = [...heights].sort((a, b) => a - b);
    return heights.filter((h, i) => h !== sorted[i]).length;
  },
  'fair-candy-swap': (alice: number[], bob: number[]) => {
    const diff = (bob.reduce((a, b) => a + b, 0) - alice.reduce((a, b) => a + b, 0)) / 2;
    const bobSet = new Set(bob);
    for (const a of alice) if (bobSet.has(a + diff)) return [a, a + diff];
    return [];
  },
  'can-place-flowers-easy': canPlaceFlowers,
  'diameter-of-binary-tree-easy': diameterOfBinaryTree,
  'merge-two-binary-trees': (r1: Array<number | null>, r2: Array<number | null>) =>
    serializeTree(mergeTrees(buildTree(r1), buildTree(r2))),
  'word-pattern': (pattern: string, s: string) => {
    const words = s.split(' ');
    if (pattern.length !== words.length) return false;
    const p2w = new Map<string, string>();
    const w2p = new Map<string, string>();
    for (let i = 0; i < pattern.length; i++) {
      const p = pattern[i]; const w = words[i];
      if ((p2w.has(p) && p2w.get(p) !== w) || (w2p.has(w) && w2p.get(w) !== p)) return false;
      p2w.set(p, w); w2p.set(w, p);
    }
    return true;
  },
  'search-insert-position': (nums: number[], target: number) => {
    let lo = 0; let hi = nums.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (nums[mid] < target) lo = mid + 1; else hi = mid; }
    return lo;
  },
  'jewels-and-stones': (jewels: string, stones: string) => {
    const set = new Set(jewels);
    return [...stones].filter((c) => set.has(c)).length;
  },
  'is-subsequence': (s: string, t: string) => {
    let i = 0;
    for (let j = 0; j < t.length && i < s.length; j++) if (s[i] === t[j]) i++;
    return i === s.length;
  },
  'maximum-product-of-three-numbers-easy': maxProductOfThree,
  'number-of-boomerangs': (points: number[][]) => {
    let total = 0;
    for (let i = 0; i < points.length; i++) {
      const distCount = new Map<number, number>();
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;
        const dx = points[i][0] - points[j][0];
        const dy = points[i][1] - points[j][1];
        const d2 = dx * dx + dy * dy;
        const c = distCount.get(d2) || 0;
        total += c * 2;
        distCount.set(d2, c + 1);
      }
    }
    return total;
  },
  'merge-two-sorted-lists': (l1: number[], l2: number[]) => [...l1, ...l2].sort((a, b) => a - b),
  'min-cost-climbing-stairs': minCostClimbingStairs,
  'power-of-three': (n: number) => {
    if (n <= 0) return false;
    while (n % 3 === 0) n /= 3;
    return n === 1;
  },
  'monotonic-array': (nums: number[]) => {
    let inc = true; let dec = true;
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] > nums[i - 1]) dec = false;
      if (nums[i] < nums[i - 1]) inc = false;
    }
    return inc || dec;
  },
  'reverse-linked-list': (head: number[]) => [...head].reverse(),
  'find-the-difference': (s: string, t: string) => {
    let code = 0;
    for (const c of s) code ^= c.charCodeAt(0);
    for (const c of t) code ^= c.charCodeAt(0);
    return String.fromCharCode(code);
  },
  'diameter-of-binary-tree': diameterOfBinaryTree,
  'roman-to-integer': (s: string) => {
    const val: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    for (let i = 0; i < s.length; i++) {
      total += i + 1 < s.length && val[s[i]] < val[s[i + 1]] ? -val[s[i]] : val[s[i]];
    }
    return total;
  },
  'goat-latin': (sentence: string) => {
    const vowels = new Set('aeiouAEIOU');
    return sentence
      .split(' ')
      .map((w, i) => (vowels.has(w[0]) ? w : w.slice(1) + w[0]) + 'ma' + 'a'.repeat(i + 1))
      .join(' ');
  },
  'two-sum-iv-input-is-a-bst': (root: Array<number | null>, k: number) => {
    const seen = new Set<number>();
    const dfs = (n: BTreeNode | null): boolean => {
      if (!n) return false;
      if (seen.has(k - n.val)) return true;
      seen.add(n.val);
      return dfs(n.left) || dfs(n.right);
    };
    return dfs(buildTree(root));
  },
  'matrix-diagonal-sum': (mat: number[][]) => {
    const n = mat.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += mat[i][i];
      if (i !== n - 1 - i) sum += mat[i][n - 1 - i];
    }
    return sum;
  },
  'transpose-matrix': (matrix: number[][]) =>
    Array.from({ length: matrix[0].length }, (_, c) => matrix.map((r) => r[c])),
  'find-common-characters': (words: string[]) => {
    let minFreq = Array(26).fill(Infinity);
    for (const w of words) {
      const f = Array(26).fill(0);
      for (const ch of w) f[ch.charCodeAt(0) - 97]++;
      for (let i = 0; i < 26; i++) minFreq[i] = Math.min(minFreq[i], f[i]);
    }
    const out: string[] = [];
    for (let i = 0; i < 26; i++) for (let c = 0; c < minFreq[i]; c++) out.push(String.fromCharCode(97 + i));
    return out;
  },
  'rotate-string': (s: string, goal: string) => s.length === goal.length && (s + s).includes(goal),
  'missing-number': (nums: number[]) => {
    const n = nums.length;
    return (n * (n + 1)) / 2 - nums.reduce((a, b) => a + b, 0);
  },
  'flipping-an-image-easy': flipAndInvertImage,
  'isomorphic-strings': (s: string, t: string) => {
    if (s.length !== t.length) return false;
    const m1 = new Map<string, string>(); const m2 = new Map<string, string>();
    for (let i = 0; i < s.length; i++) {
      if ((m1.has(s[i]) && m1.get(s[i]) !== t[i]) || (m2.has(t[i]) && m2.get(t[i]) !== s[i])) return false;
      m1.set(s[i], t[i]); m2.set(t[i], s[i]);
    }
    return true;
  },
  'degree-of-an-array': (nums: number[]) => {
    const first = new Map<number, number>();
    const last = new Map<number, number>();
    const count = new Map<number, number>();
    let deg = 0;
    for (let i = 0; i < nums.length; i++) {
      const v = nums[i];
      if (!first.has(v)) first.set(v, i);
      last.set(v, i);
      const c = (count.get(v) || 0) + 1;
      count.set(v, c);
      if (c > deg) deg = c;
    }
    let ans = nums.length;
    for (const [v, c] of count) if (c === deg) ans = Math.min(ans, last.get(v)! - first.get(v)! + 1);
    return ans;
  },
  'number-of-lines-to-write-string': (widths: number[], s: string) => {
    let lines = 1; let cur = 0;
    for (const ch of s) {
      const w = widths[ch.charCodeAt(0) - 97];
      if (cur + w > 100) { lines++; cur = w; } else cur += w;
    }
    return [lines, cur];
  },
  'sign-of-the-product-of-an-array': (nums: number[]) => {
    let sign = 1;
    for (const x of nums) { if (x === 0) return 0; if (x < 0) sign = -sign; }
    return sign;
  },
  'shortest-distance-to-a-character': (s: string, c: string) => {
    const n = s.length;
    const ans = Array(n).fill(Infinity);
    let prev = -Infinity;
    for (let i = 0; i < n; i++) { if (s[i] === c) prev = i; ans[i] = i - prev; }
    prev = Infinity;
    for (let i = n - 1; i >= 0; i--) { if (s[i] === c) prev = i; ans[i] = Math.min(ans[i], prev - i); }
    return ans;
  },
  'minimum-index-sum-of-two-lists': (list1: string[], list2: string[]) => {
    const idx1 = new Map<string, number>();
    list1.forEach((s, i) => idx1.set(s, i));
    let best = Infinity;
    let out: string[] = [];
    list2.forEach((s, j) => {
      if (idx1.has(s)) {
        const sum = idx1.get(s)! + j;
        if (sum < best) { best = sum; out = [s]; }
        else if (sum === best) out.push(s);
      }
    });
    return out;
  },
  'excel-sheet-column-number': (title: string) => {
    let res = 0;
    for (const ch of title) res = res * 26 + (ch.charCodeAt(0) - 64);
    return res;
  },
  'baseball-game': (ops: string[]) => {
    const st: number[] = [];
    for (const op of ops) {
      if (op === '+') st.push(st[st.length - 1] + st[st.length - 2]);
      else if (op === 'D') st.push(st[st.length - 1] * 2);
      else if (op === 'C') st.pop();
      else st.push(Number(op));
    }
    return st.reduce((a, b) => a + b, 0);
  },
  'assign-cookies': (g: number[], s: number[]) => {
    const gs = [...g].sort((a, b) => a - b);
    const ss = [...s].sort((a, b) => a - b);
    let i = 0; let j = 0;
    while (i < gs.length && j < ss.length) { if (ss[j] >= gs[i]) i++; j++; }
    return i;
  },
  'richest-customer-wealth': (accounts: number[][]) =>
    Math.max(...accounts.map((row) => row.reduce((a, b) => a + b, 0))),
  'sqrtx': (x: number) => Math.floor(Math.sqrt(x)),
  'same-tree': (p: Array<number | null>, q: Array<number | null>) => isSameTree(buildTree(p), buildTree(q)),
  'construct-string-from-binary-tree': (root: Array<number | null>) => {
    const dfs = (n: BTreeNode | null): string => {
      if (!n) return '';
      if (!n.left && !n.right) return String(n.val);
      if (!n.right) return `${n.val}(${dfs(n.left)})`;
      return `${n.val}(${dfs(n.left)})(${dfs(n.right)})`;
    };
    return dfs(buildTree(root));
  },
  'valid-palindrome-ii': (s: string) => {
    const isPal = (l: number, r: number) => {
      while (l < r) { if (s[l] !== s[r]) return false; l++; r--; }
      return true;
    };
    let l = 0; let r = s.length - 1;
    while (l < r) {
      if (s[l] !== s[r]) return isPal(l + 1, r) || isPal(l, r - 1);
      l++; r--;
    }
    return true;
  },
  'island-perimeter': (grid: number[][]) => {
    let p = 0;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] === 1) {
          p += 4;
          if (r > 0 && grid[r - 1][c] === 1) p -= 2;
          if (c > 0 && grid[r][c - 1] === 1) p -= 2;
        }
      }
    }
    return p;
  },
  'buddy-strings': (s: string, goal: string) => {
    if (s.length !== goal.length) return false;
    if (s === goal) return new Set(s).size < s.length;
    const diff: number[] = [];
    for (let i = 0; i < s.length; i++) if (s[i] !== goal[i]) diff.push(i);
    return diff.length === 2 && s[diff[0]] === goal[diff[1]] && s[diff[1]] === goal[diff[0]];
  },
  'decompress-run-length-encoded-list': (nums: number[]) => {
    const out: number[] = [];
    for (let i = 0; i < nums.length; i += 2) for (let k = 0; k < nums[i]; k++) out.push(nums[i + 1]);
    return out;
  },
  'count-binary-substrings': (s: string) => {
    let prev = 0; let cur = 1; let ans = 0;
    for (let i = 1; i < s.length; i++) {
      if (s[i] === s[i - 1]) cur++;
      else { ans += Math.min(prev, cur); prev = cur; cur = 1; }
    }
    return ans + Math.min(prev, cur);
  },
  'merge-two-binary-trees-easy': (r1: Array<number | null>, r2: Array<number | null>) =>
    serializeTree(mergeTrees(buildTree(r1), buildTree(r2))),
  'symmetric-tree': (root: Array<number | null>) => {
    const mirror = (a: BTreeNode | null, b: BTreeNode | null): boolean => {
      if (!a && !b) return true;
      if (!a || !b || a.val !== b.val) return false;
      return mirror(a.left, b.right) && mirror(a.right, b.left);
    };
    const r = buildTree(root);
    return !r || mirror(r.left, r.right);
  },
  'self-dividing-numbers': (left: number, right: number) => {
    const out: number[] = [];
    for (let n = left; n <= right; n++) {
      let x = n; let ok = true;
      while (x > 0) { const d = x % 10; if (d === 0 || n % d !== 0) { ok = false; break; } x = Math.floor(x / 10); }
      if (ok) out.push(n);
    }
    return out;
  },
  'hamming-distance': (x: number, y: number) => {
    let v = (x ^ y) >>> 0; let cnt = 0;
    while (v) { v &= v - 1; cnt++; }
    return cnt;
  },
  'fibonacci-number': (n: number) => {
    if (n <= 1) return n;
    let a = 0; let b = 1;
    for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c; }
    return b;
  },
  'intersection-of-two-arrays-ii': (a: number[], b: number[]) => {
    const cnt = new Map<number, number>();
    for (const x of a) cnt.set(x, (cnt.get(x) || 0) + 1);
    const out: number[] = [];
    for (const x of b) { const c = cnt.get(x) || 0; if (c > 0) { out.push(x); cnt.set(x, c - 1); } }
    return out;
  },
  'happy-number': (n: number) => {
    const seen = new Set<number>();
    while (n !== 1 && !seen.has(n)) {
      seen.add(n);
      let next = 0;
      while (n > 0) { const d = n % 10; next += d * d; n = Math.floor(n / 10); }
      n = next;
    }
    return n === 1;
  },
  'counting-bits': (n: number) => {
    const dp = Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);
    return dp;
  },
  'can-place-flowers': canPlaceFlowers,
  'maximum-depth-of-n-ary-tree': (root: Array<number | null>) => {
    const dfs = (n: NaryNode | null): number =>
      !n ? 0 : 1 + n.children.reduce((m, c) => Math.max(m, dfs(c)), 0);
    return dfs(buildNaryTree(root));
  },
  'find-all-anagrams-in-a-string-easy': (s: string, p: string) => {
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
  },
  'excel-sheet-column-title': (col: number) => {
    let out = '';
    let n = col;
    while (n > 0) { n--; out = String.fromCharCode(65 + (n % 26)) + out; n = Math.floor(n / 26); }
    return out;
  },
  'reverse-vowels-of-a-string': (s: string) => {
    const vowels = new Set('aeiouAEIOU');
    const arr = [...s];
    let l = 0; let r = arr.length - 1;
    while (l < r) {
      while (l < r && !vowels.has(arr[l])) l++;
      while (l < r && !vowels.has(arr[r])) r--;
      if (l < r) { [arr[l], arr[r]] = [arr[r], arr[l]]; l++; r--; }
    }
    return arr.join('');
  },
  'palindrome-linked-list': (head: number[]) => {
    for (let l = 0, r = head.length - 1; l < r; l++, r--) if (head[l] !== head[r]) return false;
    return true;
  },
  'reshape-the-matrix': reshapeMatrix,
  'number-of-segments-in-a-string': (s: string) => s.trim() ? s.trim().split(/\s+/).length : 0,
  'toeplitz-matrix': (mat: number[][]) => {
    for (let r = 1; r < mat.length; r++) {
      for (let c = 1; c < mat[0].length; c++) if (mat[r][c] !== mat[r - 1][c - 1]) return false;
    }
    return true;
  },
  'lemonade-change': (bills: number[]) => {
    let five = 0; let ten = 0;
    for (const b of bills) {
      if (b === 5) five++;
      else if (b === 10) { if (five === 0) return false; five--; ten++; }
      else { if (ten > 0 && five > 0) { ten--; five--; } else if (five >= 3) five -= 3; else return false; }
    }
    return true;
  },
  'duplicate-zeros': (arr: number[]) => {
    const out: number[] = [];
    for (const x of arr) {
      out.push(x);
      if (x === 0) out.push(0);
      if (out.length >= arr.length) break;
    }
    return out.slice(0, arr.length);
  },
  'relative-sort-array': (arr1: number[], arr2: number[]) => {
    const rank = new Map<number, number>();
    arr2.forEach((v, i) => rank.set(v, i));
    return [...arr1].sort((a, b) => {
      const ra = rank.has(a) ? rank.get(a)! : Infinity;
      const rb = rank.has(b) ? rank.get(b)! : Infinity;
      return ra !== rb ? ra - rb : a - b;
    });
  },
  'student-attendance-record-i': (s: string) => {
    let absents = 0;
    for (const ch of s) if (ch === 'A') absents++;
    return absents < 2 && !s.includes('LLL');
  },
  'binary-gap': (n: number) => {
    const bin = n.toString(2);
    let prev = -1; let best = 0;
    for (let i = 0; i < bin.length; i++) {
      if (bin[i] === '1') { if (prev !== -1) best = Math.max(best, i - prev); prev = i; }
    }
    return best;
  },
  'flipping-an-image': flipAndInvertImage,
  'largest-number-at-least-twice-of-others-easy': (nums: number[]) => {
    let maxIdx = 0;
    for (let i = 1; i < nums.length; i++) if (nums[i] > nums[maxIdx]) maxIdx = i;
    for (let i = 0; i < nums.length; i++) if (i !== maxIdx && nums[maxIdx] < 2 * nums[i]) return -1;
    return maxIdx;
  },
  'valid-palindrome': (s: string) => {
    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean === [...clean].reverse().join('');
  },
  'reverse-words-in-a-string': (s: string) => s.trim().split(/\s+/).filter(Boolean).reverse().join(' '),
  'longest-uncommon-subsequence-i': (a: string, b: string) => (a === b ? -1 : Math.max(a.length, b.length)),
};
