import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { requireAdminDb } from '../../middleware/requireAdminDb';
import { isMissingTableError } from '../../db/mysqlErrors';
import {
  deleteTrackCompletionVideo,
  listTrackCompletionVideos,
  upsertTrackCompletionVideo,
  type TrackKey,
} from './track-completion-videos.service';

const router = Router();

const trackParam = z.enum(['cpp', 'web']);

const upsertBody = z.object({
  youtube_url: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
});

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const videos = await listTrackCompletionVideos();
    res.json({ videos });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put(
  '/:track',
  authenticate,
  requireAdminDb,
  async (req: Request, res: Response): Promise<void> => {
    const parsedTrack = trackParam.safeParse(req.params.track);
    if (!parsedTrack.success) {
      res.status(400).json({ error: 'Invalid track', code: 'INVALID_TRACK' });
      return;
    }
    const body = upsertBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: 'Invalid body', details: body.error.flatten() });
      return;
    }
    try {
      const video = await upsertTrackCompletionVideo(parsedTrack.data as TrackKey, {
        youtube_url: body.data.youtube_url,
        title: body.data.title,
        description: body.data.description ?? null,
        thumbnail_url: body.data.thumbnail_url ?? null,
      });
      res.json({ video });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'INVALID_YOUTUBE_URL') {
        res.status(400).json({ error: e.message ?? 'Invalid YouTube URL', code: e.code });
        return;
      }
      if (e.code === 'TABLE_MISSING' || isMissingTableError(err)) {
        res.status(503).json({
          error: 'Database table missing. From backend folder run: npm run migrate:006',
          code: 'TABLE_MISSING',
        });
        return;
      }
      if (e.code === 'UPSERT_READ_FAILED') {
        console.error('[track-completion-videos PUT]', err);
        res.status(500).json({
          error: 'Save may have worked but the row could not be read back. Check DB connection.',
          code: e.code,
        });
        return;
      }
      console.error('[track-completion-videos PUT]', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete(
  '/:track',
  authenticate,
  requireAdminDb,
  async (req: Request, res: Response): Promise<void> => {
    const parsedTrack = trackParam.safeParse(req.params.track);
    if (!parsedTrack.success) {
      res.status(400).json({ error: 'Invalid track', code: 'INVALID_TRACK' });
      return;
    }
    try {
      const removed = await deleteTrackCompletionVideo(parsedTrack.data as TrackKey);
      res.json({ removed });
    } catch (err: unknown) {
      if (isMissingTableError(err)) {
        res.status(503).json({
          error: 'Database table missing. From backend folder run: npm run migrate:006',
          code: 'TABLE_MISSING',
        });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
