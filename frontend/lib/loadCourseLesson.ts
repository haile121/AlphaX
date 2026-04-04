import 'server-only';
import fs from 'fs';
import path from 'path';
import { getCourseLesson, type CourseLessonMeta } from '@/lib/courseCurriculum';

export function loadCourseLessonBody(meta: CourseLessonMeta): string {
  const filePath = path.join(process.cwd(), 'content', meta.contentDir, `part${meta.part}.txt`);
  return fs.readFileSync(filePath, 'utf8');
}

export function loadCourseLessonById(lessonId: string): { meta: CourseLessonMeta; body: string } | null {
  const meta = getCourseLesson(lessonId);
  if (!meta) return null;
  return { meta, body: loadCourseLessonBody(meta) };
}
