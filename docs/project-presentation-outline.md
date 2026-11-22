# Alvio — College Project Presentation Outline

A structured 12-slide presentation outline grounded in the implemented Alvio codebase.

---

## Slide 1: Project Title — Alvio
- **Title**: **Alvio — Interactive Data Structures & Algorithms Learning Platform**
- **Subtitle**: Combining 3D Visualizations, Guided Practice, Server-Verified Coding, and AI Tutoring
- **Presenter Details**: Student name(s), department, institution, guide/faculty name, academic year

---

## Slide 2: Problem Statement
- Learning Data Structures and Algorithms (DSA) from static textbooks or slides makes pointer updates, tree rotations, and algorithm steps difficult to visualize mentally.
- Students often juggle disconnected tools: one website for videos, another for coding practice, another for quizzes, and separate chat tools for explanations.
- Beginner coding playgrounds frequently evaluate submissions only on the client side, making progress and acceptance statistics unreliable.

---

## Slide 3: Project Objectives
- Build a unified web platform for learning, visualizing, and practicing DSA in one consistent workspace.
- Provide interactive 2D/3D visualizations for core data structures (Arrays, Linked Lists, Stacks, Queues, Binary Trees, AVL Trees, Graphs, Hash Tables, Heaps) and classic algorithms.
- Support structured practice through quizzes, progress tracking, video lessons, PvP coding duels, and a multi-language coding playground.
- Verify coding submissions server-side against database-stored test cases without executing untrusted code directly on the application server.
- Integrate optional AI-powered tutoring, step-by-step visualization generation, and mock interview practice with clean fallbacks when external APIs are unavailable.

---

## Slide 4: Proposed Solution
- **Alvio** is a full-stack web application built with React, TypeScript, Express, and SQLite.
- Organizes the student journey into four clear areas inside a unified navigation shell: **Dashboard**, **Learn** (interactive guides, 3D visualizers, video lessons), **Practice** (Coding Playground, Quizzes, PvP Coding Duel), and **AI** (AI Tutor, AI Visualizer, Mock Interview).
- Tracks learning progress locally with IndexedDB/Zustand for instant responsiveness and syncs snapshots to SQLite with conflict reconciliation when signed in.

---

## Slide 5: Main Features
- **Interactive DSA Lessons & 3D Visualizers**: Live insert, delete, search, and algorithm step controls using Three.js / React Three Fiber with offline procedural lighting.
- **Video Learning**: Bundled DSA video lessons with playback speed, timestamped notes, code examples, and resume support.
- **Coding Playground**: 472 seeded problems, Monaco Editor, 7 programming languages, editable local **Run**, server-verified **Submit**, and submission history.
- **Quizzes & Progress Command Center**: Configurable topic/difficulty/timed/Rapid Fire quizzes, mastery breakdowns, streaks, and cloud progress sync.
- **PvP Coding Duel**: Two-tab local practice duel over `BroadcastChannel` with shared problem, live opponent code view, freeze power-up, and Web Worker evaluation.
- **AI Learning Tools**: Streaming AI Tutor, AI Visualizer (2D/3D scene generation with code-line sync), and Mock Interview simulator.

---

## Slide 6: System Architecture
```text
Browser (React + TypeScript + Vite)
 ├── UI & State: React Router, Zustand, Monaco Editor, Three.js / R3F
 ├── Offline Cache: IndexedDB + LocalStorage (account-scoped)
 └── Local Teaching Runners: Web Workers (JS Run & PvP Duel)
            │
            ▼  Authenticated REST / SSE (/api/*)
Express Backend (server.ts + server/*)
 ├── Auth & Security: JWT (HS256), bcryptjs, CORS, CSP, Rate Limiting
 ├── Persistence: Node.js Built-in SQLite (node:sqlite) + Migrations
 ├── AI Proxy: Groq SDK (/api/chat SSE, /api/visualizer JSON)
 └── Submission Verifier: server/submissionRunner.ts ──► Paiza API
```

---

## Slide 7: Technologies Used
- **Frontend**: React 19, TypeScript, Vite 8, React Router 7, Zustand, Framer Motion, Recharts, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Three.js / React Three Fiber / Drei.
- **Backend**: Node.js 24, Express 5, `node:sqlite`, `bcryptjs`, `jsonwebtoken`, `cors`, `esbuild`.
- **External Services**:
  - **Groq API** (`groq-sdk`, Llama 3.3 70B & Visualizer model) for AI Tutor, AI Visualizer, and Mock Interview.
  - **Paiza.IO API** (`https://api.paiza.io`) for external multi-language code execution.
- **Testing & Quality**: Node built-in test runner (`node:test`), Playwright Chromium/Edge browser automation, `oxlint`.

