# Alvio — Viva Preparation Guide

25 likely college viva questions with clear, concise answers grounded in the actual Alvio codebase.

---

### 1. What is Alvio and what problem does it solve?
Alvio is a full-stack web platform for learning Data Structures and Algorithms (DSA). Students normally have to switch between static notes, separate visualization sites, quiz tools, and coding platforms. Alvio combines interactive 2D/3D visualizations, bundled video lessons, quizzes, cloud-synced progress tracking, a multi-language coding playground with server-verified submissions, PvP practice duels, and AI tutoring in one interface.

### 2. Why did you choose React and TypeScript for the frontend?
React lets us build reusable, state-driven UI components for complex workspaces like the Coding Playground, 3D visualizers, and quizzes. TypeScript adds compile-time type checking on shared data models (such as `CodingProblem`, `LearningProgress`, and `ExecutionResult`), which helps catch interface mismatches early during development.

### 3. What role does Vite play in this project?
Vite is our frontend build tool and development server. During development (`npm run dev`), Express mounts Vite in middleware mode for fast Hot Module Replacement on a single port. For production (`npm run build`), Vite bundles and code-splits the React app into `dist/`, while `esbuild` bundles `server.ts` into `dist/server.cjs`.

### 4. Why did you use Express on the backend?
Express provides a lightweight, easy-to-understand REST API layer for authentication, SQLite database access, learning progress synchronization, coding submission verification, and proxying AI requests. Putting AI and execution provider calls behind Express keeps API keys and verification logic off the client.

### 5. Why SQLite instead of PostgreSQL or MongoDB?
For a college project, Node.js 24's built-in `node:sqlite` (`DatabaseSync`) requires zero external database server setup, stores everything in a single portable file (`data/database.sqlite`), and supports foreign keys, WAL mode, and ACID transactions. Our schema is relational (users, problems, submissions, stats, interactions), so SQLite fits cleanly and runs reliably on any demo machine.

### 6. How are database schema updates handled safely?
`server/migrations.ts` runs numbered, transactional migrations tracked in a `schema_migrations` table on startup. Each migration runs inside `BEGIN IMMEDIATE` / `COMMIT` (with rollback on error) and checks existing columns before altering tables, so restarting the server never wipes existing accounts or submissions.

### 7. How does authentication work in Alvio?
When a student signs up (`POST /api/auth/signup`), Express normalizes the email, validates field lengths, hashes the password with `bcryptjs` (cost factor 10), and stores only the hash in SQLite. On login (`POST /api/auth/login`), Express verifies the password with `bcrypt.compare` and issues a signed JWT. Every protected API route validates that JWT via `requireAuth` in `server/auth.ts`.

### 8. What is inside the JWT and how do you verify it?
Our JWT uses HS256 with `sub` set to the numeric user ID, `issuer: 'alvio'`, `audience: 'alvio-student'`, and a 7-day expiry. `server/auth.ts` verifies the signature, algorithm, issuer, audience, and expiry using the mandatory `JWT_SECRET` environment variable (minimum 32 characters, no fallback), and also checks SQLite to confirm the user account still exists.

### 9. Why do you hash passwords with bcrypt instead of encrypting or using SHA-256?
Hashing is one-way, so even if the database file is read, plain passwords cannot be recovered. Unlike fast hashes like SHA-256, `bcryptjs` is intentionally slow and includes a unique random salt per password, protecting against rainbow-table and brute-force attacks.

### 10. How is client-side state managed with Zustand?
Zustand manages lightweight global stores such as `useAuthStore` (user session and token) and `useProgressStore` (learning progress, video lessons, quiz mastery, and sync status). It avoids boilerplate while allowing both React components and helper services (`apiFetch`, `progressSync`) to read and update state cleanly.

### 11. Why did you use IndexedDB in addition to SQLite?
IndexedDB (via `src/services/db.ts` and `progressSync.ts`) acts as an account-scoped offline cache in the browser. Progress updates happen immediately in the UI and persist locally even if the network drops, then sync to SQLite in the background when connectivity returns.

### 12. How does cloud progress synchronization prevent overwriting data across tabs or devices?
Each user's `learning_progress` row stores a numeric `revision`. When the client sends `PUT /api/progress`, the server checks that the submitted `revision` matches the current DB revision (compare-and-swap). If another session saved newer data, the server returns HTTP `409 Conflict` with the latest cloud snapshot, and the client performs a three-way merge (`mergeProgress.ts`) against the last acknowledged base before retrying.

### 13. How are the 3D visualizations built with Three.js?
We use Three.js through React Three Fiber (`@react-three/fiber`) and `@react-three/drei` to render interactive 3D arrays, linked lists, trees, graphs, heaps, and sorting algorithms. All 3D scenes use local procedural `<Environment><Lightformer /></Environment>` lighting instead of external HDR files, so they work smoothly even completely offline.

### 14. How is Monaco Editor integrated into Alvio?
We use `@monaco-editor/react` configured with bundled local `monaco-editor` packages and a local Vite Web Worker (`src/services/monacoSetup.ts` and `CodingWorkspace.tsx`). Bundling Monaco locally avoids external CDN failures during offline demos while providing syntax highlighting, line numbers, themes, and keyboard shortcuts.

