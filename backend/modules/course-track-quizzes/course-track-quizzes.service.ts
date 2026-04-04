import { randomUUID } from 'crypto';
import { query } from '../../db/connection';
import {
  isMissingTableError,
  isMissingCourseTrackQuizTableError,
  isMissingMigration005TableError,
  warnMissingMigrationOnce,
} from '../../db/mysqlErrors';
import { awardCoins, awardXP } from '../gamification/gamification.service';
import {
  CPP_LESSON_IDS,
  WEB_LESSON_IDS,
  CPP_CHAPTER_TO_LESSONS,
  WEB_CHAPTER_TO_LESSONS,
  LESSON_PROGRESS_MIN_FOR_CERT,
  FINAL_SCORE_MIN_FOR_CERT,
  TRACK_FINAL_QUIZ_ID,
} from './courseReadingLessonIds';

export type CourseTrack = 'cpp' | 'web';

export interface CourseTrackQuizRow {
  id: string;
  track: CourseTrack;
  chapter_slug: string;
  title_en: string;
  title_am: string | null;
  xp_reward: number;
  coin_reward: number;
  is_final: number;
  pass_threshold: number;
  cert_min_score: number | null;
}

function parseOptions(json: unknown): string[] {
  if (Array.isArray(json)) return json.map(String);
  if (typeof json === 'string') {
    try {
      const p = JSON.parse(json) as unknown;
      return Array.isArray(p) ? p.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function getCompletedReadingLessonIds(userId: string): Promise<Set<string>> {
  const rows = await query<{ lesson_id: string }[]>(
    'SELECT lesson_id FROM course_reading_progress WHERE user_id = ?',
    [userId]
  );
  return new Set(rows.map((r) => r.lesson_id));
}

export function readingProgressFraction(track: CourseTrack, completed: Set<string>): number {
  const ids = track === 'cpp' ? CPP_LESSON_IDS : WEB_LESSON_IDS;
  const done = ids.filter((id) => completed.has(id)).length;
  return ids.length ? done / ids.length : 0;
}

export function chapterLessonsComplete(
  track: CourseTrack,
  chapterSlug: string,
  completed: Set<string>
): boolean {
  const map = track === 'cpp' ? CPP_CHAPTER_TO_LESSONS : WEB_CHAPTER_TO_LESSONS;
  const lessons = map[chapterSlug];
  if (!lessons) return false;
  return lessons.every((lid) => completed.has(lid));
}

export function trackLessonsComplete(track: CourseTrack, completed: Set<string>): boolean {
  const ids = track === 'cpp' ? CPP_LESSON_IDS : WEB_LESSON_IDS;
  return ids.every((id) => completed.has(id));
}

async function assertQuizAccess(quiz: CourseTrackQuizRow, userId: string): Promise<void> {
  if (Number(quiz.is_final) === 1) {
    // Module finals: always allow load + submit so every attempt is stored for MAX(score).
    // Certificate eligibility still requires reading progress + final % (getTrackCertificateEligibility).
    return;
  }
  const completed = await getCompletedReadingLessonIds(userId);
  if (!chapterLessonsComplete(quiz.track, quiz.chapter_slug, completed)) {
    throw {
      code: 'CHAPTER_NOT_COMPLETE',
      message: 'Complete all reading sessions in this chapter first.',
    };
  }
}

export async function getCourseTrackQuiz(quizId: string, userId: string) {
  try {
    const quizRows = await query<CourseTrackQuizRow[]>(
      'SELECT * FROM course_track_quizzes WHERE id = ?',
      [quizId]
    );
    if (quizRows.length === 0) throw { code: 'QUIZ_NOT_FOUND', message: 'Quiz not found' };
    const quiz = quizRows[0];

    await assertQuizAccess(quiz, userId);

    const questions = await query<
      { id: string; sort_order: number; question_en: string; question_am: string; options_json: unknown }[]
    >(
      `SELECT id, sort_order, question_en, question_am, options_json
       FROM course_track_quiz_questions WHERE quiz_id = ? ORDER BY sort_order ASC, id ASC`,
      [quizId]
    );

    return {
      quiz: {
        id: quiz.id,
        track: quiz.track,
        chapter_slug: quiz.chapter_slug,
        is_final: Boolean(quiz.is_final),
        title_en: quiz.title_en,
        title_am: quiz.title_am ?? quiz.title_en,
        xp_reward: quiz.xp_reward,
        coin_reward: quiz.coin_reward,
      },
      questions: questions.map((q) => ({
        id: q.id,
        question_en: q.question_en,
        question_am: q.question_am,
        type: 'multiple_choice' as const,
        options_json: parseOptions(q.options_json),
      })),
    };
  } catch (err: unknown) {
    if (isMissingCourseTrackQuizTableError(err)) {
      throw {
        code: 'COURSE_QUIZZES_UNAVAILABLE',
        message: 'Course quiz tables are not set up. From backend/: npm run migrate:005 && npm run seed:course-track-quizzes',
      };
    }
    if (isMissingTableError(err)) {
      const msg = String(
        (err as { sqlMessage?: string; message?: string }).sqlMessage ??
          (err as { message?: string }).message ??
          'Database error'
      );
      console.error('[getCourseTrackQuiz] unrelated missing table or DB error:', err);
      throw { code: 'DB_SCHEMA_ERROR', message: msg };
    }
    throw err;
  }
}

export async function submitCourseTrackQuiz(
  quizId: string,
  userId: string,
  answers: Record<string, string>
): Promise<{ score: number; passed: boolean; xpAwarded: number; coinsAwarded: number }> {
  try {
    const quizRows = await query<CourseTrackQuizRow[]>(
      'SELECT * FROM course_track_quizzes WHERE id = ?',
      [quizId]
    );
    if (quizRows.length === 0) throw { code: 'QUIZ_NOT_FOUND', message: 'Quiz not found' };
    const quiz = quizRows[0];

    await assertQuizAccess(quiz, userId);

    const questions = await query<{ id: string; correct_answer: string }[]>(
      'SELECT id, correct_answer FROM course_track_quiz_questions WHERE quiz_id = ?',
      [quizId]
    );
    if (questions.length === 0) throw { code: 'NO_QUESTIONS', message: 'Quiz has no questions' };

    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correct_answer) correct++;
    }

    const score = Math.round((correct / questions.length) * 100 * 100) / 100;
    const passed = score >= quiz.pass_threshold;

    await query(
      `INSERT INTO course_track_quiz_attempts (id, user_id, quiz_id, score, passed, answers_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [randomUUID(), userId, quizId, score, passed ? 1 : 0, JSON.stringify(answers)]
    );

    let xpAwarded = 0;
    let coinsAwarded = 0;

    if (passed) {
      const passRows = await query<{ c: number }[]>(
        `SELECT COUNT(*) AS c FROM course_track_quiz_attempts
         WHERE user_id = ? AND quiz_id = ? AND passed = 1`,
        [userId, quizId]
      );
      const firstPass = (passRows[0]?.c ?? 0) === 1;

      if (firstPass) {
        try {
          await awardXP(userId, quiz.xp_reward);
          await awardCoins(userId, quiz.coin_reward);
          xpAwarded = quiz.xp_reward;
          coinsAwarded = quiz.coin_reward;
        } catch (e) {
          console.error('[submitCourseTrackQuiz] XP/coins/badges after pass — attempt still saved:', e);
        }
      }
    }

    return { score, passed, xpAwarded, coinsAwarded };
  } catch (err: unknown) {
    if (isMissingCourseTrackQuizTableError(err)) {
      throw {
        code: 'COURSE_QUIZZES_UNAVAILABLE',
        message: 'Course quiz tables are not set up. From backend/: npm run migrate:005 && npm run seed:course-track-quizzes',
      };
    }
    if (isMissingTableError(err)) {
      const msg = String(
        (err as { sqlMessage?: string; message?: string }).sqlMessage ??
          (err as { message?: string }).message ??
          'Database error'
      );
      console.error('[submitCourseTrackQuiz] unrelated missing table or DB error:', err);
      throw { code: 'DB_SCHEMA_ERROR', message: msg };
    }
    throw err;
  }
}

function parseFinalScore(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'bigint') return Number(raw);
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(raw)) {
    const n = Number(raw.toString('utf8').trim());
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(String(raw).trim());
  return Number.isFinite(n) ? n : null;
}

/** Best score on the track’s module final — keyed by quiz id (seed: web-final / cpp-final). */
export async function getBestFinalScore(userId: string, track: CourseTrack): Promise<number | null> {
  const quizId = TRACK_FINAL_QUIZ_ID[track];
  try {
    const rows = await query<{ best: unknown }[]>(
      `SELECT score AS best
       FROM course_track_quiz_attempts
       WHERE user_id = ? AND quiz_id = ?
       ORDER BY score DESC
       LIMIT 1`,
      [userId, quizId]
    );
    return parseFinalScore(rows[0]?.best);
  } catch (err: unknown) {
    if (isMissingTableError(err)) {
      console.warn('[course-track-quizzes] quiz tables missing — run: npm run migrate:005 && npm run seed:course-track-quizzes (from backend/)');
      return null;
    }
    throw err;
  }
}

export async function getTrackCertificateEligibility(userId: string, track: CourseTrack): Promise<{
  eligible: boolean;
  readingProgressPct: number;
  finalBestScore: number | null;
  finalExamAttemptsCount: number;
  reasons: string[];
}> {
  const completed = await getCompletedReadingLessonIds(userId);
  const frac = readingProgressFraction(track, completed);
  const readingProgressPct = Math.round(frac * 10000) / 100;
  const finalQuizId = TRACK_FINAL_QUIZ_ID[track];
  const countRows = await query<{ c: number }[]>(
    `SELECT COUNT(*) AS c FROM course_track_quiz_attempts WHERE user_id = ? AND quiz_id = ?`,
    [userId, finalQuizId]
  );
  const finalExamAttemptsCount = Number(countRows[0]?.c ?? 0);
  const finalBest = await getBestFinalScore(userId, track);
  const reasons: string[] = [];
  if (frac < LESSON_PROGRESS_MIN_FOR_CERT) {
    reasons.push(
      `Reach at least ${Math.round(LESSON_PROGRESS_MIN_FOR_CERT * 100)}% reading progress in this track (currently ${readingProgressPct}%).`
    );
  }
  if (finalBest === null || finalBest < FINAL_SCORE_MIN_FOR_CERT) {
    reasons.push(
      `Score ${FINAL_SCORE_MIN_FOR_CERT}% or higher on the module final (best attempt${finalBest !== null ? `: ${finalBest}%` : ': none yet'}).`
    );
  }
  const eligible =
    frac >= LESSON_PROGRESS_MIN_FOR_CERT &&
    finalBest !== null &&
    finalBest >= FINAL_SCORE_MIN_FOR_CERT;
  return {
    eligible,
    readingProgressPct,
    finalBestScore: finalBest,
    finalExamAttemptsCount,
    reasons,
  };
}

export async function getTrackCertificateSummary(userId: string, track: CourseTrack): Promise<{
  eligible: boolean;
  readingProgressPct: number;
  finalBestScore: number | null;
  finalExamAttemptsCount: number;
  reasons: string[];
  certificateIssued: boolean;
  certificatePdfUrl: string | null;
}> {
  try {
    const base = await getTrackCertificateEligibility(userId, track);
    let certificateIssued = false;
    let certificatePdfUrl: string | null = null;
    try {
      const rows = await query<{ pdf_url: string }[]>(
        'SELECT pdf_url FROM track_completion_certificates WHERE user_id = ? AND track = ? LIMIT 1',
        [userId, track]
      );
      certificateIssued = rows.length > 0;
      certificatePdfUrl = rows[0]?.pdf_url ?? null;
    } catch (err: unknown) {
      if (!isMissingTableError(err)) throw err;
      const msg = String(
        (err as { sqlMessage?: string; message?: string }).sqlMessage ??
          (err as { message?: string }).message ??
          ''
      );
      if (!/track_completion_certificates/i.test(msg)) throw err;
    }
    return {
      ...base,
      certificateIssued,
      certificatePdfUrl,
    };
  } catch (err: unknown) {
    if (isMissingMigration005TableError(err)) {
      warnMissingMigrationOnce(
        'course_track_summary',
        '[course-track-quizzes] DB tables missing — run migrate:005 (from backend/)'
      );
      return {
        eligible: false,
        readingProgressPct: 0,
        finalBestScore: null,
        finalExamAttemptsCount: 0,
        reasons: [],
        certificateIssued: false,
        certificatePdfUrl: null,
      };
    }
    throw err;
  }
}
