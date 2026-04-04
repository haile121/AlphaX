import axios from 'axios';
import type { User } from '@/types';

export interface AssessmentQuestion {
  id: string;
  question_en: string;
  question_am: string;
  options_json: string[];
  /** Amharic choices; same order as options_json; scoring uses English options_json. */
  options_am_json?: string[];
  track?: 'cpp' | 'web';
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string;
}

export interface AssessmentResult {
  score: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  message: string;
  breakdown?: { beginner: number; intermediate: number; advanced: number };
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  withCredentials: true,
});

// On 401, redirect to sign-in (client-side only)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register(email: string, displayName: string, password: string) {
    return api.post<{ user: User }>('/api/auth/register', { email, display_name: displayName, password });
  },
  login(email: string, password: string) {
    return api.post<{ user: User }>('/api/auth/login', { email, password });
  },
  logout() {
    return api.post('/api/auth/logout');
  },
  me() {
    return api.get<{ user: User }>('/api/auth/me');
  },
  /** Call once after sign-up, before the first placement test. */
  setPrimaryTrack(primary_track: 'cpp' | 'web') {
    return api.patch<{ user: User }>('/api/auth/primary-track', { primary_track });
  },
};

export type AssessmentTrack = 'cpp' | 'web';

export const assessmentApi = {
  getQuestions(track: AssessmentTrack = 'cpp') {
    return api.get<{ questions: AssessmentQuestion[]; track: AssessmentTrack }>(
      '/api/assessment/questions',
      { params: { track } }
    );
  },
  submit(track: AssessmentTrack, answers: AssessmentAnswer[]) {
    return api.post<AssessmentResult & { track?: AssessmentTrack }>('/api/assessment/submit', {
      track,
      answers,
    });
  },
};

export interface LessonSummary {
  id: string;
  level_id: string;
  title_en: string;
  title_am: string;
  order_index: number;
  is_published: boolean;
  is_downloadable: boolean;
  created_at: string;
  updated_at: string;
  completed: boolean;
}

export interface LessonDetail extends LessonSummary {
  content_en: string;
  content_am: string;
}

export type CompilerLanguage = 'cpp' | 'html' | 'css' | 'javascript';

export interface CompilerResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  previewHtml?: string | null;
  language?: CompilerLanguage;
}

export interface AiTutorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QuizQuestion {
  id: string;
  question_en: string;
  question_am: string;
  type: 'multiple_choice' | 'short_answer';
  options_json: string[] | null;
}

export interface QuizData {
  quiz: { id: string; title_en: string; title_am: string; xp_reward: number; coin_reward: number };
  questions: QuizQuestion[];
}

export interface SubmitResult {
  score: number;
  passed: boolean;
  xpAwarded: number;
  coinsAwarded: number;
}

export const quizzesApi = {
  get(id: string) {
    return api.get<QuizData>(`/api/quizzes/${id}`);
  },
  submit(id: string, answers: Record<string, string>) {
    return api.post<SubmitResult>(`/api/quizzes/${id}/submit`, { answers });
  },
};

export interface CourseTrackQuizData {
  quiz: {
    id: string;
    track: 'cpp' | 'web';
    chapter_slug: string;
    is_final: boolean;
    title_en: string;
    title_am: string;
    xp_reward: number;
    coin_reward: number;
  };
  questions: QuizQuestion[];
}

export interface TrackCertificateSummary {
  eligible: boolean;
  readingProgressPct: number;
  finalBestScore: number | null;
  /** Submissions recorded for this track’s module final (web-final / cpp-final). */
  finalExamAttemptsCount: number;
  reasons: string[];
  certificateIssued: boolean;
  certificatePdfUrl: string | null;
}

