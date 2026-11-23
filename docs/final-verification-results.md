# Alvio — Final College Project Verification Results

**Verification Date:** 2026-11-23  
**Base Commit Verified:** `c49a10beac9854cc2af9ed0bb6033b8e6774f8aa` (`Fix AI Visualizer error handling, 404 route fallback, search guard, coding AI error message, and sync docs`) on branch `main`, plus final release regression tests and doc sync  
**Runtime Verified:** Node.js `v24.13.0` (built-in `node:sqlite`), npm `11.19.0`, `package-lock.json` present  
**Database Safety:** All automated tests and smoke checks ran against isolated temporary SQLite databases. Existing `data/database.sqlite` and user records were never modified or reset.

---

## 1. Automated Mocked / Offline Verification Results (`npm run test:demo` — No Paid API Keys Required)

| # | Command / Check | Result | Actual Counts / Output |
| --- | --- | --- | --- |
| 1 | `npm run lint` (`oxlint`) | **PASS** | `0` errors (pre-existing unused-variable warnings remain) |
| 2 | `npm run build` (`vite build && esbuild server.ts ...`) | **PASS** | Vite client bundle + Express bundle `dist/server.cjs` built cleanly |
| 3 | `npm run test:foundation` (`build` + `backend-foundation.test.ts`, `progress-sync.test.ts`, `optional-auth.test.ts`, `coding-submissions.test.ts`, `ai-chat.test.ts`) | **PASS** | **49/49 passed, 0 failed** (covers JWT auth, CORS/headers, rate/body limits, migrations, progress conflict merge, optional auth, mocked Paiza submission verifier, `/api/chat` model/streaming/errors, `/api/visualizer` 400/429/follow-up isolation, and Mock Interview JSON parser) |
| 4 | `npm run test:models` (`auth-destination`, `dashboard-data`, `practice-model`, `progress-model`, `quiz-model`, `heap-operations` [480 ops], `visualizer-progress`) | **PASS** | **10/10 passed across 7 files, 0 failed** |
| 5 | `npm run test:auth-browser` (`auth-foundation.browser.ts`) | **PASS** | **4/4 passed, 0 failed** (deep-link protection, real login/offline/forged-token cleanup, account switch + open-redirect rejection, 404 fallback page + `Ctrl+K` unmatched search keyboard navigation) |
| 6 | `npm run test:auth-regressions` (`auth.browser.cjs`, `profile.browser.cjs`, `coding-workspace.browser.cjs`, `coding-language.browser.cjs`) | **PASS** | **4/4 browser scripts passed** (desktop & mobile; auth, profile, Monaco Run + Run Testcase + Server Submit + History + Coding AI Analysis secret-leak guard + timeout + 8 picker language symbols) |
| 7 | `npm run test:learning-browser` (`navigation-shell.browser.cjs`, `video-lessons.browser.cjs`, `tutor.browser.cjs`, `visualizer.browser.cjs`) | **PASS** | **4/4 browser scripts passed** (`128/128` viewport × route checks from `1920px` to `390px` with `0` failures; real video playback/notes/resume; mocked AI Tutor SSE/retry; mocked AI Visualizer 2D/3D/timeline/code sync) |
| 8 | `npm run test:practice-browser` (`quiz.browser.cjs`, `progress.browser.cjs`, `pvp.browser.cjs`, `interview-live.browser.cjs`) | **PASS** | **4/4 browser scripts passed** (Quiz + timers + Rapid Fire; Progress analytics; 2-tab PvP Duel + freeze + timeout + victory; mocked Mock Interview SSE + rubric + retry + private notes + report) |
| 9 | Fresh-machine DB seeding & production startup (`DATABASE_PATH=<temp> npx tsx server/migrateProblems.ts` + `dist/server.cjs`) | **PASS** | Seeded **472** coding problems; `/` → `200`, `/api/problems` → `200` (`472` items), `/api/auth/me` → `401` anon / `200` after signup |

---

## 2. Live External API Verification Results (Using `.env` `GROQ_API_KEY` + Live Paiza.IO)

These checks exercised the **real production server (`dist/server.cjs`)** with **real outbound network requests** (no `/api/chat`, `/api/visualizer`, or Paiza mocks):

| # | Live Check | External Service & Model | Result | Observed Output |
| --- | --- | --- | --- | --- |
| 1 | `npm run test:ai-live` (`tests/ai-live.smoke.ts`) — AI Tutor SSE streaming + follow-up context | Groq (`openai/gpt-oss-120b` via `GROQ_CHAT_MODEL`) | **PASS** | Progressive SSE chunks received, context retained across `Teach me` → `Give me a hint` (`6629ms`) |
| 2 | `npm run test:ai-live` — Mock Interview start + JSON evaluation + final Markdown report | Groq (`openai/gpt-oss-120b` via `GROQ_CHAT_MODEL`) | **PASS** | Real first question, valid parsed evaluation JSON (score, summary, criteria, tip, nextQuestion), substantive Markdown report (`4431ms`) |
| 3 | `npm run test:ai-live` — AI Visualizer follow-up explanation | Groq (`openai/gpt-oss-120b` via `GROQ_VISUALIZER_MODEL`) | **PASS** | HTTP `200`, substantive step explanation (`1000ms`) |
| 4 | Live AI Tutor all 4 tutoring modes (`Teach me`, `Give me a hint`, `Quiz me`, `Review my code`) | Groq (`openai/gpt-oss-120b`) | **PASS** | 4/4 HTTP `200` SSE streams (`3357`, `1572`, `149`, `4491` chars) |
| 5 | Live AI Visualizer scene generation (`Explain bubble sort on [4, 2, 7, 1]`) | Groq (`openai/gpt-oss-120b`) | **PASS** | HTTP `200` (`7583ms`), valid compiled 10-step `array` specification |
| 6 | Live Playwright Browser E2E (AI Tutor + Mock Interview against real Groq, zero mocks) | Groq (`openai/gpt-oss-120b`) | **PASS** | 5/5 real `POST /api/chat` HTTP `200` SSE (`635ms`–`2218ms`), `0` console errors, `0` `pageerror`s, private notes confirmed absent from all API payloads |
| 7 | Live Server-Verified Coding Submit (`number-of-digit-one`, JavaScript & Python 3) | Paiza.IO (`https://api.paiza.io`) | **PASS** | JS: HTTP `200`, `Passed` `4/4`, `verified: true`, `saved: true` (`1339ms`); Python 3: HTTP `200`, `Passed` `4/4`, `verified: true`, `saved: true` (`602ms`) |

