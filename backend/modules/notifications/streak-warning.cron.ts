import { query } from '../../db/connection';
import { notifyStreakWarning } from './notifications.service';
import type { User } from '../../db/types';

/**
 * Runs hourly. Finds users whose last_active_date is yesterday
 * and current time is within 2 hours of midnight — warns them their streak is at risk.
 */
export async function runStreakWarningCron(): Promise<void> {
  const now = new Date();
  const hoursUntilMidnight = 24 - now.getHours();

  // Only run within the 2-hour window before midnight
  if (hoursUntilMidnight > 2) return;

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const atRiskUsers = await query<Pick<User, 'id' | 'streak'>[]>(
    `SELECT id, streak FROM users
     WHERE last_active_date = ? AND streak > 0 AND is_active = true`,
    [yesterday]
  );

  for (const user of atRiskUsers) {
    // Check if we already sent a warning today
    const existing = await query<{ count: number }[]>(
      `SELECT COUNT(*) AS count FROM notifications
       WHERE user_id = ? AND type = 'streak_warning'
       AND DATE(created_at) = CURDATE()`,
      [user.id]
    );
    if (existing[0].count > 0) continue;

    await notifyStreakWarning(user.id, user.streak);
  }

  console.log(`[streak-warning-cron] Warned ${atRiskUsers.length} users at ${now.toISOString()}`);
}
