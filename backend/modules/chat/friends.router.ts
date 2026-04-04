import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { authenticate } from '../../middleware/authenticate';
import { query } from '../../db/connection';
import type { Friendship } from '../../db/types';

const router = Router();

router.post('/request', authenticate, async (req: Request, res: Response) => {
  const schema = z.object({ addressee_id: z.string().uuid() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const requesterId = req.user!.sub;
  const { addressee_id } = parsed.data;

  if (requesterId === addressee_id) return res.status(400).json({ error: 'Cannot friend yourself' });

  const existing = await query<Friendship[]>(
    `SELECT * FROM friendships
     WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)`,
    [requesterId, addressee_id, addressee_id, requesterId]
  );
  if (existing.length > 0) return res.status(409).json({ error: 'Friendship already exists' });

  const id = randomUUID();
  await query(
    'INSERT INTO friendships (id, requester_id, addressee_id, status) VALUES (?, ?, ?, "pending")',
    [id, requesterId, addressee_id]
  );
  return res.status(201).json({ message: 'Friend request sent' });
});

router.post('/accept', authenticate, async (req: Request, res: Response) => {
  const schema = z.object({ requester_id: z.string().uuid() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const addresseeId = req.user!.sub;
  const result = await query(
    `UPDATE friendships SET status = 'accepted'
     WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'`,
    [parsed.data.requester_id, addresseeId]
  );

  if ((result as { affectedRows: number }).affectedRows === 0) {
    return res.status(404).json({ error: 'Friend request not found' });
  }
  return res.json({ message: 'Friend request accepted' });
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const friends = await query<{ id: string; display_name: string; xp: number; level: string | null }[]>(
    `SELECT u.id, u.display_name, u.xp, u.level
     FROM users u
     JOIN friendships f ON (
       (f.requester_id = ? AND f.addressee_id = u.id) OR
       (f.addressee_id = ? AND f.requester_id = u.id)
     )
     WHERE f.status = 'accepted'`,
    [userId, userId]
  );
  return res.json({ friends });
});

export default router;
