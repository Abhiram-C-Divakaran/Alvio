import jwt, { type SignOptions } from 'jsonwebtoken';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Request, Response, RequestHandler } from 'express';
import type { PublicUser } from '../src/types/api';
import db from './db';
import { logFailure } from './security';

declare global {
  namespace Express {
    interface Request {
      userId: number;
      sessionId?: string;
      authMethod?: 'bearer' | 'cookie';
      requestId: string;
    }
  }
}

export const ACCESS_COOKIE_NAME = 'alvio_access';
export const REFRESH_COOKIE_NAME = 'alvio_refresh';
export const CSRF_COOKIE_NAME = 'alvio_csrf';

export type AuthErrorCode = 'UNAUTHORIZED' | 'TOKEN_EXPIRED' | 'SESSION_REVOKED';

export class AuthVerificationError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthVerificationError';
    this.code = code;
  }
}

export function authSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  return secret;
}

export function accessTokenTtl(): SignOptions['expiresIn'] {
  const configured = process.env.JWT_ACCESS_TTL?.trim();
  return (configured || '15m') as SignOptions['expiresIn'];
}

export function refreshTokenTtlMs(): number {
  const days = Number(process.env.JWT_REFRESH_DAYS);
  const validDays = Number.isFinite(days) && days >= 1 && days <= 90 ? days : 7;
  return validDays * 24 * 60 * 60 * 1000;
}

function hashToken(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

export function parseCookies(header?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const rawVal = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(rawVal);
    } catch {
      cookies[key] = rawVal;
    }
  }
  return cookies;
}

function isSecureCookieRequest(req: Request): boolean {
  if (process.env.COOKIE_SECURE === 'true') return true;
  if (process.env.COOKIE_SECURE === 'false') return false;
  if (req.secure) return true;
  const forwardedProto = req.headers['x-forwarded-proto'];
  if (typeof forwardedProto === 'string' && forwardedProto.split(',')[0].trim() === 'https') {
    return true;
  }
  return false;
}

function serializeCookie(
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Lax' | 'Strict' | 'None';
    path?: string;
    maxAgeSeconds?: number;
  }
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || '/'}`);
  if (options.maxAgeSeconds !== undefined) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`);
  }
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  parts.push(`SameSite=${options.sameSite || 'Lax'}`);
  return parts.join('; ');
}

export function setAuthCookies(
  req: Request,
  res: Response,
  tokens: { accessToken: string; refreshToken: string; csrfToken: string }
): void {
  const secure = isSecureCookieRequest(req);
  const refreshMaxAgeSec = Math.floor(refreshTokenTtlMs() / 1000);
  // Keep access cookie Max-Age aligned with refresh window so expired JWT triggers X-Auth-Expired refresh flow.
  const cookies = [
    serializeCookie(ACCESS_COOKIE_NAME, tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'Lax',
      path: '/api',
      maxAgeSeconds: refreshMaxAgeSec,
    }),
    serializeCookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'Lax',
      path: '/api/auth',
      maxAgeSeconds: refreshMaxAgeSec,
    }),
    serializeCookie(CSRF_COOKIE_NAME, tokens.csrfToken, {
      httpOnly: false,
      secure,
      sameSite: 'Lax',
      path: '/',
      maxAgeSeconds: refreshMaxAgeSec,
    }),
  ];
  res.setHeader('Set-Cookie', cookies);
}

export function clearAuthCookies(req: Request, res: Response): void {
  const secure = isSecureCookieRequest(req);
  res.setHeader('Set-Cookie', [
    serializeCookie(ACCESS_COOKIE_NAME, '', { httpOnly: true, secure, sameSite: 'Lax', path: '/api', maxAgeSeconds: 0 }),
    serializeCookie(REFRESH_COOKIE_NAME, '', { httpOnly: true, secure, sameSite: 'Lax', path: '/api/auth', maxAgeSeconds: 0 }),
    serializeCookie(CSRF_COOKIE_NAME, '', { httpOnly: false, secure, sameSite: 'Lax', path: '/', maxAgeSeconds: 0 }),
  ]);
}

function getUserTokenVersion(userId: number): number {
  const row = db.prepare('SELECT token_version FROM users WHERE id = ?').get(userId) as { token_version?: number } | undefined;
  return typeof row?.token_version === 'number' ? row.token_version : 1;
}

