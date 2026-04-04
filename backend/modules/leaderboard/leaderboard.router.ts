import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { query } from '../../db/connection';

const router = Router();

/** Active users: NULL is treated as active (legacy rows). */
const ACTIVE = '(u.is_active IS NULL OR u.is_active = TRUE)';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  xp: number;
  level: string | null;
  streak: number;
}

async function buildGlobalMyRank(userId: string): Promise<LeaderboardEntry | null> {
  const [me] = await query<Omit<LeaderboardEntry, 'rank'>[]>(
    `SELECT id AS user_id, display_name, xp, level, streak FROM users WHERE id = ?`,
    [userId]
  );
  if (!me) return null;
  const [cnt] = await query<{ c: number }[]>(
    `SELECT COUNT(*) AS c FROM users u WHERE ${ACTIVE} AND u.xp > ?`,
    [me.xp]
  );
  return { rank: (cnt?.c ?? 0) + 1, ...me };
}

async function buildLevelMyRank(userId: string, level: string): Promise<LeaderboardEntry | null> {
  const [me] = await query<Omit<LeaderboardEntry, 'rank'>[]>(
    `SELECT id AS user_id, display_name, xp, level, streak FROM users WHERE id = ?`,
    [userId]
  );
  if (!me || me.level !== level) return null;
  const [cnt] = await query<{ c: number }[]>(
    `SELECT COUNT(*) AS c FROM users u WHERE ${ACTIVE} AND u.level = ? AND u.xp > ?`,
    [level, me.xp]
  );
  return { rank: (cnt?.c ?? 0) + 1, ...me };
}

async function buildFriendsMyRank(userId: string): Promise<LeaderboardEntry | null> {
  const [me] = await query<Omit<LeaderboardEntry, 'rank'>[]>(
    `SELECT id AS user_id, display_name, xp, level, streak FROM users WHERE id = ?`,
    [userId]
  );
  if (!me) return null;

  const [cnt] = await query<{ c: number }[]>(
    `SELECT COUNT(*) AS c
     FROM (
       SELECT u.id AS oid, u.xp AS xpv FROM users u
       INNER JOIN friendships f ON (
         (f.requester_id = ? AND f.addressee_id = u.id) OR
         (f.addressee_id = ? AND f.requester_id = u.id)
       )
       WHERE f.status = 'accepted' AND (u.is_active IS NULL OR u.is_active = TRUE)
       UNION
       SELECT id AS oid, xp AS xpv FROM users WHERE id = ?
     ) t
     WHERE t.xpv > ?`,
    [userId, userId, userId, me.xp]
  );
  return { rank: (cnt?.c ?? 0) + 1, ...me };
}

router.get('/global', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.sub;

  const rows = await query<Omit<LeaderboardEntry, 'rank'>[]>(
    `SELECT id AS user_id, display_name, xp, level, streak
     FROM users u
     WHERE ${ACTIVE}
     ORDER BY xp DESC, id ASC
     LIMIT 100`
  );

  const ranked = rows.map((r, i) => ({ rank: i + 1, ...r }));
  let myRank = ranked.find((r) => r.user_id === userId) ?? null;
  if (!myRank) {
    myRank = await buildGlobalMyRank(userId);
  }

  return res.json({ leaderboard: ranked, myRank });
});

router.get('/level', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.sub;

  const userRows = await query<{ level: string | null }[]>(
    'SELECT level FROM users WHERE id = ?',
    [userId]
  );
  const level = userRows[0]?.level;
  if (!level) {
    return res.json({ leaderboard: [], myRank: null });
  }

  const rows = await query<Omit<LeaderboardEntry, 'rank'>[]>(
    `SELECT id AS user_id, display_name, xp, level, streak
     FROM users u
     WHERE ${ACTIVE} AND level = ?
     ORDER BY xp DESC, id ASC
     LIMIT 100`,
    [level]
  );

  const ranked = rows.map((r, i) => ({ rank: i + 1, ...r }));
  let myRank = ranked.find((r) => r.user_id === userId) ?? null;
  if (!myRank) {
    myRank = await buildLevelMyRank(userId, level);
  }

  return res.json({ leaderboard: ranked, myRank });
});

router.get('/friends', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.sub;

  const rows = await query<Omit<LeaderboardEntry, 'rank'>[]>(
    `SELECT t.user_id, t.display_name, t.xp, t.level, t.streak
     FROM (
       SELECT u.id AS user_id, u.display_name, u.xp, u.level, u.streak
       FROM users u
       INNER JOIN friendships f ON (
         (f.requester_id = ? AND f.addressee_id = u.id) OR
         (f.addressee_id = ? AND f.requester_id = u.id)
       )
       WHERE f.status = 'accepted' AND (u.is_active IS NULL OR u.is_active = TRUE)
       UNION
       SELECT id AS user_id, display_name, xp, level, streak FROM users WHERE id = ?
     ) t
     ORDER BY t.xp DESC, t.user_id ASC
     LIMIT 100`,
    [userId, userId, userId]
  );

  const ranked = rows.map((r, i) => ({ rank: i + 1, ...r }));
  let myRank = ranked.find((r) => r.user_id === userId) ?? null;
  if (!myRank) {
    myRank = await buildFriendsMyRank(userId);
  }

  return res.json({ leaderboard: ranked, myRank });
});

export default router;
