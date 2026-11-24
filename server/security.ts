import type { RequestHandler, ErrorRequestHandler } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import defaultDb from './db';

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimitStore {
  consume(keys: string[], limit: number, windowMs: number, now: number): RateLimitDecision | Promise<RateLimitDecision>;
}

export function createMemoryRateLimitStore(maxEntries = 10000): RateLimitStore {
  const entries = new Map<string, { count: number; until: number }>();
  return {
    consume(keys, limit, windowMs, now) {
      for (const [key, v] of entries) {
        if (v.until <= now) entries.delete(key);
      }
      for (const key of keys) {
        const value = entries.get(key);
        if ((value && value.count >= limit) || entries.size > maxEntries) {
          return {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil(((value?.until || now + windowMs) - now) / 1000)),
          };
        }
      }
      for (const key of keys) {
        const value = entries.get(key) || { count: 0, until: now + windowMs };
        value.count++;
        entries.set(key, value);
      }
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

/**
 * SQLite-backed rate limit store for single-host multi-process or restart-persistent quotas.
 * Multi-host horizontal deployments should supply a Redis-backed RateLimitStore implementation.
 */
export function createSqliteRateLimitStore(db: DatabaseSync = defaultDb): RateLimitStore {
  return {
    consume(keys, limit, windowMs, now) {
      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('DELETE FROM rate_limits WHERE reset_at <= ?').run(now);
        for (const key of keys) {
          const row = db
            .prepare('SELECT count, reset_at FROM rate_limits WHERE key = ?')
            .get(key) as { count: number; reset_at: number } | undefined;
          if (row && row.count >= limit) {
            db.exec('COMMIT');
            return {
              allowed: false,
              retryAfterSeconds: Math.max(1, Math.ceil((row.reset_at - now) / 1000)),
            };
          }
        }
        const resetAt = now + windowMs;
        const upsert = db.prepare(`
          INSERT INTO rate_limits (key, count, reset_at)
          VALUES (?, 1, ?)
          ON CONFLICT(key) DO UPDATE SET
            count = CASE WHEN rate_limits.reset_at <= ? THEN 1 ELSE rate_limits.count + 1 END,
            reset_at = CASE WHEN rate_limits.reset_at <= ? THEN excluded.reset_at ELSE rate_limits.reset_at END
        `);
        for (const key of keys) {
          upsert.run(key, resetAt, now, now);
        }
        db.exec('COMMIT');
        return { allowed: true, retryAfterSeconds: 0 };
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },
  };
}

/**
 * Redis REST (Upstash-compatible) shared rate-limit store for multi-instance deployments.
 * Uses Node 24's built-in fetch with an atomic pipeline (INCR + PEXPIRE NX + PTTL).
 */
export function createRedisRestRateLimitStore(options: {
  url?: string;
  token?: string;
  fetchImpl?: typeof fetch;
} = {}): RateLimitStore {
  const url = (options.url ?? process.env.REDIS_REST_URL ?? '').trim().replace(/\/+$/, '');
  const token = (options.token ?? process.env.REDIS_REST_TOKEN ?? '').trim();
  const fetchImpl = options.fetchImpl ?? fetch;
  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error('REDIS_REST_URL must be configured when RATE_LIMIT_STORE=redis.');
  }

  return {
    async consume(keys, limit, windowMs) {
      const pipeline = keys.flatMap((key) => [
        ['INCR', `alvio:rl:${key}`],
        ['PEXPIRE', `alvio:rl:${key}`, String(windowMs), 'NX'],
        ['PTTL', `alvio:rl:${key}`],
      ]);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetchImpl(`${url}/pipeline`, {
        method: 'POST',
        headers,
        body: JSON.stringify(pipeline),
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error(`Redis rate-limit store error (${res.status})`);
      const results = (await res.json()) as Array<{ result?: number }>;

      let maxRetryMs = 0;
      let exceeded = false;
      for (let i = 0; i < keys.length; i++) {
        const count = Number(results[i * 3]?.result ?? 0);
        const ttlMs = Number(results[i * 3 + 2]?.result ?? windowMs);
        if (count > limit) {
          exceeded = true;
          maxRetryMs = Math.max(maxRetryMs, ttlMs > 0 ? ttlMs : windowMs);
        }
      }
      if (exceeded) {
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(maxRetryMs / 1000)) };
      }
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

export function rateLimit(
  limit: number,
  windowMs: number,
  scope: string,
  byUser = false,
  customStore?: RateLimitStore
): RequestHandler {
  const mode = (process.env.RATE_LIMIT_STORE || 'memory').trim().toLowerCase();
  const store =
    customStore ||
    (mode === 'redis'
      ? createRedisRestRateLimitStore()
      : mode === 'sqlite'
        ? createSqliteRateLimitStore(defaultDb)
        : createMemoryRateLimitStore());

  return (req, res, next) => {
    const now = Date.now();
    const keys = [
      `${scope}:ip:${req.ip}`,
      ...(byUser && req.userId !== undefined ? [`${scope}:user:${req.userId}`] : []),
    ];
    Promise.resolve(store.consume(keys, limit, windowMs, now))
      .then((decision) => {
        if (!decision.allowed) {
          res.setHeader('Retry-After', String(decision.retryAfterSeconds));
          res.status(429).json({
            error: "You're sending requests too quickly. Try again in a moment.",
            code: 'RATE_LIMITED',
          });
          return;
        }
        next();
      })
      .catch(() => {
        logFailure(req, 'rate_limit_store_error', { scope });
        res.status(503).json({
          error: 'The service is temporarily unavailable.',
          code: 'RATE_LIMIT_UNAVAILABLE',
        });
      });
  };
}

export const securityHeaders: RequestHandler = (req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  // Inline styles and worker evaluation are required by Monaco and the local teaching runner.
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; media-src 'self' blob: https:; worker-src 'self' blob:; connect-src 'self' https://raw.githack.com https://raw.githubusercontent.com https://cdn.jsdelivr.net https://emkc.org https://api.paiza.io; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"
    );
  }
  const started = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api/')) {
      console.info(
        JSON.stringify({
          requestId: req.requestId,
          method: req.method,
          route: req.route?.path || req.path,
          status: res.statusCode,
          durationMs: Date.now() - started,
          userId: req.userId,
        })
      );
    }
  });
  next();
};

export function logFailure(
  req: { requestId?: string },
  kind: string,
  details?: Record<string, string | number | boolean | undefined>
) {
  console.error(JSON.stringify({ requestId: req.requestId, event: kind, ...details }));
}

export const safeErrors: ErrorRequestHandler = (err, req, res, _next) => {
  logFailure(req, 'request_error');
  if (res.headersSent) {
    res.end();
    return;
  }
  const status = err.type === 'entity.too.large' ? 413 : err instanceof SyntaxError ? 400 : 500;
  res.status(status).json({
    error:
      status === 413
        ? 'Request is too large.'
        : status === 400
          ? 'Invalid request body.'
          : 'The service is temporarily unavailable.',
    code: 'REQUEST_FAILED',
  });
};

export function providerCancellation(res: any) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  const close = () => {
    if (!res.writableEnded) controller.abort();
    clearTimeout(timer);
  };
  res.once('close', close);
  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timer);
      res.off('close', close);
    },
  };
}
