import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/connection';
import { User } from '../../db/types';

type SafeUser = Omit<User, 'password_hash'>;

/** Trim + lowercase so sign-in matches regardless of casing or accidental spaces. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function register(
  email: string,
  displayName: string,
  password: string
): Promise<SafeUser> {
  const emailNorm = normalizeEmail(email);
  const existing = await query<User[]>(
    'SELECT id FROM users WHERE LOWER(TRIM(email)) = ?',
    [emailNorm]
  );
  if (existing.length > 0) {
    throw { code: 'EMAIL_EXISTS', message: 'Email already in use' };
  }

  const password_hash = await bcrypt.hash(password, 12);
  const id = uuidv4();

  await query(
    `INSERT INTO users (id, email, display_name, password_hash, role, assessment_completed)
     VALUES (?, ?, ?, ?, 'student', false)`,
    [id, emailNorm, displayName.trim(), password_hash]
  );

  const rows = await query<SafeUser[]>(
    `SELECT id, email, display_name, role, level, assessment_completed,
            primary_track, cpp_level, web_level, cpp_assessment_completed, web_assessment_completed,
            language_pref, theme_pref, xp, coins, streak, last_active_date,
            is_active, created_at, updated_at
     FROM users WHERE id = ?`,
    [id]
  );

  return rows[0];
}

export async function login(
  email: string,
  password: string
): Promise<{ user: SafeUser; token: string }> {
  const emailNorm = normalizeEmail(email);
  const rows = await query<User[]>(
    `SELECT id, email, display_name, password_hash, role, level, assessment_completed,
            primary_track, cpp_level, web_level, cpp_assessment_completed, web_assessment_completed,
            language_pref, theme_pref, xp, coins, streak, last_active_date,
            is_active, created_at, updated_at
     FROM users WHERE LOWER(TRIM(email)) = ?`,
    [emailNorm]
  );

  if (rows.length === 0) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
  }

  // Keep behavior consistent with `middleware/authenticate.ts` which allows a dev fallback.
  // In production, JWT_SECRET should always be set.
  const secret = process.env.JWT_SECRET ?? 'dev-secret';
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      assessment_completed: user.assessment_completed,
    },
    secret,
    { expiresIn: '7d' }
  );

  const { password_hash, ...safeUser } = user;
  return { user: safeUser as SafeUser, token };
}

/**
 * Validate the JWT from the httpOnly cookie without returning 401.
 * Used by the marketing shell to show signed-in UI without noisy failed /me requests.
 */
export async function getSessionFromToken(
  token: string | undefined
): Promise<{ authenticated: true; user: SafeUser } | { authenticated: false }> {
  if (!token || typeof token !== 'string') {
    return { authenticated: false };
  }
  try {
    const secret = process.env.JWT_SECRET ?? 'dev-secret';
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    const sub = typeof decoded.sub === 'string' ? decoded.sub : null;
    if (!sub) return { authenticated: false };
    const user = await getMe(sub);
    return { authenticated: true, user };
  } catch {
    return { authenticated: false };
  }
}

export async function getMe(userId: string): Promise<SafeUser> {
  const rows = await query<SafeUser[]>(
    `SELECT id, email, display_name, role, level, assessment_completed,
            primary_track, cpp_level, web_level, cpp_assessment_completed, web_assessment_completed,
            language_pref, theme_pref, xp, coins, streak, last_active_date,
            is_active, created_at, updated_at
     FROM users WHERE id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    throw { code: 'USER_NOT_FOUND', message: 'User not found' };
  }

  return rows[0];
}

/** First-time only: set the learning path before the placement test. */
export async function setPrimaryTrack(
  userId: string,
  track: 'cpp' | 'web'
): Promise<SafeUser> {
  const user = await getMe(userId);
  if (user.primary_track) {
    throw { code: 'TRACK_SET', message: 'Learning path is already selected.' };
  }
  if (user.assessment_completed) {
    throw { code: 'ONBOARDING_DONE', message: 'Placement is already complete.' };
  }
  await query('UPDATE users SET primary_track = ? WHERE id = ?', [track, userId]);
  return getMe(userId);
}
