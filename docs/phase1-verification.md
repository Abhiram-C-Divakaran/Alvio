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
