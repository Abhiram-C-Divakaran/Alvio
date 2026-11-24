// ============================================================
// Shared Frontend/Backend API Contracts
// ============================================================
import type { LearningProgress, UserSettings } from './user';

export interface ApiErrorResponse {
  error: string;
  code?: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  xp: number;
  level: string;
  avatar?: string;
  createdAt: string;
  settings: UserSettings;
}

export interface AuthSessionResponse {
  user: PublicUser;
  token: string;
}

export interface ProgressResponse {
  progress: LearningProgress | null;
  revision: number;
}

export interface ProgressConflictResponse extends ApiErrorResponse {
  progress: LearningProgress | null;
  revision: number;
}

export type SubmissionVerdictStatus = 'Passed' | 'Failed' | 'Error';

export type SubmissionErrorType = 'compilation' | 'runtime' | 'timeout' | 'provider' | 'unsupported' | null;

export type SubmissionExecutionStatus =
  | 'accepted'
  | 'wrong_answer'
  | 'compilation_error'
  | 'runtime_error'
  | 'time_limit_exceeded'
  | 'provider_unavailable'
  | 'unsupported';

export interface FailedTestCaseDetail {
  index: number;
  hidden?: boolean;
  input?: unknown;
  expected?: unknown;
  actual?: unknown;
}

export interface SubmissionRecord {
  id: number;
  user_id: number;
  problem_id: string;
  status: SubmissionVerdictStatus;
  language: string;
  code: string;
  runtime_ms: number | null;
  memory_mb: number | null;
  passed_testcases: number | null;
  total_testcases: number | null;
  verified: number;
  created_at: string;
  user_name?: string;
}

export interface ProblemStatsSummary {
  accepted: number;
  submissions: number;
}

export interface SubmissionVerdictResponse {
  status: SubmissionVerdictStatus;
  executionStatus?: SubmissionExecutionStatus;
  passedCount: number;
  totalCount: number;
  visibleCount?: number;
  hiddenCount?: number;
  executionTimeMs: number;
  message: string;
  error?: string;
  stdout: string[];
  errorType: SubmissionErrorType;
  verified: boolean;
  saved: boolean;
  stats?: ProblemStatsSummary;
  failedTestCase?: FailedTestCaseDetail;
  submission?: SubmissionRecord;
  xpAwarded?: number;
  totalXp?: number;
}

export interface SubmissionHistoryResponse {
  submission: SubmissionRecord | null;
  submissions: SubmissionRecord[];
}

export interface ChatStreamEvent {
  delta?: string;
  done?: boolean;
  text?: string;
  error?: string;
  code?: string;
}

export interface XpAwardResponse {
  awarded: boolean;
  duplicate: boolean;
  capped: boolean;
  pointsAwarded: number;
  totalXp: number;
  level: string;
}

export interface XpLedgerEntry {
  id: number;
  eventType: string;
  eventKey: string;
  points: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface XpLedgerResponse {
  xp: number;
  level: string;
  dailyLearningXp: number;
  dailyLearningCap: number;
  events: XpLedgerEntry[];
}

export interface ProfileUser extends PublicUser {
  location?: string | null;
  university?: string | null;
  github?: string | null;
  linkedin?: string | null;
  avatar_url?: string | null;
}

export interface ProfileActivityRow {
  id: number;
  user_id: number;
  activity_type: string;
  points: number;
  created_at: string;
}

export interface CourseProgressRow {
  id: number;
  user_id: number;
  course_name: string;
  progress: number;
  updated_at: string;
}

export interface SolvedProblemSummary {
  id: string;
  title: string;
  difficulty: string;
  solved_at: string;
}

export interface PracticeActivityBucket {
  recordedAt: string;
  attempts: number;
}

export interface ProfileResponse {
  user: ProfileUser;
  activity: ProfileActivityRow[];
  courses: CourseProgressRow[];
  solvedProblems: SolvedProblemSummary[];
  attemptedProblems: Array<{ id: string }>;
  practiceActivity: PracticeActivityBucket[];
}

export interface DashboardApiResponse {
  user: { id: number; name: string; xp: number; level: string };
  stats: {
    topicsCompleted: number;
    totalTopics: number;
    timeSpentMins: number;
    dayStreak: number;
    daysActive: number;
    onlineUsers: number | null;
  };
  activity: ProfileActivityRow[];
  allDates: string[];
}
