// ============================================================
// User, Auth & Progress Types
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
  createdAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  voiceEnabled: boolean;
  animationSpeed: number;
  notifications: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// ---- Progress Tracking ----

export type TopicStatus = 'not-started' | 'in-progress' | 'completed';

export interface TopicProgress {
  topicId: string;
  topicName: string;
  status: TopicStatus;
  completionPercent: number;
  timeSpentMinutes: number;
  quizScore: number | null;
  lastAccessed: string;
}

export interface VideoLessonProgress {
  position:number;
  duration:number;
  speed:number;
  watchedSeconds:number[];
  completed:boolean;
  notes:{id:string;time:number;text:string;createdAt:string}[];
}

export interface LearningProgress {
  videoLessons?:Record<string,VideoLessonProgress>;
  userId: string;
  topics: TopicProgress[];
  totalTimeSpentMinutes: number;
  overallScore: number;
  streak: number;
  badges: Badge[];
  weakAreas: string[];
  recommendedTopics: string[];
  totalXp?: number;
  weeklyActivity?: WeeklyActivity[];
  quizHistory?: import('../features/quiz/quizModel').QuizCompletion[];
  completedQuizIds?: string[];
  quizTotals?: { completed: number; correct: number; questions: number; bestStreak: number; lastDay: string };
  dailyActivity?: Record<string, { minutes: number; sessions: number; completion: number }>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface DashboardStats {
  coursesCompleted: number;
  totalCourses: number;
  totalXp: number;
  level: number;
  levelName: string;
  nextLevelXp: number;
  totalTimeSpent: number;
  currentStreak: number;
  weeklyActivity: WeeklyActivity[];
}

export interface WeeklyActivity {
  day: string;
  minutes: number;
}
