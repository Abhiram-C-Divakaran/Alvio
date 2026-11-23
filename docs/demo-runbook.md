# Alvio College Project Demo Runbook

This runbook covers everything needed to install, start, and smoothly demonstrate **Alvio** during a college project evaluation, including fallback steps if external APIs are unavailable.

---

## 1. Installation and Startup

**Prerequisites:**
- **Node.js 24+** (uses Node's built-in `node:sqlite`)
- **npm**

**Install dependencies:**
```sh
npm install
```

**Configure `.env`:**
Copy `.env.example` to `.env` and fill in at least `JWT_SECRET` (see Section 2).

**Seed the coding problem catalog (first-time setup if `data/database.sqlite` does not yet have problems):**
```sh
npx tsx server/migrateProblems.ts
```

**Start in development mode (hot reload):**
```sh
npm run dev
```

**Or build and start the production bundle (recommended for a clean, fast demo):**
```sh
npm run build
NODE_ENV=production npm start
```
*(In PowerShell: `$env:NODE_ENV="production"; npm start`)*

Open **http://localhost:3001** (or `http://localhost:3000` if `PORT` is unset).

---

## 2. Required Environment Variables

| Variable | Required? | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | **Required** | Private signing secret, **at least 32 characters**. Generate with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`. Server intentionally refuses to start without it. |
| `JWT_ACCESS_TTL` | Optional | Short-lived access token lifetime (default `15m`). |
| `JWT_REFRESH_DAYS` | Optional | Rotating refresh session window in days (default `7`). |
| `COOKIE_SECURE` | Optional | Set `true` behind HTTPS in production so auth cookies include the `Secure` attribute. |
| `TRUST_PROXY` | Optional | Set `true` when behind a reverse proxy (Nginx, Caddy, cloud load balancer) for HTTPS detection and client IP rate limiting. |
| `PORT` | Optional | HTTP port (`.env.example` uses `3001`; default is `3000`). |
| `ALLOWED_ORIGINS` | **Required in production** | Comma-separated exact origins, e.g. `http://localhost:3001`. |
| `DATABASE_PATH` | Optional | Path to SQLite database (defaults to `./data/database.sqlite`). |
| `GROQ_API_KEY` | Optional (needed for live AI) | Server-only API key for AI Tutor, AI Visualizer, Mock Interview, Video Ask-AI, and Coding AI Analysis. Non-AI features work fully without it. |
| `GROQ_CHAT_MODEL` | Optional | Model override for `/api/chat` (default `openai/gpt-oss-120b`). |
| `GROQ_VISUALIZER_MODEL` | Optional | Model override for `/api/visualizer` (default `openai/gpt-oss-120b`). |
| `PAIZA_API_KEY` | Optional | Defaults to Paiza's `guest` key for external code execution. |
| `NODE_ENV` | Optional | Set to `production` when running `npm start`. |

---

## 3. Creating and Using a Demo Account

1. Open the app at `http://localhost:3001` (public landing page).
2. Click **Get Started** / **Sign Up** (or visit `/auth?mode=signup`).
3. Create a demo student account (e.g., `Demo Student`, `demo@alvio.edu`, password of at least 8 characters).
4. You will be signed in automatically and redirected to `/dashboard`.
5. Pre-populate a small amount of progress before the presentation (or walk through it live) by visiting one Data Structure lesson, completing one 5-question quiz, and submitting one coding problem.

---

## 4. Recommended Demonstration Sequence (10–12 minutes)

1. **Landing & Authentication (`/`, `/auth`)**: Show the landing page, then log in or sign up to demonstrate real server-side bcrypt + JWT authentication and protected route redirects.
2. **Dashboard (`/dashboard`)**: Show the unified shell, global search (`Ctrl+K`), learning overview, and quick resume actions.
3. **Data Structures Learning (`/learn` → `/learn/heap` or `/learn/array`)**: Open a data structure guide, show the interactive visualization, complexity summary, and bundled code examples.
4. **Interactive 3D Visualizer (`/3d-visualizer?ds=Heap` or `/algorithms-visualizer?algo=merge-sort`)**: Run insert/delete/sort operations, pan/orbit the 3D scene, and show step-by-step controls (works 100% offline with local procedural lighting).
5. **Video Learning (`/video-learning`)**: Play a bundled lesson video, adjust speed, add a timestamped note, mark complete, and reload to show persistence.
6. **Quiz & Progress (`/quiz` → `/progress`)**: Complete a 5-question Arrays quiz, review answers, then open **Progress** to show updated mastery, streak, and cloud-synced analytics.
7. **Coding Playground — Run & Server-Verified Submit (`/coding?problem=number-of-digit-one`)**:
   - Edit code in Monaco, click **Run** (local JS Web Worker) and **Run Testcase**.
   - Click **Submit** to show server-side verification (`POST /api/problems/:id/submit`) against the database's provided test cases, live updated acceptance rate, and **Submissions** history tab (reopen past code).
   - Switch languages in the picker (JavaScript, TypeScript, Python 3, C++, C, Java, C#).
8. **PvP Coding Duel (`/workspace/pvp`)**: Open two browser tabs side by side, host a room in Tab 1, join with the 6-character code in Tab 2, show live code view, freeze power-up, and solving `reverseList` to trigger the Victory screen.
9. **AI Tutor, AI Visualizer & Mock Interview (`/ai-tutor`, `/learn/ai-visualizer`, `/mock-interview`)**: Ask a DSA question in AI Tutor (streaming Markdown + code), step through a visualization in AI Visualizer (2D/3D view, timeline scrub, code line sync), and open Mock Interview to show topic/difficulty setup, live Q&A rubric feedback, private scratch notes, and report generation.
10. **Profile & Session Security (`/profile`)**: Show solved problems, profile bio update, **Sign out** (revokes the current session on the server and clears HttpOnly cookies), or **Account Settings → Sign out all devices** (revokes every active device session), and check `GET /api/health` for server/DB readiness.

---

## 5. Important External Services

| Service | Used By | Offline / Local Behavior |
| --- | --- | --- |
| **Groq API** (`GROQ_API_KEY`) | AI Tutor (`/api/chat`), Mock Interview (`/api/chat`), AI Visualizer (`/api/visualizer`), Coding Submission AI Analysis | Not required for core DSA learning, 3D visualizers, videos, quizzes, progress, local JS Run, or PvP. |
| **Paiza API** (`https://api.paiza.io`) | Server-verified Coding Submit (all 7 languages) & non-JS Run | Local JavaScript `Run` and PvP Duel run in browser Web Workers with zero external network calls. |

All 3D visualizers, Monaco Editor assets, and bundled video lessons run locally without external CDNs.

---

## 6. What to Do If AI or Execution APIs Are Unavailable

- **If Groq (`GROQ_API_KEY`) is missing, rate-limited, or offline**:
  - AI Tutor, Mock Interview, and AI Visualizer display clean inline error alerts with a **Retry** button and preserve typed answers without crashing.
  - **AI Visualizer** still opens with its built-in **Linked List: Insertion** walkthrough so you can still demonstrate 2D/3D toggle, step-by-step playback, timeline scrubbing, synchronized code highlighting, and learning modes!
- **If Paiza (`https://api.paiza.io`) is temporarily unavailable or slow**:
  - Server `Submit` returns an explicit **Execution Service Unavailable** error (HTTP 503) rather than a false Wrong Answer.
  - Use **Run** and **Run Testcase** in JavaScript (runs locally in a browser Web Worker in milliseconds), and show **PvP Coding Duel** (also runs locally in a Web Worker).
  - You can also run `npm run test:submissions` in the terminal to demonstrate all 14+ server-verified submission behaviors deterministically with mocked provider responses.

---

## 7. Short Fallback Demonstration Plan (No Internet Required, ~5 minutes)

If venue Wi-Fi fails completely, run everything locally against `http://localhost:3001`:

1. **Auth & Dashboard**: Sign in and navigate via `Ctrl+K` and sidebar.
2. **Interactive 3D & Algorithm Visualizers**: Demo `/learn/heap`, `/3d-visualizer?ds=Heap`, and `/algorithms-visualizer?algo=merge-sort` (zero external network calls).
3. **Video Learning**: Play a local bundled video lesson, add a note, mark complete, reload.
4. **Quiz & Progress**: Complete a 5-question quiz and show real-time Progress Command Center updates.
5. **Coding Playground (Local JS Run) & PvP Duel**: Run JavaScript solutions + infinite-loop timeout protection in Coding Playground, and run a two-tab PvP Coding Duel.
6. **Automated Test Verification**: Run `npm run test:submissions` in a terminal to show live proof of server-side submission verification, validation, guest mode, and database persistence.
