#!/usr/bin/env bash
# Operational health, disk/DB growth, backup freshness, 503-rate, and orphan-container monitor
set -euo pipefail

API_URL="${ALVIO_API_URL:-http://127.0.0.1:3001}"
JUDGE_URL="${ISOLATED_JUDGE_URL:-}"
CHECK_DOCKER="${CHECK_LOCAL_DOCKER:-false}"
DATABASE_PATH="${DATABASE_PATH:-}"
CHECK_BACKUP_DIR="${CHECK_BACKUP_DIR:-}"
BACKUP_MAX_AGE_HOURS="${BACKUP_MAX_AGE_HOURS:-26}"
DISK_WARN_PERCENT="${DISK_WARN_PERCENT:-85}"
DB_WARN_MB="${DB_WARN_MB:-2048}"
CHECK_JOURNAL_503="${CHECK_JOURNAL_503:-false}"
MAX_503_PER_5M="${MAX_503_PER_5M:-10}"
ALERT_WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"

send_alert() {
  local event="$1"
  local detail="$2"
  echo "[monitor] ALERT (${event}): ${detail}" >&2
  if [[ -n "${ALERT_WEBHOOK_URL}" ]]; then
    curl -fsS --max-time 5 -X POST -H "Content-Type: application/json" \
      -d "{\"event\":\"${event}\",\"host\":\"$(hostname)\",\"detail\":\"${detail}\"}" \
      "${ALERT_WEBHOOK_URL}" >/dev/null 2>&1 || true
  fi
}

echo "[monitor] Checking API liveness: ${API_URL%/}/api/health"
if ! curl -fsS --max-time 5 "${API_URL%/}/api/health" >/dev/null; then
  send_alert "api_health_failed" "GET ${API_URL%/}/api/health failed"
  exit 1
fi

echo "[monitor] Checking API readiness: ${API_URL%/}/api/ready"
READY_JSON="$(curl -fsS --max-time 5 "${API_URL%/}/api/ready" || true)"
if [[ -z "${READY_JSON}" ]] || ! echo "${READY_JSON}" | grep -q '"status":"ready"'; then
  send_alert "api_readiness_failed" "GET ${API_URL%/}/api/ready did not return ready"
  exit 1
fi

if [[ -n "${JUDGE_URL}" ]]; then
  echo "[monitor] Checking isolated judge worker health: ${JUDGE_URL%/}/health"
  HEALTH_JSON="$(curl -fsS --max-time 5 "${JUDGE_URL%/}/health" || true)"
  echo "${HEALTH_JSON}"
  if ! echo "${HEALTH_JSON}" | grep -q '"status":"ok"' \
    || ! echo "${HEALTH_JSON}" | grep -q '"docker":"ok"' \
    || ! echo "${HEALTH_JSON}" | grep -q '"runtimeVerified":true'; then
    send_alert "judge_health_failed" "Isolated judge worker health or runtimeVerified check failed"
    exit 1
  fi
fi

if [[ "${CHECK_DOCKER}" == "true" ]]; then
  ORPHANS="$(docker ps -a --filter name=alvio-judge- --filter status=exited --format '{{.Names}}')"
  if [[ -n "${ORPHANS}" ]]; then
    send_alert "orphan_judge_containers" "Exited alvio-judge containers found: ${ORPHANS}"
    exit 2
  fi
fi

if [[ -n "${DATABASE_PATH}" && -f "${DATABASE_PATH}" ]]; then
  DB_DIR="$(dirname "${DATABASE_PATH}")"
  DISK_PCT="$(df -P "${DB_DIR}" | awk 'NR==2 { gsub(/%/, "", $5); print $5 }')"
  DB_BYTES="$(wc -c < "${DATABASE_PATH}")"
  DB_MB="$(( DB_BYTES / 1048576 ))"
  echo "[monitor] Disk usage on ${DB_DIR}: ${DISK_PCT}% (warn >= ${DISK_WARN_PERCENT}%); SQLite DB size: ${DB_MB} MB (warn >= ${DB_WARN_MB} MB)"
  if [[ "${DISK_PCT}" -ge "${DISK_WARN_PERCENT}" ]]; then
    send_alert "disk_usage_high" "Disk usage on ${DB_DIR} is ${DISK_PCT}% (threshold ${DISK_WARN_PERCENT}%)"
    exit 3
  fi
  if [[ "${DB_MB}" -ge "${DB_WARN_MB}" ]]; then
    send_alert "database_size_high" "SQLite DB size is ${DB_MB} MB (threshold ${DB_WARN_MB} MB)"
    exit 4
  fi
fi

if [[ -n "${CHECK_BACKUP_DIR}" && -d "${CHECK_BACKUP_DIR}" ]]; then
  LATEST_BACKUP="$(find "${CHECK_BACKUP_DIR}" -maxdepth 1 -type f -name 'alvio-*.sqlite' -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -n 1 | cut -d' ' -f2- || true)"
  if [[ -z "${LATEST_BACKUP}" ]]; then
    send_alert "backup_missing" "No alvio-*.sqlite backup snapshot found in ${CHECK_BACKUP_DIR}"
    exit 5
  fi
  NOW_EPOCH="$(date +%s)"
  BACKUP_EPOCH="$(stat -c %Y "${LATEST_BACKUP}")"
  AGE_HOURS="$(( (NOW_EPOCH - BACKUP_EPOCH) / 3600 ))"
  echo "[monitor] Latest backup: ${LATEST_BACKUP} (age: ${AGE_HOURS}h, max: ${BACKUP_MAX_AGE_HOURS}h)"
  if [[ "${AGE_HOURS}" -gt "${BACKUP_MAX_AGE_HOURS}" ]]; then
    send_alert "backup_stale" "Latest backup ${LATEST_BACKUP} is ${AGE_HOURS}h old (max ${BACKUP_MAX_AGE_HOURS}h)"
    exit 6
  fi
fi

if [[ "${CHECK_JOURNAL_503}" == "true" ]] && command -v journalctl >/dev/null 2>&1; then
  COUNT_503="$(journalctl -u alvio-api.service --since "5 minutes ago" --no-pager 2>/dev/null | grep -c '"status":503' || true)"
  echo "[monitor] HTTP 503 responses in last 5m: ${COUNT_503} (threshold ${MAX_503_PER_5M})"
  if [[ "${COUNT_503}" -ge "${MAX_503_PER_5M}" ]]; then
    send_alert "elevated_503_rate" "Observed ${COUNT_503} HTTP 503 responses in last 5 minutes"
    exit 7
  fi
fi

echo "[monitor] All configured health checks passed."
