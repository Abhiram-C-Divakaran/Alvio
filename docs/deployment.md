# Alvio Production Deployment & Operations Guide

This guide documents everything required to deploy, monitor, back up, and recover **Alvio** safely in production on Node.js 24+.

---

## 1. Prerequisites

- **Node.js 24+** (`node:sqlite` built-in) and **npm**
- **Persistent disk volume** mounted for SQLite (`DATABASE_PATH`, including `-wal` and `-shm` sidecar files) — ephemeral filesystems will lose accounts and progress.
- **HTTPS reverse proxy** (Nginx, Caddy, Cloudflare Tunnel, or cloud load balancer) terminating TLS in front of Express.

---

## 2. Production Environment Variables

Never commit `.env` or hardcode secrets. Supply secrets through your host's secret manager:

| Variable | Required | Recommended Production Value |
| --- | --- | --- |
| `NODE_ENV` | **Yes** | `production` |
| `JWT_SECRET` | **Yes** | Random 48+ byte hex string (`node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`) |
| `ALLOWED_ORIGINS` | **Yes** | Exact HTTPS origin(s), comma-separated, no trailing slash (e.g. `https://alvio.example.com`) |
| `PORT` | Optional | `3001` (or platform-assigned port) |
| `DATABASE_PATH` | **Yes (recommended)** | Persistent volume path, e.g. `/var/lib/alvio/database.sqlite` |
| `COOKIE_SECURE` | **Yes (HTTPS)** | `true` |
| `TRUST_PROXY` | **Yes (behind proxy)** | `true` (enables `X-Forwarded-Proto` HTTPS detection and real client IP rate limiting) |
| `JWT_ACCESS_TTL` | Optional | `15m` (short-lived access JWT) |
| `JWT_REFRESH_DAYS` | Optional | `7` (rotating refresh session window) |
| `RATE_LIMIT_STORE` | Optional | `memory` (default), `sqlite` (single-host persistent), or `redis` (multi-instance with `REDIS_REST_URL` + `REDIS_REST_TOKEN`) |
| `JUDGE_PROVIDER` | Optional | `paiza` (default) or `isolated` (dedicated container/microVM judge worker via `ISOLATED_JUDGE_URL`, `ISOLATED_JUDGE_TOKEN`, `JUDGE_CPU_LIMIT_SEC`, `JUDGE_MEMORY_LIMIT_MB`) |
| `GROQ_API_KEY` | Optional (AI features) | Server-only Groq API key |
| `GROQ_CHAT_MODEL` | Optional | `openai/gpt-oss-120b` |
| `GROQ_VISUALIZER_MODEL` | Optional | `openai/gpt-oss-120b` |
| `PAIZA_API_KEY` | Optional | Paiza execution API key (defaults to `guest`) |
| `RESEND_API_KEY` + `EMAIL_FROM` | Optional (Recovery) | Enables live password reset & email verification emails (or use `EMAIL_WEBHOOK_URL` + `EMAIL_WEBHOOK_SECRET`) |

---

## 3. Build, Seed & Start

```sh
npm ci
npm run build
npx tsx server/migrateProblems.ts   # First-time catalog + curated hidden test seed on a fresh database
npm run db:seed-hidden-tests        # Idempotently seed/update curated server-only hidden tests on an existing DB
NODE_ENV=production npm start
```

Startup runs all 9 numbered, transactional SQLite migrations automatically and refuses to boot if `JWT_SECRET` (<32 chars) or `ALLOWED_ORIGINS` (in production) is missing.

---

## 4. Reverse Proxy & HTTPS Example (Nginx)

```nginx
server {
  listen 443 ssl http2;
  server_name alvio.example.com;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off; # Required for /api/chat Server-Sent Events streaming
    proxy_read_timeout 70s;
  }
}
```

---

## 5. Health Checks, Logging & Monitoring

- **Liveness probe:** `GET /api/health` → `200 { status: "ok", database: "ok", uptimeSeconds, timestamp }` (`503` on DB failure).
- **Readiness probe:** `GET /api/ready` → `200 { status: "ready", database: "ok", migrationVersion, problemsCount, timestamp }` (`503` if uninitialized/unavailable).
- **Structured JSON logs:** Every `/api/*` request logs `{ requestId, method, route, status, durationMs, userId }` to `stdout`; failures log structured JSON events to `stderr` without credentials, student code, or raw provider secrets.
- **Graceful shutdown:** Sending `SIGINT` or `SIGTERM` stops accepting new HTTP connections, closes SQLite cleanly, and exits with a 5-second drain failsafe.

---

## 6. Database Backup & Recovery Procedure

### Online Backup (Safe While Server Is Running)

```sh
npm run db:backup
# Or specify an explicit path:
npx tsx server/backupDb.ts /var/backups/alvio/alvio-$(date +%F).sqlite
```

`server/backupDb.ts` uses SQLite's atomic, WAL-safe `VACUUM INTO` statement and immediately runs `PRAGMA integrity_check` plus schema/row verification. Schedule this via cron/systemd timer and ship snapshots to off-host encrypted storage.

### Tested Recovery Procedure

