# Alvio Isolated Coding Judge Worker (`judge-worker/`)

This standalone service executes untrusted student code in hardened, ephemeral Docker containers on behalf of Alvio's Express backend (`server/submissionRunner.ts`).

**Core security invariant:** Alvio's Express server **never** executes untrusted student code in-process, and this worker **never** falls back to executing untrusted code on the host if Docker is unavailable.

---

## Architecture & Security Controls

Every `POST /execute` job runs inside a fresh ephemeral container with:

| Control | Enforcement |
| --- | --- |
| Network isolation | `--network=none` (no outbound or loopback host access) |
| Root filesystem | `--read-only` (immutable rootfs) |
| Scratch space | Size-capped in-memory `--tmpfs /tmp:rw,noexec,nosuid,nodev,size=32m` and `--tmpfs /work:rw,nosuid,nodev,size=64m` |
| Host filesystem | **Zero** bind mounts (`-v` / `--mount` never used); source code is streamed over `stdin` |
| Capabilities | `--cap-drop=ALL` + `--security-opt=no-new-privileges:true` |
| User privilege | `--user=65534:65534` (`nobody`, never `root`) |
| Fork-bomb protection | `--pids-limit=64` |
| Memory / Swap cap | `--memory=<mb>m --memory-swap=<mb>m` (default `256m`, clamped `[64m, 512m]`) |
| CPU quota | `--cpus=1` + hard wall-clock timeout with forced `docker rm -f <container>` |
| Output cap | Hard byte cap (`maxOutputBytes`, default `65536`) terminating runaway stdout/stderr |
| Secret isolation | Host `process.env` is stripped before spawning `docker` (`JWT_SECRET`, `GROQ_API_KEY`, `ISOLATED_JUDGE_TOKEN` are never passed) |
| Worker auth | Mandatory `Authorization: Bearer <ISOLATED_JUDGE_TOKEN>` verified with `crypto.timingSafeEqual` |
| Admission control | `JUDGE_MAX_CONCURRENT_JOBS` (default `4`), returning HTTP `503` + `Retry-After` when saturated |
| Fail-closed daemon errors | Returns HTTP `503` on `/health` and `/execute` if Docker is down — never runs code on host |

> **Kernel hardening recommendation:** Standard Docker (`runc`) shares the host Linux kernel. For untrusted public internet traffic, run the judge worker on a dedicated Linux VM with **gVisor** (`JUDGE_DOCKER_RUNTIME=runsc`) or **Kata Containers / Firecracker microVMs** so kernel-level escapes cannot reach the host or database.

---

## Pre-Pulling Runtime Images (Required on Judge Host)

Because containers execute with `--network=none`, pre-pull the pinned runtime images on the judge host before starting traffic:

```sh
docker pull node:22-alpine
docker pull python:3.12-alpine
docker pull gcc:14-bookworm
docker pull eclipse-temurin:21-jdk-alpine
docker pull mcr.microsoft.com/dotnet/sdk:8.0-alpine
```

---

## Running & Connecting to Alvio Express

1. Generate a shared 48-byte secret token:
   ```sh
   node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
   ```
2. Start the judge worker (either directly on a Linux Docker host or via Compose):
   ```sh
   ISOLATED_JUDGE_TOKEN="<shared-token>" npm run judge:worker
   # or:
   ISOLATED_JUDGE_TOKEN="<shared-token>" docker compose -f judge-worker/docker-compose.yml up -d --build
   ```
3. Verify `GET http://127.0.0.1:4005/health` returns `200` with `"docker": "ok"`.
4. Point Alvio Express at the worker:
   ```env
   JUDGE_PROVIDER=isolated
   ISOLATED_JUDGE_URL=http://127.0.0.1:4005
   ISOLATED_JUDGE_TOKEN=<shared-token>
   JUDGE_CPU_LIMIT_SEC=5
   JUDGE_MEMORY_LIMIT_MB=256
   ```
   Until the judge worker is deployed and live-verified on a Linux Docker host, keep `JUDGE_PROVIDER=paiza` as the safe fallback.

---

## Verification Boundary

- Automated unit and HTTP contract tests in `tests/isolated-judge-worker.test.ts` deterministically verify authentication, exact Docker isolation flags, secret stripping, timeout cleanup, OOM (`exit 137`) reporting, output-overflow termination, concurrency saturation, and fail-closed daemon errors.
- **Live Docker execution verification** must be executed on a host with a running Linux Docker daemon (plus `runsc` if using gVisor) before switching production traffic from `paiza` to `isolated`.
