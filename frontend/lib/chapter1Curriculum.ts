/**
 * Re-exports course curriculum (Chapter 1 + Chapter 2 + …).
 * Prefer importing from `@/lib/courseCurriculum`.
 */
export {
  CHAPTER_1,
  CHAPTER_2,
  CHAPTER_3,
  CHAPTER_4,
  CPP_CHAPTERS,
  WEB_HTML,
  WEB_CSS,
  WEB_JS,
  WEB_CHAPTERS,
  CHAPTERS,
  ALL_LESSONS,
  ALL_LESSON_IDS,
  COURSE_CHAPTER_QUIZ_IDS,
  COURSE_TRACK_FINAL_QUIZ_IDS,
  STORAGE_KEY_PROGRESS,
  STORAGE_KEY_LEGACY_CH1,
  getCourseLesson,
  getCourseLessonIndex,
  getChapterForLesson,
  getChapter1Lesson,
  getChapter1LessonIndex,
  type CourseLessonMeta,
  type ChapterInfo,
  type ContentDir,
  type Chapter1LessonMeta,
} from './courseCurriculum';

/** @deprecated use ALL_LESSON_IDS from courseCurriculum */
export { ALL_LESSON_IDS as CHAPTER1_LESSON_IDS } from './courseCurriculum';

/** @deprecated use STORAGE_KEY_PROGRESS */
export { STORAGE_KEY_PROGRESS as STORAGE_KEY_CH1 } from './courseCurriculum';
