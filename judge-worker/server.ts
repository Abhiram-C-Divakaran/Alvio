import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import type { PaizaLanguage } from '../server/submissionRunner';
import {
  IsolationUnavailableError,
  MAX_WORKER_SOURCE_BYTES,
  WORKER_SUPPORTED_LANGUAGES,
  clampLimits,
  createDockerRuntimeAdapter,
  executeInIsolatedContainer,
  type ContainerRuntimeAdapter,
} from './sandbox';

const MAX_REQUEST_BODY_BYTES = 262144; // 256 KB JSON envelope cap

export interface JudgeWorkerOptions {
  token: string;
  maxConcurrentJobs?: number;
  adapter?: ContainerRuntimeAdapter;
  dockerRuntime?: string;
  env?: NodeJS.ProcessEnv;
}

function constantTimeTokenMatch(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

function sendJson(res: ServerResponse, status: number, payload: unknown, extraHeaders: Record<string, string> = {}) {
  if (res.writableEnded || res.destroyed) return;
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  res.end(body);
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;

    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_REQUEST_BODY_BYTES) {
        reject(Object.assign(new Error('Request payload too large.'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('error', () => {
      reject(Object.assign(new Error('Request stream failed.'), { statusCode: 400 }));
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(Object.assign(new Error('Request body must be a JSON object.'), { statusCode: 400 }));
          return;
        }
        resolve(parsed as Record<string, unknown>);
      } catch {
        reject(Object.assign(new Error('Invalid JSON payload.'), { statusCode: 400 }));
      }
    });
  });
}

function isWorkerLanguage(value: unknown): value is PaizaLanguage {
  return typeof value === 'string' && (WORKER_SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function createJudgeWorkerServer(options: JudgeWorkerOptions): Server {
  if (!options.token || options.token.trim().length < 16) {
    throw new Error('ISOLATED_JUDGE_TOKEN must be at least 16 characters (32+ recommended in production).');
  }
  const expectedToken = options.token.trim();
  const maxConcurrentJobs = Math.max(1, Math.min(32, options.maxConcurrentJobs ?? 4));
  const adapter = options.adapter ?? createDockerRuntimeAdapter('docker', options.env);
  let activeJobs = 0;

  const server = createServer(async (req, res) => {
    const method = req.method || 'GET';
    const url = (req.url || '/').split('?')[0];

    if (method === 'GET' && url === '/health') {
      const health = await adapter.checkDaemonHealth();
      return sendJson(res, health.ok ? 200 : 503, {
        status: health.ok ? 'ok' : 'degraded',
        docker: health.ok ? 'ok' : 'unavailable',
        runtime: options.dockerRuntime || options.env?.JUDGE_DOCKER_RUNTIME || 'default-runc',
        activeJobs,
        maxConcurrentJobs,
        supportedLanguages: WORKER_SUPPORTED_LANGUAGES,
        ...(health.ok ? {} : { detail: 'Container runtime is currently unavailable.' }),
      });
    }

    if (method !== 'POST' || url !== '/execute') {
      return sendJson(res, 404, { error: 'Not found.' });
    }

    const authHeader = req.headers.authorization || '';
    const bearerMatch = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
    if (!bearerMatch || !constantTimeTokenMatch(bearerMatch[1].trim(), expectedToken)) {
      return sendJson(res, 401, { error: 'Unauthorized judge request.' });
    }

    let body: Record<string, unknown>;
    try {
      body = await readJsonBody(req);
    } catch (err: any) {
      return sendJson(res, err?.statusCode || 400, { error: err?.message || 'Bad request.' });
    }

    const { language, sourceCode, timeoutMs: rawTimeoutMs, limits: rawLimits } = body;
    if (!isWorkerLanguage(language)) {
      return sendJson(res, 400, { error: 'Unsupported execution language.' });
    }
    if (typeof sourceCode !== 'string' || sourceCode.trim().length === 0) {
      return sendJson(res, 400, { error: 'sourceCode is required.' });
    }
    if (sourceCode.includes('\0')) {
      return sendJson(res, 400, { error: 'sourceCode contains invalid null bytes.' });
    }
    if (Buffer.byteLength(sourceCode, 'utf8') > MAX_WORKER_SOURCE_BYTES) {
      return sendJson(res, 400, { error: `sourceCode exceeds maximum allowed size (${MAX_WORKER_SOURCE_BYTES} bytes).` });
    }

    if (activeJobs >= maxConcurrentJobs) {
      return sendJson(
        res,
        503,
        { error: 'Judge worker is at capacity. Please retry shortly.' },
        { 'Retry-After': '2' }
      );
    }

    const { limits, timeoutMs } = clampLimits(
      rawLimits && typeof rawLimits === 'object' && !Array.isArray(rawLimits)
        ? (rawLimits as Record<string, unknown>)
        : undefined,
      rawTimeoutMs
    );

    const abortController = new AbortController();
    const onDisconnect = () => {
      if (!res.writableEnded) abortController.abort();
    };
    res.on('close', onDisconnect);

    activeJobs++;
    try {
      const result = await executeInIsolatedContainer(
        { language, sourceCode, timeoutMs, limits, signal: abortController.signal },
        adapter,
        { env: options.env, runtime: options.dockerRuntime }
      );
      return sendJson(res, 200, result);
    } catch (err) {
      if (err instanceof IsolationUnavailableError) {
        return sendJson(res, 503, { error: err.message });
      }
      return sendJson(res, 500, { error: 'Internal judge worker error.' });
    } finally {
      activeJobs--;
      res.removeListener('close', onDisconnect);
    }
  });

  // Protect worker from slowloris / stalled HTTP connections
  server.headersTimeout = 10000;
  server.requestTimeout = 35000;
  server.keepAliveTimeout = 5000;

  return server;
}

const isMainModule =
  typeof process.argv[1] === 'string' &&
  (process.argv[1].endsWith('judge-worker/server.ts') || process.argv[1].endsWith('judge-worker\\server.ts'));

if (isMainModule) {
  const token = (process.env.ISOLATED_JUDGE_TOKEN || '').trim();
  if (token.length < 32) {
    console.error('Fatal: ISOLATED_JUDGE_TOKEN must be set to a strong random secret (>= 32 characters).');
    process.exit(1);
  }
  const port = Number(process.env.JUDGE_WORKER_PORT || 4005);
  const host = process.env.JUDGE_WORKER_HOST || '127.0.0.1';
  const maxConcurrentJobs = Number(process.env.JUDGE_MAX_CONCURRENT_JOBS || 4);

  const server = createJudgeWorkerServer({
    token,
    maxConcurrentJobs,
    dockerRuntime: process.env.JUDGE_DOCKER_RUNTIME,
  });

  server.listen(port, host, () => {
    console.log(
      JSON.stringify({
        event: 'judge_worker_started',
        host,
        port,
        maxConcurrentJobs,
        runtime: process.env.JUDGE_DOCKER_RUNTIME || 'default-runc',
      })
    );
  });

  const shutdown = (signal: string) => {
    console.log(JSON.stringify({ event: 'judge_worker_shutdown', signal }));
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
