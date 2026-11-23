import type { Express, RequestHandler } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import defaultDb from './db';
import { requireAuth } from './auth';
import { logFailure, rateLimit } from './security';

export const DAILY_LEARNING_XP_CAP = 150;

export const CODING_DIFFICULTY_XP: Record<string, number> = {
  Easy: 25,
  Medium: 50,
  Hard: 100,
};

export const ALLOWED_LESSON_TOPICS = new Set([
  'array',
  'arrays',
  'linked-list',
  'stack',
  'queue',
  'binary-tree',
  'avl-tree',
  'graph',
  'hash-table',
  'heap',
  'sorting',
  'searching',
  'divide-conquer',
  'dynamic-programming',
  'greedy',
  'graph-algorithms',
  'complexity',
  'mixed',
]);

export type XpEventType =
  | 'problem_solved'
  | 'lesson_completed'
  | 'visualizer_completed'
  | 'video_completed'
  | 'quiz_completed';

export interface AwardXpInput {
  userId: number;
  eventType: XpEventType;
  eventKey: string;
  points: number;
  activityLabel: string;
  metadata?: Record<string, unknown>;
}

export interface AwardXpResult {
  awarded: boolean;
  duplicate: boolean;
  capped: boolean;
  pointsAwarded: number;
  totalXp: number;
  level: string;
}

export function getEpicLevel(xp: number): string {
  if (xp < 100) return 'Bronze V';
  if (xp < 250) return 'Bronze IV';
  if (xp < 500) return 'Bronze I';
  if (xp < 800) return 'Silver V';
  if (xp < 1200) return 'Silver I';
  if (xp < 1800) return 'Gold V';
  if (xp < 2500) return 'Gold I';
  if (xp < 3500) return 'Platinum V';
  if (xp < 4800) return 'Platinum I';
  if (xp < 6200) return 'Diamond V';
  if (xp < 7800) return 'Diamond I';
  if (xp < 9500) return 'Crown';
  if (xp < 12000) return 'Ace';
  return 'Conqueror';
}

export function xpForCodingDifficulty(difficulty: unknown): number {
  if (typeof difficulty !== 'string') return 25;
  return CODING_DIFFICULTY_XP[difficulty] ?? 25;
}

function getDailySelfReportedXp(db: DatabaseSync, userId: number): number {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(points), 0) as total
       FROM xp_ledger
       WHERE user_id = ?
         AND event_type IN ('lesson_completed', 'visualizer_completed', 'video_completed', 'quiz_completed')
         AND created_at >= datetime('now', '-1 day')`
    )
    .get(userId) as { total?: number } | undefined;
  return Number(row?.total || 0);
}

/**
 * Atomically awards server-authoritative XP deduplicated by (user_id, event_type, event_key).
 * Set inTransaction=true when called inside an outer BEGIN IMMEDIATE block.
 */
export function awardVerifiedXp(
  db: DatabaseSync,
  input: AwardXpInput,
  options: { inTransaction?: boolean; enforceDailyCap?: boolean } = {}
): AwardXpResult {
  const { userId, eventType, eventKey, activityLabel, metadata = {} } = input;
  const safePoints = Math.max(0, Math.min(200, Math.floor(input.points)));
  const ownTx = !options.inTransaction;

  if (ownTx) db.exec('BEGIN IMMEDIATE');
  try {
    const user = db.prepare('SELECT xp, level FROM users WHERE id = ?').get(userId) as
      | { xp: number; level: string }
      | undefined;
    if (!user) {
      if (ownTx) db.exec('ROLLBACK');
      throw new Error('User not found');
    }

    const existing = db
      .prepare('SELECT id FROM xp_ledger WHERE user_id = ? AND event_type = ? AND event_key = ?')
      .get(userId, eventType, eventKey);
    if (existing) {
      if (ownTx) db.exec('COMMIT');
      return {
        awarded: false,
        duplicate: true,
        capped: false,
        pointsAwarded: 0,
        totalXp: Number(user.xp || 0),
        level: getEpicLevel(Number(user.xp || 0)),
      };
    }

    let pointsToAward = safePoints;
    let capped = false;
    if (options.enforceDailyCap) {
      const usedToday = getDailySelfReportedXp(db, userId);
      const remaining = Math.max(0, DAILY_LEARNING_XP_CAP - usedToday);
      if (remaining <= 0) {
        if (ownTx) db.exec('COMMIT');
        return {
          awarded: false,
          duplicate: false,
          capped: true,
          pointsAwarded: 0,
          totalXp: Number(user.xp || 0),
          level: getEpicLevel(Number(user.xp || 0)),
        };
      }
      if (pointsToAward > remaining) {
        pointsToAward = remaining;
        capped = true;
      }
    }

    const insert = db
      .prepare(
        `INSERT OR IGNORE INTO xp_ledger (user_id, event_type, event_key, points, metadata_json)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(userId, eventType, eventKey, pointsToAward, JSON.stringify(metadata));

    if (insert.changes !== 1) {
      if (ownTx) db.exec('COMMIT');
      return {
        awarded: false,
        duplicate: true,
        capped: false,
        pointsAwarded: 0,
        totalXp: Number(user.xp || 0),
        level: getEpicLevel(Number(user.xp || 0)),
      };
    }

    const newXp = Number(user.xp || 0) + pointsToAward;
    const newLevel = getEpicLevel(newXp);
    db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newXp, newLevel, userId);
    db.prepare('INSERT INTO user_activity (user_id, activity_type, points) VALUES (?, ?, ?)').run(
      userId,
      activityLabel.slice(0, 120),
      pointsToAward
    );

    if (ownTx) db.exec('COMMIT');
    return {
      awarded: pointsToAward > 0,
      duplicate: false,
      capped,
      pointsAwarded: pointsToAward,
      totalXp: newXp,
      level: newLevel,
    };
  } catch (err) {
    if (ownTx) db.exec('ROLLBACK');
    throw err;
  }
}

