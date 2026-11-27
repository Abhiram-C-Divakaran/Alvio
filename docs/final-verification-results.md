# Alvio — Final Verification & Operational Validation Results (Phases 1–7)

- **Verification Date:** 2026-11-27
- **Base Branch:** `main` (Phases 1–6 merged through `70287c4`; Phase 7 hidden-test expansion & oracle audit on `feat/phase7-complete-hidden-test-coverage`)
- **Runtime Verified:** Node.js `v24.13.0` (`node:sqlite` built-in), npm `11.19.0`, Ubuntu Linux `ubuntu-latest` (`Docker v29.4.2`, `runc` + official Google gVisor `runsc`)
- **Database Safety:** Every automated test, backup/restore drill, and operational drill executes against isolated temporary SQLite databases. Existing `data/database.sqlite` and user records are never modified or reset.

---

## 1. Honest Verification Scope Matrix

| Capability / Environment | Verified Locally | Verified in GitHub Actions (Ubuntu Linux) | Verified on Staging VM | Verified in Production VM | Status / Notes |
| --- | --- | --- | --- | --- | --- |
| Lint (`oxlint`), TypeScript (0 errors), Production Build (`vite` + `esbuild`) | **YES** | **YES** | Not yet provisioned | Not yet provisioned | Clean across `src/`, `server/`, `server/hiddenTests/`, `judge-worker/` |
| Backend, Auth, Security, XP, Oracle Hidden Tests, Env Validator, Restart & Rollback Tests (`test:foundation`) | **YES (91/91)** | **YES (91/91)** | Not yet provisioned | Not yet provisioned | Includes 384-problem / 1,636-case oracle validation, API/bundle leakage guards, `release-hardening`, and `phase6-operations` |
| Domain Models (`test:models`) & Playwright Browser Regressions (16 suites) | **YES** | **YES** | Not yet provisioned | Not yet provisioned | Auth, profile, coding, navigation (8 viewports), video, tutor, visualizer, quiz, progress, PvP, interview |
| Live Linux Docker (`runc`) & Official gVisor (`runsc`) Judge (All 7 Languages + Security) | Local Docker daemon not running | **YES (12/12 `runc`, 12/12 `runsc`)** | Not yet provisioned | Not yet provisioned | Live `docker inspect` confirms `HostConfig.Runtime=runsc`; zero mocks |
| Live Ubuntu Operational Drill (`run-backup.sh` `0600`, `db:restore`, `health-monitor.sh`, `validate-deployment.sh`, `rollback-judge.sh`) | Script contract & Node restart tested | **YES (live Ubuntu + `runsc`)** | Not yet provisioned | Not yet provisioned | Executed live against real `dist/server.cjs` + real gVisor worker in CI |
| Cloud HTTPS Domain, Certbot TLS, Private VPC Host A + Host B Provisioning | N/A | N/A | **NOT YET VERIFIED** | **NOT YET VERIFIED** | Blocked solely on operator cloud/VM/DNS/SSH credentials; exact commands in `docs/deployment.md` |
| Live External APIs (Groq AI & Paiza.IO) | Previously verified (`test:ai-live` 3/3 + live Paiza submit) | Mocked/offline in CI (`GROQ_API_KEY=""`) | **NOT YET VERIFIED** | **NOT YET VERIFIED** | Requires operator `GROQ_API_KEY`, `PAIZA_API_KEY`, `RESEND_API_KEY` on target host |

---

## 2. Automated Verification Results (`npm run test:demo` — No Paid API Keys Required)

| # | Command / Check | Result | Actual Counts / Details |
| --- | --- | --- | --- |
| 1 | `npm audit --audit-level=high` | **PASS** | `0` critical, `0` high (`2` moderate dev-time `postcss-selector-parser` advisories via `@tailwindcss/typography`) |
| 2 | `npm run lint` (`oxlint`) | **PASS** | `0` errors, `0` warnings in `src/`, `server/`, `judge-worker/` (`3` legacy warnings in `tests/*.cjs`) |
| 3 | `bash -n deploy/*.sh` (Linux CI) | **PASS** | All 6 shell scripts syntax-checked (`setup-api-host.sh`, `setup-judge-host.sh`, `run-backup.sh`, `health-monitor.sh`, `validate-deployment.sh`, `rollback-judge.sh`) |
| 4 | `npx tsc -p tsconfig.app.json --noEmit` & node/server/worker `tsc` | **PASS** | **0 errors** across app, Vite config, `server.ts`, `server/seedHiddenTests.ts` (including `server/hiddenTests/*.ts`), `server/hiddenTestCoverage.ts`, `server/validateEnv.ts`, and `judge-worker/server.ts` |
| 5 | `npm run build` | **PASS** | Route-lazy-loaded frontend bundle (`index` ~92 kB gzip) + `dist/server.cjs` |
| 6 | `npm run db:hidden-coverage -- --text` | **PASS** | **384/472** (`81.36%` overall; **100%** of cleanly verifiable problems), **1,636** oracle-verified hidden cases, **88** audited manual-review items, **0** unflagged uncovered, **0** low-diversity |
| 7 | `npm run test:foundation` | **PASS** | **91/91 passed, 0 failed** across 15 test suites (`backend-foundation`, `auth-hardening`, `auth-recovery`, `backend-reliability`, `xp-ledger`, `backup-and-judge`, `hidden-tests-and-restore`, `hidden-tests-coverage`, `isolated-judge-worker`, `release-hardening`, `phase6-operations`, `progress-sync`, `optional-auth`, `coding-submissions`, `ai-chat`) |
| 8 | `npm run test:models` | **PASS** | **10/10 passed across 7 files, 0 failed** |
| 9 | `npm run test:auth-browser` | **PASS** | **4/4 passed, 0 failed** |
| 10 | `npm run test:auth-regressions` | **PASS** | **4/4 browser suites passed** (`auth`, `profile`, `coding-workspace`, `coding-language`) |
| 11 | `npm run test:learning-browser` | **PASS** | **4/4 browser suites passed** (`navigation-shell` across 8 viewports, `video-lessons`, `tutor`, `visualizer`) |
| 12 | `npm run test:practice-browser` | **PASS** | **4/4 browser suites passed** (`quiz`, `progress`, `pvp`, `interview-live`) |

