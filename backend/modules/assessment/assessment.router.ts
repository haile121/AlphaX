import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { query } from '../../db/connection';
import type { AssessmentQuestion } from '../../db/types';
import { getMe } from '../auth/auth.service';

const router = Router();

function fieldToUtf8(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (Buffer.isBuffer(v)) return v.toString('utf8');
  return String(v);
}

function parseOptionsJson(raw: string | string[] | object | null | undefined): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map((x) => fieldToUtf8(x));
  if (typeof raw === 'object') {
    try {
      const p = raw as unknown;
      if (Array.isArray(p)) return (p as unknown[]).map((x) => fieldToUtf8(x));
    } catch {
      /* fall through */
    }
  }
  const s = fieldToUtf8(raw);
  try {
    const p = JSON.parse(s) as unknown;
    return Array.isArray(p) ? (p as unknown[]).map((x) => fieldToUtf8(x)) : [];
  } catch {
    return [];
  }
}

function normalizeQuestionForClient(q: AssessmentQuestion) {
  const { correct_answer: _c, options_am_json: _rawAm, ...rest } = q;
  const questionEn = fieldToUtf8(q.question_en);
  let questionAm = fieldToUtf8(q.question_am);
  if (!questionAm.trim()) questionAm = questionEn;

  const enOpts = parseOptionsJson(q.options_json as string | string[]);
  const amRaw = q.options_am_json;
  const amOpts = amRaw != null ? parseOptionsJson(amRaw as string | string[]) : [];
  const aligned =
    amOpts.length > 0 && enOpts.length > 0 && amOpts.length === enOpts.length;

  return {
    ...rest,
    question_en: questionEn,
    question_am: questionAm,
    options_json: enOpts,
    options_am_json: aligned ? amOpts : undefined,
  };
}

