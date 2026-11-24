#!/usr/bin/env bash
# Operational health & orphan-container monitor for Alvio API and Judge Worker
set -euo pipefail

API_URL="${ALVIO_API_URL:-http://127.0.0.1:3001}"
JUDGE_URL="${ISOLATED_JUDGE_URL:-}"
CHECK_DOCKER="${CHECK_LOCAL_DOCKER:-false}"

echo "[monitor] Checking API liveness: ${API_URL}/api/health"
curl -fsS --max-time 5 "${API_URL}/api/health" >/dev/null

echo "[monitor] Checking API readiness: ${API_URL}/api/ready"
curl -fsS --max-time 5 "${API_URL}/api/ready" >/dev/null

if [[ -n "${JUDGE_URL}" ]]; then
  echo "[monitor] Checking isolated judge worker health: ${JUDGE_URL}/health"
  HEALTH_JSON="$(curl -fsS --max-time 5 "${JUDGE_URL%/}/health")"
  echo "${HEALTH_JSON}"
  echo "${HEALTH_JSON}" | grep -q '"status":"ok"'
  echo "${HEALTH_JSON}" | grep -q '"docker":"ok"'
  echo "${HEALTH_JSON}" | grep -q '"runtimeVerified":true'
fi

if [[ "${CHECK_DOCKER}" == "true" ]]; then
  ORPHANS="$(docker ps -a --filter name=alvio-judge- --filter status=exited --format '{{.Names}}')"
  if [[ -n "${ORPHANS}" ]]; then
    echo "WARNING: Exited orphaned alvio-judge containers detected:" >&2
    echo "${ORPHANS}" >&2
    exit 2
  fi
fi

echo "[monitor] All configured health checks passed."
