# 3D structure learning modules

`VisualizerPage` keeps the existing R3F structure components and existing factory/operation functions. `StructureLayout` owns the responsive Alvio presentation. `/3d-visualizer?ds=Heap` selects Heap; the selector supports ten modules.

Heap operations use `dataStructureOps` as the source of truth. `heapOperationFrames` replays compare/swap/settle states for presentation, with cancellation on module/variant changes. Reduced motion skips timed playback. Nodes preserve 32-segment sphere geometry, emissive materials, rings and connectors; a small positional interpolation animates swaps. The default is a valid seven-node max heap (the supplied screenshot is not a valid heap).

Arbitrary-index deletion now sifts upward if necessary before sifting downward. Heap operations clone node records, so animation snapshots are immutable. Empty heaps no longer show the renderer's sample tree. The interactive heap is capped at 31 nodes for readability.

The camera has bounded zoom/polar angles and a reset control. Generated environment lights and a locally bundled OFL Inter font avoid external HDR/font dependencies for the scene. Supplied artwork is used only for the sidebar link. CPU/GPU frame rate has not been profiled against a 60 FPS benchmark.

Array cells and the accessible data view provide keyboard-accessible node inspection. The mobile Info/Visualizer/Code controls retain the same scene. The code dialog displays existing min-heap implementations in Python, JavaScript, Java and C++, with a note on reversing comparisons for max heaps.

Checks: `tests/heap-operations.test.ts` validates 480 max/min insert/delete operations, immutable inputs, empty heaps, and replay final states. `tests/heap-page.browser.cjs` exercises desktop/mobile operations, min/max variants, inspection, guide controls, four code languages and ten modules. Headless Edge uses SwiftShader because hardware WebGL crashes in this environment.

## 3D algorithms
`AlgorithmModuleLayout` wraps the existing immersive branch of `AlgorithmsWorkspace`, preserving its step generation and 3D renderer selection. It uses the shared shell at `/algorithms-visualizer`, metadata-driven selection, bounded responsive camera, local environment lights, playback speed and seek controls, mobile sections, accessible step descriptions, and the workspace's actual reference code with current-line highlighting. Graph/DP/recursion examples remain the existing guided examples; only array-based modules offer Shuffle. The code is reference pseudocode, not a new executable code runner. Reduced-motion preferences disable ambient movement and tile interpolation. The browser test covers sorting, searching, graphs, DP, recursion and traversal routes. Existing broad workspace TypeScript errors are outside this layout change; the new layout has a separate scoped check.
