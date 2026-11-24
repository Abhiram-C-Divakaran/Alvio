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

### Planned password reset & email verification architecture (requires external email infrastructure)

Password reset and email verification are intentionally **not** mocked or simulated because secure delivery requires an external transactional email provider (SMTP/Resend/SES/Postmark):

- **Password reset**: Add a `password_reset_tokens(id, user_id, token_hash, expires_at, used_at)` table (15-minute TTL, SHA-256 hashed single-use token). `POST /api/auth/forgot-password` always returns a generic `200` response to prevent account enumeration, rate-limited by IP and email. `POST /api/auth/reset-password` validates the token inside a transaction, updates `users.password_hash`, marks `used_at`, and calls `revokeAllUserSessions(userId)`.
- **Email verification**: Add `email_verified_at TEXT` to `users` and an `email_verification_tokens` table (24-hour TTL, single-use hashed token). Verification links confirm ownership before enabling email-based recovery or notifications.

## Progress persistence

The `LearningProgress` model tracks topics, video position/speed/notes/watched seconds, quiz attempts and credited IDs, visualizer modules/steps/operations/exploration, and daily/weekly learning time. SQLite `learning_progress` stores one validated JSON snapshot per authenticated user with a monotonic revision and server timestamp.

All learning writes pass through `progressSync.ts` with a synchronous per-account `localStorage` fallback plus transactional IndexedDB cache. `PUT /api/progress` uses compare-and-swap revisions inside `BEGIN IMMEDIATE` transactions; a `409` conflict triggers a three-way merge against the last acknowledged cloud base.

## XP ledger and coding playground security

Permanent XP is exclusively owned by SQLite `users.xp` and audited in `xp_ledger` (`server/xpLedger.ts`). `/api/progress` always overwrites `authoritativeXp` from `users.xp`, and legacy `/api/activity` returns `410`.

- **Verified coding solves**: Inside `POST /api/problems/:problemId/submit`'s transaction, a signed-in user's first `Passed` verdict (`verified = 1`) atomically records `('problem_solved', problemId)` in `xp_ledger` and awards difficulty-based XP (`Easy: 25`, `Medium: 50`, `Hard: 100`). Subsequent passing submissions for the same problem are deduplicated by `UNIQUE(user_id, event_type, event_key)` and award `0` duplicate XP.
- **Validated learning events (`POST /api/learning/events`)**: Accepts strictly validated `lesson_completed` (canonical topic allowlist, `20 XP`), `visualizer_completed` (`completedSteps >= 3`, `operationsCount >= 1`, `15 XP`), `video_completed` (`15 XP`), and `quiz_completed` (validated counts, server-calculated up to `60 XP`). Client-supplied `xp`/`points` fields are ignored, duplicate `(user_id, event_type, event_key)` events award `0`, and self-reported learning events are capped at `150 XP` per rolling 24-hour window.
- **Ledger visibility**: `GET /api/xp/ledger` returns the signed-in user's authoritative XP, level, daily usage, and recent ledger entries strictly scoped to `req.userId`.

Coding `Run` executes editable test cases in browser Web Workers (JavaScript) or Paiza (non-JS languages). `POST /api/problems/:problemId/submit` ignores any client-supplied verdicts or test cases, rejects NUL bytes and concurrent duplicate in-flight submissions (`409 SUBMISSION_IN_PROGRESS`), loads the problem's provided test cases from SQLite, validates function and parameter identifiers (`isSafeIdentifier`), wraps user code with a per-run random 48-bit hex stdout marker, executes via Paiza (`server/submissionRunner.ts`), and computes `Passed`/`Failed`/`Error` (including structured `failedTestCase` metadata) on the server. Signed-in submissions, `problem_stats`, and first-time solve XP commit atomically in a single SQLite `BEGIN IMMEDIATE` transaction (`verified = 1`). Guest submissions use `optionalAuth` and never create fake accounts or history rows.

### Security limitations of Paiza.IO & future isolated hidden-test judge blueprint

