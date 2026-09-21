# Complexity laboratory

The shared Learn shell hosts this page. `data.ts` supplies six growth classes and explicit algorithm assumptions. The graph uses log10(value), clamped to [0, 6]; the table and tooltip retain full mathematical values through N=100. Depth separates classes and has no quantitative meaning. Constant and linear classes correctly share numerical time/space growth, while stack-frame and retained-level space models count whole levels. These are representative operation/storage counts, not benchmarking or bytes.

Three.js is loaded only for 3D View, with finite 100-point curves and demand rendering when paused. Rotation and zoom are bounded; reset remounts the camera. Moving markers traverse the curves in both views. Pause freezes their phase; reduced-motion preferences default to paused. The 3D view uses perspective, lit tubes, and a shaded floor. Mobile defaults to the SVG 2D view; all selections and visibility controls are keyboard-accessible through the legend and the table provides exact readable values. At least one curve remains visible.

Checks: `node tests/complexity-model.cjs`, `node tests/complexity.browser.cjs`. Browser test requires localhost:3001 and the bundled Playwright runtime.
