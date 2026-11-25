import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import type {
  JudgeResourceLimits,
  PaizaLanguage,
  ProviderExecutionResponse,
} from '../server/submissionRunner';

export const WORKER_SUPPORTED_LANGUAGES: readonly PaizaLanguage[] = [
  'javascript',
  'typescript',
  'python3',
  'cpp',
  'c',
  'java',
  'csharp',
] as const;

export const PINNED_RUNTIME_IMAGES = {
  node: 'node:22-alpine',
  python: 'python:3.12-alpine',
  gcc: 'gcc:14-bookworm',
  java: 'eclipse-temurin:21-jdk-alpine',
  csharp: 'mono:6.12',
} as const;

export const MAX_WORKER_SOURCE_BYTES = 131072; // Wrapper + user code
export const DEFAULT_PIDS_LIMIT = 64;
export const DEFAULT_CPU_CORES = 1;
export const DEFAULT_TMPFS_TMP_MB = 32;
export const DEFAULT_TMPFS_WORK_MB = 64;
const MAX_CONTAINER_FILE_BLOCKS = 16384; // 8 MiB max file write inside tmpfs (512-byte blocks)

export const COMPILE_FAIL_SENTINEL = '__ALVIO_BUILD_FAILED__:';

export interface WorkerExecutionRequest {
  language: PaizaLanguage;
  sourceCode: string;
  timeoutMs: number;
  limits: JudgeResourceLimits;
  signal?: AbortSignal;
}

export interface ContainerRunInput {
  args: string[];
  stdin: string;
  timeoutMs: number;
  maxOutputBytes: number;
  containerName: string;
  env: Record<string, string>;
  signal?: AbortSignal;
}

export interface ContainerRunOutput {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  outputExceeded: boolean;
  aborted?: boolean;
  durationMs: number;
  spawnErrorCode?: string;
  spawnErrorMessage?: string;
}

export interface ContainerRuntimeAdapter {
  runContainer: (input: ContainerRunInput) => Promise<ContainerRunOutput>;
  forceRemoveContainer: (containerName: string) => Promise<void>;
  checkDaemonHealth: (requiredRuntime?: string) => Promise<{
    ok: boolean;
    detail?: string;
    runtimeVerified?: boolean;
    availableRuntimes?: string[];
  }>;
}

interface LanguageContainerSpec {
  image: string;
  sourceFile: string;
  /** Runs inside the container with stdin containing the source code and /work as cwd. */
  shellCommand: string;
}

export function resolveLanguageSpec(
  language: PaizaLanguage,
  limits: JudgeResourceLimits = {
    cpuTimeLimitSec: 5,
    memoryLimitMb: 256,
    maxOutputBytes: 65536,
    networkDisabled: true,
  },
  env: NodeJS.ProcessEnv = process.env
): LanguageContainerSpec {
  const nodeImage = env.JUDGE_IMAGE_NODE || PINNED_RUNTIME_IMAGES.node;
  const pythonImage = env.JUDGE_IMAGE_PYTHON || PINNED_RUNTIME_IMAGES.python;
  const gccImage = env.JUDGE_IMAGE_GCC || PINNED_RUNTIME_IMAGES.gcc;
  const javaImage = env.JUDGE_IMAGE_JAVA || PINNED_RUNTIME_IMAGES.java;
  const csharpImage = env.JUDGE_IMAGE_CSHARP || PINNED_RUNTIME_IMAGES.csharp;
  const tsImage = env.JUDGE_IMAGE_TS || nodeImage;

  const cpuSec = Math.max(1, Math.min(15, Math.round(limits.cpuTimeLimitSec)));
  const heapMb = Math.max(32, Math.floor(limits.memoryLimitMb * 0.75));
  // Use separate POSIX ulimit calls (Debian dash rejects multiple flags in one ulimit call)
  // and soft CPU limit (-S -t) so Linux emits SIGXCPU (exit 152) instead of SIGKILL (137, OOM).
  const execUlimit = `ulimit -S -t ${cpuSec} && ulimit -f ${MAX_CONTAINER_FILE_BLOCKS}`;
  const compileFailEcho = `printf '%s\\n' '${COMPILE_FAIL_SENTINEL}' >&2`;

  switch (language) {
    case 'javascript':
      return {
        image: nodeImage,
        sourceFile: 'main.js',
        shellCommand: `cat > /work/main.js && ${execUlimit} && exec node --no-warnings --disallow-code-generation-from-strings --max-old-space-size=${heapMb} /work/main.js`,
      };
    case 'typescript':
      return {
        image: tsImage,
        sourceFile: 'main.ts',
        shellCommand: `cat > /work/main.ts && ${execUlimit} && exec node --no-warnings --experimental-strip-types --disallow-code-generation-from-strings --max-old-space-size=${heapMb} /work/main.ts`,
      };
    case 'python3':
      return {
        image: pythonImage,
        sourceFile: 'main.py',
        shellCommand: `cat > /work/main.py && ${execUlimit} && exec python3 -I -B /work/main.py`,
      };
    case 'cpp':
      return {
        image: gccImage,
        sourceFile: 'main.cpp',
        shellCommand: `cat > /work/main.cpp && if ! g++ -O2 -std=c++20 -o /work/app /work/main.cpp; then ${compileFailEcho}; exit 1; fi && ${execUlimit} && exec /work/app`,
      };
    case 'c':
      return {
        image: gccImage,
        sourceFile: 'main.c',
        shellCommand: `cat > /work/main.c && if ! gcc -O2 -std=c17 -o /work/app /work/main.c -lm; then ${compileFailEcho}; exit 1; fi && ${execUlimit} && exec /work/app`,
      };
    case 'java':
      return {
        image: javaImage,
        sourceFile: 'Main.java',
        shellCommand: `cat > /work/Main.java && if ! javac -d /work /work/Main.java; then ${compileFailEcho}; exit 1; fi && ${execUlimit} && exec java -XX:+UseSerialGC -Xmx${heapMb}m -cp /work Main`,
      };
    case 'csharp':
      return {
        image: csharpImage,
        sourceFile: 'Program.cs',
        shellCommand: `cat > /work/Program.cs && if ! mcs -out:/work/app.exe /work/Program.cs; then ${compileFailEcho}; exit 1; fi && ${execUlimit} && exec mono /work/app.exe`,
      };
  }
}

