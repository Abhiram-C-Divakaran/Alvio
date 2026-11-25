import { pathToFileURL } from 'node:url';

export interface EnvValidationReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    nodeEnv: string;
    nodeVersion: string;
    databasePersistent: boolean;
    httpsCookiesEnforced: boolean;
    trustProxyEnabled: boolean;
    rateLimitStore: string;
    judgeProvider: string;
    aiConfigured: boolean;
    emailRecoveryConfigured: boolean;
  };
}

function isPrivateOrInternalHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower === '127.0.0.1' || lower === '::1') return true;
  if (lower.endsWith('.internal') || lower.endsWith('.local') || lower.endsWith('.lan')) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(lower)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(lower)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(lower)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\.\d{1,3}\.\d{1,3}$/.test(lower)) return true; // CGNAT / Tailscale
  return false;
}

/**
 * Validates Alvio staging/production environment configuration without ever echoing
 * or logging secret values.
 */
export function validateProductionEnv(
  env: NodeJS.ProcessEnv = process.env,
  nodeVersion: string = process.versions.node
): EnvValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const majorNode = Number.parseInt(nodeVersion.split('.')[0] || '0', 10);
  if (!Number.isFinite(majorNode) || majorNode < 24) {
    errors.push(`Node.js 24+ is required for built-in node:sqlite (detected v${nodeVersion}).`);
  }

  const nodeEnv = (env.NODE_ENV || '').trim();
  if (nodeEnv !== 'production') {
    errors.push(`NODE_ENV must be set to "production" (currently "${nodeEnv || 'unset'}").`);
  }

  const jwtSecret = env.JWT_SECRET || '';
  if (jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be set to a random value of at least 32 characters (48+ bytes hex recommended).');
  } else if (jwtSecret.length < 48) {
    warnings.push('JWT_SECRET is valid (>=32 chars) but 48+ bytes hex (96 hex chars) is recommended in production.');
  }

  const origins = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  if (origins.length === 0) {
    errors.push('ALLOWED_ORIGINS is required in production (comma-separated exact https:// origins, no trailing slash).');
  } else {
    for (const origin of origins) {
      if (origin.endsWith('/')) {
        errors.push(`ALLOWED_ORIGINS entry "${origin}" must not include a trailing slash.`);
      }
      try {
        const parsed = new URL(origin);
        if (parsed.protocol !== 'https:') {
          errors.push(`ALLOWED_ORIGINS entry "${origin}" must use https:// in staging/production.`);
        }
      } catch {
        errors.push(`ALLOWED_ORIGINS entry "${origin}" is not a valid URL.`);
      }
    }
  }

  const cookieSecure = env.COOKIE_SECURE === 'true';
  if (!cookieSecure) {
    errors.push('COOKIE_SECURE must be set to "true" behind HTTPS in staging/production.');
  }

  const trustProxy = env.TRUST_PROXY === 'true' || env.TRUST_PROXY === '1';
  if (!trustProxy) {
    errors.push('TRUST_PROXY must be set to "true" when running behind Nginx or another HTTPS reverse proxy.');
  }

  const dbPath = (env.DATABASE_PATH || '').trim();
  let databasePersistent = false;
  if (!dbPath) {
    errors.push('DATABASE_PATH must be explicitly set to a persistent volume path (e.g. /var/lib/alvio/database.sqlite).');
  } else if (dbPath === ':memory:' || dbPath.startsWith('/tmp/') || dbPath === '/tmp') {
    errors.push(`DATABASE_PATH ("${dbPath}") points to ephemeral storage; use a persistent disk volume.`);
  } else {
    databasePersistent = true;
    if (!dbPath.startsWith('/') && !/^[A-Za-z]:[\\/]/.test(dbPath)) {
      warnings.push(`DATABASE_PATH ("${dbPath}") is relative; prefer an absolute path like /var/lib/alvio/database.sqlite.`);
    }
  }

  const rateLimitStore = (env.RATE_LIMIT_STORE || 'memory').trim().toLowerCase();
  if (!['memory', 'sqlite', 'redis'].includes(rateLimitStore)) {
    errors.push(`RATE_LIMIT_STORE must be "memory", "sqlite", or "redis" (received "${rateLimitStore}").`);
  } else if (rateLimitStore === 'memory') {
    warnings.push('RATE_LIMIT_STORE=memory resets on restart; set RATE_LIMIT_STORE=sqlite (single host) or redis (multi-host).');
  } else if (rateLimitStore === 'redis') {
    const redisUrl = (env.REDIS_REST_URL || '').trim();
    const redisToken = (env.REDIS_REST_TOKEN || '').trim();
    if (!redisUrl || !/^https:\/\//i.test(redisUrl)) {
      errors.push('REDIS_REST_URL must be a valid https:// URL when RATE_LIMIT_STORE=redis.');
    }
    if (!redisToken) {
      errors.push('REDIS_REST_TOKEN must be set when RATE_LIMIT_STORE=redis.');
    }
  }

  const judgeProvider = (env.JUDGE_PROVIDER || 'paiza').trim().toLowerCase();
  if (judgeProvider !== 'paiza' && judgeProvider !== 'isolated') {
    errors.push(`JUDGE_PROVIDER must be "paiza" or "isolated" (received "${judgeProvider}").`);
  } else if (judgeProvider === 'isolated') {
    const judgeUrl = (env.ISOLATED_JUDGE_URL || '').trim();
    const judgeToken = (env.ISOLATED_JUDGE_TOKEN || '').trim();
    if (!judgeUrl) {
      errors.push('ISOLATED_JUDGE_URL is required when JUDGE_PROVIDER=isolated.');
    } else {
      try {
        const parsed = new URL(judgeUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          errors.push('ISOLATED_JUDGE_URL must use http:// (private VPC/VPN only) or https://.');
        }
        if (parsed.protocol === 'http:' && !isPrivateOrInternalHost(parsed.hostname)) {
          errors.push(
            `ISOLATED_JUDGE_URL host "${parsed.hostname}" appears public over plain HTTP; use a private VPC/WireGuard IP or internal HTTPS.`
          );
        }
      } catch {
        errors.push('ISOLATED_JUDGE_URL is not a valid URL.');
      }
    }
    if (judgeToken.length < 32) {
      errors.push('ISOLATED_JUDGE_TOKEN must be at least 32 characters (48+ bytes hex recommended) when JUDGE_PROVIDER=isolated.');
    }
  } else {
    warnings.push('JUDGE_PROVIDER=paiza is active (safe fallback). Switch to JUDGE_PROVIDER=isolated only after live gVisor verification passes on your dedicated judge host.');
  }

  const aiConfigured = Boolean((env.GROQ_API_KEY || '').trim());
  if (!aiConfigured) {
    warnings.push('GROQ_API_KEY is not configured; AI Tutor, AI Visualizer, and Mock Interview will return honest 503 unavailable responses.');
  }

  const resendConfigured = Boolean((env.RESEND_API_KEY || '').trim() && (env.EMAIL_FROM || '').trim());
  const webhookConfigured = Boolean((env.EMAIL_WEBHOOK_URL || '').trim());
  const emailRecoveryConfigured = resendConfigured || webhookConfigured;
  if (!emailRecoveryConfigured) {
    warnings.push('No email provider configured (RESEND_API_KEY + EMAIL_FROM or EMAIL_WEBHOOK_URL); password reset and email verification will return honest 503 EMAIL_NOT_CONFIGURED.');
  }

  if (judgeProvider === 'paiza' && !(env.PAIZA_API_KEY || '').trim()) {
    warnings.push('PAIZA_API_KEY is unset; Paiza fallback will use the rate-limited "guest" key.');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    summary: {
      nodeEnv: nodeEnv || 'unset',
      nodeVersion: `v${nodeVersion}`,
      databasePersistent,
      httpsCookiesEnforced: cookieSecure,
      trustProxyEnabled: trustProxy,
      rateLimitStore,
      judgeProvider,
      aiConfigured,
      emailRecoveryConfigured,
    },
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const report = validateProductionEnv(process.env);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