Paiza.IO is appropriate for a practical college platform because Express never executes untrusted student code locally, but it has clear production boundaries:
1. **Shared external provider**: Execution availability, latency, compiler versions, and rate limits depend on `api.paiza.io`.
2. **Visible test cases only**: Provided test cases are stored in `problems.testCases` and returned to the editor; there is no secret hidden-test evaluation preventing hard-coded answers.
3. **Single-process harness**: Generated wrappers run inside the same process as user code (mitigated against casual stdout spoofing via random per-run markers, not OS-level isolation).
4. **No measured memory or percentile telemetry**: Resource usage metrics are not fabricated.

**Planned production judge architecture (future milestone):**
- Store hidden test cases in a separate `problem_hidden_tests` table never queried by `GET /api/problems/:id`.
- Enqueue submissions to a dedicated asynchronous worker service (not the web Express process).
- Execute each submission inside an ephemeral, unprivileged container/microVM (e.g. gVisor/Firecracker or rootless Docker/nsjail) with `--network=none`, read-only root filesystem, strict cgroups v2 CPU/RAM/PID/disk limits, and wall-clock kill timers.
- Keep the evaluator harness outside user-writable files, pass test inputs over stdin/pipes, and compare outputs strictly in the host/worker process.

## Backend reliability, API security, and operations

- **Liveness & readiness probes**: `GET /api/health` checks basic SQLite connectivity (`SELECT 1`); `GET /api/ready` verifies SQLite connectivity, applied `schema_migrations`, and loaded `problems` count (`200 ready` / `503 not_ready`) without leaking secrets.
- **Graceful shutdown**: `SIGINT` and `SIGTERM` close the HTTP listener, cleanly close the SQLite handle (WAL mode), and exit with a 5-second forced-exit failsafe.
- **Transactions & validation**: Multi-statement writes (submissions + `problem_stats` + `xp_ledger`, `like`/`dislike` interaction toggles, progress CAS writes, session rotation/revocation) run inside `BEGIN IMMEDIATE` / `COMMIT` / `ROLLBACK`. Unknown problem IDs return `404` before FK writes; non-object JSON payloads return `400`.
- **AI provider resilience**: `/api/chat` and `/api/visualizer` enforce 60s timeouts, disconnect cancellation, and a bounded single retry (`withTransientRetry`) for transient upstream 5xx or network errors before response headers are sent (never retrying 4xx/429/aborts).
- **Rate limits & headers**: Pluggable `RateLimitStore` (`server/security.ts`) supports fast in-memory quotas (default) or `RATE_LIMIT_STORE=sqlite` (atomic `rate_limits` table for restart-persistent / shared-SQLite single-host deployments). Multi-host horizontal deployments should supply a Redis-backed `RateLimitStore` and set `TRUST_PROXY=true`. Quotas guard signup (5/10m), login (10/10m), refresh (30/10m), profile updates (30/10m), feedback (20/10m), interactions (60/m), learning events (30/m), progress (120/m), submit (20/m), chat (25/m), and visualizer (12/m).
- **SQLite migrations & backup/recovery**: `server/migrations.ts` runs 6 numbered, transactional, idempotent migrations (`schema_migrations`), preserving existing user data on every upgrade. Online backups run via `npm run db:backup` (`server/backupDb.ts`), executing SQLite's WAL-safe atomic `VACUUM INTO` followed by `PRAGMA integrity_check`. Restore procedure: stop the Express process, copy the verified backup over `DATABASE_PATH` (removing stale `-wal`/`-shm` files), and restart.
- **CI pipeline**: `.github/workflows/ci.yml` runs lint, TypeScript typecheck, build, foundation & model tests, and Playwright Chromium browser suites on Node.js 24 with zero paid API dependencies.

## Frontend resilience

- Root and route-scoped React `ErrorBoundary` components (`src/components/ui/ErrorBoundary.tsx`) catch unexpected render or lazy-chunk failures and offer recovery actions without blank screens.
- `localStorage` access in `CodingWorkspace` and `ProfilePage` is wrapped in safe `try/catch` guards so restricted/full browser storage degrades gracefully.
- All TypeScript checks (`npx tsc -p tsconfig.app.json --noEmit`) and lint checks (`npm run lint`) pass with 0 errors.
