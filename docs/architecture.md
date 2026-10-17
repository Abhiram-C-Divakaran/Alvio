# Alvio backend foundation

```text
Browser → React → AppShell → Feature modules → Zustand
                                               ↓
                                      IndexedDB offline cache
                                               ↕
                                      Authenticated Express API
                                               ↓
                                             SQLite
```

## Authentication and session lifecycle

Express owns accounts and bcrypt password hashes in SQLite. Signup normalizes email and validates lengths; login uses the same normalization. `server/auth.ts` is the only JWT implementation. Its optional-auth helper permits omitted credentials only on intentionally public routes and rejects invalid supplied tokens; private routes continue to use requireAuth. Tokens use HS256, a numeric account ID in `sub`, issuer `alvio`, audience `alvio-student`, and a seven-day expiration. Every protected request also checks that the account still exists. `JWT_SECRET` must be explicitly configured with at least 32 characters; startup fails without it. There is no generated or hardcoded default.

The browser persists a bearer token and public account details through Zustand. It never stores passwords or password hashes. IndexedDB version 2 removes obsolete user/session stores while retaining learning progress. Unused AuthModal and its alternate authentication path are removed.

AuthGuard keeps private pages behind a bootstrap state. `/api/auth/me` verifies the persisted token, then progress initializes before rendering the application. Redirects retain pathname, query and hash in `next`; `authDestination` rejects external redirects. `/` and `/auth` stay public. When verification is unavailable, only a previously verified, unexpired session with an account cache can use cached learning offline. This is offline UI access, not proof of authorization to any server endpoint. Unknown sessions remain at a retry screen.

`authApi.ts` also exports authenticatedFetch as the shared apiFetch transport, without a second credential-handling implementation. `apiFetch` attaches credentials only to same-origin `/api/` requests. A 401 invalidates that exact session, aborts its outstanding fetches and streams, clears visible progress, and sends the user back through AuthGuard. `authApi.ts` centralizes signup, login and session lookup. Explicit sign-out waits up to three seconds for pending progress, then cancels progress work and unmounts private feature components; cached learning history remains available for later login. Requests from a previous account cannot update the new account's progress. Tutor/interview/quiz/visualizer histories, PvP sessions and coding drafts use account-specific keys. Non-sensitive layout preferences remain shared.

## Progress persistence

The existing LearningProgress model remains intact: topics, video position/speed/notes/watched seconds, quiz attempts and credited IDs, visualizer modules/steps/operations/exploration, and daily/weekly learning time. SQLite `learning_progress` stores one validated JSON snapshot per authenticated user, a revision and a server timestamp. GET/PUT `/api/progress` derive ownership from the JWT; a mismatched body owner is rejected. Input validation bounds nesting, maps, arrays, string lengths, numeric values and percentages. Bodies are limited to 512 KB.

All learning writes pass through `progressSync.ts`. A per-account synchronous localStorage fallback plus transactional IndexedDB cache retains a snapshot, its last acknowledged cloud base/revision, and a pending flag. Ordinary writes debounce for two seconds. Completions, navigation, focus, reconnect and page hide and visibility changes trigger an attempt; failed requests retain the pending snapshot and retry. Logout does not discard cached work. The sidebar exposes syncing, synced, unavailable and storage-error states, with a retry action. A closed tab cannot guarantee delivery; pending work resumes on the next authenticated visit.

PUT uses compare-and-swap revisions. A stale revision returns 409, never silently overwrites. The client refreshes and three-way merges against the acknowledged base. Unchanged fields follow cloud; concurrent cumulative counters add only unsynced local deltas. Completion/visited sets are unioned; playback position and preferences follow the newer snapshot and can decrease. Quiz attempts merge by stable ID, preventing replay rewards. Legacy caches without a common base use the newer snapshot's counters rather than adding two unknown totals. Completion/history records are retained. Clock skew can affect last-edit selection for preferences and notes; CAS still prevents blind overwrites. This snapshot protocol is not a collaborative text editor or an audited activity ledger.

