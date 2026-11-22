# Alvio — Viva Preparation Guide

30 likely college viva questions with clear, concise, technically accurate answers grounded in the actual Alvio codebase and [docs/final-verification-results.md](./final-verification-results.md).

---

### 1. What is Alvio and what problem does it solve?
Alvio is a full-stack web platform for learning Data Structures and Algorithms (DSA). Students normally switch between static textbooks, separate video websites, animation tools, quiz sites, and coding platforms. Alvio unifies interactive 2D/3D visualizations, bundled video lessons, configurable quizzes, cloud-synced progress tracking, a 472-problem multi-language Coding Playground with server-verified submissions, local PvP practice duels, and optional AI tutoring inside one workspace.

### 2. Why did you choose React for the frontend?
React lets us build modular, reusable, state-driven components for complex interactive pages like the split-pane Coding Playground, 3D visualizers, video player with notes, and quiz engine. Combined with `React.lazy` and `Suspense`, routes load on demand so the initial page remains fast.

### 3. Why did you use TypeScript instead of plain JavaScript?
TypeScript adds compile-time static typing across shared domain models such as `CodingProblem`, `LearningProgress`, `ExecutionResult`, and API request/response contracts. This catches mismatched property names, invalid status strings, and missing parameters early during development before they become runtime bugs.

### 4. What role does Vite play in Alvio?
Vite is our frontend build tool and development server. During development (`npm run dev`), Express mounts Vite in middleware mode so the React UI (with Hot Module Replacement) and `/api/*` endpoints share a single port. For production (`npm run build`), Vite bundles and code-splits the React client into `dist/` (built in ~2.79s), while `esbuild` bundles `server.ts` into `dist/server.cjs` (101.0 kb).

### 5. Why did you choose Express on the backend?
Express 5 provides a clean, lightweight middleware and routing layer for authentication, SQLite queries, cloud progress synchronization, server-verified coding submissions, and proxying external AI requests. Keeping verification logic and API keys (`JWT_SECRET`, `GROQ_API_KEY`) on Express establishes a clear client-server trust boundary.

### 6. Why did you use SQLite instead of PostgreSQL or MongoDB?
Node.js 24 includes built-in SQLite (`node:sqlite` / `DatabaseSync`), which requires zero external database server installation, stores all data in one portable file (`data/database.sqlite`), and supports ACID transactions, foreign keys, and Write-Ahead Logging (WAL). Because our data is relational (users, problems, submissions, stats, interactions), SQLite is reliable and effortless to run on any college demo machine.

### 7. How are database schema changes and problem seeding handled safely?
`server/migrations.ts` runs numbered, transactional migrations (`BEGIN IMMEDIATE` / `COMMIT`, rolling back on error) tracked in a `schema_migrations` table on startup. It inspects existing columns before altering tables, preserving existing accounts and submissions. To populate the 472 coding challenges on a fresh setup, we run `npx tsx server/migrateProblems.ts`, which invokes `server/db.ts` and `seedProblemCatalog()`.

### 8. How does user authentication work end-to-end in Alvio?
On signup (`POST /api/auth/signup`), Express normalizes the email, validates field lengths, hashes the password with `bcryptjs`, saves the user in SQLite, and returns a signed JWT. On login (`POST /api/auth/login`), Express compares the password against the stored hash with `bcrypt.compare` and issues a JWT. On the frontend, `AuthGuard` verifies the stored token via `GET /api/auth/me` before rendering protected pages and preserves deep links via a validated `next` parameter.

### 9. What is inside the JWT and how does `server/auth.ts` verify it?
Our JWT uses the `HS256` algorithm with `sub` set to the numeric user ID, `issuer: 'alvio'`, `audience: 'alvio-student'`, and a 7-day expiration. `server/auth.ts` requires an explicit `JWT_SECRET` environment variable of at least 32 characters (server startup fails without it—no hardcoded fallback). On every protected request, `requireAuth` verifies the signature, algorithm, issuer, audience, expiry, and checks SQLite to confirm the user account still exists.

### 10. Why do you hash passwords with bcrypt instead of encrypting them or using SHA-256?
Hashing is one-way, so plaintext passwords cannot be decrypted even if someone reads `database.sqlite`. Unlike fast cryptographic hashes such as SHA-256, `bcryptjs` is intentionally computationally slow and embeds a unique random salt per password, defending against rainbow-table and brute-force attacks.

### 11. What happens when a user's session expires or receives an HTTP 401 response?
All authenticated frontend requests pass through a single shared transport (`apiFetch` / `authenticatedFetch` in `authApi.ts`), which attaches bearer credentials only to same-origin `/api/` URLs. If any endpoint returns HTTP `401`, `apiFetch` invalidates that exact session, aborts in-flight fetches and SSE streams, clears visible progress state, and redirects the student back through `AuthGuard` to `/auth`.

