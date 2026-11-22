# Authentication-only milestone verification

Date: 2026-10-17. Baseline: `8a85203`.

The supplied brief identifies `925c66b` as current, but authentication was already implemented in subsequent commits. This pass verifies that implementation and strengthens authenticated feature regression coverage. It does not add or change cloud progress, rewards, database architecture, a coding judge, or visual design.

## Architecture confirmed

- `server/auth.ts` owns signing, signature/expiry/issuer/audience verification, account existence checks, required and optional middleware. JWTs identify accounts through `sub`; JWT_SECRET has no fallback.
- Signup/login use normalized email and server-side bcrypt. `/api/auth/me` returns safe account fields. Private routes and both active AI APIs use shared middleware.
- `authApi.ts` and `api.ts` share transport and session-expiry behavior. Session bootstrap verifies the token before AuthGuard renders private pages. Redirects preserve pathname, query and hash, and reject external origins.
- IndexedDB is a learning cache, not a password/token issuer. The duplicate AuthModal and unused trace endpoint are already removed.
- Sign-out cancels authenticated work, clears identity and preserves local learning cache. Existing cloud-progress behavior remains untouched.

## Files changed

- `tests/auth-foundation.browser.ts`: explicit dashboard/profile guards and real profile sign-out, A-to-B account switching, external return-URL rejection and authenticated coding entry.
- `tests/auth.browser.cjs`: existing auth form regression now uses real disposable server accounts for successful signup/login.
- `tests/profile.browser.cjs`, `tests/coding-workspace.browser.cjs`, `tests/coding-language.browser.cjs`: portable authenticated fixtures; coding drafts use the account-scoped key.
- `tests/browser-runtime.cjs`: optional test-only catalog seeding into the disposable database for coding regressions.
- `package.json`: `test:auth-regressions` runs the auth/profile/coding browser checks.
- This report and README testing command.

## Results

PASS: production build; server TypeScript; changed-test lint; 18 server/auth/browser/destination tests; auth form UI; profile persistence/privacy/goals; coding Monaco/hints/fullscreen/drafts/local execution/timeout; eight language symbols and switching; 128 navigation/layout checks plus shell/search/mobile behavior; video, Tutor and AI Visualizer browser regressions; diff whitespace check.

PRE-EXISTING ISSUE: repository-wide lint fails on invalid UTF-8 in `temp.tsx` and syntax errors at `update_page.cjs:156–157`. Those files were not changed. The broader application TypeScript and legacy coding-runner issues remain recorded in `phase1-verification.md`; this auth-only pass changes no production TypeScript.

NEW REGRESSION: none observed.

## Limits

Provider responses in AI UI tests are mocked; no paid-model quality claim is made. Bearer tokens remain in browser storage; email verification, password reset, revocation/refresh, HttpOnly-cookie migration and shared multi-instance quotas are future work. Previously verified offline sessions may open cached learning UI, but all server requests still require server verification. Production deployment requires a private JWT_SECRET, allowed origins, HTTPS and persistent storage.
