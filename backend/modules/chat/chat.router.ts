import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { authenticate } from '../../middleware/authenticate';
import { query } from '../../db/connection';

const router = Router();

const uuidParam = z.string().uuid();

// GET /api/chat/users/search?q=name
router.get('/users/search', authenticate, async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q ?? '').trim();
    if (!q) return res.json({ users: [] });
    const userId = req.user!.sub;
    const users = await query<{ id: string; display_name: string }[]>(
      `SELECT id, display_name FROM users
       WHERE display_name LIKE ? AND id != ? AND is_active = true
       LIMIT 10`,
      [`%${q}%`, userId]
    );
    return res.json({ users });
  } catch (err) {
    console.error('[chat] users/search error:', err);
    return res.status(500).json({ error: 'Failed to search users' });
  }
});

// GET /api/chat/conversations — latest message per partner (MySQL 8+ ROW_NUMBER)
router.get('/conversations', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    const rows = await query<{ partner_id: string; display_name: string; last_message: string; sent_at: string }[]>(
      `SELECT t.partner_id, t.display_name, t.last_message, t.sent_at
       FROM (
         SELECT
           CASE WHEN m.sender_id = ? THEN m.conversation_id ELSE m.sender_id END AS partner_id,
           u.display_name,
           m.content AS last_message,
           m.sent_at,
           ROW_NUMBER() OVER (
             PARTITION BY CASE WHEN m.sender_id = ? THEN m.conversation_id ELSE m.sender_id END
             ORDER BY m.sent_at DESC
           ) AS rn
         FROM messages m
         JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.conversation_id ELSE m.sender_id END
         WHERE m.conversation_type = 'direct'
           AND (m.sender_id = ? OR m.conversation_id = ?)
           AND m.is_deleted = false
       ) t
       WHERE t.rn = 1
       ORDER BY t.sent_at DESC`,
      [userId, userId, userId, userId, userId]
    );
    return res.json({ conversations: rows });
  } catch (err) {
    console.error('[chat] conversations error:', err);
    return res.status(500).json({ error: 'Failed to load conversations' });
  }
});

// GET /api/chat/groups/all — must be before /groups/:id routes
router.get('/groups/all', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    const groups = await query<{ id: string; name: string; creator_id: string; member_count: number; is_member: number }[]>(
      `SELECT g.id, g.name, g.creator_id,
              COUNT(DISTINCT gm.user_id) AS member_count,
              MAX(CASE WHEN gm.user_id = ? THEN 1 ELSE 0 END) AS is_member
       FROM \`groups\` g
       LEFT JOIN group_members gm ON gm.group_id = g.id
       GROUP BY g.id, g.name, g.creator_id
       ORDER BY member_count DESC`,
      [userId]
    );
    return res.json({ groups });
  } catch (err) {
    console.error('[chat] groups/all error:', err);
    return res.status(500).json({ error: 'Failed to load groups' });
  }
});

// GET /api/chat/groups — list groups the user belongs to
router.get('/groups', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    const groups = await query<{ id: string; name: string; creator_id: string; created_at: string }[]>(
      `SELECT g.id, g.name, g.creator_id, g.created_at
       FROM \`groups\` g
       JOIN group_members gm ON gm.group_id = g.id
       WHERE gm.user_id = ?
       ORDER BY g.created_at DESC`,
      [userId]
    );
    return res.json({ groups });
  } catch (err) {
    console.error('[chat] groups error:', err);
    return res.status(500).json({ error: 'Failed to load groups' });
  }
});

// POST /api/chat/groups — create a group
router.post('/groups', authenticate, async (req: Request, res: Response) => {
  try {
    const schema = z.object({ name: z.string().min(1).max(100) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

    const groupId = randomUUID();
    const userId = req.user!.sub;
    const name = parsed.data.name;

    await query(
      'INSERT INTO `groups` (id, name, creator_id) VALUES (?, ?, ?)',
      [groupId, name, userId]
    );
    await query(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, userId]
    );

    return res.status(201).json({ group: { id: groupId, name, creator_id: userId } });
  } catch (err) {
    console.error('[chat] create group error:', err);
    return res.status(500).json({ error: 'Failed to create group' });
  }
});

// POST /api/chat/groups/:id/join
router.post('/groups/:id/join', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    const groupId = req.params.id;

    const existing = await query<{ group_id: string }[]>(
      'SELECT group_id FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    if (existing.length > 0) return res.status(409).json({ error: 'Already a member' });

    const group = await query<{ id: string }[]>('SELECT id FROM `groups` WHERE id = ?', [groupId]);
    if (group.length === 0) return res.status(404).json({ error: 'Group not found' });

    await query('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupId, userId]);
    return res.json({ success: true });
  } catch (err) {
    console.error('[chat] join group error:', err);
    return res.status(500).json({ error: 'Failed to join group' });
  }
});

// POST /api/chat/groups/:id/leave
router.post('/groups/:id/leave', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    await query('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', [req.params.id, userId]);
    return res.json({ success: true });
  } catch (err) {
    console.error('[chat] leave group error:', err);
    return res.status(500).json({ error: 'Failed to leave group' });
  }
});

