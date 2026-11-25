#!/usr/bin/env bash
# Controlled Judge Provider Rollback Script (isolated -> paiza)
# Usage:
#   sudo bash deploy/rollback-judge.sh [--env-file /etc/alvio/api.env] [--no-restart] [--api-url http://127.0.0.1:3001]
set -euo pipefail

ENV_FILE="/etc/alvio/api.env"
DO_RESTART="true"
API_URL="http://127.0.0.1:3001"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --no-restart)
      DO_RESTART="false"
      shift
      ;;
    --api-url)
      API_URL="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 2
      ;;
  esac
done

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "ERROR: Environment file not found: ${ENV_FILE}" >&2
  exit 1
fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
cp -p "${ENV_FILE}" "${ENV_FILE}.bak-${STAMP}"

TMP_FILE="$(mktemp)"
trap 'rm -f "${TMP_FILE}"' EXIT

if grep -q '^JUDGE_PROVIDER=' "${ENV_FILE}"; then
  sed 's/^JUDGE_PROVIDER=.*/JUDGE_PROVIDER=paiza/' "${ENV_FILE}" > "${TMP_FILE}"
else
  cat "${ENV_FILE}" > "${TMP_FILE}"
  printf '\nJUDGE_PROVIDER=paiza\n' >> "${TMP_FILE}"
fi

cat "${TMP_FILE}" > "${ENV_FILE}"
echo "[rollback] Updated JUDGE_PROVIDER=paiza in ${ENV_FILE} (backup saved at ${ENV_FILE}.bak-${STAMP})"

if [[ "${DO_RESTART}" == "true" ]]; then
  echo "[rollback] Restarting alvio-api.service..."
  sudo systemctl restart alvio-api.service
  for _ in $(seq 1 20); do
    if curl -fsS --max-time 3 "${API_URL%/}/api/ready" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  curl -fsS --max-time 5 "${API_URL%/}/api/ready"
  echo ""
  echo "[rollback] API recovered cleanly under JUDGE_PROVIDER=paiza."
fi