export function clampLimits(
  rawLimits: Partial<JudgeResourceLimits> | undefined,
  rawTimeoutMs: unknown
): { limits: JudgeResourceLimits; timeoutMs: number } {
  const cpuRaw = Number(rawLimits?.cpuTimeLimitSec);
  const memRaw = Number(rawLimits?.memoryLimitMb);
  const outRaw = Number(rawLimits?.maxOutputBytes);
  const timeoutRaw = Number(rawTimeoutMs);

  const cpuTimeLimitSec = Number.isFinite(cpuRaw) ? Math.min(15, Math.max(1, Math.round(cpuRaw))) : 5;
  const memoryLimitMb = Number.isFinite(memRaw) ? Math.min(512, Math.max(64, Math.round(memRaw))) : 256;
  const maxOutputBytes = Number.isFinite(outRaw) ? Math.min(131072, Math.max(4096, Math.round(outRaw))) : 65536;
  const timeoutMs = Number.isFinite(timeoutRaw) ? Math.min(30000, Math.max(500, Math.round(timeoutRaw))) : 10000;

  return {
    limits: {
      cpuTimeLimitSec,
      memoryLimitMb,
      maxOutputBytes,
      networkDisabled: true,
    },
    timeoutMs,
  };
}

/**
 * Builds hardened `docker run` arguments enforcing network, filesystem, capability,
 * PID, memory, swap, CPU, and unprivileged-user isolation. Never mounts host paths
 * and never forwards host environment variables or secrets.
 */
export function buildDockerRunArgs(params: {
  language: PaizaLanguage;
  limits: JudgeResourceLimits;
  containerName: string;
  pidsLimit?: number;
  cpuCores?: number;
  runtime?: string;
  env?: NodeJS.ProcessEnv;
}): string[] {
  const spec = resolveLanguageSpec(params.language, params.limits, params.env);
  const pidsLimit = params.pidsLimit ?? DEFAULT_PIDS_LIMIT;
  const cpuCores = params.cpuCores ?? DEFAULT_CPU_CORES;
  const memoryFlag = `${params.limits.memoryLimitMb}m`;
  const runtime = (params.runtime ?? params.env?.JUDGE_DOCKER_RUNTIME ?? '').trim();

  const needsNativeExec = params.language === 'c' || params.language === 'cpp';
  const workMountMode = needsNativeExec ? 'rw,exec,nosuid,nodev' : 'rw,noexec,nosuid,nodev';

  const args: string[] = [
    'run',
    '--rm',
    '-i',
    '--name',
    params.containerName,
    '--network=none',
    '--read-only',
    `--tmpfs=/tmp:rw,noexec,nosuid,nodev,size=${DEFAULT_TMPFS_TMP_MB}m,uid=65534,gid=65534,mode=0700`,
    `--tmpfs=/work:${workMountMode},size=${DEFAULT_TMPFS_WORK_MB}m,uid=65534,gid=65534,mode=0700`,
    '--cap-drop=ALL',
    '--security-opt=no-new-privileges:true',
    `--pids-limit=${pidsLimit}`,
    `--memory=${memoryFlag}`,
    `--memory-swap=${memoryFlag}`,
    `--cpus=${cpuCores}`,
    '--user=65534:65534',
    '--workdir=/work',
    '-e',
    'HOME=/tmp',
    '-e',
    'TMPDIR=/tmp',
    '-e',
    'PYTHONDONTWRITEBYTECODE=1',
  ];

  if (runtime) {
    args.push(`--runtime=${runtime}`);
  }

  args.push(spec.image, '/bin/sh', '-c', spec.shellCommand);
  return args;
}

