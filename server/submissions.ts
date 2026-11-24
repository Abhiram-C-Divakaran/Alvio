import type { Express, RequestHandler } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import type { SubmissionExecutionStatus } from '../src/types/api';
import defaultDb from './db';
import { optionalAuth, requireAuth } from './auth';
import { logFailure, providerCancellation, rateLimit } from './security';
import { awardVerifiedXp, xpForCodingDifficulty } from './xpLedger';
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

function mapExecutionStatus(verdict: {
  status: 'Passed' | 'Failed' | 'Error';
  errorType: 'compilation' | 'runtime' | 'timeout' | 'provider' | 'unsupported' | null;
}): SubmissionExecutionStatus {
  if (verdict.status === 'Passed') return 'accepted';
  if (verdict.status === 'Failed') return 'wrong_answer';
  switch (verdict.errorType) {
    case 'compilation': return 'compilation_error';
    case 'timeout': return 'time_limit_exceeded';
    case 'provider': return 'provider_unavailable';
    case 'unsupported': return 'unsupported';
    default: return 'runtime_error';
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
  const inFlightKeys = new Set<string>();

  app.post('/api/problems/:problemId/submit', useOptionalAuth, submitRateLimit, async (req, res) => {
    const cancellation = providerCancellation(res);
    let inFlightKey: string | null = null;
    try {
      const problemId = typeof req.params.problemId === 'string' ? req.params.problemId.trim() : '';
      if (!problemId || problemId.length > 128 || !/^[a-zA-Z0-9._-]+$/.test(problemId)) {
        return res.status(400).json({ error: 'Invalid problem ID.' });
      }

      const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
      const { code, language } = body;

      if (!isSupportedLanguage(language)) {
        return res.status(400).json({ error: 'Unsupported or missing programming language.' });
      }
      if (typeof code !== 'string' || code.trim().length === 0) {
        return res.status(400).json({ error: 'Code is required.' });
      }
      if (code.includes('\0')) {
        return res.status(400).json({ error: 'Code contains invalid null characters.' });
      }
      if (code.length > MAX_CODE_LENGTH) {
        return res.status(400).json({ error: `Code exceeds maximum allowed length (${MAX_CODE_LENGTH} characters).` });
      }

      const actorKey = req.userId !== undefined ? `u:${req.userId}` : `ip:${req.ip || 'unknown'}`;
      inFlightKey = `${actorKey}:${problemId}`;
      if (inFlightKeys.has(inFlightKey)) {
        inFlightKey = null;
        return res.status(409).json({
          error: 'A submission for this problem is already running. Please wait for it to finish.',
          code: 'SUBMISSION_IN_PROGRESS',
        });
      }
      inFlightKeys.add(inFlightKey);

      const row = db
        .prepare('SELECT id, title, difficulty, signature, testCases FROM problems WHERE id = ?')
        .get(problemId) as any;
      if (!row) {
        return res.status(404).json({ error: 'Problem not found.' });
      }

      const problem = parseProblemRow(row);
      if (!problem) {
        logFailure(req, 'problem_parse_failed');
        return res.status(500).json({ error: 'Problem test data is unavailable.' });
      }

      // Load server-only hidden test cases (never returned by GET /api/problems/:id).
      const hiddenRows = db
        .prepare('SELECT input_json, expected_json FROM problem_hidden_tests WHERE problem_id = ? ORDER BY id ASC')
        .all(problemId) as Array<{ input_json: string; expected_json: string }>;
      if (hiddenRows.length > 0) {
        problem.hiddenTestCases = hiddenRows
          .map((h) => {
            try {
              return { input: JSON.parse(h.input_json), expected: JSON.parse(h.expected_json) };
            } catch {
              return null;
            }
          })
          .filter((x): x is { input: unknown[]; expected: unknown } => x !== null);
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
          executionStatus: 'provider_unavailable',
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
          executionStatus: mapExecutionStatus(verdict),
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

      // Atomically record server-calculated problem stats, submission history, and first-time solve XP.
      const acceptedDelta = verdict.status === 'Passed' ? 1 : 0;
      let updatedStats: { accepted: number; submissions: number } | undefined;
      let saved = false;
      let savedSubmission: any = null;
      let xpAwarded = 0;
      let totalXp: number | undefined;

      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare(`
          INSERT INTO problem_stats (problem_id, accepted, submissions)
          VALUES (?, ?, 1)
          ON CONFLICT(problem_id) DO UPDATE SET
            accepted = accepted + excluded.accepted,
            submissions = submissions + 1
        `).run(problemId, acceptedDelta);

        updatedStats = db
          .prepare('SELECT accepted, submissions FROM problem_stats WHERE problem_id = ?')
          .get(problemId) as { accepted: number; submissions: number } | undefined;

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

          if (verdict.status === 'Passed') {
            const xpOutcome = awardVerifiedXp(
              db,
              {
                userId: req.userId,
                eventType: 'problem_solved',
                eventKey: problemId,
                points: xpForCodingDifficulty(row.difficulty),
                activityLabel: `Solved problem: ${row.title || problemId}`,
                metadata: {
                  problemId,
                  difficulty: row.difficulty || 'Easy',
                  language,
                  passedCount: verdict.passedCount,
                  totalCount: verdict.totalCount,
                },
              },
              { inTransaction: true, enforceDailyCap: false }
            );
            xpAwarded = xpOutcome.pointsAwarded;
            totalXp = xpOutcome.totalXp;
          }
        }
        db.exec('COMMIT');
      } catch (txErr) {
        db.exec('ROLLBACK');
        throw txErr;
      }

      return res.status(200).json({
        status: verdict.status,
        executionStatus: mapExecutionStatus(verdict),
        passedCount: verdict.passedCount,
        totalCount: verdict.totalCount,
        visibleCount: verdict.visibleCount,
        hiddenCount: verdict.hiddenCount,
        executionTimeMs: verdict.executionTimeMs,
        message: verdict.message,
        stdout: verdict.stdout,
        errorType: verdict.errorType,
        verified: true,
        saved,
        stats: updatedStats ?? { accepted: acceptedDelta, submissions: 1 },
        ...(verdict.failedTestCase ? { failedTestCase: verdict.failedTestCase } : {}),
        ...(savedSubmission ? { submission: savedSubmission } : {}),
        ...(req.userId !== undefined ? { xpAwarded, ...(totalXp !== undefined ? { totalXp } : {}) } : {}),
      });
    } catch {
      logFailure(req, 'submission_failed');
      return res.status(500).json({ error: 'Unable to process submission right now.' });
    } finally {
      if (inFlightKey) inFlightKeys.delete(inFlightKey);
      cancellation.dispose();
    }
  });

  app.get('/api/problems/:problemId/submissions', useRequiredAuth, (req, res) => {
    try {
      const problemId = String(req.params.problemId);
      const requestedLimit = Number(req.query.limit);
      const limit = Number.isInteger(requestedLimit) && requestedLimit >= 1 && requestedLimit <= 50
        ? requestedLimit
        : 50;

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
          'SELECT * FROM user_submissions WHERE user_id = ? AND problem_id = ? ORDER BY created_at DESC, id DESC LIMIT ?'
        ).all(req.userId, problemId, limit);
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
