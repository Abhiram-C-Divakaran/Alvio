export type ManualReviewReasonCode =
  | 'CORRUPTED_VISIBLE_TEST_DATA'
  | 'UNORDERED_OUTPUT_COMPARISON'
  | 'FLOAT_IN_INTEGER_SIGNATURE'
  | 'FLOAT_TOLERANCE_REQUIRED'
  | 'UNSUPPORTED_TREENODE_SIGNATURE'
  | 'MISSING_ORACLE_API'
  | 'SIGNATURE_TYPE_MISMATCH'
  | 'AMBIGUOUS_OR_TRUNCATED_SPEC';

export interface ManualReviewEntry {
  reasonCode: ManualReviewReasonCode;
  reason: string;
  remediation: string;
}

/**
 * Auditable registry of catalog problems intentionally excluded from automated hidden-test
 * seeding because their catalog specification, signature, or visible test data prevents
 * mathematically sound, unambiguous grading under the current runner contract.
 */
export const MANUAL_REVIEW_PROBLEMS: Readonly<Record<string, ManualReviewEntry>> = {
  // ===== Float return / tolerance mismatches (9) =====
  'powx-n': {
    reasonCode: 'FLOAT_IN_INTEGER_SIGNATURE',
    reason: 'Signature declares returns: "integer" while negative exponents produce fractional floats (e.g., 0.25).',
    remediation: 'Change signature.returns to "float" and add epsilon comparison in submissionRunner.',
  },
  'soup-servings': {
    reasonCode: 'FLOAT_IN_INTEGER_SIGNATURE',
    reason: 'Signature declares returns: "integer" while visible test expects float 0.625 with 1e-5 tolerance.',
    remediation: 'Change signature.returns to "float" and support 1e-5 float tolerance.',
  },
  'champagne-tower': {
    reasonCode: 'FLOAT_IN_INTEGER_SIGNATURE',
    reason: 'Signature declares returns: "integer" while visible test expects float 0.5.',
    remediation: 'Change signature.returns to "float" and support float tolerance.',
  },
  'evaluate-division': {
    reasonCode: 'FLOAT_IN_INTEGER_SIGNATURE',
    reason: 'Signature declares returns: "integer[]" while visible test expects float array [6, 0.5, -1, 1, -1].',
    remediation: 'Change signature.returns to "float[]" and support float array tolerance.',
  },
  'knight-probability-in-chessboard': {
    reasonCode: 'FLOAT_IN_INTEGER_SIGNATURE',
    reason: 'Signature declares returns: "integer" while visible test expects float 0.0625.',
    remediation: 'Change signature.returns to "float" and support 1e-5 float tolerance.',
  },
  'find-median-from-data-stream': {
    reasonCode: 'FLOAT_IN_INTEGER_SIGNATURE',
    reason: 'Signature declares returns: "integer[]" while visible test expects fractional median 1.5.',
    remediation: 'Support nullable float[] return type and epsilon comparison.',
  },
  'median-of-two-sorted-arrays': {
    reasonCode: 'FLOAT_IN_INTEGER_SIGNATURE',
    reason: 'Signature declares returns: "integer" while even-length visible test expects float 2.5.',
    remediation: 'Change signature.returns to "float" and support float tolerance.',
  },
  'sliding-window-median': {
    reasonCode: 'FLOAT_IN_INTEGER_SIGNATURE',
    reason: 'Signature declares returns: "integer[]" while even window sizes produce .5 fractional medians.',
    remediation: 'Change signature.returns to "float[]" and support 1e-5 float tolerance.',
  },
  'average-of-levels-in-binary-tree': {
    reasonCode: 'FLOAT_TOLERANCE_REQUIRED',
    reason: 'Spec accepts answers within 1e-5, whereas submissionRunner enforces exact JSON.stringify equality.',
    remediation: 'Add epsilon tolerance comparison for float[] return types in submissionRunner.',
  },

  // ===== Unordered multi-output problems requiring order-insensitive comparator (15) =====
  'dc8462e8-9ee6-4918-9220-fc747e418fe9': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Duplicate Group Anagrams entry allowing any group/member order; strict JSON equality rejects valid solutions.',
    remediation: 'Deduplicate catalog entry and add canonical unordered comparison mode.',
  },
  'group-anagrams': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Spec explicitly allows any group and inner-string order; strict JSON equality rejects valid hash-map orders.',
    remediation: 'Add canonical set/multiset comparator flag in submissionRunner.',
  },
  'permutations': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Spec explicitly allows returning permutations in any order.',
    remediation: 'Add unordered array-of-arrays comparator mode in submissionRunner.',
  },
  'permutations-ii': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Spec explicitly allows returning unique permutations in any order.',
    remediation: 'Add unordered array-of-arrays comparator mode in submissionRunner.',
  },
  'subsets': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Spec explicitly allows returning power-set subsets in any order.',
    remediation: 'Add unordered array-of-arrays comparator mode in submissionRunner.',
  },
  'combinations': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Spec explicitly allows returning combinations in any order.',
    remediation: 'Add unordered array-of-arrays comparator mode in submissionRunner.',
  },
  'word-ladder-ii': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Multiple shortest transformation paths may be returned in any order.',
    remediation: 'Add unordered path-list comparator mode in submissionRunner.',
  },
  'word-ladder-iii': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Multiple shortest transformation paths may be returned in any order.',
    remediation: 'Add unordered path-list comparator mode in submissionRunner.',
  },
  'remove-invalid-parentheses': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Spec explicitly allows returning all valid strings in any order.',
    remediation: 'Add unordered string-set comparator mode in submissionRunner.',
  },
  'concatenated-words': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Output list of concatenated words may be returned in any order.',
    remediation: 'Add unordered string-set comparator mode in submissionRunner.',
  },
  'n-queens': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Board solutions for n >= 4 may be returned in any order.',
    remediation: 'Add unordered board-list comparator mode in submissionRunner.',
  },
  'palindrome-pairs': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Index pairs [i, j] may be returned in any order.',
    remediation: 'Add unordered pair-set comparator mode in submissionRunner.',
  },
  'critical-connections-in-a-network': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Undirected bridge edges may be returned as [u, v] or [v, u] and in any list order.',
    remediation: 'Add canonical undirected-edge-set comparator mode in submissionRunner.',
  },
  'word-break-ii': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Spec explicitly allows returning constructed sentences in any order.',
    remediation: 'Add unordered string-set comparator mode in submissionRunner.',
  },
  'word-search-ii': {
    reasonCode: 'UNORDERED_OUTPUT_COMPARISON',
    reason: 'Found words may be returned in any order.',
    remediation: 'Add unordered string-set comparator mode in submissionRunner.',
  },

  // ===== Unsupported TreeNode class signatures (3) =====
  'insert-into-a-binary-search-tree': {
    reasonCode: 'UNSUPPORTED_TREENODE_SIGNATURE',
    reason: 'Uses TreeNode param/return type without runner serializer, truncated description, and comma-stripped test [42713].',
    remediation: 'Convert to level-order integer[] with BST invariant checker and repair test data.',
  },
  'delete-node-in-a-bst': {
    reasonCode: 'UNSUPPORTED_TREENODE_SIGNATURE',
    reason: 'Uses TreeNode param/return type, comma-stripped test [53624,null,7], and multiple valid BST deletion structures.',
    remediation: 'Convert to level-order integer[] with structural BST validator and repair test data.',
  },
  'unique-binary-search-trees-ii': {
    reasonCode: 'UNSUPPORTED_TREENODE_SIGNATURE',
    reason: 'Returns TreeNode[] object graphs in arbitrary order without runner serializer.',
    remediation: 'Add canonical tree-set comparator or replace with integer[] serialization.',
  },

  // ===== Missing API / Signature Type Mismatch / Ambiguous Spec (10) =====
  'first-bad-version': {
    reasonCode: 'MISSING_ORACLE_API',
    reason: 'Spec depends on external isBadVersion(version) API absent from signature (n: integer) -> integer.',
    remediation: 'Add bad version parameter or inject isBadVersion helper in runner wrapper.',
  },
  'clone-graph': {
    reasonCode: 'SIGNATURE_TYPE_MISMATCH',
    reason: 'Declares (node: integer[]) -> integer[] while visible test passes 2D adjacency list [[2,4],[1,3],[2,4],[1,3]] expecting identity.',
    remediation: 'Fix signature to integer[][] and clarify deep-copy verification contract.',
  },
  'populating-next-right-pointers-in-each-node': {
    reasonCode: 'AMBIGUOUS_OR_TRUNCATED_SPEC',
    reason: 'Serialized visible test expects identity array [1,2,3,4,5,6,7] without next-pointer markers (#).',
    remediation: 'Define explicit level-sentinel serialization format (e.g., "#" markers) in spec and tests.',
  },
  'copy-list-with-random-pointer': {
    reasonCode: 'AMBIGUOUS_OR_TRUNCATED_SPEC',
    reason: 'Serialized visible test expects identical 2D array output, which cannot distinguish deep copy from returning input.',
    remediation: 'Add runtime identity/aliasing check or dedicated node-graph harness.',
  },
  'serialize-and-deserialize-binary-tree': {
    reasonCode: 'AMBIGUOUS_OR_TRUNCATED_SPEC',
    reason: 'Single-function integer[] -> integer[] signature returns input unchanged without testing codec round-trip.',
    remediation: 'Add two-function serialize/deserialize codec harness.',
  },
  'number-of-ways-to-stay-stood': {
    reasonCode: 'AMBIGUOUS_OR_TRUNCATED_SPEC',
    reason: 'Underspecified prompt ("ways to stand on each stair") with only one test (4 -> 5) and no step rules.',
    remediation: 'Author complete specification with explicit transition rules and constraints.',
  },
  'count-the-number-of-ideal-arrays': {
    reasonCode: 'AMBIGUOUS_OR_TRUNCATED_SPEC',
    reason: 'Omits divisibility rule and modulo 10^9+7 requirement; visible test (3,4)->10 disagrees with LeetCode 2338 ideal-array count (11).',
    remediation: 'Clarify mathematical definition and verify catalog visible test against specification.',
  },
  'minimum-cost-to-make-at-least-one-string-equal': {
    reasonCode: 'AMBIGUOUS_OR_TRUNCATED_SPEC',
    reason: 'Truncated description omits allowed edit operations and per-operation costs.',
    remediation: 'Write full problem statement defining edit operations and cost model.',
  },
  'longest-word-in-dictionary-through-removing': {
    reasonCode: 'AMBIGUOUS_OR_TRUNCATED_SPEC',
    reason: 'Truncated description conflicts with visible test ["wrt","wrf","er","ett","rftt"] -> "wert" (not even in wordlist).',
    remediation: 'Replace with valid problem specification and consistent visible tests.',
  },
  'minimum-length-of-string-after-deletions': {
    reasonCode: 'AMBIGUOUS_OR_TRUNCATED_SPEC',
    reason: 'Description references deleting anagrams of a second given string, but signature only accepts (s: string).',
    remediation: 'Align problem description, signature parameters, and visible test cases.',
  },

  // ===== Corrupted / Comma-Stripped / Mathematically Invalid Visible Test Data (51) =====
  'floyd-warshall-algorithm': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Visible test outputs matrix[0][2]=43 and matrix[1][2]=44 instead of shortest paths 7 and 6.',
    remediation: 'Repair visible expected matrix to [[0,1,7],[1,0,6],[2147483647,2147483647,0]] before adding hidden tests.',
  },
  'valid-tic-tac-toe': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Visible test ["XOX"," X ","   "] has 3 Xs and 1 O (invalid board) but expects true.',
    remediation: 'Correct visible test expected value to false and add full rules to description.',
  },
  'max-subarray': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Visible input [-21,-34,-121,-54] has stripped commas from [-2,1,-3,4,-1,2,1,-5,4] yet expects 6.',
    remediation: 'Repair visible test array and deduplicate against maximum-subarray.',
  },
  'maximum-binary-string': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and invalid visible output ("00110" -> "00111" instead of "10111").',
    remediation: 'Restore full LeetCode 1702 rules and repair visible test outputs.',
  },
  'count-substrings-with-only-one-distinct-letter': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Visible test "abc" expects 6 instead of 3 ("a", "b", "c").',
    remediation: 'Fix visible expected output for "abc" to 3 and complete description.',
  },
  'reverse-words-in-a-string-iii': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Visible test "Let\'s take LeetCode contest" expects "s\'teL ekat edoCteeL" (missing reversed "contest").',
    remediation: 'Fix visible expected output to include "tsetnoc".',
  },
  'max-increase-to-fit': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Comma-stripped 1-column matrices [[2910],[3715],...] expecting 35 with incomplete description.',
    remediation: 'Restore 2D skyline grid inputs and complete problem statement.',
  },
  'number-of-good-pairs': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Comma-stripped inputs [123113], [123], [1111] with incomplete 6-word description.',
    remediation: 'Restore array commas and complete specification.',
  },
  'max-increase-to-fit-integer-array': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [123], [1212121212].',
    remediation: 'Restore full specification and valid array inputs.',
  },
  'minimum-size-subarray-sum': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [231243], [144].',
    remediation: 'Restore array commas ([2,3,1,2,4,3], [1,4,4]) and full description.',
  },
  'subarray-product-less-than-k': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [10526], [123].',
    remediation: 'Restore array commas ([10,5,2,6], [1,2,3]) and full description.',
  },
  'longest-subsequence-repeated-k': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Visible test ("letslearn", 2) expects "letslearn" which cannot repeat twice in itself.',
    remediation: 'Replace visible test cases with mathematically valid examples.',
  },
  'subarray-sum-equals-k': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Comma-stripped visible inputs [111], [123] instead of [1,1,1], [1,2,3].',
    remediation: 'Restore array commas in visible tests.',
  },
  'min-cost-to-connect-all-points': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Corrupted point tuples [["00"],[22],[310],...] mixing strings and comma-stripped integers.',
    remediation: 'Restore 2D coordinate pairs [[0,0],[2,2],[3,10],[5,2],[7,0]] and full description.',
  },
  'subarrays-with-k-different-integers': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [12123], [12134].',
    remediation: 'Restore array commas ([1,2,1,2,3], [1,2,1,3,4]) and complete description.',
  },
  'super-ugly-number': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped primes array [271319] instead of [2,7,13,19].',
    remediation: 'Restore primes array commas and complete description.',
  },
  'max-consecutive-ones-ii': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [110110111011], [111111].',
    remediation: 'Restore binary array commas and complete description.',
  },
  'partition-labels': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Comma-stripped visible output [978] instead of [9, 7, 8].',
    remediation: 'Fix visible expected array to [9, 7, 8] and complete description.',
  },
  'find-minimum-in-rotated-sorted-array': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Comma-stripped inputs [34512], [4567012] and truncated description.',
    remediation: 'Restore array commas ([3,4,5,1,2], [4,5,6,7,0,1,2]) and complete description.',
  },
  'construct-target-array-with-multiple-sums': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Comma-stripped input [935] instead of [9, 3, 5] and incomplete description.',
    remediation: 'Restore array commas and describe allowed sum-replacement operations.',
  },
  'minimize-malware-spread': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Corrupted adjacency matrix [[110],[110],["001"]] and string initial array ["01"].',
    remediation: 'Restore integer matrix and integer[] initial nodes.',
  },
  'min-cost-to-make-all-elements-equal-in-array': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Comma-stripped input [1352] and missing cost array parameter.',
    remediation: 'Restore full specification, cost parameter, and array commas.',
  },
  'minimize-the-difference-between-target-and-chosen-elements': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Comma-stripped matrix [[123],[456],[789]] and target typed as integer[] [231].',
    remediation: 'Restore matrix commas and fix target parameter type to integer.',
  },
  'find-k-th-smallest-pair': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs/outputs ([1711],[246] -> [12]).',
    remediation: 'Restore array commas and complete specification.',
  },
  'max-consecutive-ones-iii': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Comma-stripped binary inputs [11100011110], [110].',
    remediation: 'Restore binary array commas and complete description.',
  },
  'number-of-subsequences-that-satisfy-the-condition': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Comma-stripped inputs [3567], [3368] and missing modulo 10^9+7 note in truncated description.',
    remediation: 'Restore array commas and complete specification.',
  },
  'maximize-distance-to-closest-person': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Signature declares string[] seats while visible inputs are comma-stripped integers [1000101], [1000].',
    remediation: 'Fix signature to integer[] and restore seat array commas.',
  },
  'kth-distinct-element-in-an-array': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [12234445], [111].',
    remediation: 'Restore array commas and complete description.',
  },
  'subarray-sums-divisible-by-k': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [111], [123].',
    remediation: 'Restore array commas and complete description.',
  },
  'find-the-shortest-superstring': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description ("supersequence" vs "superstring") plus multiple equally optimal superstrings under strict equality.',
    remediation: 'Clarify exact specification and add length/containment validator.',
  },
  'number-of-islands-ii': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and corrupted string/comma-stripped positions [["00"],["01"],[12],[21]] -> [1122].',
    remediation: 'Restore integer[][] positions and integer[] expected outputs.',
  },
  'max-sum-of-3-non-overlapping-subarrays': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Visible inputs/outputs contain strings ["0011"], ["069"] inside integer[] signature.',
    remediation: 'Repair test case types and restore full specification.',
  },
  'distant-barcodes': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description, comma-stripped inputs/outputs ([111222] -> [121212]), and non-unique valid outputs.',
    remediation: 'Restore array commas and add adjacent-inequality + multiset validator.',
  },
  'max-boxes-in-a-warehouse': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [[[53],[54],...],[45678910101010]].',
    remediation: 'Restore full specification and valid array data.',
  },
  'minimize-the-difference-between-target-and-chosen-integer': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Corrupted parameter nesting [[5,[12345]], 1] violating (target: integer, arr: integer[]).',
    remediation: 'Fix parameter values, restore commas, and complete specification.',
  },
  'minimize-the-total-price-of-the-tasks': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [[[12],[23],[34]], [102030]].',
    remediation: 'Restore full specification and valid array data.',
  },
  'maximize-the-visibility-of-the-buildings': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [[[12],[23],[34]], [[11],[22]]].',
    remediation: 'Restore full specification and valid array data.',
  },
  'minimize-the-difference-between-the-max-and-min-values': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [12345], [1020304050].',
    remediation: 'Restore full specification and valid array data.',
  },
  'subsets-ii': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Comma-stripped input/output ([122] -> [[],[1],[2],[12],[22],[122]]) plus unordered power set.',
    remediation: 'Restore array commas and add unordered set comparator.',
  },
  'minimum-average-difference': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Corrupted inputs ["021",-66,-791,-2685] and [42232444444444450] with 6-word description.',
    remediation: 'Restore integer[] inputs and complete specification.',
  },
  'kth-distinct-element': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [43215], [2121345].',
    remediation: 'Restore array commas and complete description.',
  },
  'minimum-amount-of-time': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [125], [45973].',
    remediation: 'Restore array commas and complete specification.',
  },
  'number-of-subarrays-with-bounded-maximum': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [2143], [29256111].',
    remediation: 'Restore array commas ([2,1,4,3], etc.) and complete description.',
  },
  'minimum-window-subarray': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs/outputs ([231243] -> [231243], [111] -> [11]).',
    remediation: 'Restore array commas and complete specification.',
  },
  'max-consecutive-floors-without-occupied-rooms': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [12345], [135].',
    remediation: 'Restore array commas and complete specification.',
  },
  'maximum-number-of-non-overlapping-subarrays': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description, comma-stripped [111], and string ["000"] in integer[] param.',
    remediation: 'Restore integer[] inputs and complete specification.',
  },
  'count-subarrays-with-median-k': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [12345], [135].',
    remediation: 'Restore array commas and complete specification.',
  },
  'minimum-cost-to-make-at-least-one-vertex-in-each-trie': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and corrupted edge list [["01"],[12],[20]] mixing strings and comma-stripped ints.',
    remediation: 'Restore integer[][] edge list and complete specification.',
  },
  'minimum-operations-to-make-all-elements-equal': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped inputs [12345], [55555].',
    remediation: 'Restore array commas and complete specification.',
  },
  'minimum-cost-to-connect-all-nodes': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description, parameter n passed as array [4], and comma-stripped edges [[125],[236],[341]].',
    remediation: 'Fix n parameter type, restore edge triples, and complete specification.',
  },
  'minimum-amount-of-time-to-collect-garbage': {
    reasonCode: 'CORRUPTED_VISIBLE_TEST_DATA',
    reason: 'Truncated description and comma-stripped travel array [101574225] with non-standard garbage names.',
    remediation: 'Restore valid LeetCode 2391 inputs and complete specification.',
  },
};
