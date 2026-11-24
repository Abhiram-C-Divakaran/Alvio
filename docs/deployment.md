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

Startup runs all 8 numbered, transactional SQLite migrations automatically and refuses to boot if `JWT_SECRET` (<32 chars) or `ALLOWED_ORIGINS` (in production) is missing.

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

- **Default fallback:** Keep `JUDGE_PROVIDER=paiza` until `judge-worker/` is deployed and live-verified on a Linux host with Docker (and ideally gVisor `runsc` or Kata Containers / Firecracker microVMs).
- **Mandatory production authentication:** Both `judge-worker/server.ts` and `createIsolatedJudgeProvider` in production require a shared secret `ISOLATED_JUDGE_TOKEN` (>= 32 characters recommended; timing-safe Bearer validation).
- **Container hardening enforced per job:** `--rm`, `--network=none`, `--read-only`, size-capped `--tmpfs` (`/tmp` `noexec,nosuid,nodev` + `/work` `nosuid,nodev`), `--cap-drop=ALL`, `--security-opt=no-new-privileges:true`, `--pids-limit=64`, `--memory=<mb>m --memory-swap=<mb>m`, `--cpus=1`, `--user=65534:65534`, zero host bind mounts, stripped host environment variables, wall-clock timeout with forced `docker rm -f`, 64 KB output cap, and concurrency admission control (`JUDGE_MAX_CONCURRENT_JOBS`).
- **Pre-pull images before enabling traffic:** Because containers run with `--network=none`, pre-pull `node:22-alpine`, `python:3.12-alpine`, `gcc:14-bookworm`, `eclipse-temurin:21-jdk-alpine`, and `mcr.microsoft.com/dotnet/sdk:8.0-alpine` on the judge host, start the worker (`judge-worker/docker-compose.yml` or `npm run judge:worker`), verify `GET /health` returns `200` with `"docker": "ok"`, and switch Express to `JUDGE_PROVIDER=isolated`.

---

## 8. Multi-Host Scaling Notes

Single-host production works out of the box with SQLite (WAL mode) + `RATE_LIMIT_STORE=sqlite`. Scaling horizontally across multiple application hosts requires:
1. Setting `RATE_LIMIT_STORE=redis` with `REDIS_REST_URL` and `REDIS_REST_TOKEN`.
2. Migrating persistence from local SQLite to a shared database (PostgreSQL).
3. Running the standalone `judge-worker/` on dedicated isolated Linux/gVisor/microVM compute nodes behind internal TLS.
