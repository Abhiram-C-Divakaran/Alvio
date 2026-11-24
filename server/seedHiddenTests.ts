import type { DatabaseSync } from 'node:sqlite';
import type { ProblemTestCase } from './submissionRunner';

export const CURATED_HIDDEN_TESTS: Readonly<Record<string, readonly ProblemTestCase[]>> = {
  // ===== Original 18 Core Problems =====
  'number-of-digit-one': [
    { input: [1], expected: 1 },
    { input: [10], expected: 2 },
    { input: [99], expected: 20 },
    { input: [111], expected: 36 },
    { input: [824883294], expected: 767944060 },
  ],
  'rotate-list': [
    { input: [[], 5], expected: [] },
    { input: [[42], 99], expected: [42] },
    { input: [[1, 2, 3, 4], 4], expected: [1, 2, 3, 4] },
    { input: [[1, 2, 3, 4, 5, 6], 1000000001], expected: [2, 3, 4, 5, 6, 1] },
  ],
  'unique-paths-ii': [
    { input: [[[1]]], expected: 0 },
    { input: [[[0]]], expected: 1 },
    { input: [[[0, 0], [0, 1]]], expected: 0 },
    { input: [[[0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 0]]], expected: 4 },
  ],
  'house-robber': [
    { input: [[5]], expected: 5 },
    { input: [[2, 1, 1, 2]], expected: 4 },
    { input: [[0, 0, 0, 0]], expected: 0 },
    { input: [[10, 1, 1, 10, 1, 1, 10]], expected: 30 },
  ],
  'maximum-subarray': [
    { input: [[-5, -2, -8, -1, -4]], expected: -1 },
    { input: [[5, 4, -1, 7, 8]], expected: 23 },
    { input: [[-2, -1]], expected: -1 },
    { input: [[3, -2, 5, -1]], expected: 6 },
  ],
  'perfect-number': [
    { input: [1], expected: false },
    { input: [6], expected: true },
    { input: [496], expected: true },
    { input: [8128], expected: true },
    { input: [33550336], expected: true },
    { input: [12], expected: false },
  ],
  'merge-intervals': [
    { input: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
    { input: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
    { input: [[[5, 7], [1, 2], [3, 4], [2, 3]]], expected: [[1, 4], [5, 7]] },
    { input: [[[1, 10], [2, 3], [4, 5], [6, 7], [8, 9]]], expected: [[1, 10]] },
  ],
  'pascals-triangle': [
    { input: [1], expected: [[1]] },
    { input: [2], expected: [[1], [1, 1]] },
    { input: [6], expected: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1]] },
  ],
  'flood-fill': [
    { input: [[[0, 0, 0], [0, 0, 0]], 0, 0, 0], expected: [[0, 0, 0], [0, 0, 0]] },
    { input: [[[0, 0, 0], [0, 1, 1]], 1, 1, 1], expected: [[0, 0, 0], [0, 1, 1]] },
    { input: [[[1, 0, 1], [0, 1, 0], [1, 0, 1]], 1, 1, 9], expected: [[1, 0, 1], [0, 9, 0], [1, 0, 1]] },
  ],
  'power-of-four': [
    { input: [0], expected: false },
    { input: [-16], expected: false },
    { input: [8], expected: false },
    { input: [64], expected: true },
    { input: [1073741824], expected: true },
  ],
  'word-break': [
    { input: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], expected: false },
    { input: ['aaaaaaa', ['aaaa', 'aaa']], expected: true },
    { input: ['goalspecial', ['go', 'goal', 'goals', 'special']], expected: true },
    { input: ['abcd', ['a', 'abc', 'b', 'cd']], expected: true },
  ],
  'count-and-say': [
    { input: [2], expected: '11' },
    { input: [5], expected: '111221' },
    { input: [6], expected: '312211' },
    { input: [8], expected: '1113213211' },
  ],
  'valid-anagram': [
    { input: ['aacc', 'ccac'], expected: false },
    { input: ['ab', 'a'], expected: false },
    { input: ['listen', 'silent'], expected: true },
    { input: ['', ''], expected: true },
  ],
  'best-time-to-buy-and-sell-stock': [
    { input: [[7, 6, 4, 3, 1]], expected: 0 },
    { input: [[1]], expected: 0 },
    { input: [[2, 4, 1, 7]], expected: 6 },
    { input: [[3, 2, 6, 5, 0, 3]], expected: 4 },
  ],
  'valid-parentheses': [
    { input: ['([)]'], expected: false },
    { input: ['{[]}'], expected: true },
    { input: [']'], expected: false },
    { input: ['((('], expected: false },
    { input: ['()[]{}({})'], expected: true },
  ],
  'climbing-stairs': [
    { input: [1], expected: 1 },
    { input: [4], expected: 5 },
    { input: [5], expected: 8 },
    { input: [10], expected: 89 },
    { input: [20], expected: 10946 },
  ],
  'contains-duplicate': [
    { input: [[1, 2, 3, 4]], expected: false },
    { input: [[1]], expected: false },
    { input: [[0, -1, 2, -1]], expected: true },
    { input: [[1000000000, -1000000000, 1000000000]], expected: true },
  ],
  'reverse-string': [
    { input: [['a']], expected: ['a'] },
    { input: [['A', 'l', 'v', 'i', 'o']], expected: ['o', 'i', 'v', 'l', 'A'] },
    { input: [['1', '2', '3', '4']], expected: ['4', '3', '2', '1'] },
  ],

  // ===== Phase 4 Expanded Easy Problems (+44 Easy) =====
  'cells-with-odd-values-in-a-matrix': [
    { input: [2, 2, [[1, 1], [0, 0]]], expected: 0 },
    { input: [1, 1, [[0, 0]]], expected: 0 },
    { input: [3, 3, [[0, 0], [0, 1], [2, 2]]], expected: 6 },
    { input: [4, 2, [[0, 0], [1, 0], [2, 0]]], expected: 4 },
  ],
  'maximum-population-year': [
    { input: [[[1950, 1961], [1960, 1971], [1970, 1981]]], expected: 1960 },
    { input: [[[1982, 1998], [2013, 2042], [2010, 2035], [2022, 2050], [2047, 2048]]], expected: 2022 },
    { input: [[[2000, 2001], [2001, 2002], [2002, 2003]]], expected: 2000 },
    { input: [[[1950, 2050], [1960, 2040], [1970, 2030]]], expected: 1970 },
  ],
  'arrange-coins': [
    { input: [0], expected: 0 },
    { input: [1], expected: 1 },
    { input: [3], expected: 2 },
    { input: [6], expected: 3 },
    { input: [1804289383], expected: 60070 },
  ],
  'reverse-string-ii': [
    { input: ['abcd', 2], expected: 'bacd' },
    { input: ['a', 2], expected: 'a' },
    { input: ['abcdefgh', 3], expected: 'cbadefhg' },
    { input: ['abcdef', 10], expected: 'fedcba' },
  ],
  'remove-element': [
    { input: [[0, 1, 2, 2, 3, 0, 4, 2], 2], expected: 5 },
    { input: [[], 0], expected: 0 },
    { input: [[7, 7, 7], 7], expected: 0 },
    { input: [[1, 2, 3, 4], 9], expected: 4 },
  ],
  '1-bit-and-2-bit-characters': [
    { input: [[1, 1, 1, 0]], expected: false },
    { input: [[0]], expected: true },
    { input: [[1, 0]], expected: false },
    { input: [[1, 1, 0]], expected: true },
    { input: [[0, 1, 1, 1, 0]], expected: false },
  ],
  'teemo-attacking': [
    { input: [[1, 2], 2], expected: 3 },
    { input: [[1, 2, 3, 4, 5], 5], expected: 9 },
    { input: [[1, 4], 0], expected: 0 },
    { input: [[5], 10], expected: 10 },
  ],
  'contains-duplicate-ii': [
    { input: [[1, 0, 1, 1], 1], expected: true },
    { input: [[1, 2, 3, 1, 2, 3], 2], expected: false },
    { input: [[1, 2, 1], 0], expected: false },
    { input: [[99, 99], 2], expected: true },
  ],
  'distribute-candies': [
    { input: [[1, 1, 2, 3]], expected: 2 },
    { input: [[6, 6, 6, 6]], expected: 1 },
    { input: [[1, 2, 3, 4, 5, 6]], expected: 3 },
    { input: [[-1, -1, 0, 1]], expected: 2 },
  ],
  'find-pivot-index-easy': [
    { input: [[1, 2, 3]], expected: -1 },
    { input: [[2, 1, -1]], expected: 0 },
    { input: [[-1, -1, 0, 1, 1, 0]], expected: 5 },
    { input: [[0]], expected: 0 },
  ],
  'valid-perfect-square': [
    { input: [1], expected: true },
    { input: [2], expected: false },
    { input: [808201], expected: true },
    { input: [2147483647], expected: false },
  ],
  'add-binary': [
    { input: ['0', '0'], expected: '0' },
    { input: ['1111', '1111'], expected: '11110' },
    { input: ['1', '111'], expected: '1000' },
    { input: ['100001', '11111'], expected: '1000000' },
  ],
  'middle-of-the-linked-list': [
    { input: [[1, 2, 3, 4, 5, 6]], expected: [4, 5, 6] },
    { input: [[7]], expected: [7] },
    { input: [[1, 2]], expected: [2] },
    { input: [[10, 20, 30]], expected: [20, 30] },
  ],
  'is-subsequence-easy': [
    { input: ['axc', 'ahbgdc'], expected: false },
    { input: ['', 'ahbgdc'], expected: true },
    { input: ['a', ''], expected: false },
    { input: ['aaaaaa', 'bbaaaa'], expected: false },
  ],
  'length-of-last-word': [
    { input: ['luffy is still joyboy'], expected: 6 },
    { input: ['a'], expected: 1 },
    { input: ['   single   '], expected: 6 },
    { input: ['x y z'], expected: 1 },
  ],
  'add-strings': [
    { input: ['0', '0'], expected: '0' },
    { input: ['999', '1'], expected: '1000' },
    { input: ['999999999999999999', '1'], expected: '1000000000000000000' },
    { input: ['123456789', '987654321'], expected: '1111111110' },
  ],
  'third-maximum-number': [
    { input: [[1, 2]], expected: 2 },
    { input: [[2, 2, 3, 1]], expected: 1 },
    { input: [[1, 1, 2]], expected: 2 },
    { input: [[-2147483648, 1, 2]], expected: -2147483648 },
  ],
  'construct-the-rectangle': [
    { input: [37], expected: [37, 1] },
    { input: [122122], expected: [427, 286] },
    { input: [1], expected: [1, 1] },
    { input: [12], expected: [4, 3] },
  ],
  'degree-of-an-array-easy': [
    { input: [[1, 2, 2, 3, 1, 4, 2]], expected: 6 },
    { input: [[5]], expected: 1 },
    { input: [[1, 2, 3, 4]], expected: 1 },
    { input: [[2, 1, 1, 2, 1, 3, 3, 3, 1, 3, 1, 3, 2]], expected: 7 },
  ],
  'squares-of-a-sorted-array': [
    { input: [[-7, -3, 2, 3, 11]], expected: [4, 9, 9, 49, 121] },
    { input: [[-5, -3, -2, -1]], expected: [1, 4, 9, 25] },
    { input: [[0]], expected: [0] },
    { input: [[1, 2, 3]], expected: [1, 4, 9] },
  ],
  'repeated-substring-pattern': [
    { input: ['abcabcabcabc'], expected: true },
    { input: ['a'], expected: false },
    { input: ['abac'], expected: false },
    { input: ['abaababaab'], expected: true },
  ],
  'special-positions-in-a-binary-matrix': [
    { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: 3 },
    { input: [[[0, 0, 0, 1], [1, 0, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]]], expected: 2 },
    { input: [[[0, 0], [0, 0]]], expected: 0 },
    { input: [[[1]]], expected: 1 },
  ],
  'max-consecutive-ones-easy': [
    { input: [[1, 0, 1, 1, 0, 1]], expected: 2 },
    { input: [[0, 0, 0]], expected: 0 },
    { input: [[1, 1, 1, 1]], expected: 4 },
    { input: [[0, 1]], expected: 1 },
  ],
  'distance-between-bus-stops': [
    { input: [[1, 2, 3, 4], 0, 2], expected: 3 },
    { input: [[1, 2, 3, 4], 0, 3], expected: 4 },
    { input: [[7, 10, 1, 12, 11, 14, 5, 0], 7, 2], expected: 17 },
    { input: [[3, 6, 7, 2, 9, 10, 7, 16, 11], 6, 2], expected: 28 },
  ],
  'number-complement': [
    { input: [2], expected: 1 },
    { input: [7], expected: 0 },
    { input: [10], expected: 5 },
    { input: [2147483647], expected: 0 },
  ],
  'find-smallest-letter-greater-than-target': [
    { input: [['c', 'f', 'j'], 'c'], expected: 'f' },
    { input: [['c', 'f', 'j'], 'j'], expected: 'c' },
    { input: [['x', 'x', 'y', 'y'], 'z'], expected: 'x' },
    { input: [['e', 'e', 'e', 'k', 'q', 'q', 'q'], 'e'], expected: 'k' },
  ],
  'rectangle-overlap': [
    { input: [[0, 0, 1, 1], [1, 0, 2, 1]], expected: false },
    { input: [[0, 0, 1, 1], [2, 2, 3, 3]], expected: false },
    { input: [[7, 8, 13, 15], [10, 8, 12, 20]], expected: true },
    { input: [[-10, -10, 0, 0], [-5, -5, 5, 5]], expected: true },
  ],
  'transpose-matrix-easy': [
    { input: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 4], [2, 5], [3, 6]] },
    { input: [[[42]]], expected: [[42]] },
    { input: [[[1], [2], [3]]], expected: [[1, 2, 3]] },
    { input: [[[1, 2], [3, 4], [5, 6]]], expected: [[1, 3, 5], [2, 4, 6]] },
  ],
  'largest-number-at-least-twice-of-others': [
    { input: [[1, 2, 3, 4]], expected: -1 },
    { input: [[1]], expected: 0 },
    { input: [[0, 0, 0, 1]], expected: 3 },
    { input: [[0, 0, 3, 2]], expected: -1 },
  ],
  'valid-mountain-array': [
    { input: [[3, 5, 5]], expected: false },
    { input: [[0, 3, 2, 1]], expected: true },
    { input: [[0, 1, 2, 3, 4]], expected: false },
    { input: [[9, 8, 7, 6, 5]], expected: false },
    { input: [[1, 3, 2]], expected: true },
  ],
  'robot-return-to-origin': [
    { input: ['UDLR'], expected: true },
    { input: ['RRDD'], expected: false },
    { input: ['LDRRLRUULR'], expected: false },
    { input: ['UUDDLLRR'], expected: true },
  ],
  'power-of-two': [
    { input: [0], expected: false },
    { input: [-16], expected: false },
    { input: [1024], expected: true },
    { input: [1073741824], expected: true },
    { input: [2147483647], expected: false },
  ],
  'palindrome-linked-list-easy': [
    { input: [[1, 2]], expected: false },
    { input: [[1]], expected: true },
    { input: [[1, 2, 3, 2, 1]], expected: true },
    { input: [[1, 0, 1, 0]], expected: false },
  ],
  'find-all-numbers-disappeared-in-an-array': [
    { input: [[1, 1]], expected: [2] },
    { input: [[1, 2, 3, 4]], expected: [] },
    { input: [[2, 2, 2, 2]], expected: [1, 3, 4] },
    { input: [[5, 4, 6, 7, 9, 3, 10, 9, 5, 6]], expected: [1, 2, 8] },
  ],
  'array-partition-i': [
    { input: [[6, 2, 6, 5, 1, 2]], expected: 9 },
    { input: [[-10, -20, 5, 10]], expected: -15 },
    { input: [[1, 1]], expected: 1 },
    { input: [[7, 3, 1, 0, 0, 6]], expected: 7 },
  ],
  'max-consecutive-ones': [
    { input: [[1, 0, 1, 1, 0, 1]], expected: 2 },
    { input: [[0]], expected: 0 },
    { input: [[1, 1, 1, 1, 1]], expected: 5 },
    { input: [[0, 1, 1, 0, 1, 1, 1, 0]], expected: 3 },
  ],
  'ugly-number': [
    { input: [0], expected: false },
    { input: [-6], expected: false },
    { input: [8], expected: true },
    { input: [30], expected: true },
    { input: [21], expected: false },
  ],
  'binary-number-with-alternating-bits': [
    { input: [11], expected: false },
    { input: [10], expected: true },
    { input: [1], expected: true },
    { input: [42], expected: true },
    { input: [1431655765], expected: true },
  ],
  'n-th-tribonacci-number': [
    { input: [0], expected: 0 },
    { input: [1], expected: 1 },
    { input: [2], expected: 1 },
    { input: [25], expected: 1389537 },
    { input: [37], expected: 2082876103 },
  ],
  'unique-number-of-occurrences': [
    { input: [[1, 2]], expected: false },
    { input: [[-3, 0, 1, -3, 1, 1, 1, -3, 10, 0]], expected: true },
    { input: [[42]], expected: true },
    { input: [[1, 1, 2, 2]], expected: false },
  ],
  'pascals-triangle-ii': [
    { input: [0], expected: [1] },
    { input: [1], expected: [1, 1] },
    { input: [4], expected: [1, 4, 6, 4, 1] },
    { input: [6], expected: [1, 6, 15, 20, 15, 6, 1] },
  ],
  'find-numbers-with-even-number-of-digits': [
    { input: [[555, 901, 482, 1771]], expected: 1 },
    { input: [[1, 2, 3]], expected: 0 },
    { input: [[10, 1000, 100000]], expected: 3 },
    { input: [[99, 100, 999, 1000]], expected: 2 },
  ],
  'build-array-from-permutation': [
    { input: [[5, 0, 1, 2, 3, 4]], expected: [4, 5, 0, 1, 2, 3] },
    { input: [[0]], expected: [0] },
    { input: [[1, 0]], expected: [0, 1] },
    { input: [[2, 0, 1]], expected: [1, 2, 0] },
  ],
  'majority-element': [
    { input: [[1]], expected: 1 },
    { input: [[-1, -1, 2147483647]], expected: -1 },
    { input: [[6, 5, 5]], expected: 5 },
    { input: [[1, 2, 3, 2, 2, 2, 5, 4, 2]], expected: 2 },
  ],

  // ===== Phase 4 Expanded Medium Interview Classics (+13 Medium) =====
  '6a494a1d-cfc2-48a4-82cd-7397c0d7a597': [
    { input: [[30, 11, 23, 4, 20], 5], expected: 30 },
    { input: [[30, 11, 23, 4, 20], 6], expected: 23 },
    { input: [[1000000000], 2], expected: 500000000 },
    { input: [[1, 1, 1, 1], 4], expected: 1 },
  ],
  'remove-nth-node-from-end-of-list': [
    { input: [[1, 2], 1], expected: [1] },
    { input: [[1, 2], 2], expected: [2] },
    { input: [[10, 20, 30, 40], 4], expected: [20, 30, 40] },
    { input: [[10, 20, 30, 40], 1], expected: [10, 20, 30] },
  ],
  'longest-palindromic-subsequence': [
    { input: ['a'], expected: 1 },
    { input: ['abcdef'], expected: 1 },
    { input: ['agbdba'], expected: 5 },
    { input: ['character'], expected: 5 },
  ],
  'jump-game-ii': [
    { input: [[0]], expected: 0 },
    { input: [[1, 1, 1, 1]], expected: 3 },
    { input: [[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 0]], expected: 2 },
    { input: [[1, 2, 1, 1, 1]], expected: 3 },
  ],
  'reverse-integer': [
    { input: [120], expected: 21 },
    { input: [0], expected: 0 },
    { input: [1534236469], expected: 0 },
    { input: [-2147483648], expected: 0 },
    { input: [-1463847412], expected: -2147483641 },
  ],
  'spiral-matrix': [
    { input: [[[7]]], expected: [7] },
    { input: [[[1, 2, 3, 4]]], expected: [1, 2, 3, 4] },
    { input: [[[1], [2], [3], [4]]], expected: [1, 2, 3, 4] },
    { input: [[[1, 2], [3, 4], [5, 6]]], expected: [1, 2, 4, 6, 5, 3] },
  ],
  'minimum-path-sum': [
    { input: [[[5]]], expected: 5 },
    { input: [[[1, 2, 5], [3, 2, 1]]], expected: 6 },
    { input: [[[0, 0], [0, 0]]], expected: 0 },
    { input: [[[9, 1, 4, 8]]], expected: 22 },
  ],
  'container-with-most-water': [
    { input: [[4, 3, 2, 1, 4]], expected: 16 },
    { input: [[1, 2, 1]], expected: 2 },
    { input: [[0, 0, 0]], expected: 0 },
    { input: [[2, 3, 10, 5, 7, 8, 9]], expected: 36 },
  ],
  'longest-common-subsequence': [
    { input: ['abc', 'def'], expected: 0 },
    { input: ['bl', 'yby'], expected: 1 },
    { input: ['ezupkr', 'ubmrapg'], expected: 2 },
    { input: ['oxcpqrsvwf', 'shmtulqrypy'], expected: 2 },
  ],
  'coin-change': [
    { input: [[1], 0], expected: 0 },
    { input: [[186, 419, 83, 408], 6249], expected: 20 },
    { input: [[1, 3, 4], 6], expected: 2 },
    { input: [[5, 10], 3], expected: -1 },
  ],
  'search-in-rotated-sorted-array': [
    { input: [[1], 0], expected: -1 },
    { input: [[1], 1], expected: 0 },
    { input: [[3, 1], 1], expected: 1 },
    { input: [[5, 1, 3], 5], expected: 0 },
    { input: [[6, 7, 8, 1, 2, 3, 4, 5], 8], expected: 2 },
  ],
  'integer-to-roman': [
    { input: [1], expected: 'I' },
    { input: [4], expected: 'IV' },
    { input: [9], expected: 'IX' },
    { input: [3999], expected: 'MMMCMXCIX' },
    { input: [444], expected: 'CDXLIV' },
  ],
  'coin-change-ii': [
    { input: [0, [7]], expected: 1 },
    { input: [10, [10]], expected: 1 },
    { input: [5, [1, 2, 3]], expected: 5 },
    { input: [100, [1, 5, 10, 25]], expected: 242 },
  ],

  // ===== Phase 4 Expanded Hard Interview Classics (+8 Hard) =====
  'interleaving-string': [
    { input: ['', '', ''], expected: true },
    { input: ['a', '', 'c'], expected: false },
    { input: ['abc', 'def', 'adbcef'], expected: true },
    { input: ['aab', 'axy', 'aaxaby'], expected: true },
  ],
  'minimum-window-substring': [
    { input: ['ab', 'b'], expected: 'b' },
    { input: ['aa', 'aa'], expected: 'aa' },
    { input: ['cabwefgewcwaefgcf', 'cae'], expected: 'cwae' },
    { input: ['xyz', 'abc'], expected: '' },
  ],
  'maximum-gap': [
    { input: [[1, 1, 1, 1]], expected: 0 },
    { input: [[1, 10000000]], expected: 9999999 },
    { input: [[100, 3, 2, 1]], expected: 97 },
    { input: [[15252, 16764, 27963, 7817, 26155, 20757, 3478, 22602, 20404, 6739]], expected: 7435 },
  ],
  'n-queens-ii': [
    { input: [2], expected: 0 },
    { input: [3], expected: 0 },
    { input: [5], expected: 10 },
    { input: [8], expected: 92 },
    { input: [9], expected: 352 },
  ],
  'distinct-subsequences': [
    { input: ['aaa', 'aa'], expected: 3 },
    { input: ['abc', 'abcd'], expected: 0 },
    { input: ['aabb', 'ab'], expected: 4 },
    { input: ['ddd', 'dd'], expected: 3 },
  ],
  'candy': [
    { input: [[1]], expected: 1 },
    { input: [[1, 3, 2, 2, 1]], expected: 7 },
    { input: [[1, 2, 87, 87, 87, 2, 1]], expected: 13 },
    { input: [[5, 4, 3, 2, 1]], expected: 15 },
  ],
  'edit-distance': [
    { input: ['', ''], expected: 0 },
    { input: ['', 'abc'], expected: 3 },
    { input: ['abc', 'abc'], expected: 0 },
    { input: ['kitten', 'sitting'], expected: 3 },
  ],
  'merge-k-sorted-lists': [
    { input: [[[], []]], expected: [] },
    { input: [[[1], [0]]], expected: [0, 1] },
    { input: [[[-10, -5, 0], [-7, 2, 9], [-10, 10]]], expected: [-10, -10, -7, -5, 0, 2, 9, 10] },
    { input: [[[5, 10], [], [1, 2, 3]]], expected: [1, 2, 3, 5, 10] },
  ],
};

