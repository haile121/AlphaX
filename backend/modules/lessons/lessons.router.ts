import { Router, Request, Response } from 'express';
import { z } from 'zod';
import PDFDocument from 'pdfkit';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/authorize';
import {
  getLessonsForUser,
  getLessonById,
  checkPrerequisites,
  createLesson,
  updateLesson,
  deleteLesson,
} from './lessons.service';

const router = Router();

const lessonSchema = z.object({
  level_id: z.string(),
  title_en: z.string().min(1),
  title_am: z.string().min(1),
  content_en: z.string().min(1),
  content_am: z.string().min(1),
  order_index: z.number().int().min(0),
  is_published: z.boolean().optional().default(false),
  is_downloadable: z.boolean().optional().default(false),
  prerequisite_ids: z.array(z.string()).optional().default([]),
});

// GET /api/lessons
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const lessons = await getLessonsForUser(req.user!.sub);
    res.json({ lessons });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'ASSESSMENT_NOT_COMPLETED') {
      res.status(403).json({ error: e.message, code: e.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// GET /api/lessons/:id
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const lesson = await getLessonById(req.params.id, req.user!.sub);
    res.json({ lesson });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; prerequisites?: unknown[] };
    if (e.code === 'LESSON_NOT_FOUND') {
      res.status(404).json({ error: e.message, code: e.code });
    } else if (e.code === 'PREREQUISITES_NOT_MET') {
      res.status(403).json({ error: 'Prerequisites not met', code: e.code, prerequisites: e.prerequisites });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// GET /api/lessons/:id/download
router.get('/:id/download', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { met, missing } = await checkPrerequisites(req.params.id, req.user!.sub);
    if (!met) {
      res.status(403).json({ error: 'Prerequisites not met', code: 'PREREQUISITES_NOT_MET', prerequisites: missing });
      return;
    }

    const lesson = await getLessonById(req.params.id, req.user!.sub);

    if (!lesson.is_downloadable) {
      res.status(403).json({ error: 'Lesson is not downloadable', code: 'NOT_DOWNLOADABLE' });
      return;
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `lesson-${lesson.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(22).font('Helvetica-Bold').text(lesson.title_en, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica').text(lesson.title_am, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Content (English)');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(lesson.content_en, { align: 'left' });
    doc.moveDown(1.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Content (Amharic)');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(lesson.content_am, { align: 'left' });

    doc.end();
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'LESSON_NOT_FOUND') {
      res.status(404).json({ error: e.message, code: e.code });
    } else if (e.code === 'PREREQUISITES_NOT_MET') {
      res.status(403).json({ error: 'Prerequisites not met', code: e.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /api/lessons (admin)
router.post('/', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  const parsed = lessonSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
    return;
  }

  try {
    const lesson = await createLesson(parsed.data);
    res.status(201).json({ lesson });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/lessons/:id (admin)
router.put('/:id', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  const parsed = lessonSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
    return;
  }

  try {
    const lesson = await updateLesson(req.params.id, parsed.data);
    res.json({ lesson });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'LESSON_NOT_FOUND') {
      res.status(404).json({ error: e.message, code: e.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE /api/lessons/:id (admin)
router.delete('/:id', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  const force = req.query.force === 'true';

  try {
    await deleteLesson(req.params.id, force);
    res.status(204).send();
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; dependents?: string[] };
    if (e.code === 'LESSON_NOT_FOUND') {
      res.status(404).json({ error: e.message, code: e.code });
    } else if (e.code === 'IS_PREREQUISITE') {
      res.status(409).json({
        error: 'Lesson is a prerequisite for other lessons. Use ?force=true to delete anyway.',
        code: e.code,
        dependents: e.dependents,
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
