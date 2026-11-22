# Alvio — Live Demo Rehearsal Script

This script guides you step by step through a smooth, reliable **10-minute live college evaluation demo**, plus a **5-minute offline fallback**, pre-demo checklists, and API failure backup plans.

> **Reference:** All routes, features, and verified behaviors align with [docs/final-verification-results.md](file:///c:/Users/Abhiram/Downloads/al/docs/final-verification-results.md) and [docs/demo-runbook.md](file:///c:/Users/Abhiram/Downloads/al/docs/demo-runbook.md).

---

## 1. Pre-Demo Preparation Checklists

### A. Environment Variables & Server Startup Checklist (Do 15 Minutes Before Demo)
- [ ] Confirm **Node.js 24+** is active (`node -v` → e.g. `v24.13.0`).
- [ ] Confirm `.env` exists in the project root (copied from `.env.example`, never committed) and contains:
  - [ ] `JWT_SECRET` — private random string of **at least 32 characters** (server intentionally exits without it).
  - [ ] `PORT=3001` (or note `3000` if unset).
  - [ ] `ALLOWED_ORIGINS=http://localhost:3001` (**mandatory** when running in production mode).
  - [ ] `DATABASE_PATH=./data/database.sqlite` (optional; default).
  - [ ] `GROQ_API_KEY=...` (optional; required only for live AI Tutor, AI Visualizer generation, and Mock Interview).
  - [ ] `PAIZA_API_KEY=guest` (optional; defaults to `guest`).
- [ ] Confirm the database has all **472 coding problems** seeded:
  ```sh
  npx tsx server/migrateProblems.ts
  ```
- [ ] Build and start the clean production bundle (faster and smoother than hot-reload dev mode during evaluation):
  ```sh
  npm run build
  ```
  - **Windows PowerShell:** `$env:NODE_ENV="production"; npm start`
  - **macOS / Linux:** `NODE_ENV=production npm start`
- [ ] Smoke-check in a fresh browser window:
  - [ ] `http://localhost:3001` loads Landing Page with **472** problems displayed.
  - [ ] Open DevTools Console (`F12`) briefly and verify zero startup errors, then close DevTools for a clean screen.

### B. Demo Account Preparation Checklist
- [ ] Sign up a clean demo account beforehand (e.g., Name: `Demo Student`, Email: `demo@alvio.edu`, Password: 8+ chars) — or keep a second email ready (`live-demo@alvio.edu`) if you want to show live signup.
- [ ] Pre-seed light realistic activity on `demo@alvio.edu` (optional, makes Dashboard & Progress look lively immediately):
  - Visit `/learn/array` once.
  - Complete one quick quiz or leave the Arrays quiz ready to take live.
- [ ] Log out so the browser starts cleanly on `/` (Landing Page) when examiners arrive.
- [ ] Set browser zoom to **100%**, hide unrelated bookmarks/tabs, and keep one terminal window open in the background (useful if you want to show `npm run test:submissions` or server logs).

---

## 2. 10-Minute Live Demonstration Script

| Time | Segment | Target Route(s) | Key Takeaway for Examiners |
| --- | --- | --- | --- |
| 0:00 – 1:00 | Landing & Auth | `/`, `/auth` | Real `bcryptjs` + HS256 JWT auth & `AuthGuard` protection |
| 1:00 – 1:45 | Dashboard & Navigation | `/dashboard` | Unified 4-pillar shell, `Ctrl+K` search, sync indicator |
| 1:45 – 3:30 | DSA Guides & 3D Visualizers | `/learn/heap`, `/3d-visualizer?ds=Heap`, `/algorithms-visualizer?algo=merge-sort` | Interactive offline Three.js 3D operations & step playback |
| 3:30 – 4:30 | Video Learning | `/video-learning` | Bundled local video, speed, timestamped notes, reload persistence |
| 4:30 – 6:00 | Quiz & Progress Analytics | `/quiz` → `/progress` | Interactive quiz review + real-time Recharts & SQLite cloud sync |
| 6:00 – 8:00 | Coding Playground (Run & Submit) | `/coding?problem=number-of-digit-one` | Monaco Editor, Web Worker Run, server-verified Submit & History |
| 8:00 – 8:50 | PvP Coding Duel | `/workspace/pvp` (2 tabs) | Live `BroadcastChannel` room sync, freeze power-up, Victory |
| 8:50 – 10:00 | AI Suite, Profile & Sign-Out | `/ai-tutor`, `/learn/ai-visualizer`, `/mock-interview`, `/profile` | Proxied Groq AI (or offline walkthrough), profile update, clean logout |

---

### Step 1: Landing Page & Authentication (0:00 – 1:00)
- **Navigate to:** `http://localhost:3001/`
- **What to click / do:**
  1. Scroll briefly to show the feature overview and the **472** coding problems count.
  2. Click **Get Started** / **Sign In** to open `/auth`.
  3. Log in with your prepared demo account (`demo@alvio.edu`) — or create a fresh account via Sign Up.
- **What to say:**
  > "This is Alvio's public landing page. Private workspaces are protected by `AuthGuard`, which verifies a server-issued HS256 JWT against `/api/auth/me` before rendering protected pages. Passwords are hashed server-side with `bcryptjs` and stored in SQLite."
- **Expected result:** Clean redirect to `/dashboard` with the authenticated user's name and navigation shell loaded.

---

### Step 2: Dashboard & Global Navigation (1:00 – 1:45)
- **Navigate to:** `/dashboard`
- **What to click / do:**
  1. Point out the four sidebar groups: **Dashboard**, **Learn**, **Practice**, and **AI**, plus the cloud sync status badge.
  2. Press **`Ctrl+K`** (or click Search), type `heap`, and highlight quick navigation results; press `Escape` or select Heap.
- **What to say:**
  > "Instead of switching across separate websites, everything lives in one shell. Progress updates immediately in Zustand and IndexedDB for offline responsiveness, then syncs to SQLite using revision checks so concurrent tabs never overwrite each other."
- **Expected result:** Command search opens smoothly, filters topics instantly, and navigates without page reload.

---

### Step 3: Interactive DSA Guide & 3D / Algorithm Visualizers (1:45 – 3:30)
- **Navigate to:** `/learn/heap` → `/3d-visualizer?ds=Heap` → `/algorithms-visualizer?algo=merge-sort`
- **What to click / do:**
  1. On `/learn/heap`, briefly point out the structured concept guide, time/space complexities, and code snippets.
  2. Open `/3d-visualizer?ds=Heap`: insert 2–3 numbers (e.g. `42`, `15`, `88`), perform an extract/delete, and drag with the mouse to orbit the 3D scene.
  3. Open `/algorithms-visualizer?algo=merge-sort`: click **Play** and **Step** to demonstrate step-by-step animation.
- **What to say:**
  > "Our 3D visualizers are built with Three.js and React Three Fiber. Importantly, all lighting is generated procedurally on the client rather than fetching external HDR files, so every 3D and algorithm visualizer works smoothly even completely offline."
- **Expected result:** Smooth 3D animations, heap structure updates immediately, zero console/WebGL errors.

---

### Step 4: Video Learning & Persistence (3:30 – 4:30)
- **Navigate to:** `/video-learning`
- **What to click / do:**
  1. Select a bundled DSA video lesson and press **Play**.
  2. Change playback speed (e.g., `1.25x` or `1.5x`).
  3. Add a short timestamped note (e.g., `"Key pointer swap"`), mark the lesson complete, and press **`F5` (Reload)**.
- **What to say:**
  > "Video lessons are bundled locally so they do not depend on external video hosts. Timestamped notes, playback position, and completion persist in IndexedDB and sync to the SQLite backend across reloads."
- **Expected result:** After reload, the saved timestamped note and completion state remain intact.

---

### Step 5: Configurable Quiz & Progress Command Center (4:30 – 6:00)
- **Navigate to:** `/quiz` → `/progress`
- **What to click / do:**
  1. Choose **Arrays** (5 questions) and click **Start Quiz**.
  2. Answer the 5 questions briskly (narrate one question to show DSA relevance) and submit to show the score and answer-review breakdown.
  3. Click **Progress** (`/progress`) in the sidebar.
- **What to say:**
  > "Quizzes support topic filters, difficulty levels, timers, and Rapid Fire mode. Each attempt has a stable ID so re-syncing never duplicates credit. On the Progress Command Center, mastery metrics, streaks, and Recharts analytics update automatically and sync to SQLite."
- **Expected result:** Quiz review displays per-question explanations; `/progress` immediately reflects the completed quiz and synced state.

---

### Step 6: Coding Playground — Run & Server-Verified Submit (6:00 – 8:00)
- **Navigate to:** `/coding?problem=number-of-digit-one` (or any familiar problem like `two-sum` — `number-of-digit-one` is tested in our regression suite)
- **What to click / do:**
  1. Show the resizable split layout, problem statement, constraints, and locally bundled **Monaco Editor**.
  2. Click the language picker to show the **7 supported languages** (JavaScript, TypeScript, Python 3, C++, C, Java, C#), then keep JavaScript selected.
  3. Enter a working JavaScript solution and click **Run** (executes locally in a browser Web Worker in milliseconds) and **Run Testcase**.
  4. Click **Submit** to invoke `POST /api/problems/:problemId/submit`.
  5. Open the **Submissions** tab and click the newly recorded submission to reopen its saved code.
- **What to say:**
  > "Run uses a browser Web Worker with a 3-second infinite-loop guard for fast local testing on editable cases. Submit works differently: the browser sends only the code and language—never verdicts or test cases. Express loads the authoritative test cases from SQLite, wraps the code with a random per-run nonce marker so printed text cannot fake a pass, executes it externally on Paiza so Express never runs `eval` or child processes, and stores the verified result (`verified=1`) while updating acceptance stats."
- **Expected result:** Local **Run** finishes almost instantly; **Submit** returns `Passed`, increments acceptance stats, and records an entry in the **Submissions** tab. *(If Paiza is slow or offline, follow Section 4 Backup Plan immediately.)*

---

### Step 7: Two-Tab PvP Coding Duel (8:00 – 8:50)
- **Navigate to:** `/workspace/pvp` in **two side-by-side browser tabs** (same browser profile)
- **What to click / do:**
  1. In **Tab 1**, click **Host Room** and copy the 6-character room code.
  2. In **Tab 2**, paste the room code and click **Join Room**.
  3. Type in Tab 1 to show live opponent code preview in Tab 2; optionally click the **Freeze** power-up.
  4. Solve `reverseList` in one tab and run/submit to trigger the **Victory** overlay.
- **What to say:**
  > "PvP Coding Duel is a local practice mode built with the browser's `BroadcastChannel` API and a dedicated Web Worker (`duelRunner.worker.ts`). It demonstrates real-time tab synchronization without claiming a hosted internet multiplayer server."
- **Expected result:** Both tabs sync room state immediately, live code updates appear, and the Victory screen triggers cleanly.

---

### Step 8: AI Tutor, AI Visualizer, Mock Interview & Profile Sign-Out (8:50 – 10:00)
- **Navigate to:** `/learn/ai-visualizer` → `/ai-tutor` → `/mock-interview` → `/profile`
- **What to click / do:**
  1. Open `/learn/ai-visualizer`: toggle between **2D and 3D views**, scrub the step timeline, and show synchronized code-line highlighting (works immediately with the built-in Linked List walkthrough; optionally generate a new prompt if `GROQ_API_KEY` + internet are active).
  2. Open `/ai-tutor`: ask a brief DSA question (e.g., `"Explain binary heap insertion time complexity in 3 bullets"`) to show streaming SSE Markdown output.
  3. Briefly open `/mock-interview`: show topic/difficulty selector, private scratch notes area (explain these are never sent to the API), and rubric feedback workflow.
  4. Open `/profile`: show solved problems count, update one bio field (e.g., University), save, and click **Sign Out**.
- **What to say:**
  > "All AI endpoints are authenticated and proxied through Express so `GROQ_API_KEY` stays server-side, with strict rate limits and 60-second abort timeouts. Finally, Profile shows our verified solved count and bio updates, and Sign Out flushes pending progress before clearing the session and returning to `/auth`."
- **Expected result:** Streaming response or clean offline walkthrough renders properly; profile saves; Sign Out redirects cleanly to `/auth`.

---

## 3. 5-Minute Offline Fallback Demonstration (Zero Internet Required)

Use this streamlined plan if venue Wi-Fi fails completely. Every single step runs **100% locally** against `http://localhost:3001`:

1. **0:00 – 0:45 | Auth & Dashboard (`/`, `/auth`, `/dashboard`):** Sign in to prove local SQLite + bcrypt + JWT auth and open `Ctrl+K` navigation.
2. **0:45 – 1:45 | 3D & Algorithm Visualizers (`/3d-visualizer?ds=Heap`, `/algorithms-visualizer?algo=merge-sort`):** Insert/delete heap nodes, orbit 3D camera, step through Merge Sort (zero external assets).
3. **1:45 – 2:30 | Video Learning & Quiz/Progress (`/video-learning`, `/quiz`, `/progress`):** Play local bundled video, add a note, take a quick 5-question quiz, show updated Progress charts.
4. **2:30 – 3:45 | Coding Playground (Local JS Run) & PvP Duel (`/coding`, `/workspace/pvp`):** Run JavaScript code and show infinite-loop timeout protection in the Web Worker; run a 45-second two-tab PvP Duel.
5. **3:45 – 4:20 | AI Visualizer Offline Walkthrough (`/learn/ai-visualizer`):** Demonstrate 2D/3D toggle, timeline scrubbing, and code-line sync using the built-in Linked List walkthrough (and optionally show the safe non-crashing error alert on `/ai-tutor`).
6. **4:20 – 5:00 | Terminal Proof of Server-Verified Submit:** Switch to the terminal and run:
   ```sh
   npm run test:submissions
   ```
   Show all server-side submission verification tests passing deterministically offline against mocked Paiza responses.

---

## 4. Backup Plan If Groq AI or Paiza API Fails Live

| Failure Scenario | What Happens in Alvio (By Design) | Exactly What You Should Do & Say |
| --- | --- | --- |
| **Groq API fails / rate-limited / `GROQ_API_KEY` missing** | Express returns safe HTTP `500`/`502` (no secret leaks). AI Tutor, Mock Interview, and AI Visualizer display an inline error banner with **Retry** and preserve typed text. | 1. Point out the graceful error handling as a deliberate engineering feature.<br>2. Stay on `/learn/ai-visualizer` and demonstrate the **built-in Linked List: Insertion** walkthrough (2D/3D toggle, timeline scrub, code line sync).<br>3. Mention that `npm run test:learning-browser` and `npm run test:practice-browser` verify full SSE streaming and Mock Interview rubrics deterministically. |
| **Paiza API is slow, down, or venue blocks outbound traffic** | `POST /api/problems/:id/submit` returns HTTP **`503 Execution Service Unavailable`** (`errorType: 'provider'`, `saved: false`) instead of a false Wrong Answer or corrupting `problem_stats`. | 1. Explain to examiners why returning `503` without corrupting stats is safer than faking a pass or recording a wrong answer.<br>2. Demonstrate JavaScript **Run**, **Run Testcase**, and infinite-loop timeout protection locally in the browser Web Worker.<br>3. Run `npm run test:submissions` in the terminal to prove Passed, Failed, Compile Error, Timeout, Nonce Anti-Spoofing, Guest Mode, and DB persistence live. |
| **Browser tab freezes or accidental wrong click** | State is safely persisted in SQLite & IndexedDB. | Press **`F5`** to reload cleanly—`AuthGuard` restores the verified session and cached progress automatically. |