export interface SeedHiddenTestsSummary {
  problemsMatched: number;
  problemsSkipped: number;
  inserted: number;
  alreadyPresent: number;
}

export interface DifficultyCoverageBucket {
  total: number;
  covered: number;
  uncovered: number;
  hiddenTests: number;
  coveragePercent: number;
}

export interface HiddenTestCoverageReport {
  totalProblems: number;
  problemsWithHiddenTests: number;
  problemsWithoutHiddenTests: number;
  totalHiddenTests: number;
  coveragePercent: number;
  byDifficulty: Record<'Easy' | 'Medium' | 'Hard', DifficultyCoverageBucket>;
}

/**
 * Computes exact hidden-test coverage statistics against the loaded problem catalog.
 * When `db` is supplied, counts rows directly from `problem_hidden_tests`; otherwise uses `CURATED_HIDDEN_TESTS`.
 */
export function computeHiddenTestCoverage(
  catalog: Array<{ id: string; difficulty: string }>,
  db?: DatabaseSync
): HiddenTestCoverageReport {
  const countsByProblem = new Map<string, number>();

  if (db) {
    const rows = db
      .prepare('SELECT problem_id, COUNT(*) AS cnt FROM problem_hidden_tests GROUP BY problem_id')
      .all() as Array<{ problem_id: string; cnt: number }>;
    for (const row of rows) {
      countsByProblem.set(row.problem_id, Number(row.cnt) || 0);
    }
  } else {
    for (const [problemId, cases] of Object.entries(CURATED_HIDDEN_TESTS)) {
      countsByProblem.set(problemId, cases.length);
    }
  }

  const byDifficulty: Record<'Easy' | 'Medium' | 'Hard', DifficultyCoverageBucket> = {
    Easy: { total: 0, covered: 0, uncovered: 0, hiddenTests: 0, coveragePercent: 0 },
    Medium: { total: 0, covered: 0, uncovered: 0, hiddenTests: 0, coveragePercent: 0 },
    Hard: { total: 0, covered: 0, uncovered: 0, hiddenTests: 0, coveragePercent: 0 },
  };

  let problemsWithHiddenTests = 0;
  let totalHiddenTests = 0;

  for (const problem of catalog) {
    const diff = (problem.difficulty === 'Easy' || problem.difficulty === 'Medium' || problem.difficulty === 'Hard')
      ? problem.difficulty
      : 'Medium';
    const bucket = byDifficulty[diff];
    bucket.total++;
    const cnt = countsByProblem.get(problem.id) || 0;
    if (cnt > 0) {
      problemsWithHiddenTests++;
      totalHiddenTests += cnt;
      bucket.covered++;
      bucket.hiddenTests += cnt;
    } else {
      bucket.uncovered++;
    }
  }

  for (const bucket of Object.values(byDifficulty)) {
    bucket.coveragePercent = bucket.total > 0 ? Number(((bucket.covered / bucket.total) * 100).toFixed(2)) : 0;
  }

  const totalProblems = catalog.length;
  const problemsWithoutHiddenTests = totalProblems - problemsWithHiddenTests;
  const coveragePercent = totalProblems > 0 ? Number(((problemsWithHiddenTests / totalProblems) * 100).toFixed(2)) : 0;

  return {
    totalProblems,
    problemsWithHiddenTests,
    problemsWithoutHiddenTests,
    totalHiddenTests,
    coveragePercent,
    byDifficulty,
  };
}