---

## 3. Manual / Direct Browser Audits & Tests Not Performed

### Manual / Direct Verification Performed
- **44-route full Playwright crawl:** Visited every static and parameterized route in `src/App.tsx` (public & authenticated); verified `0` `pageerror`s, `0` failed local `/api/*` requests, `0` horizontal overflow on valid routes, and `10` visually inspected application screenshots in `docs/screenshots/`.
- **Static link & route audit:** Verified `0` broken `<Link>`/`navigate()` routes, `0` raw `fetch('/api/...')` calls bypassing `apiFetch`, `0` broken relative Markdown/image links across `docs/*.md` and `README.md`, and `0` retired `llama-3.3-70b-versatile` calls in active code.

### Tests Not Performed (Honestly Unverified)
- **Physical webcam, microphone, and real browser `SpeechRecognition` hardware:** Cannot be exercised in headless Chromium (covered only via simulated media/speech mocks in `tests/interview-devices.browser.cjs` and typed-answer fallback).
- **Live Paiza execution for C++, C, Java, C#, and TypeScript:** Wrapper generation and edge-case handling are verified by unit tests in `tests/coding-submissions.test.ts`; live Paiza submissions were executed for JavaScript and Python 3.
- **Full 8-question uninterrupted live Mock Interview loop in browser:** Verified Questions 1–2 + final report live against Groq, and verified Question 8 of 8 (`isFinalQuestion: true`) completion parsing in unit tests (`tests/ai-chat.test.ts`).

---

## 4. Remaining Known Limitations (Honest Scope Boundaries)

- **Local `.env` requires `JWT_SECRET` (32+ chars)** before manual server startup (and `ALLOWED_ORIGINS` in production mode). Server startup intentionally refuses to run without `JWT_SECRET`.
- **Pre-existing legacy TypeScript diagnostics:** `npx tsc -p tsconfig.app.json --noEmit` still reports pre-existing legacy diagnostics in untouched older UI components; `oxlint`, `vite build`, and `esbuild` all pass with `0` errors.
- **Coding Submit scope:** Server-verified Submit evaluates each problem's visible SQLite test cases through Paiza.IO (`server/submissionRunner.ts`). There is no hidden-test Docker/container judge and no measured memory or runtime percentile reporting.
- **External API dependency & Groq free-tier TPM limits:** Live AI features require internet + `GROQ_API_KEY`; bursting multiple large prompts quickly can trigger Groq's free-tier TPM limit (now properly forwarded as HTTP `429` with a retry prompt).
- **Local PvP transport:** PvP Coding Duel runs across tabs in the same browser via `BroadcastChannel` and a local Web Worker (unranked local demo, not networked WebSocket multiplayer).
- **Google Fonts console noise offline:** `index.html` preconnects to Google Fonts, producing a harmless browser `ERR_NAME_NOT_RESOLVED` console entry when strictly offline.

---

## 5. Required Environment Configuration & Commands

Copy `.env.example` to `.env` (never commit `.env`):

| Variable | Required? | Notes |
| --- | --- | --- |
| `JWT_SECRET` | **Required** | Private random string, **at least 32 characters** (`node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`). |
| `PORT` | Optional | Example uses `3001`; server default is `3000`. |
| `ALLOWED_ORIGINS` | **Required in production** | Comma-separated exact origins, e.g. `http://localhost:3001`. |
| `DATABASE_PATH` | Optional | Defaults to `./data/database.sqlite`. |
| `GROQ_API_KEY` | Optional (for live AI) | Server-only key for AI Tutor, Mock Interview, AI Visualizer, Video Ask-AI, and Coding AI Analysis. |
| `GROQ_CHAT_MODEL` | Optional | Defaults to `openai/gpt-oss-120b`. |
| `GROQ_VISUALIZER_MODEL` | Optional | Defaults to `openai/gpt-oss-120b`. |
| `PAIZA_API_KEY` | Optional | Defaults to Paiza's `guest` key. |
| `NODE_ENV` | Optional | Set `production` when running `npm start`. |

```sh
npm ci
npx tsx server/migrateProblems.ts
npm run build
# PowerShell: $env:NODE_ENV="production"; npm start
# Offline automated test suite: npm run test:demo
# Optional live Groq smoke test: npm run test:ai-live
```

- **Recommendation:** **Ready for college demonstration and submission.** See [docs/demo-runbook.md](./demo-runbook.md), [docs/demo-rehearsal.md](./demo-rehearsal.md), [docs/final-presentation.md](./final-presentation.md), [docs/college-project-report.md](./college-project-report.md), and [docs/viva-preparation.md](./viva-preparation.md).
