#!/usr/bin/env bash
# Dedicated Alvio Isolated Judge Host Bootstrap Script (Ubuntu 22.04 / 24.04)
# Run ONLY on a dedicated judge VM separated from the Express API and database host.
set -euo pipefail

EXPRESS_PRIVATE_IP="${EXPRESS_PRIVATE_IP:?Set EXPRESS_PRIVATE_IP to the private VPC IP of the Express API host}"
JUDGE_PORT="${JUDGE_WORKER_PORT:-4005}"

echo "[1/5] Installing official gVisor (runsc) runtime..."
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg ufw
curl -fsSL https://gvisor.dev/archive.key | sudo gpg --dearmor --yes -o /usr/share/keyrings/gvisor-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/gvisor-archive-keyring.gpg] https://storage.googleapis.com/gvisor/releases release main" \
  | sudo tee /etc/apt/sources.list.d/gvisor.list >/dev/null
sudo apt-get update
sudo apt-get install -y runsc
sudo runsc install
sudo systemctl restart docker

echo "[2/5] Verifying Docker daemon and registered gVisor runtime..."
RUNTIMES="$(docker info --format '{{range $k, $v := .Runtimes}}{{$k}} {{end}}')"
echo "Registered Docker runtimes: ${RUNTIMES}"
if [[ " ${RUNTIMES} " != *" runsc "* ]]; then
  echo "ERROR: runsc runtime is not registered in Docker daemon!" >&2
  exit 1
fi

echo "[3/5] Pre-pulling pinned language runtime images (required for --network=none)..."
docker pull node:22-alpine
docker pull python:3.12-alpine
docker pull gcc:14-bookworm
docker pull eclipse-temurin:21-jdk-alpine
docker pull mono:6.12

echo "[4/5] Restricting port ${JUDGE_PORT} strictly to Express host ${EXPRESS_PRIVATE_IP}..."
sudo ufw allow from "${EXPRESS_PRIVATE_IP}" to any port "${JUDGE_PORT}" proto tcp
sudo ufw deny "${JUDGE_PORT}/tcp"

echo "[5/5] Next: create /etc/alvio/judge-worker.env (chmod 600) with ISOLATED_JUDGE_TOKEN (>= 48 bytes),"
echo "      run 'JUDGE_DOCKER_RUNTIME=runsc npm run test:judge-live-docker' to verify live gVisor execution,"
echo "      and enable deploy/alvio-judge-worker.service."