/**
 * Idempotently populates `problem_hidden_tests` for curated catalog problems.
 * Never returns hidden cases to client routes and never duplicates existing rows.
 */
export function seedHiddenTests(db: DatabaseSync): SeedHiddenTestsSummary {
  let problemsMatched = 0;
  let problemsSkipped = 0;
  let inserted = 0;
  let alreadyPresent = 0;

  const findProblem = db.prepare('SELECT id FROM problems WHERE id = ?');
  const findExisting = db.prepare(
    'SELECT id FROM problem_hidden_tests WHERE problem_id = ? AND input_json = ? AND expected_json = ? LIMIT 1'
  );
  const insertHidden = db.prepare(
    'INSERT INTO problem_hidden_tests (problem_id, input_json, expected_json) VALUES (?, ?, ?)'
  );

  db.exec('BEGIN IMMEDIATE');
  try {
    for (const [problemId, cases] of Object.entries(CURATED_HIDDEN_TESTS)) {
      if (!findProblem.get(problemId)) {
        problemsSkipped++;
        continue;
      }
      problemsMatched++;
      for (const tc of cases) {
        const inputJson = JSON.stringify(tc.input);
        const expectedJson = JSON.stringify(tc.expected);
        if (findExisting.get(problemId, inputJson, expectedJson)) {
          alreadyPresent++;
          continue;
        }
        insertHidden.run(problemId, inputJson, expectedJson);
        inserted++;
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return { problemsMatched, problemsSkipped, inserted, alreadyPresent };
}

const isMainModule =
  typeof process.argv[1] === 'string' &&
  (process.argv[1].endsWith('server/seedHiddenTests.ts') || process.argv[1].endsWith('server\\seedHiddenTests.ts'));

if (isMainModule) {
  import('dotenv/config')
    .then(() => import('./db'))
    .then(({ default: db }) => {
      const summary = seedHiddenTests(db);
      console.log(
        `Seeded hidden tests: ${summary.inserted} inserted, ${summary.alreadyPresent} already present across ${summary.problemsMatched} problems (${summary.problemsSkipped} skipped).`
      );
      db.close();
    })
    .catch((err) => {
      console.error('Failed to seed hidden tests:', err);
      process.exit(1);
    });
}