/**
 * Minimal host environment for spawning the `docker` CLI itself — deliberately strips
 * application secrets (JWT_SECRET, GROQ_API_KEY, ISOLATED_JUDGE_TOKEN, etc.).
 */
export function buildSanitizedHostEnv(env: NodeJS.ProcessEnv = process.env): Record<string, string> {
  const safe: Record<string, string> = {};
  for (const key of ['PATH', 'DOCKER_HOST', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH', 'SYSTEMROOT', 'COMSPEC']) {
    const val = env[key];
    if (typeof val === 'string' && val.length > 0) {
      safe[key] = val;
    }
  }
  return safe;
}

export function createDockerRuntimeAdapter(
  dockerBin = 'docker',
  hostEnv: NodeJS.ProcessEnv = process.env
): ContainerRuntimeAdapter {
  const forceRemoveContainer = async (containerName: string): Promise<void> => {
    const removeOnce = () =>
      new Promise<void>((resolve) => {
        const killer = spawn(dockerBin, ['rm', '-f', containerName], {
          env: buildSanitizedHostEnv(hostEnv),
          stdio: 'ignore',
        });
        killer.on('error', () => resolve());
        killer.on('close', () => resolve());
      });
    await removeOnce();
    // Guard against the dockerd race where `docker run` is SIGKILLed mid-CreateContainer
    // and the container finishes registering slightly after the first `docker rm -f`.
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    await removeOnce();
  };

  const runContainer = async (input: ContainerRunInput): Promise<ContainerRunOutput> => {
    const startedAt = performance.now();
    return new Promise<ContainerRunOutput>((resolve) => {
      const child = spawn(dockerBin, input.args, {
        env: input.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];
      let stdoutBytes = 0;
      let stderrBytes = 0;
      let timedOut = false;
      let outputExceeded = false;
      let aborted = false;
      let settled = false;

      const terminateContainer = () => {
        try {
          child.kill('SIGKILL');
        } catch {
          // Ignore if already exited
        }
        void forceRemoveContainer(input.containerName);
      };

      const onAbort = () => {
        aborted = true;
        terminateContainer();
      };

      if (input.signal) {
        if (input.signal.aborted) {
          onAbort();
        } else {
          input.signal.addEventListener('abort', onAbort, { once: true });
        }
      }

      const finish = (result: Partial<ContainerRunOutput>) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (input.signal) input.signal.removeEventListener('abort', onAbort);
        resolve({
          exitCode: result.exitCode ?? null,
          stdout: Buffer.concat(stdoutChunks).toString('utf8'),
          stderr: Buffer.concat(stderrChunks).toString('utf8'),
          timedOut,
          outputExceeded,
          aborted,
          durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
          ...(result.spawnErrorCode ? { spawnErrorCode: result.spawnErrorCode } : {}),
          ...(result.spawnErrorMessage ? { spawnErrorMessage: result.spawnErrorMessage } : {}),
        });
      };

      const timer = setTimeout(() => {
        timedOut = true;
        terminateContainer();
      }, input.timeoutMs);

      const handleChunk = (chunk: Buffer, isStdout: boolean) => {
        const currentTotal = stdoutBytes + stderrBytes;
        const remaining = input.maxOutputBytes - currentTotal;
        if (remaining <= 0) {
          if (!outputExceeded) {
            outputExceeded = true;
            terminateContainer();
          }
          return;
        }
        const slice = chunk.length > remaining ? chunk.subarray(0, remaining) : chunk;
        if (isStdout) {
          stdoutChunks.push(slice);
          stdoutBytes += slice.length;
        } else {
          stderrChunks.push(slice);
          stderrBytes += slice.length;
        }
        if (chunk.length > remaining && !outputExceeded) {
          outputExceeded = true;
          terminateContainer();
        }
      };

      child.stdout?.on('data', (chunk: Buffer) => handleChunk(chunk, true));
      child.stderr?.on('data', (chunk: Buffer) => handleChunk(chunk, false));

      child.on('error', (err: NodeJS.ErrnoException) => {
        finish({
          exitCode: null,
          spawnErrorCode: err.code || 'SPAWN_ERROR',
          spawnErrorMessage: err.message,
        });
      });

      child.on('close', (code) => {
        finish({ exitCode: code });
      });

      child.stdin?.on('error', () => {
        // Ignore EPIPE when container exits before stdin finishes
      });
      child.stdin?.end(input.stdin, 'utf8');
    });
  };

  const checkDaemonHealth = async (
    requiredRuntime?: string
  ): Promise<{ ok: boolean; detail?: string; runtimeVerified?: boolean; availableRuntimes?: string[] }> => {
    return new Promise((resolve) => {
      const child = spawn(
        dockerBin,
        ['info', '--format', '{{.ServerVersion}}|{{range $k, $v := .Runtimes}}{{$k}},{{end}}'],
        {
          env: buildSanitizedHostEnv(hostEnv),
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      );
      let out = '';
      let err = '';
      const timer = setTimeout(() => {
        try {
          child.kill('SIGKILL');
        } catch {
          // ignore
        }
        resolve({ ok: false, detail: 'Docker daemon health check timed out.', runtimeVerified: false });
      }, 3000);

      child.stdout?.on('data', (d) => (out += d.toString()));
      child.stderr?.on('data', (d) => (err += d.toString()));
      child.on('error', (e: NodeJS.ErrnoException) => {
        clearTimeout(timer);
        resolve({ ok: false, detail: `Docker CLI unavailable: ${e.code || e.message}`, runtimeVerified: false });
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        const trimmed = out.trim();
        if (code !== 0 || !trimmed) {
          resolve({
            ok: false,
            detail: err.trim() || `docker info exited with code ${code}`,
            runtimeVerified: false,
          });
          return;
        }
        const [version, runtimeListRaw = ''] = trimmed.split('|');
        const availableRuntimes = runtimeListRaw
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean);
        const targetRuntime = (requiredRuntime || '').trim();
        if (targetRuntime && !availableRuntimes.includes(targetRuntime)) {
          resolve({
            ok: false,
            detail: `Required Docker runtime "${targetRuntime}" is not registered (available: ${availableRuntimes.join(', ') || 'none'}).`,
            runtimeVerified: false,
            availableRuntimes,
          });
          return;
        }
        resolve({
          ok: true,
          detail: `docker ${version}`,
          runtimeVerified: targetRuntime ? availableRuntimes.includes(targetRuntime) : true,
          availableRuntimes,
        });
      });
    });
  };

  return { runContainer, forceRemoveContainer, checkDaemonHealth };
}

export class IsolationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IsolationUnavailableError';
  }
}

