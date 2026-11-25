#!/usr/bin/env bash
# Alvio WAL-safe SQLite Online Backup, Retention, Optional Off-Host Upload & Failure Alerting
set -euo pipefail

umask 077

APP_DIR="${ALVIO_APP_DIR:-/opt/alvio}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/alvio}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
DATABASE_PATH="${DATABASE_PATH:-/var/lib/alvio/database.sqlite}"
ALERT_WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"
STAMP="$(date -u +%Y-%m-%dT%H%M%SZ)"
BACKUP_FILE="${1:-${BACKUP_DIR}/alvio-${STAMP}.sqlite}"

notify_failure() {
  local exit_code="$?"
  local msg="Alvio backup failed (exit=${exit_code}) on $(hostname) at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "[backup] ERROR: ${msg}" >&2
  if [[ -n "${ALERT_WEBHOOK_URL}" ]]; then
    curl -fsS --max-time 5 -X POST -H "Content-Type: application/json" \
      -d "{\"event\":\"backup_failed\",\"host\":\"$(hostname)\",\"exitCode\":${exit_code},\"message\":\"${msg}\"}" \
      "${ALERT_WEBHOOK_URL}" >/dev/null 2>&1 || true
  fi
  exit "${exit_code}"
}
trap notify_failure ERR

mkdir -p "${BACKUP_DIR}"
chmod 0750 "${BACKUP_DIR}" || true

echo "[backup] Creating WAL-safe atomic SQLite snapshot: ${BACKUP_FILE}"
DATABASE_PATH="${DATABASE_PATH}" npx --prefix "${APP_DIR}" tsx "${APP_DIR}/server/backupDb.ts" "${BACKUP_FILE}"
chmod 0600 "${BACKUP_FILE}"

if [[ -n "${BACKUP_S3_URI:-}" ]]; then
  echo "[backup] Uploading snapshot to off-host S3 bucket..."
  aws s3 cp "${BACKUP_FILE}" "${BACKUP_S3_URI%/}/$(basename "${BACKUP_FILE}")" --sse AES256
elif [[ -n "${BACKUP_RCLONE_REMOTE:-}" ]]; then
  echo "[backup] Uploading snapshot to off-host rclone remote..."
  rclone copyto "${BACKUP_FILE}" "${BACKUP_RCLONE_REMOTE%/}/$(basename "${BACKUP_FILE}")"
fi

echo "[backup] Enforcing ${RETENTION_DAYS}-day local retention in ${BACKUP_DIR}..."
find "${BACKUP_DIR}" -maxdepth 1 -type f -name "alvio-*.sqlite" -mtime "+${RETENTION_DAYS}" -delete

echo "[backup] Completed and verified: ${BACKUP_FILE}"
