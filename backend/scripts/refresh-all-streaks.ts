/**
 * Re-runs updateStreak() for every active user so streak + last_active_date
 * match the current gamification rules (after date-comparison fixes).
 *
 * Run from backend/: npx tsx scripts/refresh-all-streaks.ts
 * Or: npm run refresh:streaks
 */
import 'dotenv/config';

import { query } from '../db/connection';
import { updateStreak } from '../modules/gamification/gamification.service';

async function main() {
  const rows = await query<{ id: string }[]>(
    `SELECT id FROM users WHERE (is_active IS NULL OR is_active = TRUE)`
  );
  if (!rows.length) {
    console.log('No users found.');
    return;
  }
  let ok = 0;
  for (const r of rows) {
    try {
      await updateStreak(r.id);
      ok += 1;
    } catch (e) {
      console.error('[refresh-all-streaks] failed for', r.id, e);
    }
  }
  console.log(`Refreshed streaks for ${ok}/${rows.length} users.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