function looksLikeDockerInfrastructureError(exitCode: number | null, stderr: string): boolean {
  if (exitCode !== 125 && exitCode !== 126 && exitCode !== 127 && exitCode !== 1) return false;
  return /Cannot connect to the Docker daemon|failed to connect to the docker API|dockerDesktopLinuxEngine|Error response from daemon|permission denied while trying to connect to the Docker daemon|Unable to find image|No such image|pull access denied|unknown runtime specified/i.test(
    stderr
  );
}

function looksLikeMemoryLimitError(exitCode: number | null, stderr: string, stdout: string): boolean {
  if (exitCode === 137) return true;
  const combined = `${stderr}\n${stdout}`;
  if (exitCode === 134 && /JavaScript heap out of memory|Allocation failed|FatalProcessOutOfMemory/i.test(combined)) {
    return true;
  }
  return /\b(OutOfMemoryError|OutOfMemoryException|MemoryError|std::bad_alloc|JavaScript heap out of memory)\b/i.test(
    combined
  );
}

function looksLikeCpuTimeLimitError(exitCode: number | null, stderr: string): boolean {
  // SIGXCPU = 24 -> shell exit code 128 + 24 = 152
  return exitCode === 152 || /CPU time limit exceeded/i.test(stderr);
}

/**
 * Executes a wrapped submission inside a hardened, ephemeral container.
 * Never falls back to executing untrusted code on the host process.
 */
