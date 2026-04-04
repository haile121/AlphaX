import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/connection';
import { Lesson, User, UserProgress } from '../../db/types';

export async function getUserLevel(userId: string): Promise<string> {
  const rows = await query<Pick<User, 'level'>[]>(
    'SELECT level FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) throw { code: 'USER_NOT_FOUND', message: 'User not found' };
  if (!rows[0].level) throw { code: 'ASSESSMENT_NOT_COMPLETED', message: 'Assessment not completed' };
  return rows[0].level;
}

export async function getLessonsForUser(userId: string): Promise<(Omit<Lesson, 'content_en' | 'content_am'> & { completed: boolean })[]> {
  const level = await getUserLevel(userId);

  const rows = await query<(Lesson & { completed: number | null })[]>(
    `SELECT l.id, l.level_id, l.title_en, l.title_am, l.order_index, l.is_published, l.is_downloadable,
            l.created_at, l.updated_at,
            COALESCE(up.completed, 0) AS completed
     FROM lessons l
     JOIN levels lv ON lv.id = l.level_id
     LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = ?
     WHERE lv.name = ? AND l.is_published = true
     ORDER BY l.order_index ASC`,
    [userId, level]
  );

  return rows.map((r) => ({
    id: r.id,
    level_id: r.level_id,
    title_en: r.title_en,
    title_am: r.title_am,
    order_index: r.order_index,
    is_published: r.is_published,
    is_downloadable: r.is_downloadable,
    created_at: r.created_at,
    updated_at: r.updated_at,
    completed: Boolean(r.completed),
  }));
}

export async function checkPrerequisites(
  lessonId: string,
  userId: string
): Promise<{ met: boolean; missing: Lesson[] }> {
  const prereqs = await query<Lesson[]>(
    `SELECT l.* FROM lesson_prerequisites lp
     JOIN lessons l ON l.id = lp.prerequisite_id
     WHERE lp.lesson_id = ?`,
    [lessonId]
  );

  if (prereqs.length === 0) return { met: true, missing: [] };

  const prereqIds = prereqs.map((p) => p.id);
  const placeholders = prereqIds.map(() => '?').join(', ');

  const completed = await query<Pick<UserProgress, 'lesson_id'>[]>(
    `SELECT lesson_id FROM user_progress
     WHERE user_id = ? AND lesson_id IN (${placeholders}) AND completed = true`,
    [userId, ...prereqIds]
  );

  const completedSet = new Set(completed.map((c) => c.lesson_id));
  const missing = prereqs.filter((p) => !completedSet.has(p.id));

  return { met: missing.length === 0, missing };
}

export async function getLessonById(lessonId: string, userId: string): Promise<Lesson> {
  const rows = await query<Lesson[]>(
    'SELECT * FROM lessons WHERE id = ? AND is_published = true',
    [lessonId]
  );

  if (rows.length === 0) throw { code: 'LESSON_NOT_FOUND', message: 'Lesson not found' };

  const { met, missing } = await checkPrerequisites(lessonId, userId);
  if (!met) {
    throw { code: 'PREREQUISITES_NOT_MET', prerequisites: missing };
  }

  return rows[0];
}

export async function createLesson(data: {
  level_id: string;
  title_en: string;
  title_am: string;
  content_en: string;
  content_am: string;
  order_index: number;
  is_published: boolean;
  is_downloadable: boolean;
  prerequisite_ids: string[];
}): Promise<Lesson> {
  const id = uuidv4();
  const { prerequisite_ids, ...lessonData } = data;

  await query(
    `INSERT INTO lessons (id, level_id, title_en, title_am, content_en, content_am, order_index, is_published, is_downloadable)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, lessonData.level_id, lessonData.title_en, lessonData.title_am,
     lessonData.content_en, lessonData.content_am, lessonData.order_index,
     lessonData.is_published, lessonData.is_downloadable]
  );

  if (prerequisite_ids.length > 0) {
    for (const prereqId of prerequisite_ids) {
      await query(
        'INSERT INTO lesson_prerequisites (lesson_id, prerequisite_id) VALUES (?, ?)',
        [id, prereqId]
      );
    }
  }

  const rows = await query<Lesson[]>('SELECT * FROM lessons WHERE id = ?', [id]);
  return rows[0];
}

export async function updateLesson(
  lessonId: string,
  data: {
    level_id?: string;
    title_en?: string;
    title_am?: string;
    content_en?: string;
    content_am?: string;
    order_index?: number;
    is_published?: boolean;
    is_downloadable?: boolean;
    prerequisite_ids?: string[];
  }
): Promise<Lesson> {
  const existing = await query<Lesson[]>('SELECT * FROM lessons WHERE id = ?', [lessonId]);
  if (existing.length === 0) throw { code: 'LESSON_NOT_FOUND', message: 'Lesson not found' };

  const { prerequisite_ids, ...fields } = data;

  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      setClauses.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (setClauses.length > 0) {
    values.push(lessonId);
    await query(`UPDATE lessons SET ${setClauses.join(', ')} WHERE id = ?`, values);
  }

  if (prerequisite_ids !== undefined) {
    await query('DELETE FROM lesson_prerequisites WHERE lesson_id = ?', [lessonId]);
    for (const prereqId of prerequisite_ids) {
      await query(
        'INSERT INTO lesson_prerequisites (lesson_id, prerequisite_id) VALUES (?, ?)',
        [lessonId, prereqId]
      );
    }
  }

  const rows = await query<Lesson[]>('SELECT * FROM lessons WHERE id = ?', [lessonId]);
  return rows[0];
}

export async function deleteLesson(lessonId: string, force = false): Promise<void> {
  const existing = await query<Lesson[]>('SELECT * FROM lessons WHERE id = ?', [lessonId]);
  if (existing.length === 0) throw { code: 'LESSON_NOT_FOUND', message: 'Lesson not found' };

  // Check if this lesson is a prerequisite for another lesson
  const dependents = await query<{ lesson_id: string }[]>(
    'SELECT lesson_id FROM lesson_prerequisites WHERE prerequisite_id = ?',
    [lessonId]
  );

  if (dependents.length > 0 && !force) {
    throw { code: 'IS_PREREQUISITE', dependents: dependents.map((d) => d.lesson_id) };
  }

  if (force) {
    await query('DELETE FROM lesson_prerequisites WHERE prerequisite_id = ?', [lessonId]);
  }

  await query('DELETE FROM lessons WHERE id = ?', [lessonId]);
}
