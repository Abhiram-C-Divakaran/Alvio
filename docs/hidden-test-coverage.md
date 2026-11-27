# Alvio — Hidden-Test Coverage & Oracle Verification Audit (Phase 7)

This document records the complete hidden-test expansion audit across all **472** coding problems in `server/problemCatalog.ts` (`server/additionalProblems.json`).

## 1. Initial vs. Final Coverage Summary

| Metric | Before Phase 7 (Phases 1–6) | After Phase 7 | Delta |
| --- | ---: | ---: | ---: |
| Catalog Problems | 472 | 472 | — |
| Covered Problems (Oracle-Verified) | 83 (17.58%) | **384 (81.36%)** | **+301 (+63.78 pp)** |
| Verifiable Catalog Problems Covered | 83 / 384 (21.61%) | **384 / 384 (100.00%)** | **+301 (+78.39 pp)** |
| Audited Manual-Review Queue | Unaudited (389 raw) | **88 (18.64%)** | 100% audited with reason codes |
| Unflagged Uncovered Problems | 389 | **0** | **-389** |
| Total Server-Only Hidden Test Cases | 346 | **1,636** | **+1,290 (+372.8%)** |
| Problems with Low Diversity (`< 3` cases) | 0 | **0** | 0 |
| Cases per Covered Problem (Min / Avg / Max) | 3 / 4.17 / 6 | **3 / 4.26 / 6** | Bounded for fast judge execution |

> **Correctness-First Policy:** Every single problem in `CURATED_HIDDEN_TESTS` (`384/384`) has an independent reference oracle in `tests/hidden-tests-coverage.test.ts` + `tests/oracles/{easy,medium,hard}.ts` that agrees 100% with both all catalog visible tests (**549 visible cases**) and all curated hidden cases (**1,636 hidden cases**). The remaining **88** catalog problems are explicitly excluded and documented in `server/hiddenTests/manualReview.ts` rather than fabricating outputs or shipping flaky tests.

---

## 2. Coverage by Difficulty

| Difficulty | Total Problems | Before Phase 7 | After Phase 7 | Coverage % | Hidden Test Cases | Manual Review |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Easy** | 185 | 54 (29.19%) | **177** | **95.68%** | **769** | 8 |
| **Medium** | 212 | 20 (9.43%) | **155** | **73.11%** | **645** | 57 |
| **Hard** | 75 | 9 (12.00%) | **52** | **69.33%** | **222** | 23 |
| **Total** | **472** | **83 (17.58%)** | **384** | **81.36%** | **1,636** | **88** |

---

## 3. Coverage by Topic (Top 20 Topics of 60 Tracked)

Run `npm run db:hidden-coverage` (JSON) or `npm run db:hidden-coverage -- --text` (readable terminal report) or `npm run db:hidden-coverage -- --inventory` (full 472-problem audit inventory) to inspect all 60 topics dynamically.

| Topic | Covered / Total | Coverage % | Hidden Cases | Manual Review |
| --- | ---: | ---: | ---: | ---: |
| Array | 178 / 233 | 76.39% | 736 | 55 |
| Dynamic Programming | 90 / 114 | 78.95% | 384 | 24 |
| String | 89 / 108 | 82.41% | 387 | 19 |
| Hash Table | 60 / 75 | 80.00% | 252 | 15 |
| Depth-First Search | 58 / 66 | 87.88% | 240 | 8 |
| Math | 56 / 60 | 93.33% | 260 | 4 |
| Breadth-First Search | 42 / 50 | 84.00% | 172 | 8 |
| Two Pointers | 44 / 46 | 95.65% | 186 | 2 |
| Tree | 39 / 45 | 86.67% | 165 | 6 |
| Matrix | 42 / 44 | 95.45% | 169 | 2 |
| Binary Tree | 38 / 41 | 92.68% | 161 | 3 |
| Sorting | 33 / 41 | 80.49% | 137 | 8 |
| Graph | 25 / 32 | 78.13% | 100 | 7 |
| Binary Search | 25 / 29 | 86.21% | 107 | 4 |
| Linked List | 24 / 25 | 96.00% | 98 | 1 |
| Backtracking | 14 / 24 | 58.33% | 60 | 10 |
| Stack | 20 / 20 | **100.00%** | 88 | 0 |
| Greedy | 14 / 18 | 77.78% | 62 | 4 |
| Sliding Window | 9 / 18 | 50.00% | 37 | 9 |
| Simulation | 17 / 17 | **100.00%** | 68 | 0 |

Topics achieving **100% coverage** include: `Stack` (20/20), `Simulation` (17/17), `String Matching` (6/6), `Topological Sort` (6/6), `Game Theory` (5/5), `Monotonic Stack` (4/4), `Binary Indexed Tree` (3/3), `Segment Tree` (3/3), `Merge Sort` (3/3), `Counting Sort` (3/3), `Ordered Set` (3/3), `Doubly-Linked List` (2/2), `Eulerian Circuit` (2/2), `Geometry` (2/2), `Rolling Hash` (2/2), `Counting` (2/2), and others.

---

## 4. Modular Suite Organization & Verification Controls

