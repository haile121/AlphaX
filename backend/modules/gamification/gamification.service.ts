import { query } from '../../db/connection';
import type { Badge, User } from '../../db/types';
import { notifyBadgeEarned } from '../notifications/notifications.service';

/** Calendar YYYY-MM-DD in UTC (consistent with MySQL DATE string comparisons). */
function ymdUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDaysUtc(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return dt.toISOString().slice(0, 10);
}

/** Normalize MySQL DATE (string or Date from mysql2) to YYYY-MM-DD for comparison. */
function normalizeLastActiveDate(raw: string | Date | null | undefined): string | null {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    const t = raw.trim();
    return t.length >= 10 ? t.slice(0, 10) : null;
  }
  if (raw instanceof Date) {
    return ymdUtc(raw);
  }
  return null;
}

export async function awardXP(userId: string, amount: number): Promise<void> {
  await query('UPDATE users SET xp = xp + ? WHERE id = ?', [amount, userId]);
  await checkAndAwardBadges(userId);
}

export async function awardCoins(userId: string, amount: number): Promise<void> {
  await query('UPDATE users SET coins = coins + ? WHERE id = ?', [amount, userId]);
}

/**
 * Daily streak: consecutive calendar days (UTC) the user **signed in** via POST /login or
 * POST /register. XP, lessons, and other activity do not change streak — only auth endpoints call this.
 */
export async function updateStreak(userId: string): Promise<void> {
  const rows = await query<Pick<User, 'streak' | 'last_active_date'>[]>(
    'SELECT streak, last_active_date FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) return;

  const { streak, last_active_date } = rows[0];
  const today = ymdUtc(new Date());
  const lastStr = normalizeLastActiveDate(last_active_date as string | Date | null | undefined);

  if (lastStr === today) return; // already counted a login for this calendar day (UTC)

  const yesterday = addDaysUtc(today, -1);
  const newStreak = lastStr === yesterday ? streak + 1 : 1;

  await query(
    'UPDATE users SET streak = ?, last_active_date = ? WHERE id = ?',
    [newStreak, today, userId]
  );

  await checkAndAwardBadges(userId);
}

export async function checkAndAwardBadges(userId: string): Promise<void> {
  const userRows = await query<Pick<User, 'xp' | 'streak'>[]>(
    'SELECT xp, streak FROM users WHERE id = ?',
    [userId]
  );
  if (userRows.length === 0) return;
  const { xp, streak } = userRows[0];

  const allBadges = await query<Badge[]>('SELECT * FROM badges');
  const earnedRows = await query<{ badge_id: string }[]>(
    'SELECT badge_id FROM user_badges WHERE user_id = ?',
    [userId]
  );
  const earned = new Set(earnedRows.map((r) => r.badge_id));

  for (const badge of allBadges) {
    if (earned.has(badge.id)) continue;

    let shouldAward = false;
    if (badge.criteria_type === 'xp_milestone' && badge.criteria_value !== null) {
      shouldAward = xp >= badge.criteria_value;
    } else if (badge.criteria_type === 'streak' && badge.criteria_value !== null) {
      shouldAward = streak >= badge.criteria_value;
    }

    if (shouldAward) {
      try {
        await query(
          'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
          [userId, badge.id]
        );
        const nameEn = (badge as Badge & { name_en?: string }).name_en ?? 'Badge';
        const nameAm = (badge as Badge & { name_am?: string }).name_am ?? nameEn;
        await notifyBadgeEarned(userId, nameEn, nameAm);
      } catch (e: unknown) {
        const err = e as { code?: string };
        if (err.code !== 'ER_DUP_ENTRY') throw e;
      }
    }
  }
}

export async function getProfile(userId: string) {
  const rows = await query<Pick<User, 'xp' | 'coins' | 'streak' | 'level'>[]>(
    'SELECT xp, coins, streak, level FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) throw { code: 'USER_NOT_FOUND', message: 'User not found' };
  return rows[0];
}

export async function getBadges(userId: string) {
  return query<(Badge & { earned_at: string })[]>(
    `SELECT b.*, ub.earned_at
     FROM badges b
     JOIN user_badges ub ON ub.badge_id = b.id
     WHERE ub.user_id = ?
     ORDER BY ub.earned_at DESC`,
    [userId]
  );
}
