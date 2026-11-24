import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../server/migrations';
import { loadProblemCatalog, seedProblemCatalog } from '../server/problemCatalog';
import {
  CURATED_HIDDEN_TESTS,
  computeHiddenTestCoverage,
  seedHiddenTests,
} from '../server/seedHiddenTests';

/**
 * Independent reference oracles for every curated hidden-test problem.
 * Each oracle is validated against BOTH:
 *   1. All existing visible testCases in the problem catalog (proving spec alignment), AND
 *   2. All curated server-only hidden test cases in CURATED_HIDDEN_TESTS.
 */
const REFERENCE_ORACLES: Record<string, (...args: any[]) => any> = {
  // ===== Original 18 =====
  'number-of-digit-one': (n: number) => {
    let count = 0;
    for (let i = 1; i <= n; i *= 10) {
      const div = i * 10;
      count += Math.floor(n / div) * i + Math.min(Math.max((n % div) - i + 1, 0), i);
    }
    return count;
  },
  'rotate-list': (head: number[], k: number) => {
    if (head.length === 0) return [];
    const r = k % head.length;
    return r === 0 ? [...head] : [...head.slice(-r), ...head.slice(0, -r)];
  },
  'unique-paths-ii': (grid: number[][]) => {
    const m = grid.length;
    const n = grid[0].length;
    const dp = Array(n).fill(0);
    dp[0] = grid[0][0] === 1 ? 0 : 1;
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (grid[i][j] === 1) dp[j] = 0;
        else if (j > 0) dp[j] += dp[j - 1];
      }
    }
    return dp[n - 1];
  },
  'house-robber': (nums: number[]) => {
    let p2 = 0;
    let p1 = 0;
    for (const x of nums) {
      const c = Math.max(p1, p2 + x);
      p2 = p1;
      p1 = c;
    }
    return p1;
  },
  'maximum-subarray': (nums: number[]) => {
    let best = nums[0];
    let cur = nums[0];
    for (let i = 1; i < nums.length; i++) {
      cur = Math.max(nums[i], cur + nums[i]);
      best = Math.max(best, cur);
    }
    return best;
  },
  'perfect-number': (num: number) => {
    if (num <= 1) return false;
    let sum = 1;
    for (let d = 2; d * d <= num; d++) {
      if (num % d === 0) {
        sum += d;
        if (d * d !== num) sum += num / d;
      }
    }
    return sum === num;
  },
  'merge-intervals': (intervals: number[][]) => {
    const sorted = intervals.map((x) => [...x]).sort((a, b) => a[0] - b[0]);
    const out: number[][] = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const last = out[out.length - 1];
      if (sorted[i][0] <= last[1]) last[1] = Math.max(last[1], sorted[i][1]);
      else out.push(sorted[i]);
    }
    return out;
  },
  'pascals-triangle': (numRows: number) => {
    const tri: number[][] = [];
    for (let r = 0; r < numRows; r++) {
      const row = Array(r + 1).fill(1);
      for (let c = 1; c < r; c++) row[c] = tri[r - 1][c - 1] + tri[r - 1][c];
      tri.push(row);
    }
    return tri;
  },
  'flood-fill': (image: number[][], sr: number, sc: number, color: number) => {
    const grid = image.map((r) => [...r]);
    const orig = grid[sr][sc];
    if (orig === color) return grid;
    const dfs = (r: number, c: number) => {
      if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== orig) return;
      grid[r][c] = color;
      dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
    };
    dfs(sr, sc);
    return grid;
  },
  'power-of-four': (n: number) => n > 0 && (n & (n - 1)) === 0 && (n & 0x55555555) !== 0,
  'word-break': (s: string, wordDict: string[]) => {
    const set = new Set(wordDict);
    const dp = Array(s.length + 1).fill(false);
    dp[0] = true;
    for (let i = 1; i <= s.length; i++) {
      for (let j = 0; j < i; j++) {
        if (dp[j] && set.has(s.slice(j, i))) { dp[i] = true; break; }
      }
    }
    return dp[s.length];
  },
  'count-and-say': (n: number) => {
    let s = '1';
    for (let step = 1; step < n; step++) {
      let next = '';
      for (let i = 0; i < s.length;) {
        let j = i;
        while (j < s.length && s[j] === s[i]) j++;
        next += `${j - i}${s[i]}`;
        i = j;
      }
      s = next;
    }
    return s;
  },
  'valid-anagram': (s: string, t: string) =>
    s.length === t.length && s.split('').sort().join('') === t.split('').sort().join(''),
  'best-time-to-buy-and-sell-stock': (prices: number[]) => {
    let minP = Infinity;
    let best = 0;
    for (const p of prices) { minP = Math.min(minP, p); best = Math.max(best, p - minP); }
    return best;
  },
  'valid-parentheses': (s: string) => {
    const stack: string[] = [];
    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    for (const ch of s) {
      if (ch in pairs) { if (stack.pop() !== pairs[ch]) return false; }
      else stack.push(ch);
    }
    return stack.length === 0;
  },
  'climbing-stairs': (n: number) => {
    let a = 1;
    let b = 1;
    for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c; }
    return b;
  },
  'contains-duplicate': (nums: number[]) => new Set(nums).size !== nums.length,
  'reverse-string': (s: string[]) => [...s].reverse(),

  // ===== Expanded Easy (+44) =====
  'cells-with-odd-values-in-a-matrix': (m: number, n: number, indices: number[][]) => {
    const rows = Array(m).fill(0);
    const cols = Array(n).fill(0);
    for (const [r, c] of indices) { rows[r]++; cols[c]++; }
    let odd = 0;
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if ((rows[r] + cols[c]) % 2 === 1) odd++;
    return odd;
  },
  'maximum-population-year': (logs: number[][]) => {
    const delta = new Map<number, number>();
    for (const [b, d] of logs) {
      delta.set(b, (delta.get(b) || 0) + 1);
      delta.set(d, (delta.get(d) || 0) - 1);
    }
    const years = [...delta.keys()].sort((a, b) => a - b);
    let cur = 0; let best = 0; let ans = years[0];
    for (const y of years) {
      cur += delta.get(y)!;
      if (cur > best) { best = cur; ans = y; }
    }
    return ans;
  },
  'arrange-coins': (n: number) => Math.floor((Math.sqrt(1 + 8 * n) - 1) / 2),
  'reverse-string-ii': (s: string, k: number) => {
    const arr = s.split('');
    for (let i = 0; i < arr.length; i += 2 * k) {
      let l = i;
      let r = Math.min(i + k - 1, arr.length - 1);
      while (l < r) { [arr[l], arr[r]] = [arr[r], arr[l]]; l++; r--; }
    }
    return arr.join('');
  },
  'remove-element': (nums: number[], val: number) => nums.filter((x) => x !== val).length,
  '1-bit-and-2-bit-characters': (bits: number[]) => {
    let i = 0;
    while (i < bits.length - 1) i += bits[i] === 1 ? 2 : 1;
    return i === bits.length - 1;
  },
  'teemo-attacking': (timeSeries: number[], duration: number) => {
    if (timeSeries.length === 0 || duration === 0) return 0;
    let total = 0;
    for (let i = 0; i < timeSeries.length - 1; i++) total += Math.min(timeSeries[i + 1] - timeSeries[i], duration);
    return total + duration;
  },
  'contains-duplicate-ii': (nums: number[], k: number) => {
    const last = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
      if (last.has(nums[i]) && i - last.get(nums[i])! <= k) return true;
      last.set(nums[i], i);
    }
    return false;
  },
  'distribute-candies': (candyType: number[]) => Math.min(new Set(candyType).size, candyType.length / 2),
  'find-pivot-index-easy': (nums: number[]) => {
    const total = nums.reduce((a, b) => a + b, 0);
    let left = 0;
    for (let i = 0; i < nums.length; i++) {
      if (left === total - left - nums[i]) return i;
      left += nums[i];
    }
    return -1;
  },
  'valid-perfect-square': (num: number) => {
    const r = Math.floor(Math.sqrt(num));
    return r * r === num;
  },
  'add-binary': (a: string, b: string) => (BigInt('0b' + a) + BigInt('0b' + b)).toString(2),
  'middle-of-the-linked-list': (head: number[]) => head.slice(Math.floor(head.length / 2)),
  'is-subsequence-easy': (s: string, t: string) => {
    let i = 0;
    for (let j = 0; j < t.length && i < s.length; j++) if (s[i] === t[j]) i++;
    return i === s.length;
  },
  'length-of-last-word': (s: string) => {
    const parts = s.trim().split(/\s+/);
    return parts[parts.length - 1].length;
  },
  'add-strings': (a: string, b: string) => (BigInt(a) + BigInt(b)).toString(),
  'third-maximum-number': (nums: number[]) => {
    const uniq = [...new Set(nums)].sort((a, b) => b - a);
    return uniq.length >= 3 ? uniq[2] : uniq[0];
  },
  'construct-the-rectangle': (area: number) => {
    for (let w = Math.floor(Math.sqrt(area)); w >= 1; w--) {
      if (area % w === 0) return [area / w, w];
    }
    return [area, 1];
  },
  'degree-of-an-array-easy': (nums: number[]) => {
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
  'squares-of-a-sorted-array': (nums: number[]) => nums.map((x) => x * x).sort((a, b) => a - b),
  'repeated-substring-pattern': (s: string) => (s + s).slice(1, -1).includes(s),
  'special-positions-in-a-binary-matrix': (mat: number[][]) => {
    const m = mat.length; const n = mat[0].length;
    const rowSum = mat.map((r) => r.reduce((a, b) => a + b, 0));
    const colSum = Array.from({ length: n }, (_, c) => mat.reduce((s, r) => s + r[c], 0));
    let count = 0;
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (mat[r][c] === 1 && rowSum[r] === 1 && colSum[c] === 1) count++;
    return count;
  },
  'max-consecutive-ones-easy': (nums: number[]) => {
    let best = 0; let cur = 0;
    for (const x of nums) { cur = x === 1 ? cur + 1 : 0; if (cur > best) best = cur; }
    return best;
  },
  'distance-between-bus-stops': (distance: number[], start: number, destination: number) => {
    const total = distance.reduce((a, b) => a + b, 0);
    const [a, b] = start < destination ? [start, destination] : [destination, start];
    let cw = 0;
    for (let i = a; i < b; i++) cw += distance[i];
    return Math.min(cw, total - cw);
  },
  'number-complement': (num: number) => {
    let mask = 1;
    while (mask < num) mask = (mask << 1) | 1;
    return num ^ mask;
  },
  'find-smallest-letter-greater-than-target': (letters: string[], target: string) => {
    for (const ch of letters) if (ch > target) return ch;
    return letters[0];
  },
  'rectangle-overlap': (r1: number[], r2: number[]) =>
    r1[0] < r2[2] && r2[0] < r1[2] && r1[1] < r2[3] && r2[1] < r1[3],
  'transpose-matrix-easy': (matrix: number[][]) =>
    Array.from({ length: matrix[0].length }, (_, c) => matrix.map((r) => r[c])),
  'largest-number-at-least-twice-of-others': (nums: number[]) => {
    let maxIdx = 0;
    for (let i = 1; i < nums.length; i++) if (nums[i] > nums[maxIdx]) maxIdx = i;
    for (let i = 0; i < nums.length; i++) if (i !== maxIdx && nums[maxIdx] < 2 * nums[i]) return -1;
    return maxIdx;
  },
  'valid-mountain-array': (arr: number[]) => {
    const n = arr.length;
    if (n < 3) return false;
    let i = 0;
    while (i + 1 < n && arr[i] < arr[i + 1]) i++;
    if (i === 0 || i === n - 1) return false;
    while (i + 1 < n && arr[i] > arr[i + 1]) i++;
    return i === n - 1;
  },
  'robot-return-to-origin': (moves: string) => {
    let x = 0; let y = 0;
    for (const m of moves) { if (m === 'U') y++; else if (m === 'D') y--; else if (m === 'L') x--; else if (m === 'R') x++; }
    return x === 0 && y === 0;
  },
  'power-of-two': (n: number) => n > 0 && (n & (n - 1)) === 0,
  'palindrome-linked-list-easy': (head: number[]) => {
    for (let l = 0, r = head.length - 1; l < r; l++, r--) if (head[l] !== head[r]) return false;
    return true;
  },
  'find-all-numbers-disappeared-in-an-array': (nums: number[]) => {
    const present = new Set(nums);
    const missing: number[] = [];
    for (let i = 1; i <= nums.length; i++) if (!present.has(i)) missing.push(i);
    return missing;
  },
  'array-partition-i': (nums: number[]) => {
    const sorted = [...nums].sort((a, b) => a - b);
    let sum = 0;
    for (let i = 0; i < sorted.length; i += 2) sum += sorted[i];
    return sum;
  },
  'max-consecutive-ones': (nums: number[]) => {
    let best = 0; let cur = 0;
    for (const x of nums) { cur = x === 1 ? cur + 1 : 0; if (cur > best) best = cur; }
    return best;
  },
  'ugly-number': (n: number) => {
    if (n <= 0) return false;
    for (const p of [2, 3, 5]) while (n % p === 0) n /= p;
    return n === 1;
  },
  'binary-number-with-alternating-bits': (n: number) => {
    const b = n.toString(2);
    for (let i = 1; i < b.length; i++) if (b[i] === b[i - 1]) return false;
    return true;
  },
  'n-th-tribonacci-number': (n: number) => {
    if (n === 0) return 0;
    if (n <= 2) return 1;
    let a = 0; let b = 1; let c = 1;
    for (let i = 3; i <= n; i++) { const d = a + b + c; a = b; b = c; c = d; }
    return c;
  },
  'unique-number-of-occurrences': (arr: number[]) => {
    const freq = new Map<number, number>();
    for (const x of arr) freq.set(x, (freq.get(x) || 0) + 1);
    return new Set(freq.values()).size === freq.size;
  },
  'pascals-triangle-ii': (rowIndex: number) => {
    let row = [1];
    for (let r = 1; r <= rowIndex; r++) {
      const next = Array(r + 1).fill(1);
      for (let c = 1; c < r; c++) next[c] = row[c - 1] + row[c];
      row = next;
    }
    return row;
  },
  'find-numbers-with-even-number-of-digits': (nums: number[]) =>
    nums.filter((n) => String(Math.abs(n)).length % 2 === 0).length,
  'build-array-from-permutation': (nums: number[]) => nums.map((i) => nums[i]),
  'majority-element': (nums: number[]) => {
    let cand = nums[0]; let count = 0;
    for (const x of nums) {
      if (count === 0) cand = x;
      count += x === cand ? 1 : -1;
    }
    return cand;
  },

  // ===== Expanded Medium (+13) =====
  '6a494a1d-cfc2-48a4-82cd-7397c0d7a597': (piles: number[], h: number) => {
    let lo = 1; let hi = Math.max(...piles);
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const hrs = piles.reduce((s, p) => s + Math.ceil(p / mid), 0);
      if (hrs <= h) hi = mid; else lo = mid + 1;
    }
    return lo;
  },
  'remove-nth-node-from-end-of-list': (head: number[], n: number) => {
    const copy = [...head];
    copy.splice(copy.length - n, 1);
    return copy;
  },
  'longest-palindromic-subsequence': (s: string) => {
    const n = s.length;
    const dp = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      dp[i][i] = 1;
      for (let j = i + 1; j < n; j++) {
        dp[i][j] = s[i] === s[j] ? dp[i + 1][j - 1] + 2 : Math.max(dp[i + 1][j], dp[i][j - 1]);
      }
    }
    return dp[0][n - 1];
  },
  'jump-game-ii': (nums: number[]) => {
    let jumps = 0; let end = 0; let farthest = 0;
    for (let i = 0; i < nums.length - 1; i++) {
      farthest = Math.max(farthest, i + nums[i]);
      if (i === end) { jumps++; end = farthest; }
    }
    return jumps;
  },
  'reverse-integer': (x: number) => {
    const sign = x < 0 ? -1 : 1;
    const rev = Number(String(Math.abs(x)).split('').reverse().join('')) * sign;
    return rev < -2147483648 || rev > 2147483647 ? 0 : rev;
  },
  'spiral-matrix': (mat: number[][]) => {
    const res: number[] = [];
    let top = 0; let bottom = mat.length - 1; let left = 0; let right = mat[0].length - 1;
    while (top <= bottom && left <= right) {
      for (let c = left; c <= right; c++) res.push(mat[top][c]);
      top++;
      for (let r = top; r <= bottom; r++) res.push(mat[r][right]);
      right--;
      if (top <= bottom) { for (let c = right; c >= left; c--) res.push(mat[bottom][c]); bottom--; }
      if (left <= right) { for (let r = bottom; r >= top; r--) res.push(mat[r][left]); left++; }
    }
    return res;
  },
  'minimum-path-sum': (grid: number[][]) => {
    const m = grid.length; const n = grid[0].length;
    const dp = grid.map((r) => [...r]);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (i === 0 && j === 0) continue;
        const up = i > 0 ? dp[i - 1][j] : Infinity;
        const left = j > 0 ? dp[i][j - 1] : Infinity;
        dp[i][j] += Math.min(up, left);
      }
    }
    return dp[m - 1][n - 1];
  },
  'container-with-most-water': (height: number[]) => {
    let l = 0; let r = height.length - 1; let best = 0;
    while (l < r) {
      best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
      if (height[l] < height[r]) l++; else r--;
    }
    return best;
  },
  'longest-common-subsequence': (a: string, b: string) => {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[a.length][b.length];
  },
  'coin-change': (coins: number[], amount: number) => {
    const dp = Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let a = 1; a <= amount; a++) {
      for (const c of coins) if (a >= c) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
  },
  'search-in-rotated-sorted-array': (nums: number[], target: number) => nums.indexOf(target),
  'integer-to-roman': (num: number) => {
    const pairs: Array<[number, string]> = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
      [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
    ];
    let out = '';
    for (const [v, sym] of pairs) while (num >= v) { out += sym; num -= v; }
    return out;
  },
  'coin-change-ii': (amount: number, coins: number[]) => {
    const dp = Array(amount + 1).fill(0);
    dp[0] = 1;
    for (const c of coins) for (let a = c; a <= amount; a++) dp[a] += dp[a - c];
    return dp[amount];
  },

  // ===== Expanded Hard (+8) =====
  'interleaving-string': (s1: string, s2: string, s3: string) => {
    if (s1.length + s2.length !== s3.length) return false;
    const dp = Array.from({ length: s1.length + 1 }, () => Array(s2.length + 1).fill(false));
    dp[0][0] = true;
    for (let i = 0; i <= s1.length; i++) {
      for (let j = 0; j <= s2.length; j++) {
        if (i > 0 && dp[i - 1][j] && s1[i - 1] === s3[i + j - 1]) dp[i][j] = true;
        if (j > 0 && dp[i][j - 1] && s2[j - 1] === s3[i + j - 1]) dp[i][j] = true;
      }
    }
    return dp[s1.length][s2.length];
  },
  'minimum-window-substring': (s: string, t: string) => {
    if (!t || t.length > s.length) return '';
    const need = new Map<string, number>();
    for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);
    let required = need.size; let formed = 0;
    const win = new Map<string, number>();
    let bestLen = Infinity; let bestL = 0;
    for (let l = 0, r = 0; r < s.length; r++) {
      const ch = s[r];
      win.set(ch, (win.get(ch) || 0) + 1);
      if (need.has(ch) && win.get(ch) === need.get(ch)) formed++;
      while (l <= r && formed === required) {
        if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
        const leftCh = s[l++];
        win.set(leftCh, win.get(leftCh)! - 1);
        if (need.has(leftCh) && win.get(leftCh)! < need.get(leftCh)!) formed--;
      }
    }
    return bestLen === Infinity ? '' : s.slice(bestL, bestL + bestLen);
  },
  'maximum-gap': (nums: number[]) => {
    if (nums.length < 2) return 0;
    const s = [...nums].sort((a, b) => a - b);
    let gap = 0;
    for (let i = 1; i < s.length; i++) gap = Math.max(gap, s[i] - s[i - 1]);
    return gap;
  },
  'n-queens-ii': (n: number) => {
    let total = 0;
    const cols = new Set<number>(); const d1 = new Set<number>(); const d2 = new Set<number>();
    const dfs = (r: number) => {
      if (r === n) { total++; return; }
      for (let c = 0; c < n; c++) {
        if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
        cols.add(c); d1.add(r - c); d2.add(r + c);
        dfs(r + 1);
        cols.delete(c); d1.delete(r - c); d2.delete(r + c);
      }
    };
    dfs(0);
    return total;
  },
  'distinct-subsequences': (s: string, t: string) => {
    const dp = Array(t.length + 1).fill(0);
    dp[0] = 1;
    for (const ch of s) {
      for (let j = t.length; j >= 1; j--) if (ch === t[j - 1]) dp[j] += dp[j - 1];
    }
    return dp[t.length];
  },
  'candy': (ratings: number[]) => {
    const n = ratings.length;
    const c = Array(n).fill(1);
    for (let i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
    for (let i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
    return c.reduce((a, b) => a + b, 0);
  },
  'edit-distance': (w1: string, w2: string) => {
    const dp = Array.from({ length: w1.length + 1 }, (_, i) =>
      Array.from({ length: w2.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= w1.length; i++) {
      for (let j = 1; j <= w2.length; j++) {
        dp[i][j] = w1[i - 1] === w2[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[w1.length][w2.length];
  },
  'merge-k-sorted-lists': (lists: number[][]) => lists.flat().sort((a, b) => a - b),
};

test('every curated hidden test problem passes independent oracle validation on both visible and hidden cases with zero duplicates', () => {
  const catalog = loadProblemCatalog();
  const byId = new Map(catalog.map((p) => [p.id, p]));

  const curatedIds = Object.keys(CURATED_HIDDEN_TESTS);
  assert.equal(curatedIds.length, 83, 'Expected 83 curated hidden-test problems');

  let totalHiddenVerified = 0;

  for (const problemId of curatedIds) {
    const problem = byId.get(problemId);
    assert.ok(problem, `Curated problem ${problemId} must exist in catalog`);
    const oracle = REFERENCE_ORACLES[problemId];
    assert.ok(oracle, `Missing reference oracle for ${problemId}`);

    // 1. Validate oracle agrees with EVERY visible test case in the catalog
    const seenInputs = new Set<string>();
    for (const vc of problem.testCases) {
      const cloned = JSON.parse(JSON.stringify(vc.input));
      assert.deepEqual(
        oracle(...cloned),
        vc.expected,
        `Oracle disagreed with catalog visible test on ${problemId}: ${JSON.stringify(vc.input)}`
      );
      seenInputs.add(JSON.stringify(vc.input));
    }

    // 2. Validate every curated hidden test case: arity, uniqueness, and exact oracle expected value
    const hiddenCases = CURATED_HIDDEN_TESTS[problemId];
    assert.ok(hiddenCases.length >= 3, `${problemId} should have at least 3 hidden edge cases`);
    for (const hc of hiddenCases) {
      assert.equal(
        hc.input.length,
        problem.signature.params.length,
        `Hidden test arity mismatch on ${problemId}`
      );
      const inputKey = JSON.stringify(hc.input);
      assert.equal(
        seenInputs.has(inputKey),
        false,
        `Duplicate input detected in hidden tests for ${problemId}: ${inputKey}`
      );
      seenInputs.add(inputKey);

      const cloned = JSON.parse(JSON.stringify(hc.input));
      assert.deepEqual(
        oracle(...cloned),
        hc.expected,
        `Hidden test oracle mismatch on ${problemId}: ${inputKey}`
      );
      totalHiddenVerified++;
    }
  }

  assert.ok(totalHiddenVerified >= 340, `Expected >= 340 oracle-verified hidden tests, got ${totalHiddenVerified}`);
});

test('hidden test seeding is idempotent in SQLite and coverage report matches persisted database counts', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);

  const catalog = loadProblemCatalog();
  seedProblemCatalog(db, catalog);

  const first = seedHiddenTests(db);
  assert.equal(first.problemsMatched, 83);
  assert.equal(first.problemsSkipped, 0);
  assert.ok(first.inserted >= 340);

  const second = seedHiddenTests(db);
  assert.equal(second.inserted, 0);
  assert.equal(second.alreadyPresent, first.inserted);

  const staticReport = computeHiddenTestCoverage(catalog);
  const dbReport = computeHiddenTestCoverage(catalog, db);
  assert.deepEqual(dbReport, staticReport);
  assert.equal(dbReport.totalProblems, 472);
  assert.equal(dbReport.problemsWithHiddenTests, 83);
  assert.equal(dbReport.problemsWithoutHiddenTests, 389);
  assert.equal(dbReport.totalHiddenTests, first.inserted);
  assert.equal(dbReport.byDifficulty.Easy.covered + dbReport.byDifficulty.Medium.covered + dbReport.byDifficulty.Hard.covered, 83);

  db.close();
});
