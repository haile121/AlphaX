import { randomUUID } from 'crypto';
import { query } from '../../db/connection';
import type { Exam } from '../../db/types';
import { awardCoins, awardXP } from '../gamification/gamification.service';

interface ExamGateCheck {
  met: boolean;
  remaining: { type: 'lesson' | 'quiz'; id: string; title: string }[];
}

export async function checkExamGate(examId: string, userId: string): Promise<ExamGateCheck> {
  const examRows = await query<Exam[]>('SELECT * FROM exams WHERE id = ?', [examId]);
  if (examRows.length === 0) throw { code: 'EXAM_NOT_FOUND', message: 'Exam not found' };
  const exam = examRows[0];

  const lessons = await query<{ id: string; title_en: string; completed: number }[]>(
    `SELECT l.id, l.title_en,
            COALESCE(up.completed, 0) AS completed
     FROM lessons l
     LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = ?
     WHERE l.level_id = ? AND l.is_published = true`,
    [userId, exam.level_id]
  );

  const quizzes = await query<{ id: string; title_en: string; passed: number }[]>(
    `SELECT q.id, q.title_en,
            COALESCE(MAX(qa.passed), 0) AS passed
     FROM quizzes q
     JOIN lessons l ON l.id = q.lesson_id
     LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.user_id = ?
     WHERE l.level_id = ?
     GROUP BY q.id, q.title_en`,
    [userId, exam.level_id]
  );

  const remaining: ExamGateCheck['remaining'] = [];
  for (const l of lessons) {
    if (!l.completed) remaining.push({ type: 'lesson', id: l.id, title: l.title_en });
  }
  for (const q of quizzes) {
    if (!q.passed) remaining.push({ type: 'quiz', id: q.id, title: q.title_en });
  }

  return { met: remaining.length === 0, remaining };
}

export async function getExam(examId: string, userId: string): Promise<Exam> {
  const gate = await checkExamGate(examId, userId);
  if (!gate.met) throw { code: 'EXAM_GATE_NOT_MET', remaining: gate.remaining };

  const rows = await query<Exam[]>('SELECT * FROM exams WHERE id = ?', [examId]);
  if (rows.length === 0) throw { code: 'EXAM_NOT_FOUND', message: 'Exam not found' };
  return rows[0];
}

export async function submitExam(
  examId: string,
  userId: string,
  answers: Record<string, string>
): Promise<{ score: number; passed: boolean; xpAwarded: number; coinsAwarded: number }> {
  const examRows = await query<Exam[]>('SELECT * FROM exams WHERE id = ?', [examId]);
  if (examRows.length === 0) throw { code: 'EXAM_NOT_FOUND', message: 'Exam not found' };
  const exam = examRows[0];

  const questions = await query<{ id: string; correct_answer: string }[]>(
    'SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = ?',
    [examId]
  );

  if (questions.length === 0) throw { code: 'NO_QUESTIONS', message: 'Exam has no questions' };

  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correct_answer) correct++;
  }

  const score = Math.round((correct / questions.length) * 100 * 100) / 100;
  const passed = score >= 70;

  await query(
    `INSERT INTO exam_attempts (id, user_id, exam_id, score, passed)
     VALUES (?, ?, ?, ?, ?)`,
    [randomUUID(), userId, examId, score, passed]
  );

  let xpAwarded = 0;
  let coinsAwarded = 0;

  if (passed) {
    const passRows = await query<{ c: number }[]>(
      `SELECT COUNT(*) AS c FROM exam_attempts WHERE user_id = ? AND exam_id = ? AND passed = true`,
      [userId, examId]
    );
    const firstPass = (passRows[0]?.c ?? 0) === 1;

    if (firstPass) {
      await awardXP(userId, exam.xp_reward);
      await awardCoins(userId, exam.coin_reward);
      xpAwarded = exam.xp_reward;
      coinsAwarded = exam.coin_reward;
    }
  }

  return { score, passed, xpAwarded, coinsAwarded };
}
