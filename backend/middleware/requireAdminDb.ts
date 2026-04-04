import { Request, Response, NextFunction } from 'express';
import { query } from '../db/connection';

/**
 * Admin authorization using the current row in `users`, not the JWT `role` claim.
 * Fixes stale tokens after an account is promoted to admin (JWT still says student until re-login).
 *
 * Must not be `async` — Express 4 does not await async middleware; use `.then()` so `next()` runs
 * only after the DB check and avoids double-`next()` / 500 races.
 */
export function requireAdminDb(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.sub) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  void query<{ role: string }[]>('SELECT role FROM users WHERE id = ? LIMIT 1', [req.user.sub])
    .then((rows) => {
      if (!Array.isArray(rows) || rows.length === 0 || rows[0].role !== 'admin') {
        res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
        return;
      }
      next();
    })
    .catch((err) => {
      console.error('[requireAdminDb]', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
}
