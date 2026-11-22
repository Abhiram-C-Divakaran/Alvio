# Alvio — Final College Project Presentation

> **Companion PowerPoint File:** Also generated at [docs/alvio-final-presentation.pptx](file:///c:/Users/Abhiram/Downloads/al/docs/alvio-final-presentation.pptx) (12 academic slides with embedded speaker notes). Replace the placeholders on Slide 1 with your name, roll number, college, department, and faculty guide before presenting.

---

## Slide 1: Title — Alvio

**Slide Content:**
- **Alvio**
- *An Interactive Data Structures & Algorithms Learning Platform*
- Combining 3D Visualizations, Guided Practice, Server-Verified Coding, and AI Tutoring
- **Presented by:** `[Student Name]` (`[Roll Number]`)
- **Department & College:** `[Department Name]`, `[College / Institution Name]`
- **Guided by:** `[Faculty Guide Name]` | **Academic Year:** `[2025–2026 / 2026–2027]`

**Presenter Notes (Speaking Script — ~30 sec):**
"Good morning/afternoon respected examiners and faculty members. I am `[Student Name]`, and today I am presenting my college project, **Alvio** — an interactive full-stack web platform for learning Data Structures and Algorithms. Alvio brings together 2D/3D visualizations, video lessons, quizzes, a multi-language coding playground with server-verified submissions, and optional AI tutoring inside one unified workspace."

---

## Slide 2: Problem Statement

**Slide Content:**
- **Static Learning Materials:** Textbooks and slides make pointer updates, tree rotations, and algorithm steps hard to visualize mentally.
- **Fragmented Tools:** Students switch between separate sites for videos, visualizations, coding practice, quizzes, and explanations.
- **Unreliable Client-Only Grading:** Basic practice apps often trust browser-side verdicts, leading to inaccurate progress and statistics.
- **Fragile Demos & Study:** Dependence on remote CDNs, HDR assets, or live AI APIs causes complete failures when offline.

**Presenter Notes (Speaking Script — ~45 sec):**
"When students study Data Structures and Algorithms, they usually run into four problems. First, static diagrams do not show how memory, pointers, or trees change step by step. Second, learners constantly jump between disconnected websites for videos, animations, coding problems, and quizzes, losing track of progress. Third, simple educational coding tools often check answers only in the browser, making verdicts easy to manipulate. Finally, many apps crash when external APIs or venue internet fail. Alvio was designed specifically to solve these four issues."

---

## Slide 3: Objectives

**Slide Content:**
- Build one cohesive full-stack DSA learning platform with a unified navigation shell.
- Provide interactive **2D/3D visualizations** for 9 core data structures and classic algorithms that work **offline**.
- Deliver structured practice: **472 coding problems**, bundled video lessons, configurable quizzes, progress analytics, and local PvP duels.
- Verify coding submissions **server-side** against SQLite test cases without executing untrusted code on the Express server.
- Integrate optional **AI Tutor, AI Visualizer, and Mock Interview** behind the backend with clean offline fallbacks.
- Validate the platform with an automated, deterministic test suite (`npm run test:demo`).

**Presenter Notes (Speaking Script — ~45 sec):**
"Our project has six clear objectives: unify the DSA learning workflow in one application; make core data structures and algorithms interactive in 2D and 3D even without internet; provide comprehensive practice including 472 coding problems, videos, quizzes, and analytics; move coding submission verification safely to the server without executing student code inside Node.js; add server-proxied AI tools that degrade gracefully when offline; and verify the entire platform with repeatable automated tests."

---

## Slide 4: Proposed Solution

**Slide Content:**
- **Full-Stack Web Architecture:** React 19 + TypeScript frontend backed by Express 5 and Node.js 24 built-in SQLite.
- **Four Clear Learning Pillars:**
  - **Dashboard:** Unified overview, `Ctrl+K` quick search, sync status, resume actions.
  - **Learn:** 9 interactive DS guides, 3D & Algorithm visualizers, bundled video lessons.
  - **Practice:** Coding Playground (472 problems), Quizzes, Progress Command Center, PvP Coding Duel.
  - **AI:** Streaming AI Tutor, AI Visualizer (2D/3D), Mock Interview simulator.
- **Offline-First Sync:** Instant IndexedDB/Zustand updates + compare-and-swap SQLite cloud synchronization.

**Presenter Notes (Speaking Script — ~45 sec):**
"Our proposed solution is Alvio — a full-stack TypeScript application. Instead of scattering tools across tabs, we organize the student experience into four logical areas inside one authenticated shell: Dashboard, Learn, Practice, and AI. Every learning action saves immediately to an account-scoped IndexedDB cache in the browser for instant responsiveness and offline continuity, and then syncs automatically to SQLite on the server."

---

## Slide 5: Main Features

**Slide Content:**
- **Interactive 3D & Algorithm Visualizers:** Arrays, Linked Lists, Stacks, Queues, Binary/AVL Trees, Graphs, Hash Tables, Heaps, Sorting/Searching — offline procedural lighting.
- **Video Learning:** Bundled local DSA videos, playback speed control, timestamped notes, and automatic resume.
- **Coding Playground:** 472 seeded problems, locally bundled Monaco Editor, 7 languages, fast local **Run**, server-verified **Submit**, and submission history.
- **Quizzes & Progress Center:** Topic/difficulty/timed/Rapid Fire quizzes + mastery, streaks, and Recharts analytics.
- **PvP Coding Duel:** Two-tab local practice duel (`BroadcastChannel`) with live opponent code view, freeze power-up, and Web Worker evaluation.
- **AI Suite:** Streaming AI Tutor, AI Visualizer (2D/3D + code sync + built-in offline walkthrough), and Mock Interview.

**Presenter Notes (Speaking Script — ~60 sec):**
"Here are the six major feature groups we implemented. First, interactive 3D and algorithm visualizers built with Three.js using local procedural lighting so they never depend on remote HDR files. Second, bundled video lessons with timestamped notes and resume support. Third, a 472-problem Coding Playground powered by locally bundled Monaco Editor across seven languages. Fourth, configurable quizzes including Rapid Fire mode linked to the Progress Command Center. Fifth, a local two-tab PvP Coding Duel using `BroadcastChannel`. And sixth, an optional AI Suite covering tutoring, visualization generation, and mock interviews."

---

## Slide 6: System Architecture

**Slide Content:**
```text
Browser (React 19 + TypeScript + Vite 8)
 ├── UI & Visualization: React Router, Zustand, Monaco, Three.js / R3F
 ├── Offline Cache: Account-scoped IndexedDB + localStorage
 └── Local Runners: Web Workers (JS Run & PvP Duel)
            │
            ▼  Authenticated REST & SSE (/api/*)
Express 5 Backend (Node.js 24 — server.ts & server/*)
 ├── Security: JWT (HS256), bcryptjs, CORS, CSP, Rate Limiting
 ├── Database: Built-in node:sqlite (WAL + Foreign Keys + Migrations)
 ├── AI Proxy: Groq SDK (/api/chat SSE, /api/visualizer JSON)
 └── Submission Verifier: server/submissionRunner.ts ──► Paiza.IO API
```

**Presenter Notes (Speaking Script — ~60 sec):**
"This diagram shows Alvio's end-to-end architecture and trust boundary. The browser runs React, Zustand, Three.js, Monaco, an account-scoped IndexedDB cache, and local Web Workers for fast JavaScript execution and PvP duels. All sensitive operations go through authenticated `/api/*` routes on the Express 5 server. Express handles bcrypt password hashing, HS256 JWT verification, rate limiting, and SQLite persistence, while acting as a secure proxy to Groq for AI and Paiza.IO for multi-language code verification. Secrets never reach the browser."

---

## Slide 7: Technology Stack

**Slide Content:**
- **Frontend:** React 19, TypeScript, Vite 8, React Router 7, Zustand, Tailwind CSS, Framer Motion, Recharts.
- **Interactive Workspaces:** Three.js / React Three Fiber / Drei (3D), `@monaco-editor/react` (bundled locally).
- **Backend & Storage:** Node.js 24, Express 5, built-in `node:sqlite`, `bcryptjs`, `jsonwebtoken`, `esbuild`.
- **Client Offline Cache:** IndexedDB (`src/services/db.ts`, v2) + `localStorage` fallback.
- **External APIs (Server-Proxied):** Groq SDK (Llama 3.3 70B & Visualizer model), Paiza.IO execution API.
- **Testing & Quality:** `node:test`, Playwright Chromium, `fake-indexeddb`, `oxlint`.

**Presenter Notes (Speaking Script — ~45 sec):**
"We chose modern, lightweight technologies well-suited for a full-stack academic project. React 19, TypeScript, and Vite power the UI, while Three.js and locally bundled Monaco Editor provide rich interactive workspaces. On the backend, Node.js 24's built-in `node:sqlite` eliminates external database server setup while giving us full relational SQL, ACID transactions, and foreign keys. `bcryptjs` and `jsonwebtoken` handle authentication, and `node:test`, Playwright, and `oxlint` automate quality checks."

---

## Slide 8: Database and Backend

**Slide Content:**
- **SQLite (`data/database.sqlite`):** WAL mode, foreign keys enabled, deterministic transactional migrations (`schema_migrations`).
- **Core Tables:**
  - `users` — normalized email, `bcryptjs` hash, profile metadata, server-owned `xp`.
  - `learning_progress` — validated JSON snapshot + optimistic-concurrency `revision` (`ON DELETE CASCADE`).
  - `problems` & `problem_stats` — 472 seeded problems + server-updated acceptance counters.
  - `user_submissions` — server-verified attempts (`verified = 1`, passed/total counts, runtime, code).
  - `user_problem_interactions`, `problem_feedback`, `user_activity`, `course_progress`.
- **Conflict-Safe Sync & Security:** HTTP `409` revision checks + 3-way client merge; mandatory 32+ char `JWT_SECRET`; `410 Gone` on legacy client XP writes; per-IP/user rate limits.

**Presenter Notes (Speaking Script — ~60 sec):**
"Our backend uses SQLite with numbered, transactional migrations in `server/migrations.ts`, so restarting or upgrading the app never wipes existing accounts. Key tables include `users`, `learning_progress`, `problems` (seeded with 472 challenges), `problem_stats`, and `user_submissions`. Two backend mechanisms are worth highlighting: first, cloud progress uses compare-and-swap revision numbers—if two tabs conflict, the server returns HTTP 409 and the client performs a three-way merge instead of overwriting data. Second, permanent XP lives strictly in `users.xp` and cannot be inflated by client snapshots."

---

## Slide 9: AI Integration

**Slide Content:**
- **Server-Proxied Groq Integration:** `GROQ_API_KEY` stays strictly on Express; all AI routes require JWT auth + rate limits + 60s abort/disconnect cancellation.
- **AI Tutor (`/ai-tutor` → `POST /api/chat`):**
  - Server-enforced DSA tutor prompt, streaming Server-Sent Events (SSE), modes (`Teach me`, `Give me a hint`, `Quiz me`, `Review my code`), Markdown + code blocks.
- **AI Visualizer (`/learn/ai-visualizer` → `POST /api/visualizer`):**
  - Generates validated/repaired JSON scenes rendered in **2D/3D** with timeline scrubbing, code-line sync, and a **built-in offline Linked List walkthrough**.
- **Mock Interview (`/mock-interview` → `POST /api/chat`):**
  - Dedicated `Mock Interview` mode, per-answer rubric feedback, **private scratch notes** (never sent to API), and final Markdown report.

**Presenter Notes (Speaking Script — ~50 sec):**
"AI features are strictly optional and proxied behind Express. `/api/chat` streams answers via Server-Sent Events at up to 25 requests per minute for both the AI Tutor and Mock Interview, using a dedicated `Mock Interview` mode so rubric prompts are preserved while keeping student scratch notes private in the browser. `/api/visualizer` generates validated 2D/3D step-by-step scenes at up to 12 requests per minute. Crucially, if Groq is offline or unconfigured, every AI screen shows a clean retry banner without crashing, and AI Visualizer still loads its built-in Linked List walkthrough locally."

---

## Slide 10: Coding Playground and Testing

**Slide Content:**
- **Run vs. Server-Verified Submit:**
  - **Run:** Editable test cases; JS runs in a browser Web Worker (3s timeout), other 6 languages via Paiza.
  - **Submit (`POST /api/problems/:id/submit`):** Accepts only `{ code, language }`, loads authoritative test cases from SQLite, wraps with a random **per-run nonce marker**, executes via Paiza (zero `eval`/`child_process` on Express), updates `user_submissions` & `problem_stats`. Supports Guest Mode (`optionalAuth`).
- **Automated Verification (`npm run test:demo` — 0 live paid API keys):**
  - `oxlint`: **0 errors** | Production build: **PASS** (Vite `2.79s`, `dist/server.cjs` `101.0 kb`).
  - Backend, auth, sync & submissions (`test:foundation`): **37/37 passed**.
  - Domain models & heap ops (`test:models`): **10/10 passed** across 7 files (`480` heap ops).
  - Playwright E2E browser suites: **13 scripts passed** (**128/128** viewport × route checks).

**Presenter Notes (Speaking Script — ~60 sec):**
"In the Coding Playground, Run is designed for fast experimentation with editable test cases, while Submit is server-verified. When a student clicks Submit, Express ignores any client verdicts, loads the problem's test cases from SQLite, embeds a random nonce marker so `console.log` cannot fake a pass, and runs the wrapper externally on Paiza across all seven languages—Express never executes student code locally. To prove reliability, our single command `npm run test:demo` passes with 0 lint errors, 37 backend and submission tests, 10 domain model tests, and 13 Playwright browser scripts covering 128 responsive viewport checks—all offline with mocked providers."

---

## Slide 11: Results, Limitations, and Future Scope

**Slide Content:**
- **Verified Readiness:**
  - **472** seeded coding problems verified in SQLite & `/api/problems`.
  - **100%** pass rate across `npm run test:demo` + offline provider fallback checks (`500`/`502`/`503`).
- **Honest Current Limitations:**
  - Coding Submit checks visible SQLite test cases via Paiza (no hidden-test Docker judge or memory/percentile metrics).
  - Live AI and non-JS/Submit execution depend on Groq/Paiza availability.
  - PvP Duel uses local `BroadcastChannel` (same browser), not networked WebSockets.
  - In-memory per-process rate limits; bearer tokens in browser storage; no email password reset yet.
- **Future Scope:**
  - Docker-based hidden-test judge with CPU/memory profiling.
  - WebSocket multiplayer PvP, HttpOnly cookie auth + password reset, and a server-verified XP reward ledger.

**Presenter Notes (Speaking Script — ~50 sec):**
"Every core deliverable is verified and working, with 472 coding problems seeded and all automated checks passing. At the same time, we are transparent about scope boundaries for a college project: Submit checks the visible database test cases via Paiza rather than a private Docker judge with hidden stress tests; PvP Duel is a local browser-tab demo over `BroadcastChannel`; and live AI depends on Groq. Natural next steps include a containerized hidden-test judge, WebSocket multiplayer PvP, HttpOnly cookie sessions with email reset, and a server-validated XP ledger."

---

## Slide 12: Conclusion

**Slide Content:**
- **Alvio** unifies DSA conceptual learning, offline-capable 3D visualization, video lessons, quizzes, server-verified coding practice, and AI guidance in one cohesive full-stack application.
- Demonstrates sound engineering practices:
  - Clear client-server trust boundary (`bcryptjs`, HS256 JWT, nonce-verified submissions).
  - Offline-first IndexedDB caching with conflict-safe SQLite sync.
  - Automated multi-layer verification (`oxlint`, `node:test`, Playwright).
- **Ready for Live Demonstration & Viva Q&A.**
- *Thank you! Questions are welcome.*

**Presenter Notes (Speaking Script — ~30 sec):**
"To conclude, Alvio delivers a cohesive, thoroughly tested, and offline-resilient platform for learning Data Structures and Algorithms. It demonstrates end-to-end full-stack engineering—from 3D WebGL visualization and conflict-safe offline sync to server-side security and automated testing. Thank you for your time and attention. I would now be happy to proceed with the live demonstration and answer any questions."
