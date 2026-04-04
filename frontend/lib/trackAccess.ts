import type { User } from '@/types';

/** Web track lesson ids use the `web-p*` prefix (see courseCurriculum). */
export function isWebLessonId(lessonId: string): boolean {
  return lessonId.startsWith('web-');
}

/** Signed-out users may browse; signed-in users need the placement done per track. */
export function canAccessLessonTrack(user: User | null, lessonId: string): boolean {
  if (!user) return true;
  if (isWebLessonId(lessonId)) return Boolean(user.web_assessment_completed);
  // Legacy rows (before multi-track migration): assessment_completed implies C++ access
  if (user.cpp_assessment_completed === undefined && user.assessment_completed) return true;
  return Boolean(user.cpp_assessment_completed);
}
