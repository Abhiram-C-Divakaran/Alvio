# Phase 1 verification

Verified on 2026-10-16 against the previous commit, `925c66b`.

## Passing checks

- Production build: Vite frontend and bundled Express server. Existing large-chunk warnings remain.
- Server TypeScript check: `tsc --ignoreConfig --noEmit --module esnext --moduleResolution bundler --target es2023 --esModuleInterop --skipLibCheck server.ts`.
- 25 tests across backend authentication/security, browser login/deep links, progress synchronization, auth destinations, quiz/progress models, heap operations and visualizer progress.
- Navigation browser regression: 16 routes at eight viewport sizes (128 route/layout checks), persistent shell navigation, search, deep links and mobile drawer focus/inert behavior.
- Video regression: actual playback, speed, notes, completion/resume after reload, syllabus, code languages, AI failure handling and mobile layout.
- Tutor regression: streaming, prompts, Markdown/code, copy, feedback, history, tutor mode, safe retries and responsive layout.
- AI visualizer regression: playback/seek, code synchronization, hints, follow-up context, saved sessions, malformed responses/retries and responsive layout.
- Scoped lint of application/server code and the new or migrated browser/integration tests: no errors; existing unused-code warnings remain.
- `git diff --check`.

Browser checks use standard Playwright imports, disposable server-issued credentials and isolated SQLite databases. AI UI responses are mocked; authentication, validation and rate limits are tested against Express. No paid-provider availability or live model quality claim is made.

## Pre-existing failures

The previous commit was extracted into an ignored verification directory and checked using the same installed toolchain:

- Full application TypeScript remains failing: 115 distinct file/code/message diagnostics, versus 133 in the previous commit. Normalizing line positions shows **zero new diagnostics**. Remaining issues include unused code, existing component prop/type mismatches, Three.js extension typing and the Troika text configuration.
- Repository-wide `npm run lint` remains failing because tracked `temp.tsx` is not valid UTF-8. The baseline also reports syntax errors in the existing `update_page.cjs` maintenance script. These unrelated files were preserved.
- The existing dependency audit has four low/moderate findings in the Monaco/Tailwind dependency chains; no high/critical findings after compatible updates in this change.

## Introduced issues found and resolved

- Added shared auth response typing initially omitted the server XP field; corrected and checked against the baseline.
- Production CSP initially blocked Drei HDR asset redirects and Monaco stylesheet/font assets. Added their specific existing origins and reran navigation successfully. No visualizer rendering or layout redesign was needed.

## Operational boundaries

A configured private JWT_SECRET is mandatory. Production also requires ALLOWED_ORIGINS, HTTPS and persistent SQLite storage. Explicit sign-out attempts a cloud flush for up to three seconds; failed/offline writes remain in the account cache. Page-hide delivery is best effort, with pending writes restored on the next session.

Permanent XP remains server-owned, and coding attempts are unverified until a separate secure judge is implemented. Password reset/email verification, token revocation/refresh, distributed quotas and a verified learning-event reward ledger remain later milestones.

## Milestone re-audit — 2026-10-17

The new brief references `925c66b`; current baseline `d051c28` already implements the authentication and cloud-progress foundation. This follow-up removed the unused `/api/generate-trace` route and unrouted legacy page. Shared scene types were extracted without changing rendering, AppShell, or navigation.

PASS: production build, server TypeScript, scoped lint, 26 foundation/auth/progress/model tests, three targeted scene relationship/replay tests, 128 navigation/layout checks, shell/search/mobile navigation, video playback/resume, AI Tutor and AI Visualizer browser regressions. Retired endpoint requests return 404 for both anonymous and authenticated callers.

FAIL — caused by this change: none observed.

PRE-EXISTING FAILURE: repository lint still reports the invalid UTF-8 `temp.tsx` and syntax errors in `update_page.cjs`. App TypeScript still has the same 115 distinct diagnostics as the previous verification, with no additions. The optional full `review-fixes.test.mjs` suite has two coding-runner failures (missing browser Worker in Node and a remote-runner fixture mismatch); both reproduce on unchanged `d051c28`. Its scene relationship, matrix and replay checks pass.

AI browser tests mock provider responses; live Groq output was not tested. The existing progress-store integration checks exercise Heap, quiz and video cloud restoration and account isolation; browser video checks additionally exercise real playback.

