import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { query } from '../../db/connection';
import type { User, Notification } from '../../db/types';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.sub;

  const userRows = await query<Pick<User, 'xp' | 'coins' | 'streak' | 'level'>[]>(
    'SELECT xp, coins, streak, level FROM users WHERE id = ?',
    [userId]
  );
  if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });
  const user = userRows[0];

  const levels = await query<{ id: string; name: string; label_en: string }[]>(
    'SELECT id, name, label_en FROM levels ORDER BY FIELD(name, "beginner", "intermediate", "advanced")'
  );

  const levelProgress = await Promise.all(
    levels.map(async (lvl) => {
      const [lessonStats] = await query<{ total: number; completed: number }[]>(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN up.completed = true THEN 1 ELSE 0 END) AS completed
         FROM lessons l
         LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = ?
         WHERE l.level_id = ? AND l.is_published = true`,
        [userId, lvl.id]
      );

      const [quizStats] = await query<{ total: number; passed: number }[]>(
        `SELECT COUNT(DISTINCT q.id) AS total,
                COUNT(DISTINCT CASE WHEN qa.passed = true THEN q.id END) AS passed
         FROM quizzes q
         JOIN lessons l ON l.id = q.lesson_id
         LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.user_id = ?
         WHERE l.level_id = ?`,
        [userId, lvl.id]
      );

      const [examStats] = await query<{ total: number; passed: number }[]>(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN ea.passed = true THEN 1 ELSE 0 END) AS passed
         FROM exams e
         LEFT JOIN exam_attempts ea ON ea.exam_id = e.id AND ea.user_id = ?
         WHERE e.level_id = ?`,
        [userId, lvl.id]
      );

      const totalItems = (lessonStats.total || 0) + (quizStats.total || 0) + (examStats.total || 0);
      const completedItems = (lessonStats.completed || 0) + (quizStats.passed || 0) + (examStats.passed || 0);
      const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        level_id: lvl.id,
        level_name: lvl.name,
        label_en: lvl.label_en,
        completion_pct: pct,
        lessons: { total: lessonStats.total || 0, completed: lessonStats.completed || 0 },
        quizzes: { total: quizStats.total || 0, passed: quizStats.passed || 0 },
        exams: { total: examStats.total || 0, passed: examStats.passed || 0 },
      };
    })
  );

  const [badgeCount] = await query<{ count: number }[]>(
    'SELECT COUNT(*) AS count FROM user_badges WHERE user_id = ?',
    [userId]
  );

  return res.json({
    xp: user.xp,
    coins: user.coins,
    streak: user.streak,
    level: user.level,
    badge_count: badgeCount.count || 0,
    levels: levelProgress,
  });
});

router.get('/notifications', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const notifications = await query<Notification[]>(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
    [userId]
  );
  return res.json({ notifications });
});

router.patch('/notifications/:id/read', authenticate, async (req: Request, res: Response) => {
  await query(
    'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
    [req.params.id, req.user!.sub]
  );
  return res.json({ success: true });
});

router.patch('/notifications/read-all', authenticate, async (req: Request, res: Response) => {
  await query(
    'UPDATE notifications SET is_read = true WHERE user_id = ?',
    [req.user!.sub]
  );
  return res.json({ success: true });
});

export default router;
