# Shared student navigation

`AppLayout` owns the persistent `AppShell` for every authenticated application route, including `/learn`. Feature pages supply content only. Landing and authentication remain separate.

- Header: 64px, one logo, global sections, grouped search, live account metrics.
- Sidebar: 240px, starts below the header. Below 1024px it becomes an accessible overlay drawer.
- PageContainer: 24px gutters, 18px at <=1000px, 14px horizontal / 12px vertical at <=600px. Normal content is capped at 1480px; specialized workspaces can be wide. Containers stay left anchored so wide and normal routes share the same content origin, including at 1920px.
- Normal pages use document scrolling. Chat/editor/canvas retain their internal interactions.

`src/navigation/navigationConfig.ts` is the source of global sections, contextual groups, nested active states, and search results. Search indexes existing structure and algorithm metadata. Its AI destination only prefills the tutor composer.

`TopicOrientation` supplies lesson breadcrumbs, supported contextual actions, and progress-aware next steps. Heap does not advertise a nonexistent Heap quiz; its existing visualizer can still offer the explicitly labeled related Binary Trees quiz.

Legacy DashboardShell, PracticeShell, TopBar, Sidebar, LearningSidebar, and TopNavbar were removed. Feature artwork and rendering implementations remain in their feature modules.

## Verification

Start the local server on port 3001, then run:

- `node tests/navigation-shell.browser.cjs` — 16 routes at eight viewport sizes, persistent shell transitions, active states, overflow, keyboard search and drawer accessibility.
- `node tests/navigation-regressions.cjs` — existing feature browser suites.
- `node node_modules/typescript/bin/tsc -p tests/tsconfig.navigation.json --noEmit`
- `node node_modules/vite/bin/vite.js build`

Browser tests use the existing local Playwright runtime and Edge. Screenshots and test logs go to the ignored `data/` directory.
