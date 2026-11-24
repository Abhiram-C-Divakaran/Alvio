import type { Express, RequestHandler } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import defaultDb from './db';
import { clearAuthCookies, requireAuth } from './auth';
import { logFailure, rateLimit } from './security';

export interface OutboundEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailSender {
  send(message: OutboundEmail): Promise<void>;
}

export const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
export const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Creates a real outbound email transport when configured via environment variables.
 * Returns null when no email provider is configured (never simulates delivery).
 */
export function createConfiguredEmailSender(env: NodeJS.ProcessEnv = process.env): EmailSender | null {
  const resendKey = typeof env.RESEND_API_KEY === 'string' ? env.RESEND_API_KEY.trim() : '';
  const emailFrom = typeof env.EMAIL_FROM === 'string' ? env.EMAIL_FROM.trim() : '';
  if (resendKey && emailFrom) {
    return {
      async send(message: OutboundEmail) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: emailFrom,
            to: [message.to],
            subject: message.subject,
            text: message.text,
            html: message.html,
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
          throw new Error(`Email provider rejected request (${res.status})`);
        }
      },
    };
  }

  const webhookUrl = typeof env.EMAIL_WEBHOOK_URL === 'string' ? env.EMAIL_WEBHOOK_URL.trim() : '';
  if (webhookUrl && /^https?:\/\//i.test(webhookUrl)) {
    const webhookSecret = typeof env.EMAIL_WEBHOOK_SECRET === 'string' ? env.EMAIL_WEBHOOK_SECRET.trim() : '';
    return {
      async send(message: OutboundEmail) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (webhookSecret) headers.Authorization = `Bearer ${webhookSecret}`;
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(message),
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
          throw new Error(`Email webhook rejected request (${res.status})`);
        }
      },
    };
  }

  return null;
}

function resolvePublicOrigin(req: any, allowedOrigins: string[]): string {
  if (allowedOrigins.length > 0) return allowedOrigins[0].replace(/\/+$/, '');
  const proto = req.secure ? 'https' : 'http';
  const host = typeof req.headers?.host === 'string' ? req.headers.host : 'localhost:3001';
  return `${proto}://${host}`;
}

export interface RegisterAuthRecoveryOptions {
  db?: DatabaseSync;
  emailSender?: EmailSender | null;
  allowedOrigins?: string[];
  authRequired?: RequestHandler;
  resetTtlMs?: number;
  verifyTtlMs?: number;
}

