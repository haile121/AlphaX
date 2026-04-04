import {
  STORAGE_KEY_LEGACY_CH1,
  STORAGE_KEY_PROGRESS,
  normalizeLegacyLessonId,
} from '@/lib/courseCurriculum';

function dedupeNormalized(ids: string[]): string[] {
  return [...new Set(ids.map(normalizeLegacyLessonId))];
}

export function readCompletedLessonIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      const arr = Array.isArray(parsed) ? (parsed as string[]) : [];
      return dedupeNormalized(arr);
    }
    const legacy = localStorage.getItem(STORAGE_KEY_LEGACY_CH1);
    if (legacy) {
      const parsed = JSON.parse(legacy) as unknown;
      const arr = Array.isArray(parsed) ? (parsed as string[]) : [];
      const normalized = dedupeNormalized(arr);
      if (normalized.length) {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(normalized));
      }
      return normalized;
    }
    return [];
  } catch {
    return [];
  }
}

export function writeCompletedLessonIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(ids));
}

/** Call on sign-out so the next user on a shared device does not see the previous account’s cached list. */
export function clearCourseReadingLocalCache() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
    localStorage.removeItem(STORAGE_KEY_LEGACY_CH1);
  } catch {
    /* ignore */
  }
}
