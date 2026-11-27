# Alvio Architecture & Security Design

```text
Browser → React 19 (ErrorBoundary) → AppShell → Feature modules → Zustand
                                                                    ↓
                                                           IndexedDB offline cache
                                                                    ↕
                                         Authenticated Express 5 API (Cookies/Bearer + CSRF)
                                                                    ↓
                                                          SQLite (WAL + Transactions)
```

## Authentication and session lifecycle

Express owns accounts and bcrypt password hashes in SQLite. Signup normalizes email and validates lengths; login uses the same normalization. `server/auth.ts` is the sole authentication, cookie, and CSRF implementation.

- **Session-backed JWTs & rotating refresh tokens**:
  - `POST /api/auth/signup` and `POST /api/auth/login` create a server-side session record in `auth_sessions` (`id`, `user_id`, `refresh_token_hash`, `user_agent`, `expires_at`, `revoked_at`, `created_at`, `last_used_at`).
  - Access JWTs use HS256 with numeric `sub`, `jti` (session ID), `ver` (`users.token_version`), issuer `alvio`, audience `alvio-student`, and a short expiration (`JWT_ACCESS_TTL`, default `15m`).
  - Refresh tokens are opaque (`<sessionId>.<256-bit-random>`), stored only as SHA-256 hashes in SQLite (`JWT_REFRESH_DAYS`, default `7` days).
  - `JWT_SECRET` must be explicitly configured with at least 32 characters; startup fails without it.
- **HttpOnly cookies + Bearer coexistence**:
  - Login, signup, and refresh set `alvio_access` (`HttpOnly`, `SameSite=Lax`, `Path=/api`), `alvio_refresh` (`HttpOnly`, `SameSite=Lax`, `Path=/api/auth`), and `alvio_csrf` (`SameSite=Lax`, `Path=/`). `Secure` is enabled automatically on HTTPS requests or when `COOKIE_SECURE=true`.
  - `requireAuth` and `optionalAuth` accept either an explicit `Authorization: Bearer <token>` header or the `alvio_access` HttpOnly cookie. Supplied invalid credentials never fall back to cookies or anonymous access.
  - Every authenticated request verifies signature, expiry, account existence, `users.token_version`, and that the `auth_sessions` row is neither revoked nor expired.
- **CSRF protection**:
  - `csrfProtection(allowedOrigins)` guards cookie-authenticated state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) by enforcing allowed `Origin`/`Referer` headers and timing-safe double-submit matching between the `alvio_csrf` cookie and `X-CSRF-Token` header.
  - Requests carrying an explicit `Authorization: Bearer` header are immune to ambient browser CSRF and bypass cookie double-submit checks.
- **Token refresh & replay detection**:
  - When an authentic, non-revoked access JWT expires, `requireAuth` returns `401` with `code: 'TOKEN_EXPIRED'` and `X-Auth-Expired: 1`. Forged or revoked tokens return `UNAUTHORIZED` or `SESSION_REVOKED` without `X-Auth-Expired`, ensuring `apiFetch` never silently refreshes a forged or revoked session.
  - `POST /api/auth/refresh` atomically rotates the refresh token in a SQLite transaction. If an already-rotated or revoked refresh token is replayed, the server revokes all sessions for that account (`revokeAllUserSessions`) and clears cookies.
- **Revocation & multi-device isolation**:
  - `POST /api/auth/logout` revokes only the current session in SQLite and clears cookies, leaving other devices signed in.
  - `POST /api/auth/logout-all` increments `users.token_version` and marks every active `auth_sessions` row for the user revoked inside a transaction, immediately invalidating all devices.
- **Client bootstrap & offline cache**:
  - `AuthGuard` keeps private pages behind `bootstrapSession()`, which verifies `/api/auth/me` (or refreshes a cookie-only session via `/api/auth/refresh` when `alvio_csrf` is present) before mounting private routes.
  - When the backend is unreachable, only a previously verified, unexpired session with an account-scoped progress cache can open offline cached learning UI.
  - Explicit sign-out flushes pending progress (up to 3 seconds), calls `/api/auth/logout` best-effort, cancels in-flight requests, and clears visible account state while preserving device-local progress cache for future sign-in.

### Password reset & email verification (`server/authRecovery.ts`)

Both workflows are implemented end-to-end using SQLite Migration #7 (`users.email_verified_at`, `password_reset_tokens`, `email_verification_tokens`) and a pluggable `EmailSender` transport (never simulated when unconfigured):

