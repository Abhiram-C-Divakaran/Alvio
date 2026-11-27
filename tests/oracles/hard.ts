import { buildTree, serializeTree, type BTreeNode } from './helpers';

const MOD = 1_000_000_007;

function largestRectangleArea(heights: number[]): number {
  const st: number[] = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (st.length && heights[st[st.length - 1]] > h) {
      const top = st.pop()!;
      const width = st.length === 0 ? i : i - st[st.length - 1] - 1;
      best = Math.max(best, heights[top] * width);
    }
    st.push(i);
  }
  return best;
}

export const HARD_ORACLES: Record<string, (...args: any[]) => any> = {
  'substring-with-concatenation-of-all-words': (s: string, words: string[]) => {
    if (!words.length || !words[0].length) return [];
    const wLen = words[0].length;
    const total = wLen * words.length;
    const need = new Map<string, number>();
    for (const w of words) need.set(w, (need.get(w) || 0) + 1);
    const out: number[] = [];
    for (let i = 0; i <= s.length - total; i++) {
      const seen = new Map<string, number>();
      let ok = true;
      for (let j = 0; j < words.length; j++) {
        const sub = s.slice(i + j * wLen, i + (j + 1) * wLen);
        if (!need.has(sub)) { ok = false; break; }
        const c = (seen.get(sub) || 0) + 1;
        if (c > need.get(sub)!) { ok = false; break; }
        seen.set(sub, c);
      }
      if (ok) out.push(i);
    }
    return out;
  },
  'lfu-cache': (ops: string[], args: number[][]) => {
    let cap = 0;
    let minFreq = 0;
    const keyVal = new Map<number, number>();
    const keyFreq = new Map<number, number>();
    const freqKeys = new Map<number, Set<number>>();
    const touch = (k: number) => {
      const f = keyFreq.get(k)!;
      freqKeys.get(f)!.delete(k);
      if (freqKeys.get(f)!.size === 0) { freqKeys.delete(f); if (minFreq === f) minFreq++; }
      keyFreq.set(k, f + 1);
      if (!freqKeys.has(f + 1)) freqKeys.set(f + 1, new Set());
      freqKeys.get(f + 1)!.add(k);
    };
    return ops.map((op, i) => {
      if (op === 'LFUCache') { cap = args[i][0]; return null; }
      if (op === 'get') {
        const k = args[i][0];
        if (!keyVal.has(k)) return -1;
        touch(k);
        return keyVal.get(k)!;
      }
      const [k, v] = args[i];
      if (cap <= 0) return null;
      if (keyVal.has(k)) { keyVal.set(k, v); touch(k); return null; }
      if (keyVal.size === cap) {
        const evict = freqKeys.get(minFreq)!.values().next().value!;
        freqKeys.get(minFreq)!.delete(evict);
        keyVal.delete(evict);
        keyFreq.delete(evict);
      }
      keyVal.set(k, v);
      keyFreq.set(k, 1);
      if (!freqKeys.has(1)) freqKeys.set(1, new Set());
      freqKeys.get(1)!.add(k);
      minFreq = 1;
      return null;
    });
  },
  'text-justification': (words: string[], maxWidth: number) => {
    const out: string[] = [];
    for (let i = 0; i < words.length; ) {
      let j = i; let len = 0;
      while (j < words.length && len + words[j].length + (j - i) <= maxWidth) len += words[j++].length;
      const lineWords = words.slice(i, j);
      const gaps = lineWords.length - 1;
      if (j === words.length || gaps === 0) {
        const line = lineWords.join(' ');
        out.push(line + ' '.repeat(maxWidth - line.length));
      } else {
        const totalSpaces = maxWidth - len;
        const base = Math.floor(totalSpaces / gaps);
        const extra = totalSpaces % gaps;
        let line = '';
        for (let k = 0; k < lineWords.length; k++) {
          line += lineWords[k];
          if (k < gaps) line += ' '.repeat(base + (k < extra ? 1 : 0));
        }
        out.push(line);
      }
      i = j;
    }
    return out;
  },
  'distinct-subsequences-ii': (s: string) => {
    const last = Array(26).fill(0);
    let total = 0;
    for (const ch of s) {
      const idx = ch.charCodeAt(0) - 97;
      const added = (total + 1 - last[idx] + MOD) % MOD;
      last[idx] = (last[idx] + added) % MOD;
      total = (total + added) % MOD;
    }
    return total;
  },
  'longest-increasing-path-in-a-matrix': (mat: number[][]) => {
    const m = mat.length; const n = mat[0].length;
    const memo = Array.from({ length: m }, () => Array(n).fill(0));
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const dfs = (r: number, c: number): number => {
      if (memo[r][c]) return memo[r][c];
      let best = 1;
      for (const [dr, dc] of dirs) {
        const nr = r + dr; const nc = c + dc;
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && mat[nr][nc] > mat[r][c]) best = Math.max(best, 1 + dfs(nr, nc));
      }
      return (memo[r][c] = best);
    };
    let ans = 0;
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) ans = Math.max(ans, dfs(r, c));
    return ans;
  },
  'valid-number': (s: string) => /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(s.trim()),
  'count-of-smaller-numbers-after-self': (nums: number[]) =>
    nums.map((v, i) => {
      let c = 0;
      for (let j = i + 1; j < nums.length; j++) if (nums[j] < v) c++;
      return c;
    }),
  'russian-doll-envelopes': (envs: number[][]) => {
    const sorted = envs.map((e) => [...e]).sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]));
    const tails: number[] = [];
    for (const [, h] of sorted) {
      let l = 0; let r = tails.length;
      while (l < r) { const m = (l + r) >> 1; if (tails[m] < h) l = m + 1; else r = m; }
      tails[l] = h;
    }
    return tails.length;
  },
  'best-time-to-buy-and-sell-stock-iv': (k: number, prices: number[]) => {
    const n = prices.length;
    if (n <= 1 || k === 0) return 0;
    if (k >= Math.floor(n / 2)) {
      let profit = 0;
      for (let i = 1; i < n; i++) if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
      return profit;
    }
    const buy = Array(k + 1).fill(-Infinity);
    const sell = Array(k + 1).fill(0);
    for (const p of prices) {
      for (let t = 1; t <= k; t++) {
        buy[t] = Math.max(buy[t], sell[t - 1] - p);
        sell[t] = Math.max(sell[t], buy[t] + p);
      }
    }
    return sell[k];
  },
  'regular-expression-matching': (s: string, p: string) => {
    const m = s.length; const n = p.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(false));
    dp[0][0] = true;
    for (let j = 2; j <= n; j++) if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') {
          dp[i][j] = dp[i][j - 2] || ((p[j - 2] === '.' || p[j - 2] === s[i - 1]) && dp[i - 1][j]);
        } else if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        }
      }
    }
    return dp[m][n];
  },
  'basic-calculator': (s: string) => {
    let res = 0; let num = 0; let sign = 1;
    const st: number[] = [];
    for (const ch of s) {
      if (ch >= '0' && ch <= '9') num = num * 10 + (ch.charCodeAt(0) - 48);
      else if (ch === '+') { res += sign * num; num = 0; sign = 1; }
      else if (ch === '-') { res += sign * num; num = 0; sign = -1; }
      else if (ch === '(') { st.push(res, sign); res = 0; sign = 1; }
      else if (ch === ')') { res += sign * num; num = 0; res *= st.pop()!; res += st.pop()!; }
    }
    return res + sign * num;
  },
  'maximal-rectangle': (mat: string[][]) => {
    if (!mat.length || !mat[0].length) return 0;
    const cols = mat[0].length;
    const heights = Array(cols).fill(0);
    let best = 0;
    for (const row of mat) {
      for (let c = 0; c < cols; c++) heights[c] = row[c] === '1' ? heights[c] + 1 : 0;
      best = Math.max(best, largestRectangleArea(heights));
    }
    return best;
  },
  'frog-jump': (stones: number[]) => {
    const map = new Map<number, Set<number>>();
    for (const st of stones) map.set(st, new Set());
    map.get(0)!.add(0);
    for (const st of stones) {
      for (const k of map.get(st)!) {
        for (const step of [k - 1, k, k + 1]) {
          if (step > 0 && map.has(st + step)) map.get(st + step)!.add(step);
        }
      }
    }
    return map.get(stones[stones.length - 1])!.size > 0;
  },
  'reconstruct-itinerary': (tickets: string[][]) => {
    const graph = new Map<string, string[]>();
    for (const [u, v] of tickets) { if (!graph.has(u)) graph.set(u, []); graph.get(u)!.push(v); }
    for (const arr of graph.values()) arr.sort().reverse();
    const out: string[] = [];
    const dfs = (u: string) => {
      const dests = graph.get(u) || [];
      while (dests.length) dfs(dests.pop()!);
      out.push(u);
    };
    dfs('JFK');
    return out.reverse();
  },
  'dungeon-game': (dungeon: number[][]) => {
    const m = dungeon.length; const n = dungeon[0].length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(Infinity));
    dp[m][n - 1] = 1; dp[m - 1][n] = 1;
    for (let r = m - 1; r >= 0; r--) {
      for (let c = n - 1; c >= 0; c--) {
        dp[r][c] = Math.max(1, Math.min(dp[r + 1][c], dp[r][c + 1]) - dungeon[r][c]);
      }
    }
    return dp[0][0];
  },
  'split-array-largest-sum': (nums: number[], k: number) => {
    let lo = Math.max(...nums);
    let hi = nums.reduce((a, b) => a + b, 0);
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      let parts = 1; let cur = 0;
      for (const x of nums) { if (cur + x > mid) { parts++; cur = x; } else cur += x; }
      if (parts <= k) hi = mid; else lo = mid + 1;
    }
    return lo;
  },
  'best-time-to-buy-and-sell-stock-iii': (prices: number[]) => {
    let b1 = -Infinity; let s1 = 0; let b2 = -Infinity; let s2 = 0;
    for (const p of prices) {
      b1 = Math.max(b1, -p);
      s1 = Math.max(s1, b1 + p);
      b2 = Math.max(b2, s1 - p);
      s2 = Math.max(s2, b2 + p);
    }
    return s2;
  },
  'word-ladder': (begin: string, end: string, wordList: string[]) => {
    const set = new Set(wordList);
    if (!set.has(end)) return 0;
    const q: Array<[string, number]> = [[begin, 1]];
    let head = 0;
    while (head < q.length) {
      const [w, d] = q[head++];
      for (let i = 0; i < w.length; i++) {
        for (let c = 97; c <= 122; c++) {
          const nw = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);
          if (nw === end) return d + 1;
          if (set.has(nw)) { set.delete(nw); q.push([nw, d + 1]); }
        }
      }
    }
    return 0;
  },
  'max-sum-of-rectangle-no-larger-than-k': (mat: number[][], k: number) => {
    const m = mat.length; const n = mat[0].length;
    let best = -Infinity;
    for (let top = 0; top < m; top++) {
      const colSum = Array(n).fill(0);
      for (let bot = top; bot < m; bot++) {
        for (let c = 0; c < n; c++) colSum[c] += mat[bot][c];
        for (let l = 0; l < n; l++) {
          let sum = 0;
          for (let r = l; r < n; r++) {
            sum += colSum[r];
            if (sum <= k && sum > best) best = sum;
          }
        }
      }
    }
    return best;
  },
  'reverse-nodes-in-k-group': (head: number[], k: number) => {
    const out = [...head];
    for (let i = 0; i + k <= out.length; i += k) {
      const sub = out.slice(i, i + k).reverse();
      out.splice(i, k, ...sub);
    }
    return out;
  },
  'first-missing-positive': (nums: number[]) => {
    const set = new Set(nums);
    let x = 1;
    while (set.has(x)) x++;
    return x;
  },
  'alien-dictionary': (words: string[]) => {
    const adj = new Map<string, Set<string>>();
    const indeg = new Map<string, number>();
    for (const w of words) for (const ch of w) { if (!adj.has(ch)) adj.set(ch, new Set()); if (!indeg.has(ch)) indeg.set(ch, 0); }
    for (let i = 0; i < words.length - 1; i++) {
      const a = words[i]; const b = words[i + 1];
      if (a.length > b.length && a.startsWith(b)) return '';
      for (let j = 0; j < Math.min(a.length, b.length); j++) {
        if (a[j] !== b[j]) {
          if (!adj.get(a[j])!.has(b[j])) { adj.get(a[j])!.add(b[j]); indeg.set(b[j], indeg.get(b[j])! + 1); }
          break;
        }
      }
    }
    const q = [...indeg.entries()].filter(([, d]) => d === 0).map(([c]) => c);
    let out = '';
    while (q.length) {
      const u = q.shift()!;
      out += u;
      for (const v of adj.get(u)!) {
        indeg.set(v, indeg.get(v)! - 1);
        if (indeg.get(v) === 0) q.push(v);
      }
    }
    return out.length === indeg.size ? out : '';
  },
  '0-1-knapsack': (wt: number[], val: number[], W: number) => {
    const dp = Array(W + 1).fill(0);
    for (let i = 0; i < wt.length; i++) {
      for (let w = W; w >= wt[i]; w--) dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
    }
    return dp[W];
  },
  'wildcard-matching': (s: string, p: string) => {
    const m = s.length; const n = p.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(false));
    dp[0][0] = true;
    for (let j = 1; j <= n && p[j - 1] === '*'; j++) dp[0][j] = true;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
        else if (p[j - 1] === '?' || p[j - 1] === s[i - 1]) dp[i][j] = dp[i - 1][j - 1];
      }
    }
    return dp[m][n];
  },
  'recover-binary-search-tree': (root: Array<number | null>) => {
    const tree = buildTree(root);
    const nodes: BTreeNode[] = [];
    const inorder = (n: BTreeNode | null) => { if (!n) return; inorder(n.left); nodes.push(n); inorder(n.right); };
    inorder(tree);
    const sorted = nodes.map((n) => n.val).sort((a, b) => a - b);
    nodes.forEach((n, i) => { n.val = sorted[i]; });
    return serializeTree(tree);
  },
  'strong-password-checker': (password: string) => {
    const n = password.length;
    const missing =
      (/[a-z]/.test(password) ? 0 : 1) +
      (/[A-Z]/.test(password) ? 0 : 1) +
      (/\d/.test(password) ? 0 : 1);
    let replace = 0; let oneDel = 0; let twoDel = 0;
    for (let i = 0; i < n; ) {
      let j = i;
      while (j < n && password[j] === password[i]) j++;
      const len = j - i;
      if (len >= 3) {
        replace += Math.floor(len / 3);
        if (len % 3 === 0) oneDel++;
        else if (len % 3 === 1) twoDel++;
      }
      i = j;
    }
    if (n < 6) return Math.max(missing, 6 - n);
    if (n <= 20) return Math.max(missing, replace);
    const del = n - 20;
    let rem = del;
    const use1 = Math.min(rem, oneDel);
    replace -= use1; rem -= use1;
    const use2 = Math.min(Math.floor(rem / 2), twoDel);
    replace -= use2; rem -= use2 * 2;
    replace -= Math.floor(rem / 3);
    return del + Math.max(missing, replace);
  },
  'find-minimum-in-rotated-sorted-array-ii': (nums: number[]) => Math.min(...nums),
  'burst-balloons': (nums: number[]) => {
    const a = [1, ...nums, 1];
    const n = a.length;
    const dp = Array.from({ length: n }, () => Array(n).fill(0));
    for (let len = 2; len < n; len++) {
      for (let l = 0; l + len < n; l++) {
        const r = l + len;
        for (let k = l + 1; k < r; k++) {
          dp[l][r] = Math.max(dp[l][r], a[l] * a[k] * a[r] + dp[l][k] + dp[k][r]);
        }
      }
    }
    return dp[0][n - 1];
  },
  'largest-rectangle-in-histogram': largestRectangleArea,
  'the-skyline-problem': (buildings: number[][]) => {
    const xs = [...new Set(buildings.flatMap(([l, r]) => [l, r]))].sort((a, b) => a - b);
    const out: number[][] = [];
    for (const x of xs) {
      let h = 0;
      for (const [l, r, bh] of buildings) if (l <= x && x < r && bh > h) h = bh;
      if (!out.length || out[out.length - 1][1] !== h) out.push([x, h]);
    }
    return out;
  },
  'k-inverse-pairs-array': (n: number, k: number) => {
    let dp = Array(k + 1).fill(0);
    dp[0] = 1;
    for (let i = 1; i <= n; i++) {
      const next = Array(k + 1).fill(0);
      let win = 0;
      for (let j = 0; j <= k; j++) {
        win = (win + dp[j]) % MOD;
        if (j >= i) win = (win - dp[j - i] + MOD) % MOD;
        next[j] = win;
      }
      dp = next;
    }
    return dp[k];
  },
  'shortest-palindrome': (s: string) => {
    const rev = [...s].reverse().join('');
    for (let i = 0; i <= s.length; i++) {
      if (s.startsWith(rev.slice(i))) return rev.slice(0, i) + s;
    }
    return s;
  },
  'scramble-string': (s1: string, s2: string) => {
    const memo = new Map<string, boolean>();
    const dfs = (a: string, b: string): boolean => {
      if (a === b) return true;
      if (a.length !== b.length) return false;
      const key = `${a}|${b}`;
      if (memo.has(key)) return memo.get(key)!;
      if ([...a].sort().join('') !== [...b].sort().join('')) { memo.set(key, false); return false; }
      const n = a.length;
      for (let i = 1; i < n; i++) {
        if ((dfs(a.slice(0, i), b.slice(0, i)) && dfs(a.slice(i), b.slice(i))) ||
            (dfs(a.slice(0, i), b.slice(n - i)) && dfs(a.slice(i), b.slice(0, n - i)))) {
          memo.set(key, true);
          return true;
        }
      }
      memo.set(key, false);
      return false;
    };
    return dfs(s1, s2);
  },
  'binary-tree-maximum-path-sum': (root: Array<number | null>) => {
    let best = -Infinity;
    const gain = (n: BTreeNode | null): number => {
      if (!n) return 0;
      const l = Math.max(0, gain(n.left));
      const r = Math.max(0, gain(n.right));
      best = Math.max(best, n.val + l + r);
      return n.val + Math.max(l, r);
    };
    gain(buildTree(root));
    return best;
  },
  'max-points-on-a-line': (points: number[][]) => {
    const n = points.length;
    if (n <= 2) return n;
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    let best = 2;
    for (let i = 0; i < n; i++) {
      const slopes = new Map<string, number>();
      for (let j = i + 1; j < n; j++) {
        let dx = points[j][0] - points[i][0];
        let dy = points[j][1] - points[i][1];
        const g = gcd(Math.abs(dx), Math.abs(dy));
        dx /= g; dy /= g;
        if (dx < 0 || (dx === 0 && dy < 0)) { dx = -dx; dy = -dy; }
        const key = `${dy}/${dx}`;
        const c = (slopes.get(key) || 1) + 1;
        slopes.set(key, c);
        if (c > best) best = c;
      }
    }
    return best;
  },
  'sliding-window-maximum': (nums: number[], k: number) => {
    const dq: number[] = [];
    const out: number[] = [];
    for (let i = 0; i < nums.length; i++) {
      while (dq.length && dq[0] <= i - k) dq.shift();
      while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
      dq.push(i);
      if (i >= k - 1) out.push(nums[dq[0]]);
    }
    return out;
  },
  'trapping-rain-water': (height: number[]) => {
    let l = 0; let r = height.length - 1; let lm = 0; let rm = 0; let water = 0;
    while (l < r) {
      if (height[l] < height[r]) { lm = Math.max(lm, height[l]); water += lm - height[l++]; }
      else { rm = Math.max(rm, height[r]); water += rm - height[r--]; }
    }
    return water;
  },
  'minimum-spanning-tree': (n: number, edges: number[][]) => {
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const sorted = edges.map((e) => [...e]).sort((a, b) => a[2] - b[2]);
    let cost = 0;
    for (const [u, v, w] of sorted) {
      const pu = find(u); const pv = find(v);
      if (pu !== pv) { parent[pu] = pv; cost += w; }
    }
    return cost;
  },
  'travelling-salesman-problem': (cost: number[][]) => {
    const n = cost.length;
    const full = (1 << n) - 1;
    const dp = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
    dp[1][0] = 0;
    for (let mask = 1; mask <= full; mask++) {
      for (let u = 0; u < n; u++) {
        if (dp[mask][u] === Infinity) continue;
        for (let v = 0; v < n; v++) {
          if (!(mask & (1 << v))) dp[mask | (1 << v)][v] = Math.min(dp[mask | (1 << v)][v], dp[mask][u] + cost[u][v]);
        }
      }
    }
    let ans = Infinity;
    for (let u = 0; u < n; u++) ans = Math.min(ans, dp[full][u] + cost[u][0]);
    return ans;
  },
  'longest-valid-parentheses': (s: string) => {
    const st = [-1];
    let best = 0;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') st.push(i);
      else {
        st.pop();
        if (!st.length) st.push(i);
        else best = Math.max(best, i - st[st.length - 1]);
      }
    }
    return best;
  },
  'sudoku-solver': (board: string[][]) => {
    const g = board.map((r) => [...r]);
    const valid = (r: number, c: number, ch: string) => {
      for (let i = 0; i < 9; i++) {
        if (g[r][i] === ch || g[i][c] === ch || g[3 * Math.floor(r / 3) + Math.floor(i / 3)][3 * Math.floor(c / 3) + (i % 3)] === ch) return false;
      }
      return true;
    };
    const solve = (): boolean => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (g[r][c] === '.') {
            for (let d = 1; d <= 9; d++) {
              const ch = String(d);
              if (valid(r, c, ch)) { g[r][c] = ch; if (solve()) return true; g[r][c] = '.'; }
            }
            return false;
          }
        }
      }
      return true;
    };
    solve();
    return g;
  },
  'decode-ways-ii': (s: string) => {
    let prev2 = 1;
    let prev1 = s[0] === '*' ? 9 : s[0] === '0' ? 0 : 1;
    for (let i = 1; i < s.length; i++) {
      const c = s[i]; const p = s[i - 1];
      let cur = 0;
      if (c === '*') cur = (9 * prev1) % MOD;
      else if (c !== '0') cur = prev1;
      if (p === '*' && c === '*') cur = (cur + 15 * prev2) % MOD;
      else if (p === '*') cur = (cur + (c <= '6' ? 2 : 1) * prev2) % MOD;
      else if (c === '*') {
        if (p === '1') cur = (cur + 9 * prev2) % MOD;
        else if (p === '2') cur = (cur + 6 * prev2) % MOD;
      } else {
        const two = Number(p + c);
        if (two >= 10 && two <= 26) cur = (cur + prev2) % MOD;
      }
      prev2 = prev1; prev1 = cur;
    }
    return prev1;
  },
  'longest-substring-with-at-most-k-distinct-characters': (s: string, k: number) => {
    if (k <= 0) return 0;
    const cnt = new Map<string, number>();
    let l = 0; let best = 0;
    for (let r = 0; r < s.length; r++) {
      cnt.set(s[r], (cnt.get(s[r]) || 0) + 1);
      while (cnt.size > k) {
        const lc = s[l++];
        if (cnt.get(lc) === 1) cnt.delete(lc);
        else cnt.set(lc, cnt.get(lc)! - 1);
      }
      best = Math.max(best, r - l + 1);
    }
    return best;
  },
};
