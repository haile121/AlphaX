export interface User {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  role: 'student' | 'admin';
  level: string;
  assessment_completed: boolean;
  /** First chosen learning path before the placement test. */
  primary_track: 'cpp' | 'web' | null;
  cpp_level: string | null;
  web_level: string | null;
  cpp_assessment_completed: boolean;
  web_assessment_completed: boolean;
  language_pref?: string;
  theme_pref?: string;
  xp: number;
  coins: number;
  streak: number;
  last_active_date?: string | Date;
  is_active?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface Lesson {
  id: string;
  level_id: string;
  title_en: string;
  title_am: string;
  content_en: string;
  content_am: string;
  order_index: number;
  is_published: boolean;
  is_downloadable: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface UserProgress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
}

export interface AssessmentQuestion {
  id: string;
  question_en: string;
  question_am: string;
  options_json: string | string[];
  /** Same length as options_json; Amharic labels for display when lang=am. */
  options_am_json?: string | string[] | null;
  correct_answer: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** Placement bank: cpp (default) or web fundamentals. */
  track?: 'cpp' | 'web';
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title_en: string;
  title_am?: string;
  xp_reward: number;
  coin_reward: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_en: string;
  question_am: string;
  type?: string;
  options_json?: string;
  correct_answer: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  answers_json?: string;
}

export interface Exam {
  id: string;
  level_id: string;
  title_en?: string;
  xp_reward: number;
  coin_reward: number;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  passed: boolean;
}

export interface Badge {
  id: string;
  name_en?: string;
  description_en?: string;
  criteria_type?: 'xp' | 'streak' | string;
  criteria_value?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type?: string;
  title?: string;
  message?: string;
  is_read?: boolean;
  created_at?: string | Date;
}

export interface Certificate {
  id: string;
  user_id: string;
  level_id: string;
  verification_code: string;
  pdf_url: string;
  issued_at?: string | Date;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
}
