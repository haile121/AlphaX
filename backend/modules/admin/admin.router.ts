import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireAdminDb } from '../../middleware/requireAdminDb';
import { query } from '../../db/connection';

const router = Router();

const CURRICULUM_LESSON_COUNT = 18; // ch1:4 + ch2:4 + ch3:4 + ch4:6 — keep in sync with frontend courseCurriculum

const adminChain = [authenticate, requireAdminDb];

/** Dashboard stats + chart series for admin UI */
router.get('/stats', ...adminChain, async (_req: Request, res: Response): Promise<void> => {
  try {
    const userRows = await query<{ count: number }[]>('SELECT COUNT(*) AS count FROM users');
    const total_users = Number(userRows[0]?.count ?? 0);

    let avg_quiz_score = 0;
    let total_quiz_attempts = 0;
    try {
      const avgRows = await query<{ avg: number | null }[]>(
        'SELECT AVG(score) AS avg FROM quiz_attempts',
      );
      const raw = avgRows[0]?.avg;
      avg_quiz_score = raw != null ? Math.round(Number(raw) * 10) / 10 : 0;
      const cntRows = await query<{ c: number }[]>('SELECT COUNT(*) AS c FROM quiz_attempts');
      total_quiz_attempts = Number(cntRows[0]?.c ?? 0);
    } catch {
      avg_quiz_score = 0;
      total_quiz_attempts = 0;
    }

    let lesson_completion_rate = 0;
    try {
      const crRows = await query<{ c: number }[]>('SELECT COUNT(*) AS c FROM course_reading_progress');
      const completions = Number(crRows[0]?.c ?? 0);
      if (total_users > 0 && CURRICULUM_LESSON_COUNT > 0) {
        const denom = total_users * CURRICULUM_LESSON_COUNT;
        lesson_completion_rate = Math.min(100, Math.round((completions / denom) * 1000) / 10);
      }
    } catch {
      lesson_completion_rate = 0;
    }

    let streak_distribution: { streak: number; count: number }[] = [];
    try {
      streak_distribution = await query<{ streak: number; count: number }[]>(
        `SELECT streak, COUNT(*) AS count FROM users GROUP BY streak ORDER BY streak DESC LIMIT 14`,
      );
    } catch {
      streak_distribution = [];
    }

    /** Last 14 days new signups (for line/area chart) */
    let signups_by_day: { date: string; count: number }[] = [];
    try {
      const rows = await query<{ d: Date | string; count: number }[]>(
        `SELECT DATE(created_at) AS d, COUNT(*) AS count FROM users
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
         GROUP BY DATE(created_at) ORDER BY d ASC`,
      );
      const byDay = new Map<string, number>();
      for (const r of rows) {
        const key =
          typeof r.d === 'string'
            ? r.d.slice(0, 10)
            : new Date(r.d).toISOString().slice(0, 10);
        byDay.set(key, Number(r.count));
      }
      for (let i = 13; i >= 0; i--) {
        const dt = new Date();
        dt.setDate(dt.getDate() - i);
        const key = dt.toISOString().slice(0, 10);
        signups_by_day.push({ date: key, count: byDay.get(key) ?? 0 });
      }
    } catch {
      signups_by_day = [];
    }

    let users_by_level: { level: string; count: number }[] = [];
    try {
      const levelRows = await query<{ level: string | null; count: number }[]>(
        `SELECT COALESCE(NULLIF(TRIM(level), ''), 'unset') AS level, COUNT(*) AS count
         FROM users GROUP BY COALESCE(NULLIF(TRIM(level), ''), 'unset') ORDER BY count DESC`,
      );
      users_by_level = levelRows.map((r) => ({
        level: r.level ?? 'unset',
        count: Number(r.count),
      }));
    } catch {
      users_by_level = [];
    }

    let role_breakdown: { role: string; count: number }[] = [];
    try {
      const roleRows = await query<{ role: string; count: number }[]>(
        `SELECT role, COUNT(*) AS count FROM users GROUP BY role`,
      );
      role_breakdown = roleRows.map((r) => ({
        role: r.role,
        count: Number(r.count),
      }));
    } catch {
      role_breakdown = [];
    }

    /** Quiz score buckets (0–10, 11–20, … 91–100) */
    let quiz_score_buckets: { label: string; count: number }[] = [];
    try {
      const buckets = await query<{ bucket: number; count: number }[]>(
        `SELECT FLOOR(score / 10) * 10 AS bucket, COUNT(*) AS count
         FROM quiz_attempts WHERE score IS NOT NULL
         GROUP BY FLOOR(score / 10) ORDER BY bucket ASC`,
      );
      quiz_score_buckets = buckets.map((b) => ({
        label: `${b.bucket}-${Math.min(b.bucket + 9, 100)}`,
        count: Number(b.count),
      }));
    } catch {
      quiz_score_buckets = [];
    }

    let total_lessons = 0;
    let published_lessons = 0;
    try {
      const lr = await query<{ c: number }[]>('SELECT COUNT(*) AS c FROM lessons');
      total_lessons = Number(lr[0]?.c ?? 0);
      const pr = await query<{ c: number }[]>(
        'SELECT COUNT(*) AS c FROM lessons WHERE is_published = true',
      );
      published_lessons = Number(pr[0]?.c ?? 0);
    } catch {
      total_lessons = 0;
      published_lessons = 0;
    }

    let active_users = total_users;
    try {
      const ar = await query<{ c: number }[]>(
        'SELECT COUNT(*) AS c FROM users WHERE is_active IS NULL OR is_active = true',
      );
      active_users = Number(ar[0]?.c ?? total_users);
    } catch {
      active_users = total_users;
    }

    res.json({
      total_users,
      active_users,
      avg_quiz_score,
      total_quiz_attempts,
      lesson_completion_rate,
      streak_distribution,
      signups_by_day,
      users_by_level,
      role_breakdown,
      quiz_score_buckets,
      total_lessons,
      published_lessons,
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** Legacy endpoint — same counts as before */
router.get('/dashboard', ...adminChain, async (_req: Request, res: Response): Promise<void> => {
  try {
    const userRows = await query<{ count: number }[]>('SELECT COUNT(*) AS count FROM users');
    const lessonRows = await query<{ count: number }[]>('SELECT COUNT(*) AS count FROM lessons');
    res.json({
      stats: {
        users: Number(userRows[0]?.count ?? 0),
        lessons: Number(lessonRows[0]?.count ?? 0),
      },
    });
  } catch (err) {
    console.error('[admin/dashboard]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users', ...adminChain, async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await query<
      {
        id: string;
        email: string;
        display_name: string;
        role: string;
        level: string | null;
        xp: number;
        streak: number;
        is_active: boolean;
        created_at: Date | string;
      }[]
    >(
      `SELECT id, email, display_name, role, level, xp, streak,
              COALESCE(is_active, true) AS is_active, created_at
       FROM users ORDER BY created_at DESC LIMIT 500`,
    );
    res.json({ users });
  } catch (err) {
    console.error('[admin/users]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/users/:id/status', ...adminChain, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const is_active = Boolean(req.body?.is_active);
    await query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[admin/users/status]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/users/:id/role', ...adminChain, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const role = req.body?.role;
    if (role !== 'student' && role !== 'admin') {
      res.status(400).json({ error: 'role must be student or admin' });
      return;
    }
    await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[admin/users/role]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/flagged-messages', ...adminChain, async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await query<
      {
        id: string;
        sender_id: string;
        display_name: string;
        content: string;
        conversation_type: string;
        sent_at: Date | string;
      }[]
    >(
      `SELECT m.id, m.sender_id, u.display_name, m.content, m.conversation_type, m.sent_at
       FROM messages m
       INNER JOIN users u ON u.id = m.sender_id
       WHERE m.is_flagged = true AND m.is_deleted = false
       ORDER BY m.sent_at DESC
       LIMIT 200`,
    );
    res.json({ messages });
  } catch (err) {
    console.error('[admin/flagged-messages]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/messages/:id', ...adminChain, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await query('UPDATE messages SET is_deleted = true WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[admin/messages/delete]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
