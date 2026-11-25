#!/usr/bin/env bash
# Live Staging / Production Deployment Validation Script (Zero Mocks)
# Usage:
#   ALVIO_PUBLIC_URL=https://staging.alvio.example.com bash deploy/validate-deployment.sh
# Optional:
#   ISOLATED_JUDGE_URL=http://10.0.1.20:4005 (checked from Host A over private network)
#   EXPECT_HTTPS=true (default true; set false only for local loopback smoke tests)
set -euo pipefail

PUBLIC_URL="${ALVIO_PUBLIC_URL:?Set ALVIO_PUBLIC_URL (e.g. https://staging.alvio.example.com)}"
PUBLIC_URL="${PUBLIC_URL%/}"
EXPECT_HTTPS="${EXPECT_HTTPS:-true}"
JUDGE_URL="${ISOLATED_JUDGE_URL:-}"
EXPECTED_PROBLEMS="${EXPECTED_PROBLEMS:-472}"

echo "[1/6] Verifying /api/health liveness..."
HEALTH_BODY="$(curl -fsS --max-time 10 "${PUBLIC_URL}/api/health")"
echo "  ${HEALTH_BODY}"
echo "${HEALTH_BODY}" | grep -q '"status":"ok"'
echo "${HEALTH_BODY}" | grep -q '"database":"ok"'

echo "[2/6] Verifying /api/ready readiness (migration >= 9, catalog = ${EXPECTED_PROBLEMS})..."
READY_HEADERS="$(mktemp)"
trap 'rm -f "${READY_HEADERS}"' EXIT
READY_BODY="$(curl -fsS --max-time 10 -D "${READY_HEADERS}" "${PUBLIC_URL}/api/ready")"
echo "  ${READY_BODY}"
echo "${READY_BODY}" | grep -q '"status":"ready"'
echo "${READY_BODY}" | grep -q "\"problemsCount\":${EXPECTED_PROBLEMS}"
MIGRATION_VER="$(echo "${READY_BODY}" | sed -n 's/.*"migrationVersion":\([0-9][0-9]*\).*/\1/p')"
if [[ -z "${MIGRATION_VER}" || "${MIGRATION_VER}" -lt 9 ]]; then
  echo "ERROR: Expected migrationVersion >= 9, got '${MIGRATION_VER}'" >&2
  exit 1
fi

echo "[3/6] Verifying security headers (X-Content-Type-Options, X-Frame-Options, CSP, HSTS)..."
grep -iq '^x-content-type-options:.*nosniff' "${READY_HEADERS}"
grep -iq '^x-frame-options:.*DENY' "${READY_HEADERS}"
grep -iq '^content-security-policy:.*frame-ancestors' "${READY_HEADERS}"
if [[ "${EXPECT_HTTPS}" == "true" ]]; then
  grep -iq '^strict-transport-security:.*max-age=31536000' "${READY_HEADERS}"
fi

echo "[4/6] Verifying restricted CORS rejects untrusted Origin and private API rejects unauthenticated access..."
CORS_HDRS="$(curl -sS --max-time 10 -D - -o /dev/null -H "Origin: https://untrusted.invalid" "${PUBLIC_URL}/api/auth/me")"
if echo "${CORS_HDRS}" | grep -iq '^access-control-allow-origin:'; then
  echo "ERROR: Untrusted origin received Access-Control-Allow-Origin!" >&2
  exit 1
fi
PRIVATE_CODE="$(curl -sS --max-time 10 -o /dev/null -w '%{http_code}' "${PUBLIC_URL}/api/progress")"
if [[ "${PRIVATE_CODE}" != "401" ]]; then
  echo "ERROR: Expected 401 on unauthenticated GET /api/progress, got ${PRIVATE_CODE}" >&2
  exit 1
fi

echo "[5/6] Verifying judge worker port 4005 is NOT publicly exposed on public host..."
PUBLIC_HOST="$(echo "${PUBLIC_URL}" | sed -E 's#^https?://([^/:]+).*#\1#')"
if curl -fsS --max-time 3 "http://${PUBLIC_HOST}:4005/health" >/dev/null 2>&1; then
  echo "ERROR: Judge worker port 4005 is publicly reachable on ${PUBLIC_HOST}!" >&2
  exit 1
fi

if [[ -n "${JUDGE_URL}" ]]; then
  echo "[6/6] Verifying private isolated judge worker /health (Docker + gVisor runsc)..."
  JUDGE_BODY="$(curl -fsS --max-time 5 "${JUDGE_URL%/}/health")"
  echo "  ${JUDGE_BODY}"
  echo "${JUDGE_BODY}" | grep -q '"status":"ok"'
  echo "${JUDGE_BODY}" | grep -q '"docker":"ok"'
  echo "${JUDGE_BODY}" | grep -q '"runtimeVerified":true'
else
  echo "[6/6] ISOLATED_JUDGE_URL not set; skipping private judge worker probe."
fi

echo "PASS: Live deployment validation succeeded for ${PUBLIC_URL}."
