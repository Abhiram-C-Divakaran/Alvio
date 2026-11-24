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
| `RATE_LIMIT_STORE` | Optional | `sqlite` for restart-persistent / single-host shared quotas (or `memory` default) |
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
npx tsx server/migrateProblems.ts   # First-time catalog seed on a fresh database
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

## 7. Multi-Host Scaling Notes

Single-host production works out of the box with SQLite (WAL mode) + `RATE_LIMIT_STORE=sqlite`. Scaling horizontally across multiple application hosts requires:
1. Replacing `RateLimitStore` with a Redis-backed implementation.
2. Migrating persistence from local SQLite to a shared database (PostgreSQL).
3. Offloading coding execution to a dedicated isolated container/microVM judge worker queue.
