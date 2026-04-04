import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { awardCoins, awardXP } from '../gamification/gamification.service';
import {
  COURSE_READING_COIN_REWARD,
  COURSE_READING_XP_REWARD,
} from './course-readings.constants';
import {
  getCourseReadingProgress,
  replaceCourseReadingProgress,
  addCourseReadingComplete,
} from './course-readings.service';

const router = Router();

const putBodySchema = z.object({
  completed_lesson_ids: z.array(z.string().max(40)).max(64),
});

const postCompleteSchema = z.object({
  lesson_id: z.string().max(40),
});

router.get('/progress', authenticate, async (req: Request, res: Response) => {
  try {
    const ids = await getCourseReadingProgress(req.user!.sub);
    return res.json({ completed_lesson_ids: ids });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({
        error: 'Database migration required',
        hint: 'Run backend/db/migrations/001_course_reading_progress.sql',
      });
    }
    console.error('[course-readings] GET', err);
    return res.status(500).json({ error: 'Failed to load progress' });
  }
});

router.put('/progress', authenticate, async (req: Request, res: Response) => {
  const parsed = putBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', details: parsed.error.flatten() });
  }
  try {
    const ids = await replaceCourseReadingProgress(req.user!.sub, parsed.data.completed_lesson_ids);
    return res.json({ completed_lesson_ids: ids });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({
        error: 'Database migration required',
        hint: 'Run backend/db/migrations/001_course_reading_progress.sql',
      });
    }
    console.error('[course-readings] PUT', err);
    return res.status(500).json({ error: 'Failed to save progress' });
  }
});

router.post('/progress/complete', authenticate, async (req: Request, res: Response) => {
  const parsed = postCompleteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', details: parsed.error.flatten() });
  }
  try {
    const { wasNew } = await addCourseReadingComplete(req.user!.sub, parsed.data.lesson_id);
    let xpAwarded = 0;
    let coinsAwarded = 0;
    if (wasNew) {
      await awardXP(req.user!.sub, COURSE_READING_XP_REWARD);
      await awardCoins(req.user!.sub, COURSE_READING_COIN_REWARD);
      xpAwarded = COURSE_READING_XP_REWARD;
      coinsAwarded = COURSE_READING_COIN_REWARD;
    }
    const ids = await getCourseReadingProgress(req.user!.sub);
    return res.json({ completed_lesson_ids: ids, xp_awarded: xpAwarded, coins_awarded: coinsAwarded });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'INVALID_LESSON_ID') {
      return res.status(400).json({ error: 'Invalid lesson_id' });
    }
    if (e.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({
        error: 'Database migration required',
        hint: 'Run backend/db/migrations/001_course_reading_progress.sql',
      });
    }
    console.error('[course-readings] POST complete', err);
    return res.status(500).json({ error: 'Failed to save progress' });
  }
});

export default router;