1. Stop the running Alvio Express process (`SIGTERM`).
2. Run the verified restore utility (validates `PRAGMA integrity_check` on the backup first, removes stale `-wal`/`-shm` files, atomically replaces `DATABASE_PATH`, and re-verifies):
   ```sh
   npm run db:restore -- /var/backups/alvio/alvio-backup.sqlite
   ```
3. Start Alvio (`NODE_ENV=production npm start`) and verify `GET /api/ready` returns `200`.

---

## 7. Dedicated Isolated Coding Judge Worker (Phase 3)

Alvio ships a standalone isolated coding judge worker under [`judge-worker/`](../judge-worker/README.md) so Express never executes untrusted student code in-process.

- **Required infrastructure & isolation boundary:** Deploy `judge-worker/` on a **dedicated Linux VM/node** separated from the Express API and database host. Mounting `/var/run/docker.sock` gives the worker root-equivalent control over Docker on that host; never co-locate it with application secrets or databases, and never expose port `4005` publicly. Standard Docker (`runc`) shares the host kernel — for untrusted public traffic, install **gVisor** (`JUDGE_DOCKER_RUNTIME=runsc`), **Kata Containers**, or **Firecracker microVMs**.
- **Default fallback & switching:** Keep `JUDGE_PROVIDER=paiza` until `judge-worker/` passes live verification (`npm run test:judge-live-docker`) on your target Linux host. To switch: set `JUDGE_PROVIDER=isolated`, `ISOLATED_JUDGE_URL`, `ISOLATED_JUDGE_TOKEN` (>= 32 chars, mandatory in production), `JUDGE_CPU_LIMIT_SEC=5`, `JUDGE_MEMORY_LIMIT_MB=256`. To roll back at any time, set `JUDGE_PROVIDER=paiza` and restart Express.
- **Container hardening enforced per job:** `--rm`, `--network=none`, `--read-only`, `--tmpfs /tmp:rw,noexec,nosuid,nodev,size=32m`, `--tmpfs /work:rw,nosuid,nodev,size=64m`, `--cap-drop=ALL`, `--security-opt=no-new-privileges:true`, `--pids-limit=64`, `--memory=<mb>m --memory-swap=<mb>m`, `--cpus=1`, `--user=65534:65534`, in-container `ulimit -t` & `ulimit -f`, zero host bind mounts, stripped host env, client-disconnect container kill, wall-clock timeout with forced `docker rm -f`, 64 KB output cap, and concurrency admission control (`JUDGE_MAX_CONCURRENT_JOBS`).
- **Pre-pull images before enabling traffic:** Because containers run with `--network=none`, pre-pull `node:22-alpine`, `python:3.12-alpine`, `gcc:14-bookworm`, `eclipse-temurin:21-jdk-alpine`, and `mono:6.12` on the judge host, start the worker (`judge-worker/docker-compose.yml` or `npm run judge:worker`), and monitor `GET /health` (`200` with `"docker": "ok"`, `503` on daemon failure).
- **Failure recovery & monitoring:** Alert on non-`200` responses from `GET /health`, elevated HTTP `503` rates (`activeJobs >= maxConcurrentJobs` or daemon/image errors), and any lingering `alvio-judge-*` containers (`docker ps -a --filter name=alvio-judge-`). Worker outages always return explicit HTTP `503 provider_unavailable` from Express — never Wrong Answer and never host-process execution.

---

## 8. Turnkey Deployment Artifacts (`deploy/`), Validation, Rollback & Scaling

Ready-to-use Linux staging/production templates are shipped in [`deploy/`](../deploy/):

