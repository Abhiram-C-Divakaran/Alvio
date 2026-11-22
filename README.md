# Alvio

Alvio is an interactive platform for learning data structures and algorithms through lessons, 2D/3D visualizations, quizzes, coding practice, AI tutoring and mock interviews.

## Student experience

Sign in, explore lessons and visualizers, practice, and take quizzes. Learning progress restores from the authenticated server across sessions and devices; an account-scoped device cache retains offline changes. Tutor conversations and coding drafts remain device-local.

## Technology and architecture

React, TypeScript, React Router and Zustand power the interface. Three.js/React Three Fiber render visualizations; Monaco provides the code editor. Express handles authentication, API authorization and Groq requests. SQLite stores accounts and learning progress; IndexedDB caches progress offline.

Read [docs/architecture.md](docs/architecture.md) for session lifecycle, account isolation, progress conflict resolution, API limits and coding submission trust. For presentation setup and fallback steps, see [docs/demo-runbook.md](docs/demo-runbook.md), [docs/project-presentation-outline.md](docs/project-presentation-outline.md), and [docs/viva-preparation.md](docs/viva-preparation.md).

## Local setup

Use Node.js 24 and npm. Node's built-in SQLite is required.

```sh
npm install
```

Copy `.env.example` to `.env`, then explicitly configure `JWT_SECRET` with a private random value of at least 32 characters. Generate a value with your password manager or `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"` and place it in `.env`. Never commit it. Startup intentionally fails without a valid secret.

| Variable | Purpose |
| --- | --- |
| JWT_SECRET | Required private signing secret; no fallback |
| PORT | HTTP port; example uses 3001, server default 3000 |
| ALLOWED_ORIGINS | Comma-separated exact origins; mandatory in production |
| DATABASE_PATH | SQLite file; default `./data/database.sqlite` |
| GROQ_API_KEY | Server-only AI provider key; optional for non-AI learning |
| GROQ_VISUALIZER_MODEL | Visualizer model override |
| PAIZA_API_KEY | Optional external code runner key (defaults to `guest`) |
| NODE_ENV | Set `production` when serving the built app |

Seed the coding problem catalog once on a fresh database (runs SQLite migrations automatically and loads all 472 problems):

```sh
npx tsx server/migrateProblems.ts
```

```sh
npm run dev
```

Open http://localhost:3001 when using the example environment. Create an account through the public authentication page. Private routes require a verified session. Offline cached learning works for previously verified unexpired sessions; new logins require the server.

## Build and run

```sh
npm run build
npm start
```

Set `NODE_ENV=production` in your process manager/environment for production. Configure allowed origins, HTTPS and persistent database storage before deployment. `npm run preview` previews static assets only and does not replace the Express backend.

## Authentication and progress persistence

Express verifies server-issued JWTs before serving private APIs. Application startup verifies the session with `/api/auth/me` before opening protected pages and preserves the requested destination through login. Password hashing is server-only.

Progress updates immediately in Zustand, persists to IndexedDB, and syncs after a two-second debounce. Completion events and explicit sign-out trigger an immediate attempt. Revision checks and three-way reconciliation protect concurrent changes; pending offline edits survive later login. Permanent account XP cannot be increased by uploading a learning snapshot.

## AI services

`/api/chat` and `/api/visualizer` require authentication, enforce per-account/IP quotas and bounded inputs, and cancel provider work on timeout or disconnect. The unused `/api/generate-trace` API has been retired. Groq credentials stay on the server.

## Tests

Run the full college-demo verification suite (lint, production build, backend foundation & server-verified submissions, model/unit tests, and Playwright browser regressions for auth, profile, coding, navigation, videos, AI tutor, AI visualizer, quiz, progress, PvP, and mock interview — no paid API keys required):

```sh
npm run test:demo
```

Or run individual suites:

```sh
npm run lint
npm run test:foundation
npm run test:submissions
npm run test:models
npx playwright install chromium
npm run test:auth-browser
npm run test:auth-regressions
npm run test:learning-browser
npm run test:practice-browser
```

The browser tests require the build produced by `test:foundation` or `npm run build`. Tests use temporary databases and disposable secrets; they do not contact Groq or Paiza live. See [docs/phase1-verification.md](docs/phase1-verification.md) for verification results. `npx tsc -p tsconfig.app.json --noEmit` still reports pre-existing legacy TypeScript diagnostics across older UI files; `npm run lint` passes with 0 errors.

## Database and migration

SQLite migrations run on server startup and are tracked in `schema_migrations`. Existing accounts and learning records are preserved. Missing profile columns are added deterministically. Browser database version 2 removes obsolete credentials/session stores while keeping progress. Progress sync uses account ownership and version checks, with a per-account offline cache. Back up the SQLite database using SQLite-aware tooling before deploying migrations.

## Security and current limitations

- Passwords are hashed only on the server. All private APIs share JWT verification, including account existence checks.
- AI endpoints require authentication and enforce request limits, per-user/IP quotas, timeouts and disconnect cancellation. Missing AI configuration returns an explicit unavailable response.
- Permanent XP is server-owned. Self-reported learning snapshots cannot increase account XP. A validated learning-event reward ledger is a follow-up.
- Coding submissions are verified server-side against each problem's provided SQLite test cases using the external Paiza execution provider (`server/submissionRunner.ts`). Client-supplied verdicts and test cases are ignored, and Express never executes student code locally. There is no hidden-test LeetCode-style judge or measured memory/percentiles. See [src/features/coding/WORKSPACE.md](src/features/coding/WORKSPACE.md) for supported languages and limitations.
- Password reset remains explicitly unavailable. Email verification, revocation/refresh and HttpOnly-cookie sessions are follow-ups.
- Rate limits are in-memory per process. Distributed deployment needs shared quotas. Bearer tokens in browser storage require careful same-origin script security.
- Tutor/interview histories, code drafts and visualizer sessions remain account-scoped on the device. Learning progress syncs to the server.
- Local deletion does not erase another device's history; progress merges preserve completion records. Device clocks influence selection of concurrent preference edits.

See the architecture document for precise boundaries and deployment follow-ups.