---

## 3. Live Linux Docker (`runc`), Live gVisor (`runsc`) & Operational Drill (ZERO MOCKS)

Executed automatically in GitHub Actions (`.github/workflows/ci.yml`) on Ubuntu Linux (`Docker v29.4.2`):

- **`live-gvisor-judge` (`JUDGE_DOCKER_RUNTIME=runsc`):** **12/12 PASS** — official `runsc` installed & registered; live `docker inspect` confirms `HostConfig.Runtime=runsc`; all 7 languages (JS, TS, Python 3, C, C++, Java, C# via `mono:6.12`) verified for Pass/WA/CE/RE; two-phase hidden-test anti-exfiltration; timeout, OOM, 64 KB output cap, `--network=none`, `--read-only`, UID `65534`, stripped host env, concurrency saturation (`503`), disconnect cancel, worker/daemon outages (`503`), and 0 orphaned containers.
- **Live Ubuntu Linux Operational Drill (inside `live-gvisor-judge`):** Boots real `dist/server.cjs` + real `runsc` judge worker, runs `npm run ops:check-env`, executes `deploy/run-backup.sh` (verifying `0600` permissions + `PRAGMA integrity_check`), verifies `npm run db:restore`, executes `deploy/health-monitor.sh` (`CHECK_LOCAL_DOCKER=true` + backup freshness + disk/DB checks + `runtimeVerified: true`), executes `deploy/validate-deployment.sh`, and verifies `deploy/rollback-judge.sh --no-restart` switches `JUDGE_PROVIDER=paiza`.
- **`live-docker-judge` (`default-runc`):** **12/12 PASS** — builds `judge-worker/Dockerfile`, pre-pulls all 5 pinned runtime images, and runs the full 12/12 suite.

---

## 4. Database, Hidden-Test Coverage & Recovery Verification

- **Schema Migrations:** **9** numbered, transactional, multi-process-safe SQLite migrations (Migration #9 adds 4 read-path indexes verified via `EXPLAIN QUERY PLAN`).
- **Catalog & Hidden Tests (`npm run db:hidden-coverage -- --text`):** **472** coding problems; **384 problems (81.36% overall; 100% of cleanly verifiable problems)** covered by **1,636 independently oracle-verified server-only hidden test cases** (Easy: `177/185` [95.68%, 769 cases], Medium: `155/212` [73.11%, 645 cases], Hard: `52/75` [69.33%, 222 cases]), plus **88** explicitly audited manual-review entries in `server/hiddenTests/manualReview.ts` and [docs/hidden-test-coverage.md](./hidden-test-coverage.md). Seeding takes `~8.7 ms` (idempotent re-seed `~8.0 ms`); full 384-problem oracle suite runs in `~75 ms`.
- **Backup, Restore & Restart Recovery:** Online WAL-safe `VACUUM INTO` (`deploy/run-backup.sh` with `0600` permissions) + `PRAGMA integrity_check === 'ok'` + destructive mutation + full restore preserving accounts, sessions, `learning_progress`, `xp_ledger`, `user_submissions`, all 472 problems, and all **1,636** hidden tests.

---

## 5. Remaining Known Limitations & Required Operator Access

1. **Live Cloud Staging & Production Hosting Not Yet Provisioned:** No cloud provider account/CLI, SSH host access, DNS zone, or TLS domain credentials exist in this workspace. Operator provisioning steps are documented in [docs/deployment.md](./deployment.md) and [docs/operations-runbook.md](./operations-runbook.md).
2. **Paiza Fallback Active Until Target Judge Host Verification:** `JUDGE_PROVIDER` remains `paiza` by default until `JUDGE_DOCKER_RUNTIME=runsc npm run test:judge-live-docker` passes directly on your dedicated private Linux judge VM.
3. **External Provider Keys Required on Target Host:** Live AI (`GROQ_API_KEY`) and transactional email recovery (`RESEND_API_KEY` + `EMAIL_FROM` or `EMAIL_WEBHOOK_URL`) require operator credentials; when unset, endpoints fail closed with honest `503` responses.
4. **Audited Manual-Review Problem Queue (`88/472` = `18.64%`):** 51 legacy catalog entries have comma-stripped or mathematically invalid visible tests, 15 require an unordered set/multiset comparator, 9 require float return types/epsilon tolerance, 9 have ambiguous/mismatched specs, 3 use unsupported `TreeNode` signatures, and 1 lacks an external oracle API. All 88 are catalogued with remediation steps in [docs/hidden-test-coverage.md](./hidden-test-coverage.md).
5. **Single-Host SQLite Boundary & Separate UI Branch:** Multi-host horizontal Express scaling requires PostgreSQL + `RATE_LIMIT_STORE=redis`; PR #1 (`ui/premium-dashboard-refresh`) remains open and unmerged due to pre-`AppShell` UI divergence.