// GET /api/assessment/questions?track=cpp|web
// Returns 5 beginner + 5 intermediate + 5 advanced = 15 questions, interleaved.
router.get('/questions', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const track = req.query.track === 'web' ? 'web' : 'cpp';
    const user = await getMe(req.user!.sub);

    if (track === 'cpp' && user.cpp_assessment_completed) {
      res.status(400).json({ error: 'You already completed the C++ placement test.' });
      return;
    }
    if (track === 'web' && user.web_assessment_completed) {
      res.status(400).json({ error: 'You already completed the Web fundamentals placement test.' });
      return;
    }

    const [beginners, intermediates, advanced] = await Promise.all([
      query<AssessmentQuestion[]>(
        `SELECT id, question_en, question_am, options_json, options_am_json, correct_answer, difficulty, track
         FROM assessment_questions WHERE difficulty = 'beginner' AND track = ? ORDER BY RAND() LIMIT 5`,
        [track]
      ),
      query<AssessmentQuestion[]>(
        `SELECT id, question_en, question_am, options_json, options_am_json, correct_answer, difficulty, track
         FROM assessment_questions WHERE difficulty = 'intermediate' AND track = ? ORDER BY RAND() LIMIT 5`,
        [track]
      ),
      query<AssessmentQuestion[]>(
        `SELECT id, question_en, question_am, options_json, options_am_json, correct_answer, difficulty, track
         FROM assessment_questions WHERE difficulty = 'advanced' AND track = ? ORDER BY RAND() LIMIT 5`,
        [track]
      ),
    ]);

    if (beginners.length < 5 || intermediates.length < 5 || advanced.length < 5) {
      console.error('[assessment/questions] Not enough questions for track', track, {
        beginners: beginners.length,
        intermediates: intermediates.length,
        advanced: advanced.length,
      });
      res.status(500).json({
        error:
          'Placement questions are not fully configured for this track. Ask an admin to run database migrations.',
      });
      return;
    }

    const questions: AssessmentQuestion[] = [];
    for (let i = 0; i < 5; i++) {
      questions.push(beginners[i], intermediates[i], advanced[i]);
    }

    const safe = questions.map((q) => normalizeQuestionForClient(q));
    res.json({ questions: safe, track });
  } catch (err) {
    console.error('[assessment/questions]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/assessment/submit
const submitSchema = z.object({
  track: z.enum(['cpp', 'web']),
  answers: z
    .array(z.object({ questionId: z.string(), answer: z.string() }))
    .length(15),
});

router.post('/submit', authenticate, async (req: Request, res: Response): Promise<void> => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
    return;
  }

  const { track, answers } = parsed.data;
  const questionIds = answers.map((a) => a.questionId);

  try {
    const user = await getMe(req.user!.sub);

    if (!user.assessment_completed) {
      if (!user.primary_track) {
        res.status(400).json({ error: 'Choose a learning path before taking the placement test.' });
        return;
      }
      if (user.primary_track !== track) {
        res
          .status(400)
          .json({ error: 'This placement test does not match your selected learning path.' });
        return;
      }
    } else {
      if (track === 'cpp' && user.cpp_assessment_completed) {
        res.status(400).json({ error: 'C++ placement was already completed.' });
        return;
      }
      if (track === 'web' && user.web_assessment_completed) {
        res.status(400).json({ error: 'Web fundamentals placement was already completed.' });
        return;
      }
    }

    const placeholders = questionIds.map(() => '?').join(', ');
    const rows = await query<Pick<AssessmentQuestion, 'id' | 'correct_answer' | 'difficulty' | 'track'>[]>(
      `SELECT id, correct_answer, difficulty, track FROM assessment_questions WHERE id IN (${placeholders})`,
      questionIds
    );

    if (rows.length !== 15) {
      res.status(400).json({ error: 'Invalid or incomplete question set.' });
      return;
    }

    for (const r of rows) {
      if ((r.track ?? 'cpp') !== track) {
        res.status(400).json({ error: 'Question set does not match the selected track.' });
        return;
      }
    }

    const questionMap = new Map(rows.map((r) => [r.id, r]));

    const scores = { beginner: 0, intermediate: 0, advanced: 0 };
    let totalScore = 0;

    for (const { questionId, answer } of answers) {
      const q = questionMap.get(questionId);
      if (!q) continue;
      if (q.correct_answer === answer) {
        scores[q.difficulty]++;
        totalScore++;
      }
    }

    let level: 'beginner' | 'intermediate' | 'advanced';
    if (scores.advanced >= 4) {
      level = 'advanced';
    } else if (scores.beginner >= 4 || scores.intermediate >= 3) {
      level = 'intermediate';
    } else {
      level = 'beginner';
    }

    const uid = req.user!.sub;

    if (!user.assessment_completed) {
      if (track === 'cpp') {
        await query(
          `UPDATE users SET cpp_level = ?, cpp_assessment_completed = 1, level = ?, assessment_completed = 1 WHERE id = ?`,
          [level, level, uid]
        );
      } else {
        await query(
          `UPDATE users SET web_level = ?, web_assessment_completed = 1, level = ?, assessment_completed = 1 WHERE id = ?`,
          [level, level, uid]
        );
      }
    } else if (track === 'cpp') {
      await query(`UPDATE users SET cpp_level = ?, cpp_assessment_completed = 1 WHERE id = ?`, [level, uid]);
    } else {
      await query(`UPDATE users SET web_level = ?, web_assessment_completed = 1 WHERE id = ?`, [level, uid]);
    }

    const messages: Record<typeof level, string> = {
      beginner:
        track === 'cpp'
          ? "Great start! You're placed at Beginner level for C++. Let's build your foundation."
          : "Great start! You're placed at Beginner level for Web fundamentals. Let's build your foundation.",
      intermediate:
        track === 'cpp'
          ? 'Nice work! You have a solid C++ base — you start at Intermediate level.'
          : 'Nice work! You have a solid Web base — you start at Intermediate level.',
      advanced:
        track === 'cpp'
          ? 'Impressive! You have strong C++ knowledge. You start at Advanced level.'
          : 'Impressive! You have strong Web fundamentals. You start at Advanced level.',
    };

    res.json({ score: totalScore, level, message: messages[level], breakdown: scores, track });
  } catch (err) {
    console.error('[assessment/submit]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