---

## Slide 8: Database & Backend Overview
- **SQLite with numbered transactional migrations** (`server/migrations.ts`, tracked in `schema_migrations`, WAL mode + foreign keys enabled).
- **Core tables**:
  - `users` — account credentials (`password_hash` via bcrypt), profile fields, server-owned `xp`.
  - `learning_progress` — per-user validated JSON progress snapshot with optimistic concurrency `revision` (409 conflict + 3-way client merge).
  - `problems` & `problem_stats` — 472 coding problems (descriptions, signatures, starter code, visible test cases) and acceptance counters.
  - `user_submissions` — server-verified submission attempts (`status`, `verified`, `passed_testcases`, `total_testcases`, `runtime_ms`, `language`, `code`, timestamp).
  - `user_problem_interactions`, `problem_feedback`, `user_activity`, `course_progress`.
- **Security**: Mandatory `JWT_SECRET` (min 32 chars), server-only API keys, `requireAuth` & `optionalAuth` middleware, strict payload validation, and in-memory rate limiting.

---

## Slide 9: AI Features
- **AI Tutor (`/ai-tutor`)**: Server-enforced DSA tutor system prompt, streaming Server-Sent Events (`/api/chat`), tutoring modes (`Teach me`, `Give me a hint`, `Quiz me`, `Review my code`), Markdown + copyable code blocks, file attachments, and local history.
- **AI Visualizer (`/learn/ai-visualizer`)**: Generates structured step-by-step data structure scenes via `/api/visualizer` with 2D/3D view toggle, timeline scrubbing, synchronized code line highlighting, follow-up Q&A, and a built-in default Linked List walkthrough.
- **Mock Interview (`/mock-interview`)**: Multi-question technical interview practice with typed/voice answers, private scratch notes (never sent to the API), per-answer rubric scoring, final Markdown report, and graceful retry on provider errors.

---

## Slide 10: Coding Playground & Server-Side Verification
- **Run (`Run` / `Run Testcase`)**: Fast experimentation against editable test cases (Web Worker with 3s timeout for JavaScript; Paiza for Python, TypeScript, C++, C, Java, C#).
- **Server-Verified Submit (`POST /api/problems/:problemId/submit`)**:
  1. Frontend sends only `{ code, language }` (client-sent verdicts and test cases are ignored).
  2. Server validates inputs and loads the problem's test cases from SQLite.
  3. Server wraps the code with a per-run nonce marker and sends it to Paiza (Express never runs `eval` or child processes on submitted code).
  4. Server computes `Passed`, `Failed`, or `Error` (compile/runtime/timeout/provider unavailable), saves signed-in attempts (`verified=1`), and updates `problem_stats`.
  5. Supports **Guest Mode** via `optionalAuth` (returns verdict without creating a fake account).

---

## Slide 11: Testing & Verification Results
- **Unified automated verification command**: `npm run test:demo` (uses isolated SQLite databases, disposable test accounts, and mocked external AI/Paiza providers — no paid API keys needed).
- **Verified coverage**:
  - **Lint (`npm run lint`)**: 0 errors across the repository.
  - **Production build (`npm run build`)**: Vite client bundle + esbuild Express bundle pass cleanly.
  - **Backend & submission tests (`test:foundation`)**: 37 tests passing (JWT auth, rate/body limits, migrations, cloud progress sync & conflict merge, optional auth, and all server-verified coding submission cases).
  - **Domain model tests (`test:models`)**: 10 model/unit tests across 7 files passing (auth redirects, dashboard, practice filters, progress, quiz engine, 480 heap operations, visualizer progress).
  - **End-to-end Playwright browser tests (13 test files)**: Auth foundation & auth UI, profile, coding workspace (Run + Submit + History + 8 picker language symbols), 128 navigation/viewport checks (desktop & mobile), video learning, AI Tutor, AI Visualizer, Quiz, Progress, PvP Duel, and Mock Interview.

---

## Slide 12: Conclusion & Future Scope
- **Conclusion**: Alvio delivers a cohesive, tested, and demonstrable DSA learning environment combining visual intuition, interactive practice, server-verified coding submissions, and AI guidance.
- **Honest Current Limitations**:
  - Coding Submit checks visible/provided SQLite test cases via Paiza rather than a hidden-test Docker/container judge, and does not measure memory or percentiles.
  - Live AI features depend on Groq API availability; PvP Duel is a local browser `BroadcastChannel` demo.
- **Future Scope**:
  - Isolated container-based judge with hidden test suites and memory/time profiling.
  - Real-time networked multiplayer PvP via WebSockets.
  - Password reset / email verification and HttpOnly cookie sessions.
  - Server-verified XP/achievement reward ledger across quizzes and lessons.
