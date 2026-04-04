export type Language = 'am' | 'en';

export type Level = 'beginner' | 'intermediate' | 'advanced';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  level: Level | null;
  assessment_completed: boolean;
  /** Learning path chosen before the first placement test (required for onboarding). */
  primary_track?: 'cpp' | 'web' | null;
  cpp_level?: Level | null;
  web_level?: Level | null;
  cpp_assessment_completed?: boolean;
  web_assessment_completed?: boolean;
  language_pref: Language;
  theme_pref: 'light' | 'dark';
  xp: number;
  coins: number;
  streak: number;
}

export type DialogVariant = 'error' | 'info' | 'warning' | 'success' | 'confirm' | 'auth-required';

export interface DialogConfig {
  variant: DialogVariant;
  title: string;
  message: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
