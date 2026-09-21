# Data Structures catalog

`/learn/data-structures` uses the shared DashboardShell with Learn navigation. Existing topic content and the learning engine are preserved. The BST card opens the BST section of the existing Binary Tree lesson; progress for those cards refers to the same underlying lesson.

The ten structures, categories, aliases, difficulty, prerequisites and destinations are in `structureCatalog.ts`. Popular preserves the curated catalog order; it does not imply measured usage analytics. Search includes aliases and related concepts. Progress sorting and the next incomplete topic use the existing progress store and recommendation/prerequisite data.

The hero and ten cards display the exact user-supplied September 13 PNGs from `public/learn/data-structures/`, without pixel edits. Cards retain semantic headings, descriptions, difficulty labels, and real lesson links; progress is overlaid from live state. Desktop hero controls align with the supplied image buttons. Mobile uses readable HTML hero content instead of shrinking the baked text. Full interactive 3D remains in existing lesson/visualizer routes. Reduced motion disables hover transforms.

Watch Overview opens an introductory lesson with the existing Array introduction video and accompanying text; no standalone general-overview video was available. Code Examples links to the real implementation section of the Array lesson. Header streak/XP remain driven by the shared account state rather than the reference screenshot's sample numbers.

Verification: `node tests/ds-catalog-model.cjs`, `node tests/ds-catalog.browser.cjs`, `node tests/ds-catalog-navigation.browser.cjs`, and `node tests/ds-catalog-progress.browser.cjs`. Browser tests expect port 3001 and the bundled Playwright installation. They check aliases/categories/sorts, persisted progress, recommended navigation, overview, actual lesson anchors, feature destinations, keyboard activation and responsive layout.