- [`deploy/api.env.example`](../deploy/api.env.example) & [`deploy/judge-worker.env.example`](../deploy/judge-worker.env.example) — secret-free environment templates for Host A (`/etc/alvio/api.env`, `chmod 640 root:alvio`) and Host B (`/etc/alvio/judge-worker.env`, `chmod 600 root:root`).
- [`deploy/setup-api-host.sh`](../deploy/setup-api-host.sh) — bootstraps Host A (verifies Node.js 24+, creates `alvio` user and persistent `/var/lib/alvio` + `/var/backups/alvio`, builds production bundle, runs secret-safe `npm run ops:check-env`, runs migrations/seed without overwriting existing DBs, enables API, backup, and monitor timers).
- [`deploy/setup-judge-host.sh`](../deploy/setup-judge-host.sh) — bootstraps dedicated Ubuntu Host B with official **gVisor (`runsc`)**, verifies `runsc` registration in Docker, pre-pulls all 5 pinned language images, and locks UFW port `4005` exclusively to `EXPRESS_PRIVATE_IP`.
- [`deploy/alvio-api.service`](../deploy/alvio-api.service) & [`deploy/alvio-judge-worker.service`](../deploy/alvio-judge-worker.service) — hardened `systemd` units with graceful `SIGTERM` handling and journald structured logs.
- [`deploy/run-backup.sh`](../deploy/run-backup.sh), [`deploy/alvio-backup.service`](../deploy/alvio-backup.service) & [`deploy/alvio-backup.timer`](../deploy/alvio-backup.timer) — automated daily WAL-safe `VACUUM INTO` backups with `umask 077` (`chmod 0600`), `PRAGMA integrity_check`, 14-day local retention, optional off-host S3/rclone upload (`BACKUP_S3_URI` / `BACKUP_RCLONE_REMOTE`), and failure webhook alerting (`ALERT_WEBHOOK_URL`).
- [`deploy/nginx-alvio.conf`](../deploy/nginx-alvio.conf) — TLS 1.2/1.3 reverse proxy with HSTS and `proxy_buffering off` for `/api/chat` SSE (port `4005` never proxied).
- [`deploy/health-monitor.sh`](../deploy/health-monitor.sh), [`deploy/alvio-health-monitor.service`](../deploy/alvio-health-monitor.service) & [`deploy/alvio-health-monitor.timer`](../deploy/alvio-health-monitor.timer) — 5-minute operational monitor checking `/api/health`, `/api/ready`, judge `/health` (`runtimeVerified: true`), exited orphan `alvio-judge-*` containers, disk usage %, SQLite DB size growth, backup freshness (<26h), HTTP 503 spike counts, and optional webhook alerts.
- [`deploy/validate-deployment.sh`](../deploy/validate-deployment.sh) — zero-mock live verifier checking public HTTPS headers/HSTS, `/api/health`, `/api/ready` (migration >= 9, 472 problems), CORS origin rejection, unauthenticated `401` enforcement, public non-exposure of port `4005`, and private judge `runsc` health.
- [`deploy/rollback-judge.sh`](../deploy/rollback-judge.sh) — controlled `JUDGE_PROVIDER=isolated` → `paiza` rollback script with env backup, restart, and readiness verification.

See [docs/operations-runbook.md](./operations-runbook.md) for full incident recovery, alerting thresholds, backup/restore drills, and secret rotation procedures.

### Pre-Flight Environment Check & Controlled Cutover (`paiza` ↔ `isolated`)
1. Run `npm run ops:check-env` on Host A (loads no secrets to stdout; exits non-zero if `JWT_SECRET`, HTTPS `ALLOWED_ORIGINS`, `COOKIE_SECURE`, `TRUST_PROXY`, persistent `DATABASE_PATH`, or `ISOLATED_JUDGE_*` are misconfigured).
2. Bootstrap Host B with `deploy/setup-judge-host.sh` and run `JUDGE_DOCKER_RUNTIME=runsc npm run test:judge-live-docker` on Host B (must pass 12/12 under live `runsc`).
3. Verify `deploy/health-monitor.sh` and `deploy/validate-deployment.sh` pass from Host A over private networking.
4. Only after steps 1–3 pass, set `JUDGE_PROVIDER=isolated`, `ISOLATED_JUDGE_URL`, and `ISOLATED_JUDGE_TOKEN` in `/etc/alvio/api.env` and restart `alvio-api.service`.
5. **Instant rollback:** If the isolated judge host degrades, run `sudo bash /opt/alvio/deploy/rollback-judge.sh --env-file /etc/alvio/api.env` (while degraded, Express fails closed with `503 provider_unavailable` and never runs untrusted code on the API host).

### External Services Configuration & Failure Semantics
- **Groq AI (`GROQ_API_KEY`, `GROQ_CHAT_MODEL`, `GROQ_VISUALIZER_MODEL`):** Server-only; 60s timeout, disconnect cancellation, single bounded transient retry before headers. When unset or unreachable, `/api/chat` and `/api/visualizer` return honest `503` without affecting core learning.
- **Paiza Fallback (`PAIZA_API_KEY`):** Defaults to `guest` when unset; used whenever `JUDGE_PROVIDER=paiza` (default until target gVisor host is verified).
- **Email Recovery (`RESEND_API_KEY` + `EMAIL_FROM`, or `EMAIL_WEBHOOK_URL` + `EMAIL_WEBHOOK_SECRET`):** Enables live password-reset and email-verification delivery. When unset, endpoints return honest `503 EMAIL_NOT_CONFIGURED` (never simulated).

### SQLite Suitability vs PostgreSQL + Distributed Rate Limiting
- **When SQLite (WAL mode) + `RATE_LIMIT_STORE=sqlite` is suitable:** Single API host deployments up to ~100–300 concurrent active students (thousands of registered users, tens of thousands of daily progress/submission writes, DB size < 2–5 GB on local SSD/NVMe) where `BEGIN IMMEDIATE` write contention stays sub-10ms.
- **When to migrate to PostgreSQL + `RATE_LIMIT_STORE=redis`:**
  1. Deploying **2+ Express API replicas** behind a load balancer for high availability or horizontal scale (SQLite cannot safely serve concurrent multi-host writers over network filesystems).
  2. Sustained write p95 latency > 50ms or `SQLITE_BUSY` errors under peak classroom/contest traffic.
  3. Zero-downtime online schema migrations or point-in-time recovery (PITR) requirements beyond daily snapshots.
  4. Rate-limit quotas must be shared across multiple API nodes (`RATE_LIMIT_STORE=redis` with `REDIS_REST_URL` + `REDIS_REST_TOKEN` is already implemented in `server/security.ts`).
