import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { getQuiz, submitQuiz } from './quizzes.service';

const router = Router();

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const data = await getQuiz(req.params.id);
    return res.json(data);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'QUIZ_NOT_FOUND') return res.status(404).json({ error: e.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

router.post('/:id/submit', authenticate, async (req: Request, res: Response) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  try {
    const result = await submitQuiz(req.params.id, req.user!.sub, parsed.data.answers);
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'QUIZ_NOT_FOUND') return res.status(404).json({ error: e.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