## Foundation completion audit — 2026-10-17

Baseline: `0dea775`. The brief's references to unprotected routes, browser password hashing, missing cloud progress and the Vite README describe the older `925c66b` snapshot. Those issues are already resolved by the committed foundation.

This pass adds the requested optional-auth middleware and shared authenticatedFetch export. Optional auth delegates to the same JWT verifier and rejects invalid supplied credentials; no private route was changed to optional authentication. New tests cover missing/malformed credentials, valid optional authentication, and an actual account deletion invalidating a previously valid JWT. The normal foundation test command includes these tests.

PASS: production build; server TypeScript; changed-file lint; all 28 foundation/auth/progress/model tests; all 128 navigation/layout checks and shell interactions; video, AI Tutor and AI Visualizer browser regressions; diff whitespace checks. No visual design, AppShell, navigation or learning-model change was made.

NEW REGRESSION: none observed.

PRE-EXISTING ISSUE: full lint fails on `temp.tsx` encoding and `update_page.cjs` syntax. Full application TypeScript still reports the same 115 distinct diagnostics, with zero additions. Existing deployment limitations and the earlier legacy coding-runner test failures remain documented above. Paid AI output was mocked in browser tests, not live-provider validated.

## Final College Demo Readiness Audit — 2026-11-22

Baseline: `efc3220` (server-verified coding submissions).

### Updates verified in this pass

- **Coding submissions are now server-verified**: `POST /api/problems/:problemId/submit` loads each problem's provided test cases from SQLite, executes submitted code through the external Paiza provider (`server/submissionRunner.ts`), computes authoritative `Passed` / `Failed` / `Error` verdicts, records signed-in attempts (`verified=1`), updates `problem_stats` only from server verdicts, and supports Guest Mode via `optionalAuth`. Earlier statements describing submissions as unverified are superseded.
- **Offline/CDN resilience fixes**:
  - Replaced external HDR `<Environment preset="city" | "night" />` network fetches in `Visualization3D.tsx`, `AnimatedGenerativeVisualizer.tsx`, `SkillTreeMap.tsx`, and `AlgorithmsWorkspace.tsx` with local procedural `<Lightformer>` environments so 3D scenes do not crash when offline or when external HDR CDNs fail.
  - Added shared bundled Monaco loader setup (`src/services/monacoSetup.ts`) to `DataStructurePageLayout.tsx`, `AlgorithmPageLayout.tsx`, `AnimatedGenerativeVisualizer.tsx`, and `WorkspacePage.tsx` so learn pages do not depend on `cdn.jsdelivr.net` or throw unhandled script-load rejections offline.
  - Fixed `CodingWorkspace.tsx` `runAiAnalysis` to parse `/api/chat` Server-Sent Events (`text/event-stream`) and display clean fallback text when AI is unavailable.
- **Repository cleanup**: Removed obsolete, unreferenced `temp.tsx` (invalid UTF-8) and `update_page.cjs` (syntax errors targeting a retired file path). Repository-wide `npm run lint` now passes with **0 errors**.
- **Test coverage & unified demo script**: Migrated `tests/quiz.browser.cjs`, `tests/progress.browser.cjs`, and `tests/pvp.browser.cjs` to isolated authenticated `browser-runtime.cjs` fixtures, added server-Submit and Submission History verification to `tests/coding-workspace.browser.cjs`, and added `npm run test:demo` plus `docs/demo-runbook.md`.

### Remaining known issues (honest scope boundaries)

- Full application TypeScript check (`npx tsc -p tsconfig.app.json --noEmit`) still reports pre-existing legacy diagnostics in untouched files; Vite production build and `esbuild` server bundle succeed cleanly.
- Coding Playground evaluates only provided/visible SQLite test cases via Paiza (no hidden-test LeetCode judge, Docker sandbox, or measured memory/percentiles).
- Live Groq AI and live Paiza APIs are mocked in automated tests and require network access / `GROQ_API_KEY` during live demos (offline fallback documented in `docs/demo-runbook.md`).
- Legacy `tests/review-fixes.test.mjs` still has two Node-environment coding-runner assertions that assume browser `Worker`/`window` globals.

