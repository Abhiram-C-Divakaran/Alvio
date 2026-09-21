import {Link} from 'react-router-dom';
import {algorithms} from './model';
import './algorithms.css';
const heapCode=`def heap_sort(a):
    def sift(i, size):
        while 2 * i + 1 < size:
            child = 2 * i + 1
            if child + 1 < size and a[child + 1] > a[child]:
                child += 1
            if a[i] >= a[child]:
                break
            a[i], a[child] = a[child], a[i]
            i = child
    for i in range(len(a) // 2 - 1, -1, -1):
        sift(i, len(a))
    for end in range(len(a) - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift(0, end)
    return a`;
const rabinCode=`def rabin_karp(text, pattern):
    n, m = len(text), len(pattern)
    if m == 0:
        return list(range(n + 1))
    if m > n:
        return []
    base, prime = 256, 1000000007
    power = pow(base, m - 1, prime)
    wanted = window = 0
    for i in range(m):
        wanted = (wanted * base + ord(pattern[i])) % prime
        window = (window * base + ord(text[i])) % prime
    matches = []
    for start in range(n - m + 1):
        if window == wanted and text[start:start + m] == pattern:
            matches.append(start)
        if start < n - m:
            window = ((window - ord(text[start]) * power) * base
                      + ord(text[start + m])) % prime
    return matches`;
export default function SupplementalAlgorithmLesson({id}:{id:string}){
 const a=algorithms.find(a=>a.id===id)!;const heap=id==='heap-sort';
 return <div className="al-hub al-supplement"><Link to="/learn/algorithms">← All Algorithms</Link><h1>{a.name}</h1><p>{a.description}</p><h2>Intuition</h2><p>{heap?'A max heap keeps the largest value at the root. Move it to the final position, shrink the unsorted heap, and repair the root. Repeating this produces ascending order.':'Compare compact fingerprints of the pattern and each text window. A rolling hash updates the next fingerprint without hashing the entire window again. Equal hashes are candidates, not proof of equal strings.'}</p><h2>How it works</h2><ol>{(heap?['Build a max heap from the bottom up.','Swap the root with the last unsorted element.','Sift the new root down within the smaller heap.','Repeat until the heap contains at most one element.']:['Hash the pattern and first text window.','If their hashes match, compare the actual characters.','Remove the outgoing character and add the incoming character to update the hash.','Continue through every possible window, including overlapping matches.']).map(s=><li key={s}>{s}</li>)}</ol><h2>Worked example</h2><p>{heap?'[4, 1, 3, 2] → max heap [4, 2, 3, 1] → [3, 2, 1 | 4] → [2, 1 | 3, 4] → [1, 2, 3, 4]. The suffix after the divider is sorted.':'For text “ababa” and pattern “aba”, compare windows “aba”, “bab”, and “aba”. Verification reports starting indices [0, 2].'}</p><h2>Python implementation</h2><pre>{heap?heapCode:rabinCode}</pre><h2>Complexity and trade-offs</h2><p>{heap?'Heap construction takes O(n). Worst-case sorting takes O(n log n), with O(1) auxiliary space for this iterative implementation. Heap sort is in-place but is not stable.':'Expected time is O(n + m) when hash matches are rare; the worst case is O(nm) because matching hashes require character verification. This Python implementation uses O(m + k) extra space for verification slices and k output indices. A character-by-character check removes the O(m) slice allocation.'}</p><h2>Common mistakes</h2><p>{heap?'Do not include the sorted suffix when sifting down. Choose the larger child, and use zero-based child indices 2i + 1 and 2i + 2.':'Always verify matching hashes. Handle an empty pattern and a pattern longer than the text, and normalize hash arithmetic modulo the chosen prime.'}</p><Link className="al-primary" to={`/coding?topic=${heap?'Sorting':'Strings'}`}>Practice {heap?'sorting':'string matching'} →</Link></div>
}