### 12. How is client-side state managed with Zustand?
Zustand provides minimal, reactive global stores—primarily `useAuthStore` (authenticated user profile and bearer token) and `useProgressStore` (topic progress, video positions/notes, quiz attempts, visualizer metrics, and sync status). Unlike heavier state libraries, Zustand requires very little boilerplate and can be accessed cleanly from both React components and service modules like `apiFetch` and `progressSync`.

### 13. Why do you use IndexedDB on the client if SQLite already stores data on the server?
IndexedDB (`src/services/db.ts`, version 2, paired with a synchronous `localStorage` fallback) serves as an account-scoped offline cache in the browser. When a student watches a video, adds a note, or completes a quiz, the UI updates immediately and persists locally even if the network drops, then syncs to SQLite once connectivity is available. Version 2 also removed legacy credential/session stores so passwords are never stored locally.

### 14. How does cloud progress synchronization work, and how do you avoid overwriting concurrent edits?
`progressSync.ts` debounces routine progress writes for 2 seconds and flushes immediately on completion events, reconnects, visibility changes, or sign-out. Each user's `learning_progress` row has a numeric `revision`. When `PUT /api/progress` runs, Express checks that the submitted `revision` matches the database (compare-and-swap). If another tab or device saved newer data first, the server returns **HTTP `409 Conflict`** with the latest cloud snapshot, and the client performs a **three-way merge** (`mergeProgress.ts`) against its last acknowledged base—unioning completion sets, adding only unsynced counter deltas, and deduplicating quiz attempts by stable ID—before retrying.

### 15. How do you protect permanent account XP from being faked by the client?
Permanent account XP lives strictly in `users.xp` on the server. Whenever progress syncs via `/api/progress`, Express overwrites `authoritativeXp` with `users.xp` and never converts self-reported snapshot counters into trusted XP. Legacy client reward endpoints (`POST /api/activity`) explicitly return **HTTP `410 Gone`**.

### 16. How are the 3D visualizations built with Three.js, and why do they work offline?
We use Three.js through React Three Fiber (`@react-three/fiber`) and `@react-three/drei` to build interactive 3D scenes for data structures (such as Heaps, Trees, Arrays, Linked Lists, Stacks, Queues, Graphs) and sorting algorithms. Instead of downloading remote HDR environment maps, all scenes use local procedural `<Environment><Lightformer /></Environment>` lighting, so they render reliably with zero external network requests.

### 17. How is Monaco Editor integrated without breaking during offline demos?
We integrate `@monaco-editor/react` using locally bundled `monaco-editor` packages and a local Vite Web Worker (`src/services/monacoSetup.ts`). Bundling Monaco locally avoids external CDN failures while giving students syntax highlighting, line numbers, dark theme support, keyboard shortcuts, and per-problem/per-language auto-saved drafts.

### 18. How do the AI features communicate with Groq securely?
The browser never sees `GROQ_API_KEY`. Authenticated frontend requests call Express:
- `POST /api/chat` (rate-limited at 25/min per IP & account) enforces a server-side DSA tutor prompt (or a dedicated `'Mock Interview'` `tutorMode` for interviews), validates input bounds, and streams responses from Groq (`llama-3.3-70b-versatile`) back via Server-Sent Events (`text/event-stream`).
- `POST /api/visualizer` (rate-limited at 12/min per IP & account) requests structured JSON scenes (`openai/gpt-oss-120b` by default), validates and repairs the scene schema server-side, and returns renderable 2D/3D steps with synchronized code line numbers.

### 19. How does Mock Interview handle prompts, rubrics, and private scratch notes?
Mock Interview sends requests to `POST /api/chat` with `tutorMode: 'Mock Interview'` so Express preserves the interview persona and rubric evaluation prompt instead of overriding it with the standard DSA Tutor prompt, and parses the SSE stream cleanly in `useInterviewSession.ts`. Private scratch notes typed by the student stay purely in client state and are never transmitted to the backend or Groq API.

### 20. What happens if Groq API is unavailable or `GROQ_API_KEY` is not set during the demo?
Express returns a safe HTTP `500`/`502` error without exposing secrets or stack traces. AI Tutor, Mock Interview, and AI Visualizer display clean inline error alerts with a **Retry** button while keeping the user's typed text intact. Additionally, AI Visualizer automatically loads a built-in local **Linked List: Insertion** walkthrough so 2D/3D toggling, timeline scrubbing, and code-line highlighting still work completely offline.

### 21. What is the difference between "Run" and "Submit" in the Coding Playground?
**Run** (and **Run Testcase**) is for quick experimentation against editable or custom test cases: JavaScript runs locally in a browser Web Worker with a 3-second infinite-loop timeout, while the other six languages run via Paiza. Run never saves a submission or changes problem statistics. **Submit** (`POST /api/problems/:problemId/submit`) sends only `{ code, language }` to Express, evaluates the code against the authoritative test cases stored in SQLite, computes the verdict on the server, records signed-in attempts (`verified=1`), and updates `problem_stats`.