## XP and coding trust

Permanent XP is exclusively `users.xp`. The progress endpoint always replaces `authoritativeXp` from that server record and never converts client `totalXp`, quiz scores or completed topics into trusted XP. Legacy practice values remain in the learning snapshot; the signed-in display uses permanent XP. Client `/api/activity` reward writes return 410. A future server-validated event ledger with unique event IDs is needed to award new permanent learning XP. Current learning statistics are self-reported, not examination evidence.

Coding Run/Submit may execute provided tests through browser workers or configured external execution providers. Express never evaluates student code. POST `/api/problems/:id/submit` accepts code/language and stores an **Unverified** attempt; client verdicts, runtime and passed counts cannot grant acceptance or XP. Older client-reported verdicts are also unverified after migration. Only `verified=1` submissions count toward solved totals. A future isolated judge must own hidden tests, execution limits and verdicts. PvP remains a local browser demo, not a secure competitive service.

## API security and operations

Chat and AI visualization require authentication. Shared in-memory limits apply by IP and account (chat 25/minute, visualizer 12/minute); login is 10/10 minutes and signup 5/10 minutes per IP. These limits are per process and reset on restart. Multi-instance deployments need a shared rate-limit store and appropriately configured trusted proxies; do not blindly trust forwarded IP headers.

AI messages, history and problem statements have limits before provider calls. Provider work aborts on disconnect and after 60 seconds, including visualizer repair attempts. Failures return safe messages with a consistent string `error` and optional `code`; structured logs include request ID, route, duration, status and account ID without credentials, student conversations or raw provider errors.

Production requires an explicit `ALLOWED_ORIGINS` list. Development also permits localhost origins. CORS is a browser control, not authorization. Security headers include nosniff, referrer policy, frame denial and a CSP with scoped external sources for fonts, Monaco and execution providers. Monaco/local teaching workers currently require evaluation permissions. Serve production over HTTPS. Secrets stay server-side. Password reset remains explicitly unavailable until real email/reset infrastructure exists.

`server/migrations.ts` applies numbered, transactional, repeatable migrations tracked in `schema_migrations`. It preserves existing users, adds missing profile columns, creates cloud progress, marks submission verification explicitly, and migrates progress ownership to an ON DELETE CASCADE foreign key without discarding snapshots. `DATABASE_PATH` defaults to `data/database.sqlite`; WAL and foreign keys are enabled. Back up the database with SQLite-aware tooling before deployment and retain a tested restore procedure. Use persistent storage; ephemeral hosting will lose accounts.

## Verification and remaining work

`npm run test:foundation` builds and tests JWT rejection/ownership, CORS/headers, rate and body limits, migrations, cloud conflicts, legacy migration, offline/interrupted sync, video/Heap restore, quiz idempotency, account switching and API 401 cleanup. `npm run test:auth-browser` uses standard Playwright Chromium and an isolated temporary database to exercise real login/deep-link protection. Tests do not call paid AI providers or use real student accounts. Existing feature tests remain alongside these tests; some older browser fixtures still assume unauthenticated pages and require migration.

Deployment follow-ups: verified learning rewards, isolated coding judge, password reset and email verification, token revocation/refresh and an HttpOnly-cookie session design, shared quotas, backups/monitoring and a full dependency/type-error cleanup. Bearer tokens in browser storage remain exposed to same-origin script compromise. This pass establishes consistent authorization and persistence; it does not claim those follow-ups are implemented.

Dependency audit after compatible updates: no high/critical findings; four low/moderate findings remain in the Monaco DOMPurify and Tailwind selector-parser dependency chains. Resolving these may require upstream updates or separate compatibility work. Re-run `npm audit` before deployment.

The obsolete `/api/generate-trace` endpoint and its unrouted page were removed. Active visualization uses `/api/visualizer`; shared scene types remain available independently of the retired page.