export const courseTrackQuizzesApi = {
  get(id: string) {
    return api.get<CourseTrackQuizData>(`/api/course-track-quizzes/${id}`);
  },
  submit(id: string, answers: Record<string, string>) {
    return api.post<SubmitResult>(`/api/course-track-quizzes/${id}/submit`, { answers });
  },
  trackSummary(track: 'cpp' | 'web') {
    return api.get<TrackCertificateSummary>(`/api/course-track-quizzes/track/${track}/summary`, {
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
  },
};

/** Backend serves PDFs and static files under the API origin (e.g. /certificates/...). */
export function backendPublicUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export const examsApi = {
  get(id: string) {
    return api.get<{ exam: { id: string; title_en: string; title_am: string; time_limit_minutes: number } }>(`/api/exams/${id}`);
  },
  submit(id: string, answers: Record<string, string>) {
    return api.post<SubmitResult>(`/api/exams/${id}/submit`, { answers });
  },
};

export const aiTutorApi = {
  ask(question: string, language: 'am' | 'en') {
    return api.post<{ response: string }>('/api/ai-tutor/ask', { question, language });
  },
  history() {
    return api.get<{ history: { id: string; question: string; response: string; language: string; created_at: string }[] }>('/api/ai-tutor/history');
  },
};

export const compilerApi = {
  run(source_code: string, language: CompilerLanguage = 'cpp') {
    return api.post<CompilerResult>('/api/compiler/run', { source_code, language });
  },
};

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  xp: number;
  level: string | null;
  streak: number;
}

export const leaderboardApi = {
  global() {
    return api.get<{ leaderboard: LeaderboardEntry[]; myRank: LeaderboardEntry | null }>('/api/leaderboard/global');
  },
  level() {
    return api.get<{ leaderboard: LeaderboardEntry[]; myRank: LeaderboardEntry | null }>('/api/leaderboard/level');
  },
  friends() {
    return api.get<{ leaderboard: LeaderboardEntry[]; myRank: LeaderboardEntry | null }>('/api/leaderboard/friends');
  },
};

export interface LevelProgress {
  level_id: string;
  level_name: string;
  label_en: string;
  completion_pct: number;
  lessons: { total: number; completed: number };
  quizzes: { total: number; passed: number };
  exams: { total: number; passed: number };
}

export interface ProgressData {
  xp: number;
  coins: number;
  streak: number;
  level: string | null;
  badge_count: number;
  levels: LevelProgress[];
}

export interface NotificationItem {
  id: string;
  type: string;
  title_en: string;
  title_am: string;
  body_en: string;
  body_am: string;
  is_read: boolean;
  created_at: string;
}

export const certificatesApi = {
  list() {
    return api.get<{
      certificates: { id: string; level_id: string; verification_code: string; pdf_url: string; issued_at: string }[];
      trackCertificates: {
        id: string;
        track: string;
        verification_code: string;
        pdf_url: string;
        issued_at: string;
      }[];
    }>('/api/certificates');
  },
  generate(levelId: string) {
    return api.post<{ certificate: { id: string; pdf_url: string; verification_code: string } }>(`/api/certificates/${levelId}/generate`);
  },
  generateTrack(track: 'cpp' | 'web') {
    return api.post<{ certificate: { id: string; pdf_url: string; verification_code: string; track: string } }>(
      `/api/certificates/track/${track}/generate`
    );
  },
  verify(code: string) {
    return api.get<{ certificate: { issued_at: string }; display_name: string; level_label: string }>(`/api/certificates/verify/${code}`);
  },
};

/** Response from POST /api/course-readings/progress/complete */
export interface CourseReadingCompleteResult {
  completed_lesson_ids: string[];
  xp_awarded: number;
  coins_awarded: number;
}

export const courseReadingsApi = {
  getProgress() {
    return api.get<{ completed_lesson_ids: string[] }>('/api/course-readings/progress');
  },
  putProgress(completed_lesson_ids: string[]) {
    return api.put<{ completed_lesson_ids: string[] }>('/api/course-readings/progress', {
      completed_lesson_ids,
    });
  },
  postComplete(lesson_id: string) {
    return api.post<CourseReadingCompleteResult>('/api/course-readings/progress/complete', {
      lesson_id,
    });
  },
};

export const progressApi = {
  get() {
    return api.get<ProgressData>('/api/progress');
  },
  notifications() {
    return api.get<{ notifications: NotificationItem[] }>('/api/progress/notifications');
  },
  markRead(id: string) {
    return api.patch(`/api/progress/notifications/${id}/read`);
  },
  markAllRead() {
    return api.patch('/api/progress/notifications/read-all');
  },
};

export const gamificationApi = {
  profile() {
    return api.get<{ profile: { xp: number; coins: number; streak: number; level: string | null } }>('/api/gamification/profile');
  },
  badges() {
    return api.get<{ badges: { id: string; name_en: string; name_am: string; icon_url: string; earned_at: string }[] }>('/api/gamification/badges');
  },
};

export const lessonsApi = {
  list() {
    return api.get<{ lessons: LessonSummary[] }>('/api/lessons');
  },
  get(id: string) {
    return api.get<{ lesson: LessonDetail }>(`/api/lessons/${id}`);
  },
  download(id: string) {
    return api.get(`/api/lessons/${id}/download`, { responseType: 'blob' });
  },
};

export default api;
