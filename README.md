# Alvio

Alvio is an interactive platform for learning data structures and algorithms through lessons, 2D/3D visualizations, quizzes, coding practice, AI tutoring and mock interviews.

## Student experience

Sign in, explore lessons and visualizers, practice, and take quizzes. Learning progress restores from the authenticated server across sessions and devices; an account-scoped device cache retains offline changes. Tutor conversations and coding drafts remain device-local.

## Technology and architecture

React 19, TypeScript, React Router and Zustand power the interface. Three.js/React Three Fiber render visualizations; Monaco provides the code editor. Express 5 handles authentication, CSRF protection, API authorization, server-verified coding submissions and Groq AI requests. Node's built-in `node:sqlite` stores accounts, sessions, problems, submissions and learning progress; IndexedDB caches progress offline.

Read [docs/architecture.md](docs/architecture.md) for the session/cookie/CSRF lifecycle, account isolation, progress conflict resolution, API limits, coding submission trust and future isolated judge architecture, and [docs/deployment.md](docs/deployment.md) for production deployment, HTTPS reverse proxy, monitoring, and backup/restore runbooks. For presentation setup and fallback steps, see [docs/demo-runbook.md](docs/demo-runbook.md), [docs/project-presentation-outline.md](docs/project-presentation-outline.md), and [docs/viva-preparation.md](docs/viva-preparation.md).

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
| `RATE_LIMIT_STORE` | Optional (`memory` default or `sqlite` for restart-persistent / shared-SQLite rate limiting) |
| `RESEND_API_KEY` / `EMAIL_FROM` | Optional transactional email credentials for password reset & email verification (or use `EMAIL_WEBHOOK_URL` + `EMAIL_WEBHOOK_SECRET`) |
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

Set `NODE_ENV=production` in your process manager/environment for production. Configure `ALLOWED_ORIGINS`, HTTPS (`COOKIE_SECURE=true`, `TRUST_PROXY=true` behind a proxy), and persistent SQLite storage before deployment. Health and readiness probes can check `GET /api/health` (liveness) and `GET /api/ready` (schema + catalog readiness). Create verified online SQLite backups anytime with `npm run db:backup` (`VACUUM INTO` + `PRAGMA integrity_check`). `npm run preview` previews static assets only and does not replace the Express backend.

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

## Database, backup, and migration

SQLite migrations (8 numbered, transactional, repeatable migrations) run automatically on server startup and are tracked in `schema_migrations`. Existing accounts and learning records are preserved across upgrades, including `users.token_version`, `users.email_verified_at`, `auth_sessions` (`ON DELETE CASCADE`), `password_reset_tokens`, `email_verification_tokens`, `xp_ledger` (`ON DELETE CASCADE`, unique per `(user_id, event_type, event_key)`), `rate_limits`, and server-only `problem_hidden_tests` (`ON DELETE CASCADE`). Submissions, interactions, progress updates, XP awards, password resets, email confirmations, and session revocations execute inside explicit `BEGIN IMMEDIATE` transactions.

Create a WAL-safe online backup and verify integrity with:

```sh
npm run db:backup
```

Restore from a verified backup after stopping the server:

```sh
npm run db:restore -- <backupPath>
```

See [docs/deployment.md](docs/deployment.md) for full production deployment, HTTPS, monitoring, and recovery steps.

## Security and current limitations

- Passwords are hashed only on the server with bcrypt. All private APIs share session-backed JWT/cookie verification, account existence checks, and token-version checks.
- AI endpoints require authentication, enforce request limits, per-user/IP quotas, timeouts, disconnect cancellation, and a bounded single retry for transient upstream 5xx/network errors before headers are sent. Missing AI configuration returns an explicit unavailable response.
- **Server-authoritative XP ledger**: Permanent XP (`users.xp`) is awarded exclusively on the server via `xp_ledger` (`UNIQUE(user_id, event_type, event_key)`). Verified coding solves automatically award difficulty-based XP once per problem (`Easy: 25`, `Medium: 50`, `Hard: 100`). Validated learning milestones (`POST /api/learning/events`) ignore client XP fields, deduplicate strictly, and enforce a `150 XP/day` cap. Uploading forged `totalXp` or `authoritativeXp` via `PUT /api/progress` never modifies `users.xp`.
- Coding submissions are verified server-side against each problem's provided SQLite test cases using the external Paiza execution provider (`server/submissionRunner.ts`), with in-flight duplicate submission protection (`409 Conflict`), NUL-byte rejection, and structured `failedTestCase` reporting. Client-supplied verdicts and test cases are ignored, and Express never executes student code locally. There is no hidden-test LeetCode-style container judge or measured memory/percentiles. See [src/features/coding/WORKSPACE.md](src/features/coding/WORKSPACE.md) and [docs/architecture.md](docs/architecture.md) for limitations and the planned isolated judge architecture.
- **Password reset & email verification**: Backend endpoints (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/verify-email/request`, `POST /api/auth/verify-email/confirm`) and `/auth` UI flows use single-use SHA-256-hashed tokens with expiration and forced cross-device session revocation on password reset. Outbound delivery activates automatically when `RESEND_API_KEY` + `EMAIL_FROM` or `EMAIL_WEBHOOK_URL` is configured, and explicitly returns `503 EMAIL_NOT_CONFIGURED` otherwise (never simulated).
- Rate limiting defaults to in-memory per process and supports `RATE_LIMIT_STORE=sqlite` for restart-persistent / shared-SQLite single-host quotas. Multi-host horizontal deployments require a shared Redis store and `TRUST_PROXY=true` behind a reverse proxy.
- GitHub Actions CI (`.github/workflows/ci.yml`) runs lint, full TypeScript checks, production build, backend foundation tests, domain model tests, and Playwright Chromium regressions on pushes and pull requests without paid API keys.
- Tutor/interview histories, code drafts and visualizer sessions remain account-scoped on the device. Learning progress syncs to the server.

See [docs/architecture.md](docs/architecture.md) for precise boundaries and deployment requirements.