### 15. How do the AI features communicate with the backend?
The frontend never holds `GROQ_API_KEY`. Instead, it sends authenticated requests to Express:
- `POST /api/chat` enforces a server-side DSA tutor system prompt, validates message lengths, and streams responses from Groq (`llama-3.3-70b-versatile`) back to the browser as Server-Sent Events (`text/event-stream`).
- `POST /api/visualizer` validates problem statements, requests structured JSON visualization scenes from Groq, validates/repairs the schema server-side, and returns renderable 2D/3D steps.

### 16. What happens if Groq API is unavailable or `GROQ_API_KEY` is missing during a demo?
The backend returns a safe HTTP 500/502 error without leaking secrets or stack traces. AI Tutor, Video Ask-AI, Mock Interview, and AI Visualizer display clean inline error alerts with a **Retry** button, preserve the student's typed text, and never crash the page. AI Visualizer also loads a built-in default Linked List walkthrough locally.

### 17. How does Coding Playground "Run" differ from "Submit"?
**Run** is for quick local testing against editable or custom test cases (JavaScript executes in a browser Web Worker with a 3-second timeout; other languages use Paiza) and does not alter submission history or problem statistics. **Submit** sends only `{ code, language }` to `POST /api/problems/:problemId/submit`, where the server loads the problem's authoritative test cases from SQLite, executes the code externally, calculates the verdict, updates `problem_stats`, and records the submission for signed-in users.

### 18. Why does the server never run student code directly with `eval` or `child_process`?
Executing untrusted student code directly inside the Node.js Express process would allow infinite loops to freeze the server or malicious code to read `.env`, modify `database.sqlite`, or access the host machine. Delegating execution to an external sandboxed provider (Paiza) keeps the Alvio server isolated and safe.

### 19. How does the server prevent a student from faking a "Passed" submission?
First, `POST /api/problems/:problemId/submit` ignores any client-supplied `status`, `passedCount`, `totalCount`, `runtimeMs`, or `testCases` fields—it reads test cases only from SQLite. Second, `server/submissionRunner.ts` embeds a unique random nonce marker into each generated runner script, so even if student code prints `"Passed|5"` to stdout, the server rejects output without that exact run's marker.

### 20. Which programming languages work for server-verified Submit, and how does Paiza execute them?
JavaScript, TypeScript, Python/Python 3, C++, C, Java, and C# all run via the Paiza.IO API (`POST /runners/create` followed by polling `GET /runners/get_details` with a 15-second timeout). JavaScript, TypeScript, and Python work across all 472 problems; C++, Java, C#, and C explicitly return an `Unsupported` error on problems whose signatures use types their wrapper cannot serialize (such as `TreeNode` or nullable integer arrays), rather than falsely reporting Passed.

### 21. How does Guest Mode work on coding submissions?
`POST /api/problems/:problemId/submit` uses `optionalAuth`. If no `Authorization` header is sent, the server still validates the request, executes the code, and returns the full verdict (`saved: false`) without creating a fake user or `user_submissions` row. If an invalid or expired token *is* sent, `optionalAuth` rejects it with HTTP `401` rather than silently downgrading to guest.

### 22. How does the PvP Coding Duel work without a WebSocket server?
PvP Coding Duel uses the browser's `BroadcastChannel` API to synchronize room codes, live opponent code previews, freeze power-ups, and match outcomes across tabs in the same browser, and runs submitted JavaScript solutions in a dedicated Web Worker (`duelRunner.worker.ts`) with a timeout. It is clearly documented as a local practice duel rather than a ranked online server.

### 23. How did you test the application without spending money on live AI or execution APIs?
We built a unified `npm run test:demo` script that runs `oxlint`, the production Vite + esbuild build, 37 backend/submission integration tests (using in-memory/temporary SQLite databases and mocked Paiza providers), 10 domain model/unit tests across 7 files, and 13 Playwright end-to-end browser test scripts (mocking `/api/chat` and `/api/visualizer` responses and using disposable server accounts).

### 24. What security measures are implemented in the Express API?
- Strict JWT validation (`HS256`, issuer/audience/expiry, account existence check, mandatory 32+ char secret).
- Server-only secrets (`GROQ_API_KEY`, `JWT_SECRET`) never exposed to the browser.
- Security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, and production CSP) plus explicit `ALLOWED_ORIGINS` CORS checks in production.
- Request body size limits (`512 KB`), code length limits (`64 KB`), strict schema validation, prototype-pollution key rejection, and per-IP/per-user rate limiting.
- Server-owned permanent XP (client `/api/activity` reward writes return `410 Gone`).

### 25. What are the honest limitations of the project, and what would you improve next?
- **No hidden-test container judge**: Submissions check the visible SQLite test cases through Paiza rather than a private Docker judge with hidden stress tests, and memory/percentiles are not measured.
- **External API dependency**: Live AI Tutor/Visualizer need `GROQ_API_KEY` + internet, and live server Submit depends on Paiza's availability.
- **Single-process limits**: Rate limits are stored in memory and reset on server restart; auth uses bearer tokens in browser storage rather than HttpOnly cookies with refresh/revocation.
- **Next improvements**: Docker-based hidden-test judge, WebSocket multiplayer PvP, email verification/password reset, and a server-verified learning-event XP ledger.
