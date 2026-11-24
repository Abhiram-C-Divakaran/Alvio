# Alvio Isolated Coding Judge Worker (`judge-worker/`)

This standalone service executes untrusted student code inside hardened, ephemeral Linux Docker containers on behalf of Alvio's Express backend ([submissionRunner.ts](../server/submissionRunner.ts)).

**Core security invariant:** Alvio's Express server **never** executes untrusted student code in-process, and this worker **never** falls back to executing untrusted code on the host when Docker or a runtime image is unavailable.

---

## Architecture & Enforced Security Controls

Every `POST /execute` job runs inside a fresh ephemeral container with:

| Control | Enforcement |
| --- | --- |
| Network isolation | `--network=none` (zero outbound, DNS, or host loopback access) |
| Root filesystem | `--read-only` (immutable rootfs) |
| Scratch space | `--tmpfs /tmp:rw,noexec,nosuid,nodev,size=32m,uid=65534,gid=65534,mode=0700` and `/work` (`noexec` for interpreted/VM runtimes, `exec` strictly for compiled `c`/`cpp` ELF binaries) |
| Host filesystem | **Zero** bind mounts (`-v` / `--mount` never used); source code is streamed over `stdin` |
| Capabilities | `--cap-drop=ALL` + `--security-opt=no-new-privileges:true` |
| User privilege | `--user=65534:65534` (`nobody`, never `root`) |
| Fork-bomb protection | `--pids-limit=64` |
| Memory / Swap cap | `--memory=<mb>m --memory-swap=<mb>m` (default `256m`, clamped `[64m, 512m]`) plus `--max-old-space-size` (Node) / `-Xmx` (JVM) |
| CPU & file-size caps | `--cpus=1` + in-container `ulimit -t <cpuSec> -f 16384` + hard wall-clock timer with forced `docker rm -f <container>` |
| Output cap | Hard byte cap (`maxOutputBytes`, default `65536`) terminating runaway stdout/stderr immediately |
| Client disconnect cancel | `res.on('close')` aborts and force-removes the container immediately; HTTP server enforces `headersTimeout=10s`, `requestTimeout=35s`, `keepAliveTimeout=5s` |
| Secret isolation | Host `process.env` is stripped before spawning `docker` (`JWT_SECRET`, `GROQ_API_KEY`, `ISOLATED_JUDGE_TOKEN`, `DATABASE_PATH` are never passed) |
| Worker authentication | Mandatory `Authorization: Bearer <ISOLATED_JUDGE_TOKEN>` verified with `crypto.timingSafeEqual` (CLI refuses to start if < 32 chars) |
| Admission control | `JUDGE_MAX_CONCURRENT_JOBS` (default `4`), returning HTTP `503` + `Retry-After: 2` when saturated |
| Hidden-test isolation | Express executes visible and hidden test suites in **separate containers**; hidden-phase stdout, stderr, and exception messages are never returned to the browser |
| Fail-closed behavior | Missing Docker daemon, socket errors, or missing local runtime images return HTTP `503` — never host fallback |

---

## Critical Infrastructure Warning: Docker Socket & Kernel Isolation

1. **Docker socket privilege boundary:** Mounting `/var/run/docker.sock` grants the `judge-worker` process **root-equivalent control over the Docker daemon on that host**. Therefore, `judge-worker` **MUST** run on a **dedicated, isolated judge VM/node** completely separated from:
   - the public Express API server,
   - the SQLite/PostgreSQL database volume,
   - application secrets (`JWT_SECRET`, `GROQ_API_KEY`, email keys).
   Bind port `4005` strictly to a private VPC interface, WireGuard/Tailscale mesh, or internal mTLS proxy — never expose `4005` to the public internet.
2. **Kernel escape reality:** Standard Docker (`runc`) containers share the host Linux kernel and **do not** protect against every Linux kernel privilege-escalation vulnerability. For untrusted public internet traffic, configure **gVisor** (`JUDGE_DOCKER_RUNTIME=runsc`), **Kata Containers**, or **Firecracker microVMs** on the dedicated judge VM.

---

## Supported Languages & Pinned Runtime Images

Because execution containers run with `--network=none`, pre-pull every pinned image on the judge host before accepting traffic:

| Language | Pinned Image (Env Override) | Execution Command |
| --- | --- | --- |
| JavaScript | `node:22-alpine` (`JUDGE_IMAGE_NODE`) | `node --no-warnings --disallow-code-generation-from-strings` |
| TypeScript | `node:22-alpine` (`JUDGE_IMAGE_TS`) | `node --no-warnings --experimental-strip-types --disallow-code-generation-from-strings` |
| Python 3 | `python:3.12-alpine` (`JUDGE_IMAGE_PYTHON`) | `python3 -I -B` |
| C | `gcc:14-bookworm` (`JUDGE_IMAGE_GCC`) | `gcc -O2 -std=c17 ... -lm` → `/work/app` |
| C++ | `gcc:14-bookworm` (`JUDGE_IMAGE_GCC`) | `g++ -O2 -std=c++20` → `/work/app` |
| Java | `eclipse-temurin:21-jdk-alpine` (`JUDGE_IMAGE_JAVA`) | `javac` → `java -XX:+UseSerialGC -Xmx...` |
| C# | `mono:6.12` (`JUDGE_IMAGE_CSHARP`) | `mcs` → `mono /work/app.exe` |

```sh
docker pull node:22-alpine
docker pull python:3.12-alpine
docker pull gcc:14-bookworm
docker pull eclipse-temurin:21-jdk-alpine
docker pull mono:6.12
```

---

## Deployment, Health Checks, Switching & Rollback

1. Generate a 48-byte shared secret:
   ```sh
   node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
   ```
2. Start the worker on the dedicated Linux judge host:
   ```sh
   ISOLATED_JUDGE_TOKEN="<shared-token>" docker compose -f judge-worker/docker-compose.yml up -d --build
   # Or without Compose:
   ISOLATED_JUDGE_TOKEN="<shared-token>" npm run judge:worker
   ```
3. Verify readiness (`200 { status: "ok", docker: "ok", ... }`):
   ```sh
   curl -fsS http://127.0.0.1:4005/health
   ```
4. Run the live Linux Docker verification suite before enabling production traffic:
   ```sh
   npm run test:judge-live-docker
   ```
5. Switch Express to the isolated judge:
   ```env
   JUDGE_PROVIDER=isolated
   ISOLATED_JUDGE_URL=http://<private-judge-host>:4005
   ISOLATED_JUDGE_TOKEN=<shared-token>
   JUDGE_CPU_LIMIT_SEC=5
   JUDGE_MEMORY_LIMIT_MB=256
   ```
6. **Instant rollback:** If the judge host experiences an outage, Express automatically fails closed with HTTP `503` (`provider_unavailable`) without corrupting submission verdicts. To roll back immediately to Paiza.IO, set `JUDGE_PROVIDER=paiza` and restart Express.
