import { randomUUID } from 'crypto';
import { query } from '../../db/connection';
import type { Quiz, QuizQuestion } from '../../db/types';
import { awardCoins, awardXP } from '../gamification/gamification.service';

export async function getQuiz(quizId: string): Promise<{ quiz: Quiz; questions: Omit<QuizQuestion, 'correct_answer'>[] }> {
  const quizRows = await query<Quiz[]>('SELECT * FROM quizzes WHERE id = ?', [quizId]);
  if (quizRows.length === 0) throw { code: 'QUIZ_NOT_FOUND', message: 'Quiz not found' };

  const questions = await query<QuizQuestion[]>(
    'SELECT id, quiz_id, question_en, question_am, type, options_json FROM quiz_questions WHERE quiz_id = ?',
    [quizId]
  );

  return { quiz: quizRows[0], questions };
}

export async function submitQuiz(
  quizId: string,
  userId: string,
  answers: Record<string, string>
): Promise<{ score: number; passed: boolean; xpAwarded: number; coinsAwarded: number }> {
  const quizRows = await query<Quiz[]>('SELECT * FROM quizzes WHERE id = ?', [quizId]);
  if (quizRows.length === 0) throw { code: 'QUIZ_NOT_FOUND', message: 'Quiz not found' };
  const quiz = quizRows[0];

  const questions = await query<QuizQuestion[]>(
    'SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = ?',
    [quizId]
  );

  if (questions.length === 0) throw { code: 'NO_QUESTIONS', message: 'Quiz has no questions' };

  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correct_answer) correct++;
  }

  const score = Math.round((correct / questions.length) * 100 * 100) / 100;
  const passed = score >= 70;

  await query(
    `INSERT INTO quiz_attempts (id, user_id, quiz_id, score, passed, answers_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [randomUUID(), userId, quizId, score, passed, JSON.stringify(answers)]
  );

  let xpAwarded = 0;
  let coinsAwarded = 0;

  if (passed) {
    const passRows = await query<{ c: number }[]>(
      `SELECT COUNT(*) AS c FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? AND passed = true`,
      [userId, quizId]
    );
    const firstPass = (passRows[0]?.c ?? 0) === 1;

    if (firstPass) {
      await awardXP(userId, quiz.xp_reward);
      await awardCoins(userId, quiz.coin_reward);
      xpAwarded = quiz.xp_reward;
      coinsAwarded = quiz.coin_reward;
    }
  }

  return { score, passed, xpAwarded, coinsAwarded };
}