- `server/seedHiddenTests.ts` — Preserves all 83 original curated problems (`346` cases) verbatim in `BASE_CURATED_HIDDEN_TESTS`, merges modular Phase 7 suites into `CURATED_HIDDEN_TESTS` (`384` problems, `1,636` cases), enforces idempotent transactional SQLite seeding (`INSERT OR IGNORE`), and provides `computeHiddenTestCoverage`, `buildCoverageInventory`, and `formatHiddenTestCoverageReport`.
- `server/hiddenTests/easy.ts` — `123` additional Easy problems (`544` hidden cases).
- `server/hiddenTests/medium.ts` — `135` additional Medium problems (`562` hidden cases).
- `server/hiddenTests/hard.ts` — `43` additional Hard problems (`184` hidden cases).
- `server/hiddenTests/manualReview.ts` — Machine-readable audit registry for all `88` excluded problems (`reasonCode`, `reason`, `remediation`).
- `tests/oracles/{helpers,easy,medium,hard}.ts` + `tests/hidden-tests-coverage.test.ts` — Independent reference oracles executed on every CI run verifying:
  - 100% agreement with every catalog visible test case (`549` visible tests) and every hidden test case (`1,636` hidden tests),
  - Exact parameter arity match against `problem.signature.params`,
  - Zero duplicate inputs across visible + hidden tests per problem,
  - Bounded payload size (`<= 8,192` bytes per case; actual max: `1,984` bytes, average: `27` bytes, total across all 1,636 cases: `42.4 KB`),
  - Bounded oracle runtime (`< 500 ms` per problem, `< 5,000 ms` full suite; actual worst case: `12.84 ms` on `open-the-lock`, full suite: `~75 ms`),
  - Fast idempotent SQLite seeding (`~8.7 ms` initial insert, `~8.0 ms` idempotent re-seed) that preserves existing user accounts and survives WAL `VACUUM INTO` backup/restore with all `1,636` rows intact,
  - Zero leakage of hidden tests in public catalog serialization, frontend bundles (`dist/assets/*.js`), `GET /api/problems`, `GET /api/problems/:id`, or failed hidden submission responses (two-phase isolated container execution + redaction).

---

## 5. Audited Manual-Review Queue (88 Problems)

Every excluded problem is tracked in [`server/hiddenTests/manualReview.ts`](../server/hiddenTests/manualReview.ts) with a concrete remediation path:

| Reason Code | Count | Root Cause | Required Remediation |
| --- | ---: | --- | --- |
| `CORRUPTED_VISIBLE_TEST_DATA` | 51 | Legacy catalog entries (`#400–#471` and 6 earlier items) contain comma-stripped arrays (e.g., `[123113]`, `[-21,-34,-121,-54]`) or mathematically invalid visible outputs (e.g., `floyd-warshall-algorithm` expecting `44` instead of `6`, `valid-tic-tac-toe` accepting 3 X / 1 O, `reverse-words-in-a-string-iii` dropping `"tsetnoc"`). | Repair source entries in `server/additionalProblems.json` and re-run oracle validation. |
| `UNORDERED_OUTPUT_COMPARISON` | 15 | Problems explicitly allowing arbitrary output ordering (`group-anagrams`, `permutations`, `permutations-ii`, `subsets`, `combinations`, `word-ladder-ii`, `word-ladder-iii`, `remove-invalid-parentheses`, `concatenated-words`, `n-queens`, `palindrome-pairs`, `critical-connections-in-a-network`, `word-break-ii`, `word-search-ii`, plus duplicate Group Anagrams UUID). Strict JSON equality rejects valid student solutions. | Add canonical set/multiset comparator metadata to `submissionRunner.ts`. |
| `FLOAT_IN_INTEGER_SIGNATURE` | 8 | Signature declares `integer` or `integer[]` while visible tests expect floats (`powx-n`, `soup-servings`, `champagne-tower`, `evaluate-division`, `knight-probability-in-chessboard`, `find-median-from-data-stream`, `median-of-two-sorted-arrays`, `sliding-window-median`). | Update signatures to `float` / `float[]` and add epsilon comparator (`1e-5`). |
| `AMBIGUOUS_OR_TRUNCATED_SPEC` | 8 | Truncated or self-contradictory descriptions, or identity-array serialization unable to verify deep-copy/codec invariants (`populating-next-right-pointers-in-each-node`, `copy-list-with-random-pointer`, `serialize-and-deserialize-binary-tree`, `number-of-ways-to-stay-stood`, `count-the-number-of-ideal-arrays`, `minimum-cost-to-make-at-least-one-string-equal`, `longest-word-in-dictionary-through-removing`, `minimum-length-of-string-after-deletions`). | Author complete specs and/or dedicated object-graph/codec harness. |
| `UNSUPPORTED_TREENODE_SIGNATURE` | 3 | Uses `TreeNode` / `TreeNode[]` types without a runner serializer (`insert-into-a-binary-search-tree`, `delete-node-in-a-bst`, `unique-binary-search-trees-ii`). | Convert to level-order `integer[]` with structural BST/tree invariant validator. |
| `FLOAT_TOLERANCE_REQUIRED` | 1 | `average-of-levels-in-binary-tree` accepts answers within `1e-5`; strict JSON equality causes floating-point representation false negatives across languages. | Add epsilon tolerance comparison for `float[]` return types in `submissionRunner.ts`. |
| `SIGNATURE_TYPE_MISMATCH` | 1 | `clone-graph` declares `integer[] -> integer[]` while visible test passes 2D adjacency list `[[2,4],[1,3],[2,4],[1,3]]`. | Update signature to `integer[][]` and add deep-copy reference check. |
| `MISSING_ORACLE_API` | 1 | `first-bad-version` requires an external `isBadVersion(version)` API absent from `(n: integer) -> integer`. | Inject `isBadVersion` helper or pass `bad` parameter in harness. |
| **Total** | **88** | **100% audited — zero silently skipped problems** | |
