# Alvio

Alvio is an interactive platform for learning data structures and algorithms through lessons, 2D/3D visualizations, quizzes, coding practice, AI tutoring and mock interviews.

## Student experience

Sign in, explore lessons and visualizers, practice, and take quizzes. Learning progress restores from the authenticated server across sessions and devices; an account-scoped device cache retains offline changes. Tutor conversations and coding drafts remain device-local.

## Technology and architecture

React 19, TypeScript, React Router and Zustand power the interface. Three.js/React Three Fiber render visualizations; Monaco provides the code editor. Express 5 handles authentication, CSRF protection, API authorization, server-verified coding submissions and Groq AI requests. Node's built-in `node:sqlite` stores accounts, sessions, problems, submissions and learning progress; IndexedDB caches progress offline.

Read [docs/architecture.md](docs/architecture.md) for the session/cookie/CSRF lifecycle, account isolation, progress conflict resolution, API limits, coding submission trust and future isolated judge architecture. For presentation setup and fallback steps, see [docs/demo-runbook.md](docs/demo-runbook.md), [docs/project-presentation-outline.md](docs/project-presentation-outline.md), and [docs/viva-preparation.md](docs/viva-preparation.md).

## Local setup

Use Node.js 24 and npm. Node's built-in SQLite (`node:sqlite`) is required.

```sh
npm install
```

Copy `.env.example` to `.env`, then explicitly configure `JWT_SECRET` with a private random value of at least 32 characters. Generate a value with your password manager or `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"` and place it in `.env`. Never commit it. Startup intentionally fails without a valid secret.

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Required private signing secret (min 32 chars); no fallback |
| `JWT_ACCESS_TTL` | Optional short-lived access JWT lifetime (default `15m`) |
| `JWT_REFRESH_DAYS` | Optional rotating refresh session window in days (default `7`, range `1–90`) |
| `COOKIE_SECURE` | Optional (`true`/`false`); set `true` behind HTTPS in production |
| `TRUST_PROXY` | Optional (`true`/`1`); enable when running behind a reverse proxy for HTTPS detection & rate-limit IP |
| `PORT` | HTTP port; example uses `3001`, server default `3000` |
| `ALLOWED_ORIGINS` | Comma-separated exact origins; mandatory in production |
| `DATABASE_PATH` | SQLite file; default `./data/database.sqlite` |
| `GROQ_API_KEY` | Server-only AI provider key; optional for non-AI learning |
| `GROQ_CHAT_MODEL` | Chat/interview model override (default `openai/gpt-oss-120b`) |
| `GROQ_VISUALIZER_MODEL` | Visualizer model override (default `openai/gpt-oss-120b`) |
| `PAIZA_API_KEY` | Optional external code runner key (defaults to `guest`) |
| `NODE_ENV` | Set `production` when serving the built app |

Seed the coding problem catalog once on a fresh database (runs SQLite migrations automatically and loads all 472 problems):

```sh
npx tsx server/migrateProblems.ts
```

```sh
npm run dev
```

Open http://localhost:3001 when using the example environment. Create an account through the public authentication page. Private routes require a verified session. Offline cached learning works for previously verified unexpired sessions; new logins require the server.

## Build and run

```sh
npm run build
npm start
```

Set `NODE_ENV=production` in your process manager/environment for production. Configure `ALLOWED_ORIGINS`, HTTPS (`COOKIE_SECURE=true`, `TRUST_PROXY=true` behind a proxy), and persistent SQLite storage before deployment. Health probes can check `GET /api/health`. `npm run preview` previews static assets only and does not replace the Express backend.

## Authentication and progress persistence

Express issues short-lived HS256 access tokens (`15m` default) backed by server-side `auth_sessions` rows and rotating opaque refresh tokens (`7d` default) stored as SHA-256 hashes in SQLite. Login and signup set HttpOnly `SameSite=Lax` cookies (`alvio_access`, `alvio_refresh`) alongside a double-submit `alvio_csrf` cookie, while continuing to support explicit `Authorization: Bearer` headers for API clients.

