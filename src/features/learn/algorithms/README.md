# Algorithms hub

`/learn/algorithms` uses the shared Alvio DashboardShell. All 26 existing algorithms keep their lesson and visualizer routes. Their original metadata is now exported from `metadata.ts` and re-exported by AlgorithmsWorkspace for compatibility; opening the catalog does not initialize a Three.js scene.

Heap Sort and Rabin–Karp are supplemental lessons with worked examples, Python code, complexity notes, and practice links. They correctly display “Start Lesson”; no unsupported visualizer is linked. Backtracking has an introductory lesson dialog and practice link, but no dedicated algorithm is invented for that category.

The library combines category/paradigm filters with immediate keyword search, sorting, and grid/list views. “Popular” preserves the established catalog order because no popularity analytics exist. “Recommended” puts incomplete algorithms first. Start Learning prefers an in-progress algorithm, then an existing recommendation, then the next incomplete catalog entry. Progress reads matching algorithm IDs from the existing progress store; absent records do not display fabricated percentages. Existing algorithm visualizers award XP/time but do not currently persist per-algorithm completion, so the hub does not infer completion from those rewards.

Hero and paradigm artwork reuse the supplied assets. Text, counts, CTAs, filters and cards remain live HTML. Counts show 28 lessons and 26 visualizers; the practice link avoids the unsupported reference value of 250+. The overview is an accessible native dialog with an introduction because there is no dedicated overview video.

Checks:
- `node node_modules/tsx/dist/cli.mjs tests/algorithms-model.ts`
- `node tests/algorithms-hub.browser.cjs`
- `node node_modules/vite/bin/vite.js build`

Browser coverage includes all 28 cards, combined filters/search, aliases, Grid/List, sorting, keyboard dismissal, both supplemental lessons, and mobile overflow. Lesson Python implementations were checked against built-in sorting and exhaustive substring matching on 200 seeded randomized cases.
