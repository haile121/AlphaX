/** XP / coins for the first completion of each static curriculum lesson (not on duplicate saves). */
export const COURSE_READING_XP_REWARD = 12;
export const COURSE_READING_COIN_REWARD = 4;

/**
 * Allowed lesson ids for course reading progress — keep in sync with
 * frontend/lib/courseCurriculum.ts (ALL_LESSON_IDS).
 */
export const COURSE_READING_LESSON_IDS: readonly string[] = [
  'ch1-p1',
  'ch1-p2',
  'ch1-p3',
  'ch1-p4',
  'ch2-p1',
  'ch2-p2',
  'ch2-p3',
  'ch2-p4',
  'ch3-p1',
  'ch3-p2',
  'ch3-p3',
  'ch3-p4',
  'ch4-p1',
  'ch4-p2',
  'ch4-p3',
  'ch4-p4',
  'ch4-p5',
  'ch4-p6',
  'web-p1',
  'web-p2',
  'web-p3',
  'web-p4',
  'web-p5',
  'web-p6',
];

const ALLOWED = new Set(COURSE_READING_LESSON_IDS);
const ORDER = new Map(COURSE_READING_LESSON_IDS.map((id, i) => [id, i]));

/** Renamed from ch5-p* — migrate stored rows to web-p*. */
const LEGACY_LESSON_ID_MAP: Record<string, string> = {
  'ch5-p1': 'web-p1',
  'ch5-p2': 'web-p2',
  'ch5-p3': 'web-p3',
};

export function normalizeLessonId(id: string): string {
  return LEGACY_LESSON_ID_MAP[id] ?? id;
}

export function isAllowedLessonId(id: string): boolean {
  return ALLOWED.has(normalizeLessonId(id));
}

export function sortLessonIds(ids: string[]): string[] {
  const normalized = ids.map(normalizeLessonId);
  return [...new Set(normalized.filter((id) => ALLOWED.has(id)))].sort(
    (a, b) => (ORDER.get(a) ?? 0) - (ORDER.get(b) ?? 0)
  );
}