- **CSRF protection**: Cookie-authenticated mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) enforce allowed `Origin`/`Referer` checks and timing-safe `X-CSRF-Token` verification.
- **Session revocation**: `POST /api/auth/logout` revokes the current device session in SQLite and clears cookies. `POST /api/auth/logout-all` (available under Profile → Account Settings → **Sign out all devices**) increments `users.token_version` and revokes every active session across all devices.
- **Refresh rotation & replay protection**: `POST /api/auth/refresh` rotates the refresh token atomically; replaying an already-rotated or revoked refresh token revokes all sessions for the account.
- **Transparent client refresh**: Legitimately expired access tokens emit `X-Auth-Expired: 1` so `apiFetch` refreshes once and retries automatically; forged or revoked tokens never trigger refresh and return the user to `/auth`.

Progress updates immediately in Zustand, persists to IndexedDB, and syncs after a two-second debounce. Completion events and explicit sign-out trigger an immediate flush. Revision checks (CAS) and three-way reconciliation protect concurrent changes; pending offline edits survive later login. Permanent account XP cannot be increased by uploading a learning snapshot.

## AI services

`/api/chat` and `/api/visualizer` require authentication, enforce per-account/IP quotas and bounded inputs, and cancel provider work on timeout or disconnect. The unused `/api/generate-trace` API has been retired. Groq credentials stay on the server.

## Tests

Run the full verification suite (lint, production build, backend foundation/auth-hardening/reliability/submissions/AI tests, model/unit tests, and Playwright browser regressions — no paid API keys required):

```sh
npx tsc -p tsconfig.app.json --noEmit
npm run test:demo
```

Run the optional live Groq API smoke test (requires `GROQ_API_KEY` and outbound internet):

```sh
npm run test:ai-live
```

Or run individual suites:

```sh
npm run lint
npx tsc -p tsconfig.app.json --noEmit
npm run test:foundation
npm run test:submissions
npm run test:models
npx playwright install chromium
npm run test:auth-browser
npm run test:auth-regressions
npm run test:learning-browser
npm run test:practice-browser
```

All TypeScript diagnostics (`npx tsc -p tsconfig.app.json --noEmit`) and repository lint (`npm run lint`) pass with **0 errors**. Offline tests use temporary databases and disposable secrets and do not contact Groq or Paiza live. See [docs/phase1-verification.md](docs/phase1-verification.md) for full Phase 1 and Phase 2 verification logs.

## Database and migration

SQLite migrations (5 numbered, transactional, repeatable migrations) run automatically on server startup and are tracked in `schema_migrations`. Existing accounts and learning records are preserved across upgrades, including `users.token_version` and the `auth_sessions` table (`ON DELETE CASCADE`). Submissions, interactions, progress updates, and session revocations execute inside explicit `BEGIN IMMEDIATE` transactions. Back up the SQLite database using SQLite-aware tooling before deploying migrations.

## Security and current limitations

- Passwords are hashed only on the server with bcrypt. All private APIs share session-backed JWT/cookie verification, account existence checks, and token-version checks.
- AI endpoints require authentication and enforce request limits, per-user/IP quotas, timeouts and disconnect cancellation. Missing AI configuration returns an explicit unavailable response.
- Permanent XP is server-owned. Self-reported learning snapshots cannot increase account XP. A validated learning-event reward ledger is a follow-up.
- Coding submissions are verified server-side against each problem's provided SQLite test cases using the external Paiza execution provider (`server/submissionRunner.ts`). Client-supplied verdicts and test cases are ignored, and Express never executes student code locally. There is no hidden-test LeetCode-style container judge or measured memory/percentiles. See [src/features/coding/WORKSPACE.md](src/features/coding/WORKSPACE.md) and [docs/architecture.md](docs/architecture.md) for limitations and the planned isolated judge architecture.
- Password reset and email verification remain explicitly unavailable until transactional email (SMTP/API) infrastructure is configured. See [docs/architecture.md](docs/architecture.md) for the planned reset/verification design.
- Rate limits are in-memory per process. Multi-instance production deployments require a shared store (e.g. Redis) and `TRUST_PROXY=true` behind a reverse proxy.
- Tutor/interview histories, code drafts and visualizer sessions remain account-scoped on the device. Learning progress syncs to the server.

See [docs/architecture.md](docs/architecture.md) for precise boundaries and deployment requirements.