export function signAuthToken(userId: number, options?: { sessionId?: string; tokenVersion?: number; expiresIn?: SignOptions['expiresIn'] }): string {
  const ver = options?.tokenVersion ?? getUserTokenVersion(userId);
  const payload: Record<string, unknown> = { typ: 'access', ver };
  const signOpts: SignOptions = {
    subject: String(userId),
    algorithm: 'HS256',
    expiresIn: options?.expiresIn ?? accessTokenTtl(),
    issuer: 'alvio',
    audience: 'alvio-student',
  };
  if (options?.sessionId) {
    signOpts.jwtid = options.sessionId;
  }
  return jwt.sign(payload, authSecret(), signOpts);
}

export function createAuthSession(
  userId: number,
  userAgent = ''
): { sessionId: string; accessToken: string; refreshToken: string; csrfToken: string } {
  const sessionId = randomUUID();
  const refreshSecret = randomBytes(32).toString('base64url');
  const refreshToken = `${sessionId}.${refreshSecret}`;
  const csrfToken = randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + refreshTokenTtlMs()).toISOString();
  const safeUa = userAgent.slice(0, 256);

  db.prepare(
    `INSERT INTO auth_sessions (id, user_id, refresh_token_hash, user_agent, expires_at, created_at, last_used_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  ).run(sessionId, userId, hashToken(refreshToken), safeUa, expiresAt);

  const tokenVersion = getUserTokenVersion(userId);
  const accessToken = signAuthToken(userId, { sessionId, tokenVersion });
  return { sessionId, accessToken, refreshToken, csrfToken };
}

export function revokeSessionById(sessionId: string): void {
  db.prepare('UPDATE auth_sessions SET revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP) WHERE id = ?').run(sessionId);
}

export function revokeAllUserSessions(userId: number): void {
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('UPDATE users SET token_version = COALESCE(token_version, 1) + 1 WHERE id = ?').run(userId);
    db.prepare('UPDATE auth_sessions SET revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP) WHERE user_id = ? AND revoked_at IS NULL').run(userId);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function rotateRefreshSession(
  rawRefreshToken: string,
  userAgent = ''
): { user: any; sessionId: string; accessToken: string; refreshToken: string; csrfToken: string } | null {
  const dot = rawRefreshToken.indexOf('.');
  if (dot <= 0 || dot === rawRefreshToken.length - 1) return null;
  const sessionId = rawRefreshToken.slice(0, dot);

  const session = db
    .prepare('SELECT id, user_id, refresh_token_hash, expires_at, revoked_at FROM auth_sessions WHERE id = ?')
    .get(sessionId) as
    | { id: string; user_id: number; refresh_token_hash: string; expires_at: string; revoked_at: string | null }
    | undefined;

  if (!session) return null;

  const suppliedHash = hashToken(rawRefreshToken);
  const hashMatches = safeEqualHex(suppliedHash, session.refresh_token_hash);

  // Reuse or replay of a rotated/revoked refresh token revokes all sessions for the account.
  if (session.revoked_at !== null || !hashMatches) {
    revokeAllUserSessions(session.user_id);
    return null;
  }

  if (!Number.isFinite(Date.parse(session.expires_at)) || Date.parse(session.expires_at) <= Date.now()) {
    revokeSessionById(session.id);
    return null;
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as any;
  if (!user) return null;

  const newRefreshToken = `${session.id}.${randomBytes(32).toString('base64url')}`;
  const csrfToken = randomBytes(24).toString('base64url');
  const newExpiresAt = new Date(Date.now() + refreshTokenTtlMs()).toISOString();
  const safeUa = userAgent.slice(0, 256);

  db.exec('BEGIN IMMEDIATE');
  try {
    const update = db
      .prepare(
        `UPDATE auth_sessions
         SET refresh_token_hash = ?, expires_at = ?, last_used_at = CURRENT_TIMESTAMP, user_agent = ?
         WHERE id = ? AND revoked_at IS NULL AND refresh_token_hash = ?`
      )
      .run(hashToken(newRefreshToken), newExpiresAt, safeUa, session.id, session.refresh_token_hash);

    if (update.changes !== 1) {
      db.exec('ROLLBACK');
      revokeAllUserSessions(session.user_id);
      return null;
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const accessToken = signAuthToken(Number(user.id), {
    sessionId: session.id,
    tokenVersion: typeof user.token_version === 'number' ? user.token_version : 1,
  });

  return { user, sessionId: session.id, accessToken, refreshToken: newRefreshToken, csrfToken };
}

function validateVerifiedPayload(value: string | jwt.JwtPayload): { userId: number; sessionId?: string } {
  if (typeof value === 'string' || typeof value.sub !== 'string' || !/^\d+$/.test(value.sub)) {
    throw new AuthVerificationError('UNAUTHORIZED', 'Invalid subject');
  }
  const id = Number(value.sub);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AuthVerificationError('UNAUTHORIZED', 'Invalid account');
  }
  const user = db.prepare('SELECT id, token_version FROM users WHERE id = ?').get(id) as
    | { id: number; token_version?: number }
    | undefined;
  if (!user) {
    throw new AuthVerificationError('UNAUTHORIZED', 'Invalid account');
  }

  const currentVersion = typeof user.token_version === 'number' ? user.token_version : 1;
  if (typeof value.ver === 'number' && value.ver !== currentVersion) {
    throw new AuthVerificationError('SESSION_REVOKED', 'Session has been revoked');
  }

  const sessionId = typeof value.jti === 'string' ? value.jti : undefined;
  if (sessionId) {
    const session = db
      .prepare('SELECT user_id, revoked_at, expires_at FROM auth_sessions WHERE id = ?')
      .get(sessionId) as { user_id: number; revoked_at: string | null; expires_at: string } | undefined;
    if (
      !session ||
      session.user_id !== id ||
      session.revoked_at !== null ||
      !Number.isFinite(Date.parse(session.expires_at)) ||
      Date.parse(session.expires_at) <= Date.now()
    ) {
      throw new AuthVerificationError('SESSION_REVOKED', 'Session has been revoked');
    }
  }

  return { userId: id, sessionId };
}

export function verifyAuthSession(token: string): { userId: number; sessionId?: string } {
  const secret = authSecret();
  try {
    const value = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'alvio',
      audience: 'alvio-student',
    });
    return validateVerifiedPayload(value);
  } catch (err: any) {
    if (err instanceof AuthVerificationError) throw err;
    if (err?.name === 'TokenExpiredError') {
      // Confirm signature, user existence, and non-revoked session before signaling refreshable expiry.
      try {
        const decoded = jwt.verify(token, secret, {
          algorithms: ['HS256'],
          issuer: 'alvio',
          audience: 'alvio-student',
          ignoreExpiration: true,
        });
        validateVerifiedPayload(decoded);
        throw new AuthVerificationError('TOKEN_EXPIRED', 'Access token expired');
      } catch (inner) {
        if (inner instanceof AuthVerificationError) throw inner;
      }
    }
    throw new AuthVerificationError('UNAUTHORIZED', 'Invalid token');
  }
}

export function verifyAuthToken(token: string): number {
  return verifyAuthSession(token).userId;
}

function extractRequestToken(req: Request): { token: string; method: 'bearer' | 'cookie' } | null {
  if (req.headers.authorization !== undefined) {
    const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization);
    if (!match) throw new AuthVerificationError('UNAUTHORIZED', 'Malformed Authorization header');
    return { token: match[1], method: 'bearer' };
  }
  const cookies = parseCookies(req.headers.cookie);
  if (cookies[ACCESS_COOKIE_NAME]) {
    return { token: cookies[ACCESS_COOKIE_NAME], method: 'cookie' };
  }
  return null;
}

export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const extracted = extractRequestToken(req);
    if (!extracted) {
      throw new AuthVerificationError('UNAUTHORIZED', 'Missing credentials');
    }
    const verified = verifyAuthSession(extracted.token);
    req.userId = verified.userId;
    req.sessionId = verified.sessionId;
    req.authMethod = extracted.method;
    next();
  } catch (err) {
    const code: AuthErrorCode = err instanceof AuthVerificationError ? err.code : 'UNAUTHORIZED';
    if (code === 'TOKEN_EXPIRED') {
      res.setHeader('X-Auth-Expired', '1');
    }
    res.status(401).json({ error: 'Please sign in again.', code });
  }
};

/** For explicitly public routes only. Supplied invalid credentials never become anonymous. */
export const optionalAuth: RequestHandler = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  if (req.headers.authorization === undefined && !cookies[ACCESS_COOKIE_NAME]) {
    next();
    return;
  }
  return requireAuth(req, res, next);
};

function isAllowedOrigin(originHeader: string, allowedOrigins: string[], hostHeader?: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(originHeader);
  } catch {
    return false;
  }
  const normalized = parsed.origin;
  if (allowedOrigins.includes(normalized)) return true;
  if (hostHeader && parsed.host === hostHeader) return true;
  if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
    return true;
  }
  return false;
}

/**
 * CSRF protection for cookie-authenticated state-changing requests.
 * Requests carrying an explicit Authorization: Bearer header are not vulnerable to browser CSRF.
 */
export function csrfProtection(allowedOrigins: string[]): RequestHandler {
  const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
  return (req, res, next) => {
    if (safeMethods.has(req.method.toUpperCase())) {
      next();
      return;
    }

    // Explicit Bearer header is not sent automatically by browsers on cross-site requests.
    if (typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')) {
      next();
      return;
    }

    const cookies = parseCookies(req.headers.cookie);
    const hasAuthCookie = Boolean(cookies[ACCESS_COOKIE_NAME] || cookies[REFRESH_COOKIE_NAME]);
    const isAuthBootstrap =
      req.path === '/auth/login' ||
      req.path === '/auth/signup' ||
      req.path === '/auth/forgot-password' ||
      req.path === '/auth/reset-password' ||
      req.path === '/auth/verify-email/confirm';

    // Always reject explicit cross-origin requests even on login/signup if Origin is untrusted.
    const originHeader = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
    const refererHeader = typeof req.headers.referer === 'string' ? req.headers.referer : undefined;
    const hostHeader = typeof req.headers.host === 'string' ? req.headers.host : undefined;

    if (originHeader && !isAllowedOrigin(originHeader, allowedOrigins, hostHeader)) {
      logFailure(req, 'csrf_origin_rejected');
      res.status(403).json({ error: 'Cross-site request blocked.', code: 'CSRF_REJECTED' });
      return;
    }

    if (!hasAuthCookie || isAuthBootstrap) {
      next();
      return;
    }

    if (!originHeader && refererHeader && !isAllowedOrigin(refererHeader, allowedOrigins, hostHeader)) {
      logFailure(req, 'csrf_referer_rejected');
      res.status(403).json({ error: 'Cross-site request blocked.', code: 'CSRF_REJECTED' });
      return;
    }

    const csrfCookie = cookies[CSRF_COOKIE_NAME] || '';
    const csrfHeader = typeof req.headers['x-csrf-token'] === 'string' ? req.headers['x-csrf-token'] : '';
    if (!csrfCookie || !csrfHeader || !safeEqualHex(csrfCookie, csrfHeader)) {
      logFailure(req, 'csrf_token_rejected');
      res.status(403).json({ error: 'Invalid CSRF token. Please refresh and try again.', code: 'CSRF_REJECTED' });
      return;
    }

    next();
  };
}

export function extractSessionIdFromRequest(req: Request): string | null {
  if (req.sessionId) return req.sessionId;
  const secret = authSecret();
  const candidates: string[] = [];
  const authMatch = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '');
  if (authMatch) candidates.push(authMatch[1]);
  const cookies = parseCookies(req.headers.cookie);
  if (cookies[ACCESS_COOKIE_NAME]) candidates.push(cookies[ACCESS_COOKIE_NAME]);

  for (const token of candidates) {
    try {
      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer: 'alvio',
        audience: 'alvio-student',
        ignoreExpiration: true,
      });
      if (typeof decoded !== 'string' && typeof decoded.jti === 'string') {
        return decoded.jti;
      }
    } catch {
      // Ignore invalid token during best-effort logout
    }
  }

  const refresh = cookies[REFRESH_COOKIE_NAME];
  if (refresh && refresh.includes('.')) {
    return refresh.slice(0, refresh.indexOf('.'));
  }
  return null;
}

export function publicUser(user: any): PublicUser {
  return {
    id: String(user.id),
    name: String(user.name),
    email: String(user.email),
    emailVerified: Boolean(user.email_verified_at),
    xp: Number(user.xp || 0),
    level: String(user.level || 'Apprentice'),
    avatar: user.avatar_url || undefined,
    createdAt: String(user.created_at || ''),
    settings: { theme: 'dark', voiceEnabled: false, animationSpeed: 1, notifications: true },
  };
}