export async function executeInIsolatedContainer(
  request: WorkerExecutionRequest,
  adapter: ContainerRuntimeAdapter,
  options: { env?: NodeJS.ProcessEnv; runtime?: string } = {}
): Promise<ProviderExecutionResponse> {
  const containerName = `alvio-judge-${randomBytes(8).toString('hex')}`;
  // Compiled languages need compile headroom; all languages need brief containerd cold-start headroom
  // while in-container `ulimit -S -t` enforces the exact CPU execution budget.
  const isCompiled = request.language === 'cpp' || request.language === 'c' || request.language === 'java' || request.language === 'csharp';
  const activeRuntime = (options.runtime ?? options.env?.JUDGE_DOCKER_RUNTIME ?? '').trim();
  const gvisorColdStartMs = activeRuntime === 'runsc' ? 4000 : 0;
  const startupHeadroomMs = (isCompiled ? 8000 : 6000) + gvisorColdStartMs;
  const effectiveTimeoutMs = Math.min(request.timeoutMs, request.limits.cpuTimeLimitSec * 1000 + startupHeadroomMs);
  const args = buildDockerRunArgs({
    language: request.language,
    limits: request.limits,
    containerName,
    runtime: options.runtime,
    env: options.env,
  });

  const runResult = await adapter.runContainer({
    args,
    stdin: request.sourceCode,
    timeoutMs: effectiveTimeoutMs,
    maxOutputBytes: request.limits.maxOutputBytes,
    containerName,
    env: buildSanitizedHostEnv(options.env),
    signal: request.signal,
  });

  if (runResult.spawnErrorCode) {
    throw new IsolationUnavailableError(
      `Container runtime unavailable (${runResult.spawnErrorCode}). Refusing host execution.`
    );
  }

  if (runResult.aborted) {
    await adapter.forceRemoveContainer(containerName);
    throw new IsolationUnavailableError('Execution cancelled because client disconnected.');
  }

  if (looksLikeDockerInfrastructureError(runResult.exitCode, runResult.stderr)) {
    throw new IsolationUnavailableError(
      'Container runtime or language image is unavailable. Refusing host execution.'
    );
  }

  const timeSec = (runResult.durationMs / 1000).toFixed(3);

  if (runResult.timedOut || looksLikeCpuTimeLimitError(runResult.exitCode, runResult.stderr)) {
    await adapter.forceRemoveContainer(containerName);
    return {
      status: 'completed',
      result: 'timeout',
      exit_code: 124,
      stdout: '',
      stderr: `Time Limit Exceeded: container terminated after ${effectiveTimeoutMs}ms.`,
      time: timeSec,
    };
  }

  if (runResult.outputExceeded) {
    await adapter.forceRemoveContainer(containerName);
    return {
      status: 'completed',
      result: 'output_limit',
      exit_code: 1,
      stdout: '',
      stderr: `Output Limit Exceeded: submission exceeded ${request.limits.maxOutputBytes} bytes of output.`,
      time: timeSec,
    };
  }

  if (runResult.stderr.includes(COMPILE_FAIL_SENTINEL)) {
    const cleanedBuildErr = runResult.stderr
      .replace(COMPILE_FAIL_SENTINEL, '')
      .trim()
      .slice(0, request.limits.maxOutputBytes);
    return {
      status: 'completed',
      build_result: 'failure',
      build_stderr: cleanedBuildErr || 'Compilation failed.',
      result: 'failure',
      exit_code: runResult.exitCode ?? 1,
      stdout: '',
      stderr: '',
      time: timeSec,
    };
  }

  if (looksLikeMemoryLimitError(runResult.exitCode, runResult.stderr, runResult.stdout)) {
    return {
      status: 'completed',
      result: 'memory_limit',
      exit_code: runResult.exitCode ?? 137,
      stdout: '',
      stderr: `Memory Limit Exceeded: container terminated (limit ${request.limits.memoryLimitMb}MB).`,
      time: timeSec,
    };
  }

  const succeeded = runResult.exitCode === 0;
  return {
    status: 'completed',
    build_result: 'success',
    result: succeeded ? 'success' : 'failure',
    exit_code: runResult.exitCode ?? 1,
    stdout: runResult.stdout.slice(0, request.limits.maxOutputBytes),
    stderr: runResult.stderr.slice(0, request.limits.maxOutputBytes),
    time: timeSec,
  };
}