// GET /api/chat/messages/:conversationId?limit=50&before=<messageId>
router.get('/messages/:conversationId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    const convParse = uuidParam.safeParse(req.params.conversationId);
    if (!convParse.success) {
      return res.status(400).json({ error: 'Invalid conversation id' });
    }
    const conversationId = convParse.data;

    const limitRaw = Number(req.query.limit ?? 50);
    const limit = Number.isFinite(limitRaw) ? Math.min(100, Math.max(1, Math.floor(limitRaw))) : 50;

    const beforeId = typeof req.query.before === 'string' ? req.query.before.trim() : '';
    const beforeParse = beforeId ? uuidParam.safeParse(beforeId) : { success: true as const, data: undefined as string | undefined };
    if (!beforeParse.success) {
      return res.status(400).json({ error: 'Invalid before cursor' });
    }

    const groupRow = await query<{ id: string }[]>('SELECT id FROM `groups` WHERE id = ?', [conversationId]);

    if (groupRow.length > 0) {
      const membership = await query<{ group_id: string }[]>(
        'SELECT group_id FROM group_members WHERE group_id = ? AND user_id = ?',
        [conversationId, userId]
      );
      if (membership.length === 0) {
        return res.status(403).json({ error: 'Not a member of this group' });
      }

      let beforeSentAt: string | null = null;
      if (beforeParse.data) {
        const cur = await query<{ sent_at: string }[]>(
          `SELECT sent_at FROM messages
           WHERE id = ? AND conversation_id = ? AND conversation_type = 'group'`,
          [beforeParse.data, conversationId]
        );
        if (cur.length === 0) {
          return res.status(400).json({ error: 'Cursor message not found in this conversation' });
        }
        beforeSentAt = cur[0].sent_at;
      }

      const messages = await query<{ id: string; sender_id: string; display_name: string; content: string; sent_at: string }[]>(
        beforeSentAt
          ? `SELECT m.id, m.sender_id, u.display_name, m.content, m.sent_at
             FROM messages m
             JOIN users u ON u.id = m.sender_id
             WHERE m.conversation_id = ? AND m.conversation_type = 'group'
               AND m.is_deleted = false AND m.is_flagged = false
               AND m.sent_at < ?
             ORDER BY m.sent_at DESC
             LIMIT ?`
          : `SELECT m.id, m.sender_id, u.display_name, m.content, m.sent_at
             FROM messages m
             JOIN users u ON u.id = m.sender_id
             WHERE m.conversation_id = ? AND m.conversation_type = 'group'
               AND m.is_deleted = false AND m.is_flagged = false
             ORDER BY m.sent_at DESC
             LIMIT ?`,
        beforeSentAt ? [conversationId, beforeSentAt, limit] : [conversationId, limit]
      );

      messages.reverse();
      return res.json({ messages, hasMore: messages.length === limit });
    }

    // Direct messages
    let beforeSentAt: string | null = null;
    if (beforeParse.data) {
      const cur = await query<{ sent_at: string }[]>(
        `SELECT sent_at FROM messages
         WHERE id = ? AND conversation_type = 'direct'
           AND (
             (sender_id = ? AND conversation_id = ?)
             OR (sender_id = ? AND conversation_id = ?)
           )`,
        [beforeParse.data, userId, conversationId, conversationId, userId]
      );
      if (cur.length === 0) {
        return res.status(400).json({ error: 'Cursor message not found in this conversation' });
      }
      beforeSentAt = cur[0].sent_at;
    }

    const messages = await query<{ id: string; sender_id: string; display_name: string; content: string; sent_at: string }[]>(
      beforeSentAt
        ? `SELECT m.id, m.sender_id, u.display_name, m.content, m.sent_at
           FROM messages m
           JOIN users u ON u.id = m.sender_id
           WHERE m.conversation_type = 'direct'
             AND m.is_deleted = false AND m.is_flagged = false
             AND (
               (m.sender_id = ? AND m.conversation_id = ?)
               OR (m.sender_id = ? AND m.conversation_id = ?)
             )
             AND m.sent_at < ?
           ORDER BY m.sent_at DESC
           LIMIT ?`
        : `SELECT m.id, m.sender_id, u.display_name, m.content, m.sent_at
           FROM messages m
           JOIN users u ON u.id = m.sender_id
           WHERE m.conversation_type = 'direct'
             AND m.is_deleted = false AND m.is_flagged = false
             AND (
               (m.sender_id = ? AND m.conversation_id = ?)
               OR (m.sender_id = ? AND m.conversation_id = ?)
             )
           ORDER BY m.sent_at DESC
           LIMIT ?`,
      beforeSentAt
        ? [userId, conversationId, conversationId, userId, beforeSentAt, limit]
        : [userId, conversationId, conversationId, userId, limit]
    );

    messages.reverse();
    return res.json({ messages, hasMore: messages.length === limit });
  } catch (err) {
    console.error('[chat] messages error:', err);
    return res.status(500).json({ error: 'Failed to load messages' });
  }
});

export default router;
