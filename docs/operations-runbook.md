# Alvio Operations, Incident Recovery & Secret Rotation Runbook

This runbook defines concrete day-2 operational procedures for Alvio staging and production hosts.

---

## 1. Monitoring & Alerting Thresholds

Install and enable [alvio-health-monitor.service](../deploy/alvio-health-monitor.service) + [alvio-health-monitor.timer](../deploy/alvio-health-monitor.timer) (runs [deploy/health-monitor.sh](../deploy/health-monitor.sh) every 5 minutes). Configure `ALERT_WEBHOOK_URL` in `/etc/alvio/api.env` to route JSON alert payloads to Slack/PagerDuty/Discord/Alertmanager.

| Signal | Probe / Check | Alert Condition | Action |
| --- | --- | --- | --- |
| API liveness | `GET /api/health` | Non-`200` or timeout > 5s | Inspect `journalctl -u alvio-api -n 100`, restart service if wedged |
| API & DB readiness | `GET /api/ready` | Non-`200` or `status != "ready"` | Check SQLite disk mount, permissions (`alvio:alvio`), and `PRAGMA integrity_check` |
| Judge worker health | `GET http://<HOST_B>:4005/health` | Non-`200`, `docker != "ok"`, or `runtimeVerified != true` | Inspect `alvio-judge-worker` & Docker/`runsc` on Host B; roll back to Paiza if prolonged |
| Orphan containers | `docker ps -a --filter name=alvio-judge- --filter status=exited` | Any exited container remaining | Inspect worker logs, run `docker rm -f <id>`, verify `--rm` and `forceRemoveContainer` |
| Elevated HTTP 503 rate | `journalctl -u alvio-api --since "5 minutes ago"` | `>= 10` `503` responses in 5 min | Check judge concurrency (`JUDGE_MAX_CONCURRENT_JOBS`), Groq/Paiza outages, or DB lock contention |
| Backup failure / staleness | [deploy/run-backup.sh](../deploy/run-backup.sh) + `CHECK_BACKUP_DIR` | Exit != 0 or latest snapshot > 26h old | Inspect `journalctl -u alvio-backup`, verify disk space and off-host S3/rclone credentials |
| Disk & DB growth | `df` on `DATABASE_PATH` mount & file size | Disk >= 85% or DB >= 2048 MB | Prune old backups, expand volume, or evaluate PostgreSQL migration threshold |

---

## 2. Structured Log Policy (Zero Secret / Code Leakage)

- **API logs (`journalctl -u alvio-api`):** Structured JSON lines `{ requestId, method, route, status, durationMs, userId }` on stdout; error events `{ requestId, event, ... }` on stderr. Never logs `JWT_SECRET`, cookies, `Authorization` headers, `GROQ_API_KEY`, `RESEND_API_KEY`, or raw student source code.
- **Judge worker logs (`journalctl -u alvio-judge-worker`):** Logs lifecycle and runtime metadata only — never logs `ISOLATED_JUDGE_TOKEN`, student code, or hidden test cases.

---

## 3. Rollback Procedures

### A. Instant Coding Judge Rollback (`isolated` → `paiza`)

While the isolated judge host is degraded or unreachable, Express fails closed with `503 provider_unavailable` (never runs student code on the API host and never corrupts verdicts). To restore coding submissions immediately via Paiza fallback:

```bash
sudo bash /opt/alvio/deploy/rollback-judge.sh --env-file /etc/alvio/api.env
```

This backs up `/etc/alvio/api.env`, sets `JUDGE_PROVIDER=paiza`, restarts `alvio-api.service`, and verifies `GET /api/ready`.

### B. Application Build Rollback

```bash
cd /opt/alvio
git fetch --tags origin
git checkout <previous-known-good-sha>
npm ci && npm run build
sudo systemctl restart alvio-api.service
curl -fsS http://127.0.0.1:3001/api/ready
```

Note: SQLite migrations (`1..9`) are strictly additive and forward-compatible with existing rows; only restore a DB snapshot if data corruption occurred.

### C. Database Snapshot Recovery (Restore Drill & Incident Restore)

Never run destructive drills against live production data — always verify restore into a disposable path first:

```bash
# Non-destructive restore verification drill:
npm run db:restore -- /var/backups/alvio/<snapshot>.sqlite /tmp/alvio-restore-drill.sqlite
rm -f /tmp/alvio-restore-drill.sqlite

# Live incident restore (only when production DB is corrupted/lost):
sudo systemctl stop alvio-api.service
sudo -u alvio env DATABASE_PATH=/var/lib/alvio/database.sqlite \
  npm run db:restore -- /var/backups/alvio/<snapshot>.sqlite /var/lib/alvio/database.sqlite
sudo systemctl start alvio-api.service
curl -fsS http://127.0.0.1:3001/api/ready
```

---

## 4. Incident Recovery Checklist

1. **API outage (`502/503` at Nginx):** Check `systemctl status alvio-api nginx`, inspect `journalctl -u alvio-api -n 100`, verify `/var/lib/alvio` disk space (`df -h`), restart `alvio-api.service`, and run `deploy/validate-deployment.sh`.
2. **Judge worker outage (`503 provider_unavailable` on submit):** Check `curl http://<HOST_B>:4005/health` from Host A. If Host B Docker/`runsc` cannot recover within 2 minutes, run `sudo bash /opt/alvio/deploy/rollback-judge.sh` to restore submissions on Paiza while repairing Host B.
3. **External AI (`GROQ_API_KEY`) or Email (`RESEND_API_KEY`) outage:** Express degrades honestly with bounded timeouts (60s AI, 1 single transient retry before headers) and explicit `503` responses without blocking core authentication, lessons, visualizers, quizzes, or coding practice.

---

## 5. Secret Rotation Procedure

All secrets live exclusively in `/etc/alvio/api.env` (`0640 root:alvio`) on Host A and `/etc/alvio/judge-worker.env` (`0600 root:root`) on Host B.

| Secret | Rotation Steps | User / Service Impact |
| --- | --- | --- |
| `ISOLATED_JUDGE_TOKEN` | 1. Generate new 48-byte hex token (`openssl rand -hex 48`). 2. Temporarily roll back to `paiza` OR schedule a 10s maintenance window. 3. Update token in `/etc/alvio/judge-worker.env` on Host B and `systemctl restart alvio-judge-worker`. 4. Update token in `/etc/alvio/api.env` on Host A and `systemctl restart alvio-api`. 5. Verify `deploy/health-monitor.sh`. | Zero session impact; < 5s coding submit pause if done without Paiza bridge |
| `JWT_SECRET` | 1. Generate new 48-byte hex secret. 2. Update `/etc/alvio/api.env` on Host A. 3. `systemctl restart alvio-api.service`. | All existing access JWTs are invalidated immediately; signed-in browsers with valid `alvio_refresh` cookies automatically rotate via `POST /api/auth/refresh` on next API call, or re-authenticate cleanly |
| `GROQ_API_KEY` | 1. Issue new key in Groq console. 2. Update `/etc/alvio/api.env` and restart `alvio-api.service`. 3. Revoke old key after verifying `/api/chat`. | Zero downtime beyond 1–2s Express restart |
| `RESEND_API_KEY` / `EMAIL_WEBHOOK_SECRET` | 1. Issue new provider key. 2. Update `/etc/alvio/api.env` and restart `alvio-api.service`. 3. Trigger a test password reset on a staging account, then revoke old key. | Zero impact to active sessions |
| `PAIZA_API_KEY` | 1. Update `/etc/alvio/api.env` and restart `alvio-api.service`. | Affects only Paiza fallback submissions |
