# Coding problem workspace

The shared Practice topbar remains; the sidebar is hidden only while a problem is open. The generic metadata-driven workspace retains the existing language execution adapters and problem-list URL filters. Both dividers persist locally, drafts are saved per problem/language, and fullscreen expands both the editor and testcase area.

Monaco uses the bundled editor and language definitions. JavaScript runs in an isolated worker with a three-second termination deadline. Run evaluates editable cases; Run Testcase evaluates only the selected case. Submit always uses the original problem testcases, never edited expected results. Submission requests use the server's camelCase testcase-count fields. Memory and percentile figures are no longer fabricated. Server history returns the latest 50 attempts for reopening.

Existing backend limitations: submission acceptance is client-reported; there is no server-side hidden-test judge. Therefore the interface calls these provided tests, not hidden tests. XP awarding was not added on top of this unverified judge. Real memory/percentile metrics are unavailable. Other languages continue to use their existing configured execution service. Community discussions are not implemented, so no dead Discussions tab is shown.

Validation: `node tests/coding-workspace.browser.cjs` checks Monaco, progressive hints, fullscreen/Escape, persisted code, execution, selected testcase, infinite-loop timeout, and mobile overflow. The Vite production build and scoped TypeScript check also pass.
