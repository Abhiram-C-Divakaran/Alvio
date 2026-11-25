#!/usr/bin/env bash
# Alvio API Host Bootstrap Script (Ubuntu 22.04 / 24.04 — Host A Only)
# Provisions system user, persistent SQLite/backup directories, build, migrations/seed,
# systemd services, backup timer, and health-monitor timer.
# NEVER runs Docker or executes student code on the API host.
set -euo pipefail

APP_DIR="${ALVIO_APP_DIR:-/opt/alvio}"
DATA_DIR="${ALVIO_DATA_DIR:-/var/lib/alvio}"
BACKUP_DIR="${ALVIO_BACKUP_DIR:-/var/backups/alvio}"
ENV_DIR="/etc/alvio"
ENV_FILE="${ENV_DIR}/api.env"

echo "[1/7] Verifying Node.js 24+ runtime..."
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [[ "${NODE_MAJOR}" -lt 24 ]]; then
  echo "ERROR: Node.js 24+ is required (found $(node -v)). Install Node.js 24 LTS first." >&2
  exit 1
fi
echo "Detected Node.js $(node -v)"

echo "[2/7] Creating dedicated 'alvio' user and persistent storage directories..."
if ! id -u alvio >/dev/null 2>&1; then
  sudo useradd --system --home-dir "${DATA_DIR}" --shell /usr/sbin/nologin alvio
fi
sudo install -d -o alvio -g alvio -m 0750 "${DATA_DIR}" "${BACKUP_DIR}"
sudo install -d -o root -g alvio -m 0750 "${ENV_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "ERROR: ${ENV_FILE} not found." >&2
  echo "Copy ${APP_DIR}/deploy/api.env.example to ${ENV_FILE}, fill in secrets, and chmod 640." >&2
  exit 1
fi
sudo chown root:alvio "${ENV_FILE}"
sudo chmod 0640 "${ENV_FILE}"

echo "[3/7] Installing dependencies and building production bundle..."
cd "${APP_DIR}"
npm ci
npm run build

echo "[4/7] Running pre-flight production environment validation (secret-safe)..."
set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a
npm run ops:check-env

echo "[5/7] Initializing SQLite migrations (9), 472-problem catalog, and curated hidden tests..."
if [[ ! -f "${DATABASE_PATH}" ]]; then
  sudo -u alvio env DATABASE_PATH="${DATABASE_PATH}" npx tsx "${APP_DIR}/server/migrateProblems.ts"
else
  echo "Existing SQLite database found at ${DATABASE_PATH} — preserving all user records."
  sudo -u alvio env DATABASE_PATH="${DATABASE_PATH}" npm run db:seed-hidden-tests
fi

echo "[6/7] Installing systemd units (API, daily backup timer, 5-minute health monitor timer)..."
sudo cp "${APP_DIR}/deploy/alvio-api.service" /etc/systemd/system/alvio-api.service
sudo cp "${APP_DIR}/deploy/alvio-backup.service" /etc/systemd/system/alvio-backup.service
sudo cp "${APP_DIR}/deploy/alvio-backup.timer" /etc/systemd/system/alvio-backup.timer
sudo cp "${APP_DIR}/deploy/alvio-health-monitor.service" /etc/systemd/system/alvio-health-monitor.service
sudo cp "${APP_DIR}/deploy/alvio-health-monitor.timer" /etc/systemd/system/alvio-health-monitor.timer
sudo chmod 0755 "${APP_DIR}/deploy/run-backup.sh" "${APP_DIR}/deploy/health-monitor.sh" "${APP_DIR}/deploy/validate-deployment.sh" "${APP_DIR}/deploy/rollback-judge.sh"
sudo systemctl daemon-reload
sudo systemctl enable --now alvio-api.service alvio-backup.timer alvio-health-monitor.timer

echo "[7/7] Verifying local API health & readiness..."
for _ in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:${PORT:-3001}/api/ready" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
curl -fsS "http://127.0.0.1:${PORT:-3001}/api/ready"
echo ""
echo "Host A bootstrap complete. Next: configure deploy/nginx-alvio.conf with Certbot TLS and run deploy/validate-deployment.sh."