- **Transport configuration**: Automatically enables real outbound delivery when `RESEND_API_KEY` + `EMAIL_FROM` or `EMAIL_WEBHOOK_URL` (+ optional `EMAIL_WEBHOOK_SECRET`) is configured. Without a configured provider, request endpoints explicitly return `503 EMAIL_NOT_CONFIGURED`.
- **Password reset**: `POST /api/auth/forgot-password` (rate-limited, anti-enumeration generic `200`) creates a single-use 15-minute SHA-256-hashed token and sends `/auth?mode=login&resetToken=...`. `POST /api/auth/reset-password` validates token hash/expiry/unused state inside `BEGIN IMMEDIATE`, updates bcrypt `password_hash`, marks `used_at`, increments `users.token_version`, revokes all active `auth_sessions`, and clears cookies.
- **Email verification**: `POST /api/auth/verify-email/request` (`requireAuth`, rate-limited) issues a single-use 24-hour SHA-256-hashed token; `POST /api/auth/verify-email/confirm` atomically marks `users.email_verified_at` and `used_at`. `publicUser()` exposes `emailVerified`.

## Progress persistence

The `LearningProgress` model tracks topics, video position/speed/notes/watched seconds, quiz attempts and credited IDs, visualizer modules/steps/operations/exploration, and daily/weekly learning time. SQLite `learning_progress` stores one validated JSON snapshot per authenticated user with a monotonic revision and server timestamp.

All learning writes pass through `progressSync.ts` with a synchronous per-account `localStorage` fallback plus transactional IndexedDB cache. `PUT /api/progress` uses compare-and-swap revisions inside `BEGIN IMMEDIATE` transactions; a `409` conflict triggers a three-way merge against the last acknowledged cloud base.

## XP ledger and coding playground security

Permanent XP is exclusively owned by SQLite `users.xp` and audited in `xp_ledger` (`server/xpLedger.ts`). `/api/progress` always overwrites `authoritativeXp` from `users.xp`, and legacy `/api/activity` returns `410`.

- **Verified coding solves**: Inside `POST /api/problems/:problemId/submit`'s transaction, a signed-in user's first `Passed` verdict (`verified = 1`) atomically records `('problem_solved', problemId)` in `xp_ledger` and awards difficulty-based XP (`Easy: 25`, `Medium: 50`, `Hard: 100`). Subsequent passing submissions for the same problem are deduplicated by `UNIQUE(user_id, event_type, event_key)` and award `0` duplicate XP.
- **Validated learning events (`POST /api/learning/events`)**: Accepts strictly validated `lesson_completed` (canonical topic allowlist, `20 XP`), `visualizer_completed` (`completedSteps >= 3`, `operationsCount >= 1`, `15 XP`), `video_completed` (`15 XP`), and `quiz_completed` (validated counts, server-calculated up to `60 XP`). Client-supplied `xp`/`points` fields are ignored, duplicate `(user_id, event_type, event_key)` events award `0`, and self-reported learning events are capped at `150 XP` per rolling 24-hour window.
- **Ledger visibility**: `GET /api/xp/ledger` returns the signed-in user's authoritative XP, level, daily usage, and recent ledger entries strictly scoped to `req.userId`.

