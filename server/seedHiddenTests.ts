import type { DatabaseSync } from 'node:sqlite';
import type { ProblemTestCase } from './submissionRunner';

export const CURATED_HIDDEN_TESTS: Readonly<Record<string, readonly ProblemTestCase[]>> = {
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
};

export interface SeedHiddenTestsSummary {
  problemsMatched: number;
  problemsSkipped: number;
  inserted: number;
  alreadyPresent: number;
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
