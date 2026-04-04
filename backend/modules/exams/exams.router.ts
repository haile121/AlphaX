import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { getExam, submitExam } from './exams.service';

const router = Router();

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const exam = await getExam(req.params.id, req.user!.sub);
    return res.json({ exam });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; remaining?: unknown };
    if (e.code === 'EXAM_GATE_NOT_MET') return res.status(403).json({ error: 'Prerequisites not met', remaining: e.remaining });
    if (e.code === 'EXAM_NOT_FOUND') return res.status(404).json({ error: e.message });
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
    const result = await submitExam(req.params.id, req.user!.sub, parsed.data.answers);
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'EXAM_NOT_FOUND') return res.status(404).json({ error: e.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
