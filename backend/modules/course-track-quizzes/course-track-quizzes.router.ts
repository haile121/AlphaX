import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import {
  getCourseTrackQuiz,
  submitCourseTrackQuiz,
  getTrackCertificateSummary,
} from './course-track-quizzes.service';

const router = Router();

const trackSchema = z.enum(['cpp', 'web']);

router.get('/track/:track/summary', authenticate, async (req: Request, res: Response) => {
  const parsed = trackSchema.safeParse(req.params.track);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid track' });
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const summary = await getTrackCertificateSummary(req.user!.sub, parsed.data);
    return res.json(summary);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) {
    res.status(400).json({ error: 'Quiz id required' });
    return;
  }
  try {
    const data = await getCourseTrackQuiz(id, req.user!.sub);
    return res.json(data);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'QUIZ_NOT_FOUND') return res.status(404).json({ error: e.message });
    if (e.code === 'COURSE_QUIZZES_UNAVAILABLE') return res.status(503).json({ error: e.message, code: e.code });
    if (e.code === 'DB_SCHEMA_ERROR') return res.status(500).json({ error: e.message, code: e.code });
    if (e.code === 'CHAPTER_NOT_COMPLETE' || e.code === 'TRACK_NOT_COMPLETE') {
      return res.status(403).json({ error: e.message, code: e.code });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

router.post('/:id/submit', authenticate, async (req: Request, res: Response) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) {
    res.status(400).json({ error: 'Quiz id required' });
    return;
  }
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  try {
    const result = await submitCourseTrackQuiz(id, req.user!.sub, parsed.data.answers);
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'QUIZ_NOT_FOUND') return res.status(404).json({ error: e.message });
    if (e.code === 'NO_QUESTIONS') return res.status(400).json({ error: e.message });
    if (e.code === 'COURSE_QUIZZES_UNAVAILABLE') return res.status(503).json({ error: e.message, code: e.code });
    if (e.code === 'DB_SCHEMA_ERROR') return res.status(500).json({ error: e.message, code: e.code });
    if (e.code === 'CHAPTER_NOT_COMPLETE' || e.code === 'TRACK_NOT_COMPLETE') {
      return res.status(403).json({ error: e.message, code: e.code });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
