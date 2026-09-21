# Data Structures Universe

The `/learn` page uses the shared DashboardShell and lazy-loads a single React Three Fiber scene. Planets have stable positions, bounded camera controls, keyboard-accessible labels, search/category dimming, and a DOM List view (the mobile default).

Topic paths, prerequisite recommendations, and lesson/visualization/practice counts come from the existing curriculum metadata. Completion is read from the existing progress store using the canonical lesson topic IDs; the journey summarizes the seven topics displayed here. Existing lessons allow free navigation, so unmet prerequisites are recommendations, not new locks. Counts retain the existing curriculum metadata rather than the example values in the reference.

The renderer uses on-demand frames, limited pixel ratio, reusable procedural textures, and no continuous orbit animation. Reduced motion skips camera interpolation and CSS entrance effects. Reset restores the default camera while retaining the selected topic. Practice and visualization links reuse the existing destinations.

Validation: `node tests/universe.browser.cjs` checks map selection, list filters/search, lesson links, Escape, mobile defaults and overflow. Build: `node node_modules/vite/bin/vite.js build`.