### 22. Why does the Express server never execute student code locally with `eval` or `child_process`?
Executing untrusted code inside the Node.js process or host shell would allow infinite loops to freeze the server or malicious code to read `.env`, corrupt `database.sqlite`, or compromise the host OS. Offloading execution to the external sandboxed Paiza.IO API keeps the Alvio backend isolated and safe.

### 23. How does `server/submissionRunner.ts` prevent students from spoofing a "Passed" verdict?
Two safeguards prevent spoofing:
1. Express ignores any client-supplied `status`, `passedCount`, `totalCount`, `runtimeMs`, or `testCases`—it loads test cases strictly from SQLite.
2. `submissionRunner.ts` embeds a fresh cryptographic random **nonce marker** (generated via `node:crypto` `randomBytes`) into each generated runner wrapper. Even if student code prints `"Passed"` to stdout, the server rejects output lacking that exact run's nonce.

### 24. Which languages are supported for coding execution, and how are unsupported types handled?
All seven workspace languages (**JavaScript, TypeScript, Python/Python 3, C++, C, Java, C#**) are wired into both Run and server-verified Submit via Paiza.IO (`POST /runners/create` + polling `GET /runners/get_details` with a 15-second timeout). JavaScript, TypeScript, and Python support all 472 problems. C++, Java, C#, and C handle standard primitive/array signatures and return an explicit `Unsupported` error on complex signatures (such as `TreeNode` or nullable integer arrays) rather than falsely reporting Passed.

### 25. What happens if Paiza.IO is unreachable during a Submit, and how does Guest Mode work?
If Paiza is unavailable, Express returns **HTTP `503`** (`status: 'Error'`, `errorType: 'provider'`, `saved: false`) so an outage is never misreported as Wrong Answer or corrupts `problem_stats`. For Guest Mode, `POST /api/problems/:problemId/submit` uses `optionalAuth`: unauthenticated requests still receive the full server-calculated verdict without creating fake accounts or DB rows, whereas invalid/expired supplied tokens are strictly rejected with HTTP `401`.

### 26. How does the PvP Coding Duel work without a WebSocket backend?
PvP Coding Duel uses the browser's native **`BroadcastChannel`** API to synchronize room codes, live opponent code previews, freeze power-ups, and victory events across two tabs in the same browser, and executes JavaScript submissions inside a dedicated Web Worker (`duelRunner.worker.ts` calling `executeJavaScriptInline()` directly with a 3-second timeout). We document it honestly as a local practice duel rather than an online multiplayer server.

### 27. How did you test the application thoroughly without paying for live AI or Paiza APIs?
Our unified verification script `npm run test:demo` runs completely locally using isolated temporary SQLite databases, disposable JWT secrets, and mocked Groq/Paiza providers:
- `oxlint`: **0 errors**; `npm run build`: clean Vite + `esbuild` output.
- `test:foundation` (`node:test`): **37/37 tests passed** (auth, headers, rate/body limits, migrations, progress conflict merge, optional auth, and all server-verified coding submission flows).
- `test:models` (`node:test`): **10/10 tests passed** across 7 files (including 480 heap operations).
- Playwright E2E browser suites: **13 test scripts passed**, including **128/128** desktop-to-mobile viewport × route checks and all major student workflows.

### 28. What key security measures are implemented across the Express API?
- Server-only `bcryptjs` password hashing and strict HS256 JWT verification (`JWT_SECRET >= 32` chars, issuer/audience/expiry + DB account existence check).
- Server-only AI credentials (`GROQ_API_KEY`) and 60-second abort/disconnect cancellation.
- Strict payload caps (`512 KB` body limit, `64 KB` code limit), schema validation, and prototype-pollution key rejection.
- Per-IP / per-account rate limits (e.g., login 10/10min, signup 5/10min, chat 25/min, visualizer 12/min, progress 120/min).
- Security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, scoped CSP) and mandatory `ALLOWED_ORIGINS` in production.

### 29. What are the honest limitations of Alvio as a college project?
- **No hidden-test container judge:** Server Submit checks the visible SQLite test cases through Paiza rather than a private Docker judge with hidden stress tests, and does not measure memory usage or runtime percentiles.
- **External API dependency:** Live AI features require `GROQ_API_KEY` + internet, and live multi-language Submit depends on Paiza.IO.
- **Local-only PvP & single-process backend:** PvP Duel uses `BroadcastChannel` (same browser), rate limits are stored in memory per process, and auth uses bearer tokens in browser storage without email password reset.
- **Legacy UI type diagnostics:** Running full `npx tsc -p tsconfig.app.json --noEmit` still flags pre-existing diagnostics in untouched older UI files (though `oxlint`, `vite build`, `esbuild`, and all tests pass with 0 errors).

### 30. If you had more time after college submission, what would you add next?
1. A containerized **Docker/Firecracker coding judge** with hidden test suites and real memory/CPU telemetry.
2. **WebSocket multiplayer** for real-time cross-device PvP coding duels.
3. **HttpOnly cookie sessions** with token refresh/revocation plus SMTP-backed email verification and password reset.
4. A **server-verified learning-event XP ledger** and instructor analytics dashboards for classroom deployment.