export function registerAuthRecovery(app: Express, options: RegisterAuthRecoveryOptions = {}) {
  const db = options.db ?? defaultDb;
  const auth = options.authRequired ?? requireAuth;
  const allowedOrigins = options.allowedOrigins ?? [];
  const resetTtlMs = options.resetTtlMs ?? RESET_TOKEN_TTL_MS;
  const verifyTtlMs = options.verifyTtlMs ?? VERIFY_TOKEN_TTL_MS;
  const getSender = () => (options.emailSender !== undefined ? options.emailSender : createConfiguredEmailSender());

  app.post('/api/auth/forgot-password', rateLimit(5, 600000, 'forgot_password'), async (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (!email || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: 'Enter a valid email address.' });
      }

      const sender = getSender();
      if (!sender) {
        return res.status(503).json({
          error: 'Password reset email delivery is not configured on this server yet.',
          code: 'EMAIL_NOT_CONFIGURED',
        });
      }

      const user = db.prepare('SELECT id, email, name FROM users WHERE lower(email) = ?').get(email) as
        | { id: number; email: string; name: string }
        | undefined;

      if (user) {
        const rawToken = randomBytes(32).toString('base64url');
        const tokenHash = sha256Hex(rawToken);
        const expiresAt = new Date(Date.now() + resetTtlMs).toISOString();

        db.exec('BEGIN IMMEDIATE');
        try {
          db.prepare('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL').run(user.id);
          db.prepare(
            'INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)'
          ).run(randomUUID(), user.id, tokenHash, expiresAt);
          db.exec('COMMIT');
        } catch (txErr) {
          db.exec('ROLLBACK');
          throw txErr;
        }

        const link = `${resolvePublicOrigin(req, allowedOrigins)}/auth?mode=login&resetToken=${encodeURIComponent(rawToken)}`;
        await sender.send({
          to: user.email,
          subject: 'Reset your Alvio password',
          text: `Hi ${user.name},\n\nUse this single-use link (valid for 15 minutes) to reset your Alvio password:\n${link}\n\nIf you did not request this, you can safely ignore this email.`,
          html: `<p>Hi ${user.name},</p><p>Use this single-use link (valid for 15 minutes) to reset your Alvio password:</p><p><a href="${link}">Reset Password</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
        });
      }

      // Always return the same response regardless of whether the email exists (anti-enumeration).
      return res.json({
        success: true,
        message: 'If an account matches that email, a password reset link has been sent.',
      });
    } catch {
      logFailure(req, 'forgot_password_failed');
      return res.status(500).json({ error: 'Unable to process password reset right now.' });
    }
  });

  app.post('/api/auth/reset-password', rateLimit(10, 600000, 'reset_password'), async (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
      const rawToken = typeof body.token === 'string' ? body.token.trim() : '';
      const password = body.password;
      if (!rawToken || rawToken.length > 256) {
        return res.status(400).json({ error: 'Invalid password reset token.', code: 'INVALID_RESET_TOKEN' });
      }
      if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
        return res.status(400).json({ error: 'Use a new password of 8–72 bytes.' });
      }

      const tokenHash = sha256Hex(rawToken);
      const newHash = await bcrypt.hash(password, 10);

      db.exec('BEGIN IMMEDIATE');
      try {
        const record = db
          .prepare('SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?')
          .get(tokenHash) as { id: string; user_id: number; expires_at: string; used_at: string | null } | undefined;

        if (
          !record ||
          record.used_at !== null ||
          !Number.isFinite(Date.parse(record.expires_at)) ||
          Date.parse(record.expires_at) <= Date.now()
        ) {
          db.exec('ROLLBACK');
          return res.status(400).json({
            error: 'This password reset link is invalid or has expired.',
            code: 'INVALID_RESET_TOKEN',
          });
        }

        const consume = db
          .prepare('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ? AND used_at IS NULL')
          .run(record.id);
        if (consume.changes !== 1) {
          db.exec('ROLLBACK');
          return res.status(400).json({
            error: 'This password reset link is invalid or has expired.',
            code: 'INVALID_RESET_TOKEN',
          });
        }

        // Atomically update password and revoke every active session across all devices.
        db.prepare('UPDATE users SET password_hash = ?, token_version = COALESCE(token_version, 1) + 1 WHERE id = ?').run(
          newHash,
          record.user_id
        );
        db.prepare('UPDATE auth_sessions SET revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP) WHERE user_id = ? AND revoked_at IS NULL').run(
          record.user_id
        );
        db.exec('COMMIT');
      } catch (txErr) {
        db.exec('ROLLBACK');
        throw txErr;
      }

      clearAuthCookies(req, res);
      return res.json({ success: true, message: 'Password updated. Please sign in with your new password.' });
    } catch {
      logFailure(req, 'reset_password_failed');
      return res.status(500).json({ error: 'Unable to reset password right now.' });
    }
  });

  app.post('/api/auth/verify-email/request', auth, rateLimit(5, 600000, 'verify_email', true), async (req, res) => {
    try {
      const user = db.prepare('SELECT id, email, name, email_verified_at FROM users WHERE id = ?').get(req.userId) as
        | { id: number; email: string; name: string; email_verified_at: string | null }
        | undefined;
      if (!user) return res.status(404).json({ error: 'User not found.' });
      if (user.email_verified_at) {
        return res.json({ verified: true, alreadyVerified: true });
      }

      const sender = getSender();
      if (!sender) {
        return res.status(503).json({
          error: 'Email verification delivery is not configured on this server yet.',
          code: 'EMAIL_NOT_CONFIGURED',
        });
      }

      const rawToken = randomBytes(32).toString('base64url');
      const tokenHash = sha256Hex(rawToken);
      const expiresAt = new Date(Date.now() + verifyTtlMs).toISOString();

      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL').run(user.id);
        db.prepare(
          'INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)'
        ).run(randomUUID(), user.id, tokenHash, expiresAt);
        db.exec('COMMIT');
      } catch (txErr) {
        db.exec('ROLLBACK');
        throw txErr;
      }

      const link = `${resolvePublicOrigin(req, allowedOrigins)}/auth?mode=login&verifyToken=${encodeURIComponent(rawToken)}`;
      await sender.send({
        to: user.email,
        subject: 'Verify your Alvio email address',
        text: `Hi ${user.name},\n\nVerify your email address using this single-use link (valid for 24 hours):\n${link}`,
        html: `<p>Hi ${user.name},</p><p>Verify your email address using this single-use link (valid for 24 hours):</p><p><a href="${link}">Verify Email</a></p>`,
      });

      return res.json({ sent: true });
    } catch {
      logFailure(req, 'verify_email_request_failed');
      return res.status(500).json({ error: 'Unable to send verification email right now.' });
    }
  });

  app.post('/api/auth/verify-email/confirm', rateLimit(10, 600000, 'verify_email_confirm'), (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
      const rawToken = typeof body.token === 'string' ? body.token.trim() : '';
      if (!rawToken || rawToken.length > 256) {
        return res.status(400).json({ error: 'Invalid verification token.', code: 'INVALID_VERIFY_TOKEN' });
      }
      const tokenHash = sha256Hex(rawToken);

      db.exec('BEGIN IMMEDIATE');
      try {
        const record = db
          .prepare('SELECT id, user_id, expires_at, used_at FROM email_verification_tokens WHERE token_hash = ?')
          .get(tokenHash) as { id: string; user_id: number; expires_at: string; used_at: string | null } | undefined;

        if (
          !record ||
          record.used_at !== null ||
          !Number.isFinite(Date.parse(record.expires_at)) ||
          Date.parse(record.expires_at) <= Date.now()
        ) {
          db.exec('ROLLBACK');
          return res.status(400).json({
            error: 'This email verification link is invalid or has expired.',
            code: 'INVALID_VERIFY_TOKEN',
          });
        }

        const consume = db
          .prepare('UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ? AND used_at IS NULL')
          .run(record.id);
        if (consume.changes !== 1) {
          db.exec('ROLLBACK');
          return res.status(400).json({
            error: 'This email verification link is invalid or has expired.',
            code: 'INVALID_VERIFY_TOKEN',
          });
        }

        db.prepare('UPDATE users SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP) WHERE id = ?').run(
          record.user_id
        );
        db.exec('COMMIT');
      } catch (txErr) {
        db.exec('ROLLBACK');
        throw txErr;
      }

      return res.json({ verified: true });
    } catch {
      logFailure(req, 'verify_email_confirm_failed');
      return res.status(500).json({ error: 'Unable to verify email right now.' });
    }
  });
}
