import type { PoolConnection } from 'mysql2/promise';
import { query, withTransaction } from '../../db/connection';
import {
  sortLessonIds,
  isAllowedLessonId,
  normalizeLessonId,
} from './course-readings.constants';

export async function getCourseReadingProgress(userId: string): Promise<string[]> {
  const rows = await query<{ lesson_id: string }[]>(
    'SELECT lesson_id FROM course_reading_progress WHERE user_id = ?',
    [userId]
  );
  const rawIds = rows.map((r) => r.lesson_id);
  const migrated = sortLessonIds(rawIds);
  const needsMigrate = rawIds.some((id) => normalizeLessonId(id) !== id);
  if (needsMigrate) {
    await replaceCourseReadingProgress(userId, migrated);
  }
  return migrated;
}

export async function replaceCourseReadingProgress(userId: string, ids: string[]): Promise<string[]> {
  const valid = sortLessonIds(ids);
  await withTransaction(async (conn: PoolConnection) => {
    await conn.query('DELETE FROM course_reading_progress WHERE user_id = ?', [userId]);
    if (valid.length === 0) return;
    const placeholders = valid.map(() => '(?, ?)').join(', ');
    const params: unknown[] = [];
    for (const lessonId of valid) {
      params.push(userId, lessonId);
    }
    await conn.query(
      `INSERT INTO course_reading_progress (user_id, lesson_id) VALUES ${placeholders}`,
      params
    );
  });
  return valid;
}

export async function addCourseReadingComplete(userId: string, lessonId: string): Promise<{ wasNew: boolean }> {
  const normalized = normalizeLessonId(lessonId);
  if (!isAllowedLessonId(normalized)) {
    const err = new Error('INVALID_LESSON_ID') as Error & { code?: string };
    err.code = 'INVALID_LESSON_ID';
    throw err;
  }

  const before = await query<{ c: number }[]>(
    'SELECT COUNT(*) AS c FROM course_reading_progress WHERE user_id = ? AND lesson_id = ?',
    [userId, normalized]
  );
  const wasNew = (before[0]?.c ?? 0) === 0;

  await query(
    `INSERT INTO course_reading_progress (user_id, lesson_id) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE lesson_id = VALUES(lesson_id)`,
    [userId, normalized]
  );

  return { wasNew };
}
