import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { runCompiler } from './compiler-runner';
import { query } from '../../db/connection';
import { randomUUID } from 'crypto';

const router = Router();

const submitSchema = z.object({
  source_code: z.string().min(1).max(64_000),
  language: z.enum(['cpp', 'html', 'css', 'javascript']).default('cpp'),
});

router.post('/run', authenticate, async (req: Request, res: Response) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }

  const { source_code, language } = parsed.data;
  const userId = req.user!.sub;

  try {
    const result = await runCompiler(language, source_code);

    // Persist submission
    await query(
      `INSERT INTO compiler_submissions (id, user_id, source_code, stdout, stderr, exit_code, timed_out)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        userId,
        `[${language}]\n${source_code}`,
        result.stdout ?? null,
        result.stderr ?? null,
        result.exitCode,
        result.timedOut,
      ]
    );

    return res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      previewHtml: result.previewHtml ?? null,
      language,
    });
  } catch (err) {
    console.error('Compiler error:', err);
    return res.status(500).json({ error: 'Compiler service unavailable' });
  }
});

export default router;