Coding `Run` executes editable test cases in browser Web Workers (JavaScript) or Paiza (non-JS languages). `POST /api/problems/:problemId/submit` ignores any client-supplied verdicts or test cases, rejects NUL bytes and concurrent duplicate in-flight submissions (`409 SUBMISSION_IN_PROGRESS`), loads and validates visible test cases from SQLite plus server-only hidden cases from `problem_hidden_tests` (Migration #8, seeded idempotently via `server/seedHiddenTests.ts` for 384 problems with 1,636 oracle-verified cases, never returned by `GET /api/problems` or `GET /api/problems/:id`), validates function and parameter identifiers (`isSafeIdentifier`), wraps user code with a per-run random 48-bit hex stdout marker, and evaluates visible and hidden phases in **separate isolated invocations** (Container 1 receives ONLY visible cases; Container 2 runs hidden cases only after visible cases pass, and its stdout, stderr, and exception messages are never returned to the browser). Server verdicts classify `accepted`, `wrong_answer`, `compilation_error`, `runtime_error`, `time_limit_exceeded`, `memory_limit_exceeded`, `provider_unavailable`, and `unsupported`. Signed-in submissions, `problem_stats`, and first-time solve XP commit atomically in a single SQLite `BEGIN IMMEDIATE` transaction (`verified = 1`). Guest submissions use `optionalAuth` and never create fake accounts or history rows.

### Judge Execution Providers (`JUDGE_PROVIDER=paiza` vs `JUDGE_PROVIDER=isolated`)

Express never executes student code in-process. Two providers are supported in `server/submissionRunner.ts`:

1. **`JUDGE_PROVIDER=paiza` (default fallback)**: Delegates execution to external `api.paiza.io`. Appropriate until a dedicated Linux judge host is deployed; subject to third-party availability and rate limits.
2. **`JUDGE_PROVIDER=isolated` (Phase 3 standalone container worker in `judge-worker/`)**: Sends authenticated (`ISOLATED_JUDGE_TOKEN`, timing-safe Bearer check) execution requests to `judge-worker/server.ts`, which spawns one ephemeral container per job with `--rm`, `--network=none`, `--read-only`, size-capped `--tmpfs`, `--cap-drop=ALL`, `--security-opt=no-new-privileges:true`, `--pids-limit=64`, `--memory`/`--memory-swap`, `--cpus=1`, `--user=65534:65534`, in-container `ulimit -t`/`-f`, zero bind mounts, stripped host env, forced `docker rm -f` on timeout/overflow/disconnect, and fail-closed HTTP `503` on daemon or missing-image failure. Supports all 7 languages (`node:22-alpine`, `python:3.12-alpine`, `gcc:14-bookworm`, `eclipse-temurin:21-jdk-alpine`, `mono:6.12`).

**Remaining isolation boundaries:**
- Mounting `/var/run/docker.sock` gives `judge-worker` root-equivalent Docker control on its host, so the worker **must** run on a dedicated isolated VM separate from Express and databases.
- Standard Docker (`runc`) shares the host Linux kernel and does not defeat every kernel escape; untrusted public workloads should enable **gVisor (`JUDGE_DOCKER_RUNTIME=runsc`)**, **Kata Containers**, or **Firecracker microVMs**.
- Curated server-only hidden tests cover **384 of 472** coding problems (**1,636 independently oracle-verified hidden cases**, `81.36%` overall / `100%` of cleanly verifiable problems; Easy `177/185` [95.68%], Medium `155/212` [73.11%], Hard `52/75` [69.33%]; auditable via `npm run db:hidden-coverage -- --text`). The remaining **88** catalog problems are explicitly catalogued in `server/hiddenTests/manualReview.ts` and [docs/hidden-test-coverage.md](hidden-test-coverage.md) (51 corrupted/comma-stripped visible tests, 15 unordered multi-output comparators, 9 float signature/tolerance mismatches, 9 ambiguous/mismatched specs, 3 unsupported `TreeNode` signatures, 1 missing oracle API) rather than fabricating expected outputs. Memory/runtime percentile telemetry is not fabricated.

## Backend reliability, API security, and operations

- **Liveness & readiness probes**: `GET /api/health` checks basic SQLite connectivity (`SELECT 1`); `GET /api/ready` verifies SQLite connectivity, applied `schema_migrations`, and loaded `problems` count (`200 ready` / `503 not_ready`) without leaking secrets.
- **Graceful shutdown**: `SIGINT` and `SIGTERM` close the HTTP listener, cleanly close the SQLite handle (WAL mode), and exit with a 5-second forced-exit failsafe.
- **Transactions & validation**: Multi-statement writes (submissions + `problem_stats` + `xp_ledger`, `like`/`dislike` interaction toggles, progress CAS writes, session rotation/revocation) run inside `BEGIN IMMEDIATE` / `COMMIT` / `ROLLBACK`. Unknown problem IDs return `404` before FK writes; non-object JSON payloads return `400`.
- **AI provider resilience**: `/api/chat` and `/api/visualizer` enforce 60s timeouts, disconnect cancellation, and a bounded single retry (`withTransientRetry`) for transient upstream 5xx or network errors before response headers are sent (never retrying 4xx/429/aborts).
- **Rate limits & headers**: Pluggable `RateLimitStore` (`server/security.ts`) supports fast in-memory quotas (default) or `RATE_LIMIT_STORE=sqlite` (atomic `rate_limits` table for restart-persistent / shared-SQLite single-host deployments). Multi-host horizontal deployments should supply a Redis-backed `RateLimitStore` and set `TRUST_PROXY=true`. Quotas guard signup (5/10m), login (10/10m), refresh (30/10m), profile updates (30/10m), feedback (20/10m), interactions (60/m), learning events (30/m), progress (120/m), submit (20/m), chat (25/m), and visualizer (12/m).
- **SQLite migrations & backup/recovery**: `server/migrations.ts` runs 9 numbered, transactional, idempotent migrations (`schema_migrations`, including Migration #9 read-path indexes on `user_submissions`, `user_activity`, and `problem_feedback`), preserving existing user data on every upgrade. Online backups run via `npm run db:backup` (`server/backupDb.ts`), executing SQLite's WAL-safe atomic `VACUUM INTO` followed by `PRAGMA integrity_check`. Tested recovery runs via `npm run db:restore -- <backupPath>` (verifies backup integrity first, cleans stale `-wal`/`-shm` sidecars, and atomically replaces `DATABASE_PATH`). See [docs/deployment.md](deployment.md).
- **CI pipeline**: `.github/workflows/ci.yml` runs lint, TypeScript typecheck, build, foundation & model tests, and Playwright Chromium browser suites on Node.js 24 with zero paid API dependencies.

## Frontend resilience

- Root and route-scoped React `ErrorBoundary` components (`src/components/ui/ErrorBoundary.tsx`) catch unexpected render or lazy-chunk failures and offer recovery actions without blank screens.
- `localStorage` access in `CodingWorkspace` and `ProfilePage` is wrapped in safe `try/catch` guards so restricted/full browser storage degrades gracefully.
- All TypeScript checks (`npx tsc -p tsconfig.app.json --noEmit`) and lint checks (`npm run lint`) pass with 0 errors.
