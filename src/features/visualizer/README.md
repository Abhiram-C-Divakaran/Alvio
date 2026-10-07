# 3D structure learning modules

`VisualizerPage` keeps the existing R3F structure components and existing factory/operation functions. `StructureLayout` owns the responsive Alvio presentation. `/3d-visualizer?ds=Heap` selects Heap; the selector supports ten modules.

Heap operations use `dataStructureOps` as the source of truth. `heapOperationFrames` replays compare/swap/settle states for presentation, with cancellation on module/variant changes. Reduced motion skips timed playback. Nodes preserve 32-segment sphere geometry, emissive materials, rings and connectors; a small positional interpolation animates swaps. The default is a valid seven-node max heap (the supplied screenshot is not a valid heap).

Arbitrary-index deletion now sifts upward if necessary before sifting downward. Heap operations clone node records, so animation snapshots are immutable. Empty heaps no longer show the renderer's sample tree. The interactive heap is capped at 31 nodes for readability.

The camera has bounded zoom/polar angles and a reset control. Generated environment lights and a locally bundled OFL Inter font avoid external HDR/font dependencies for the scene. Supplied artwork is used only for the sidebar link. See the measured rendering check below; hardware 60 FPS remains unverified.

Array cells and the accessible data view provide keyboard-accessible node inspection. The mobile Info/Visualizer/Code controls retain the same scene. The code dialog displays existing min-heap implementations in Python, JavaScript, Java and C++, with a note on reversing comparisons for max heaps.

Checks: `tests/heap-operations.test.ts` validates 480 max/min insert/delete operations, immutable inputs, empty heaps, and replay final states. `tests/heap-page.browser.cjs` exercises desktop/mobile operations, min/max variants, inspection, guide controls, four code languages and ten modules. Headless Edge uses SwiftShader because hardware WebGL crashes in this environment.

## 3D algorithms
`AlgorithmModuleLayout` wraps the existing immersive branch of `AlgorithmsWorkspace`, preserving its step generation and 3D renderer selection. It uses the shared shell at `/algorithms-visualizer`, metadata-driven selection, bounded responsive camera, local environment lights, playback speed and seek controls, mobile sections, accessible step descriptions, and the workspace's actual reference code with current-line highlighting. Graph/DP/recursion examples remain the existing guided examples; only array-based modules offer Shuffle. The code is reference pseudocode, not a new executable code runner. Reduced-motion preferences disable ambient movement and tile interpolation. The browser test covers sorting, searching, graphs, DP, recursion and traversal routes. Existing broad workspace TypeScript errors are outside this layout change; the new layout has a separate scoped check.

## Connected structure learning

The existing progress store now persists optional `visualizerModules` records, keyed by module ID and variant, plus a reduced-motion preference. No IndexedDB schema migration is needed. BST and AVL records contribute activity to the canonical `binary-tree` topic. Opening a module starts its topic without changing lesson percentages or quiz scores. All guided steps plus a successful heap operation (or inspected node/cell for other structures) complete only the visualization. Completion activity is recorded once; no new XP award is introduced.

Module/variant changes remount the learning session, cancelling playback and heap replay, clearing selection and restoring the saved tour. Demo data starts fresh. Active time is sampled with a monotonic clock, flushed in small deltas, and added to existing topic, total, weekly and daily activity. Hidden/blurred time, idle time after 60 seconds, and suspended scheduling gaps are excluded. Account guards prevent cross-profile writes; failed database sync retains local progress and retries on session restoration.

The Universe and catalog retain their recommendations and add a contextual resume card. Universe visualization links now select the focused structure. Each module offers existing lesson, code, practice and quiz destinations. Heap explicitly links to the related Binary Trees quiz because there is no dedicated Heap quiz pool. Existing learning routes retain the shared DashboardShell, topbar, Learn navigation and real XP/streak state; duplicate App routes were removed without URL changes.

## Measured rendering check

`tests/visualizer-performance.browser.cjs` instruments actual WebGL draw calls. At 1400×1000 with device scale factor 2, all ten modules produced **zero draws during a two-second settled idle window**, with effective DPR capped at 1.5. A CSS-hidden mobile scene also produced zero draws while its guide was playing. Demand rendering allows bounded interpolation after changes and interaction, and stops while hidden. Existing mesh geometry, emissive materials, lights and postprocessing are retained; asteroids remain instanced and environment lighting is generated once.

Headless Edge using SwiftShader software WebGL observed approximately 3–5 rendered FPS during the automated rotation workload (Array 5, Linked List 5, Stack 4, Queue 5, Hash Table 4, Binary Tree 5, BST 5, AVL 5, Heap 5, Graph 3). These are automation/software-renderer measurements, **not evidence of 60 FPS on a hardware GPU**. The reproducible test writes detailed samples to `data/visualizer-performance.json`.

Additional checks:
- `node node_modules/tsx/dist/cli.mjs tests/visualizer-progress.test.ts`
- `node tests/visualizer-progress.browser.cjs`
- `node tests/visualizer-store.browser.cjs`
- `node tests/visualizer-performance.browser.cjs`
- `node node_modules/typescript/bin/tsc -p tests/tsconfig.visualizer-progress.json`

The existing heap operations, heap page, AI visualizer interaction and page, Universe, video lessons and 3D algorithms checks passed, as did the production Vite build and scoped structure/video/algorithm-layout TypeScript checks. Repository-wide lint remains blocked by pre-existing parser errors in `update_page.cjs` and invalid UTF-8 in `temp.tsx`, with existing unused-code warnings. Vite retains its large-chunk warning.