export interface RegisterXpLedgerOptions {
  db?: DatabaseSync;
  authRequired?: RequestHandler;
  rateLimitMiddleware?: RequestHandler;
}

function validateLearningEventBody(body: Record<string, any>): Omit<AwardXpInput, 'userId'> | null {
  const type = body.type;
  if (type === 'lesson_completed') {
    const topicId = typeof body.topicId === 'string' ? body.topicId.trim().toLowerCase() : '';
    if (!ALLOWED_LESSON_TOPICS.has(topicId)) return null;
    return {
      eventType: 'lesson_completed',
      eventKey: topicId,
      points: 20,
      activityLabel: `Completed lesson: ${topicId}`,
      metadata: { topicId },
    };
  }

  if (type === 'visualizer_completed') {
    const moduleId = typeof body.moduleId === 'string' ? body.moduleId.trim().toLowerCase() : '';
    const completedSteps = Number(body.completedSteps);
    const operationsCount = Number(body.operationsCount);
    if (
      !/^[a-z0-9-]{2,64}$/.test(moduleId) ||
      !Number.isInteger(completedSteps) ||
      completedSteps < 3 ||
      !Number.isInteger(operationsCount) ||
      operationsCount < 1
    ) {
      return null;
    }
    return {
      eventType: 'visualizer_completed',
      eventKey: moduleId,
      points: 15,
      activityLabel: `Completed visualizer: ${moduleId}`,
      metadata: { moduleId, completedSteps, operationsCount },
    };
  }

  if (type === 'video_completed') {
    const videoId = typeof body.videoId === 'string' ? body.videoId.trim().toLowerCase() : '';
    if (!/^[a-z0-9_-]{2,64}$/.test(videoId)) return null;
    return {
      eventType: 'video_completed',
      eventKey: videoId,
      points: 15,
      activityLabel: `Completed video: ${videoId}`,
      metadata: { videoId },
    };
  }

  if (type === 'quiz_completed') {
    const attemptId = typeof body.attemptId === 'string' ? body.attemptId.trim() : '';
    const topicId = typeof body.topicId === 'string' ? body.topicId.trim().toLowerCase() : 'mixed';
    const total = Number(body.total);
    const correct = Number(body.correct);
    if (
      !/^[a-zA-Z0-9:_-]{4,80}$/.test(attemptId) ||
      !ALLOWED_LESSON_TOPICS.has(topicId) ||
      !Number.isInteger(total) ||
      total < 1 ||
      total > 50 ||
      !Number.isInteger(correct) ||
      correct < 0 ||
      correct > total
    ) {
      return null;
    }
    const accuracy = Math.round((correct / total) * 100);
    const perfectBonus = total >= 5 && correct === total ? 10 : 0;
    const points = Math.min(60, correct * 5 + perfectBonus);
    return {
      eventType: 'quiz_completed',
      eventKey: attemptId,
      points,
      activityLabel: `Completed quiz (${topicId}: ${accuracy}%)`,
      metadata: { attemptId, topicId, total, correct, accuracy },
    };
  }

  return null;
}

export function registerXpLedger(app: Express, options: RegisterXpLedgerOptions = {}) {
  const db = options.db ?? defaultDb;
  const auth = options.authRequired ?? requireAuth;
  const limiter = options.rateLimitMiddleware ?? rateLimit(30, 60000, 'learning_events', true);

  app.post('/api/learning/events', auth, limiter, (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : null;
      if (!body) {
        return res.status(400).json({ error: 'Invalid learning event payload.', code: 'INVALID_EVENT' });
      }
      const validated = validateLearningEventBody(body);
      if (!validated) {
        return res.status(400).json({ error: 'Invalid or unsupported learning event.', code: 'INVALID_EVENT' });
      }
      const outcome = awardVerifiedXp(
        db,
        { userId: req.userId, ...validated },
        { enforceDailyCap: true }
      );
      return res.json(outcome);
    } catch {
      logFailure(req, 'learning_event_failed');
      return res.status(500).json({ error: 'Unable to record learning event right now.' });
    }
  });

  app.get('/api/xp/ledger', auth, (req, res) => {
    try {
      const user = db.prepare('SELECT xp, level FROM users WHERE id = ?').get(req.userId) as
        | { xp: number; level: string }
        | undefined;
      if (!user) return res.status(404).json({ error: 'User not found.' });
      const events = db
        .prepare(
          `SELECT id, event_type, event_key, points, metadata_json, created_at
           FROM xp_ledger
           WHERE user_id = ?
           ORDER BY id DESC
           LIMIT 50`
        )
        .all(req.userId)
        .map((row: any) => ({
          id: row.id,
          eventType: row.event_type,
          eventKey: row.event_key,
          points: row.points,
          metadata: (() => {
            try {
              return JSON.parse(row.metadata_json || '{}');
            } catch {
              return {};
            }
          })(),
          createdAt: row.created_at,
        }));
      const dailyLearningXp = getDailySelfReportedXp(db, req.userId);
      return res.json({
        xp: Number(user.xp || 0),
        level: getEpicLevel(Number(user.xp || 0)),
        dailyLearningXp,
        dailyLearningCap: DAILY_LEARNING_XP_CAP,
        events,
      });
    } catch {
      logFailure(req, 'xp_ledger_read_failed');
      return res.status(500).json({ error: 'Unable to load XP ledger.' });
    }
  });
}
