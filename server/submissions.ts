import type { Express, RequestHandler } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import defaultDb from './db';
import { optionalAuth, requireAuth } from './auth';
import { logFailure, providerCancellation, rateLimit } from './security';
import {
  DEFAULT_EXECUTION_TIMEOUT_MS,
  MAX_CODE_LENGTH,
  evaluateSubmission,
  isSupportedLanguage,
  type ExecutionProvider,
  type SubmissionProblem,
} from './submissionRunner';

export interface RegisterSubmissionsOptions {
  db?: DatabaseSync;
  provider?: ExecutionProvider;
  timeoutMs?: number;
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
  authOptional?: RequestHandler;
  authRequired?: RequestHandler;
}

function parseProblemRow(row: any): SubmissionProblem | null {
  try {
    const signature = typeof row.signature === 'string' ? JSON.parse(row.signature) : row.signature;
    const testCases = typeof row.testCases === 'string' ? JSON.parse(row.testCases) : row.testCases;
    return {
      id: String(row.id),
      title: typeof row.title === 'string' ? row.title : undefined,
      signature,
      testCases,
    };
  } catch {
    return null;
  }
}

export function registerSubmissions(app: Express, options: RegisterSubmissionsOptions = {}) {
  const db = options.db ?? defaultDb;
  const timeoutMs = options.timeoutMs ?? DEFAULT_EXECUTION_TIMEOUT_MS;
  const submitRateLimit = rateLimit(
    options.rateLimitMax ?? 20,
    options.rateLimitWindowMs ?? 60000,
    'submit',
    true
  );
  const useOptionalAuth = options.authOptional ?? optionalAuth;
  const useRequiredAuth = options.authRequired ?? requireAuth;

  app.post('/api/problems/:problemId/submit', useOptionalAuth, submitRateLimit, async (req, res) => {
    const cancellation = providerCancellation(res);
    try {
      const problemId = typeof req.params.problemId === 'string' ? req.params.problemId.trim() : '';
      if (!problemId || problemId.length > 128) {
        return res.status(400).json({ error: 'Invalid problem ID.' });
      }

      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const { code, language } = body;

      if (!isSupportedLanguage(language)) {
        return res.status(400).json({ error: 'Unsupported or missing programming language.' });
      }
      if (typeof code !== 'string' || code.trim().length === 0) {
        return res.status(400).json({ error: 'Code is required.' });
      }
      if (code.length > MAX_CODE_LENGTH) {
        return res.status(400).json({ error: `Code exceeds maximum allowed length (${MAX_CODE_LENGTH} characters).` });
      }

      const row = db.prepare('SELECT id, title, signature, testCases FROM problems WHERE id = ?').get(problemId) as any;
      if (!row) {
        return res.status(404).json({ error: 'Problem not found.' });
      }

      const problem = parseProblemRow(row);
      if (!problem) {
        logFailure(req, 'problem_parse_failed');
        return res.status(500).json({ error: 'Problem test data is unavailable.' });
      }

      const verdict = await evaluateSubmission({
        problem,
        code,
        language,
        provider: options.provider,
        timeoutMs,
        signal: cancellation.signal,
      });

      if (verdict.errorType === 'provider') {
        logFailure(req, 'submission_provider_unavailable');
        return res.status(503).json({
          status: 'Error',
          passedCount: 0,
          totalCount: verdict.totalCount,
          executionTimeMs: verdict.executionTimeMs,
          message: verdict.message,
          error: verdict.message,
          stdout: [],
          errorType: 'provider',
          verified: false,
          saved: false,
        });
      }

      if (!verdict.recordable) {
        return res.status(200).json({
          status: verdict.status,
          passedCount: verdict.passedCount,
          totalCount: verdict.totalCount,
          executionTimeMs: verdict.executionTimeMs,
          message: verdict.message,
          stdout: verdict.stdout,
          errorType: verdict.errorType,
          verified: false,
          saved: false,
        });
      }

      // Record server-calculated problem statistics.
      const acceptedDelta = verdict.status === 'Passed' ? 1 : 0;
      db.prepare(`
        INSERT INTO problem_stats (problem_id, accepted, submissions)
        VALUES (?, ?, 1)
        ON CONFLICT(problem_id) DO UPDATE SET
          accepted = accepted + excluded.accepted,
          submissions = submissions + 1
      `).run(problemId, acceptedDelta);

      const updatedStats = db
        .prepare('SELECT accepted, submissions FROM problem_stats WHERE problem_id = ?')
        .get(problemId) as { accepted: number; submissions: number } | undefined;

      let saved = false;
      let savedSubmission: any = null;

      if (req.userId !== undefined) {
        const insertResult = db.prepare(`
          INSERT INTO user_submissions
            (user_id, problem_id, status, language, code, runtime_ms, passed_testcases, total_testcases, verified)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `).run(
          req.userId,
          problemId,
          verdict.status,
          language,
          code,
          verdict.executionTimeMs,
          verdict.passedCount,
          verdict.totalCount
        );
        saved = true;
        savedSubmission = db
          .prepare('SELECT * FROM user_submissions WHERE id = ?')
          .get(Number(insertResult.lastInsertRowid));
      }

      return res.status(200).json({
        status: verdict.status,
        passedCount: verdict.passedCount,
        totalCount: verdict.totalCount,
        executionTimeMs: verdict.executionTimeMs,
        message: verdict.message,
        stdout: verdict.stdout,
        errorType: verdict.errorType,
        verified: true,
        saved,
        stats: updatedStats ?? { accepted: acceptedDelta, submissions: 1 },
        ...(savedSubmission ? { submission: savedSubmission } : {}),
      });
    } catch {
      logFailure(req, 'submission_failed');
      return res.status(500).json({ error: 'Unable to process submission right now.' });
    } finally {
      cancellation.dispose();
    }
  });

  app.get('/api/problems/:problemId/submissions', useRequiredAuth, (req, res) => {
    try {
      const problemId = String(req.params.problemId);
      const submission = db.prepare(`
        SELECT us.*, u.name as user_name
        FROM user_submissions us
        JOIN users u ON us.user_id = u.id
        WHERE us.problem_id = ? AND us.user_id = ?
        ORDER BY us.created_at DESC, us.id DESC
        LIMIT 1
      `).get(problemId, req.userId);

      if (submission) {
        const submissions = db.prepare(
          'SELECT * FROM user_submissions WHERE user_id = ? AND problem_id = ? ORDER BY created_at DESC, id DESC LIMIT 50'
        ).all(req.userId, problemId);
        res.json({ submission, submissions });
      } else {
        res.json({ submission: null, submissions: [] });
      }
    } catch {
      logFailure(req, 'backend_error');
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
