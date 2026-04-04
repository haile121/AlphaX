import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as authService from './auth.service';
import { authenticate } from '../../middleware/authenticate';
import { updateStreak } from '../gamification/gamification.service';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// A non-httpOnly flag cookie so the frontend JS can detect auth state
const FLAG_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, display_name, displayName, password } = req.body;
    const name = display_name ?? displayName;

    if (!email || !name || !password) {
      res.status(400).json({ error: 'email, display_name, and password are required' });
      return;
    }

    const user = await authService.register(email, name, password);

    // Sign a token for the newly registered user
    const { token } = await authService.login(email, password);

    res.cookie('token', token, COOKIE_OPTIONS);
    res.cookie('logged_in', '1', FLAG_COOKIE_OPTIONS);
    await updateStreak(user.id).catch(() => {}); // daily streak (login day), not XP
    res.status(201).json({ user: { ...user, assessment_completed: false } });
  } catch (err: any) {
    console.error('[register error]', err);
    if (err?.code === 'EMAIL_EXISTS') {
      res.status(409).json({ error: err.message, code: err.code });
    } else {
      res.status(500).json({ error: err?.message ?? 'Internal server error' });
    }
  }
});

// POST /login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    const { user, token } = await authService.login(email, password);

    res.cookie('token', token, COOKIE_OPTIONS);
    res.cookie('logged_in', '1', FLAG_COOKIE_OPTIONS);
    await updateStreak(user.id).catch(() => {}); // daily streak (login day), not XP
    res.json({ user });
  } catch (err: any) {
    if (err?.code === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: err.message, code: err.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /logout
router.post('/logout', (_req: Request, res: Response): void => {
  const secure = process.env.NODE_ENV === 'production';
  // Clear with matching attributes to maximize cross-browser reliability.
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure, path: '/' });
  res.clearCookie('logged_in', { sameSite: 'lax', secure, path: '/' });
  res.clearCookie('ws_token', { sameSite: 'lax', secure, path: '/' });
  res.json({ message: 'Logged out' });
});

// GET /ws-token — returns a readable cookie for WebSocket auth
router.get('/ws-token', authenticate, (req: Request, res: Response): void => {
  // Re-issue the same token as a non-httpOnly cookie so the WS client can read it
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.cookie('ws_token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

// GET /me — streak is updated on POST /login and /register only (not on browsing while logged in).
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authService.getMe(req.user!.sub);
    res.json({ user });
  } catch (err: any) {
    if (err?.code === 'USER_NOT_FOUND') {
      res.status(404).json({ error: err.message, code: err.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

const primaryTrackSchema = z.object({
  primary_track: z.enum(['cpp', 'web']),
});

// PATCH /primary-track — choose Web fundamentals vs C++ before the first placement test
router.patch('/primary-track', authenticate, async (req: Request, res: Response): Promise<void> => {
  const parsed = primaryTrackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'primary_track must be cpp or web' });
    return;
  }
  try {
    const user = await authService.setPrimaryTrack(req.user!.sub, parsed.data.primary_track);
    res.json({ user });
  } catch (err: any) {
    if (err?.code === 'TRACK_SET' || err?.code === 'ONBOARDING_DONE') {
      res.status(409).json({ error: err.message, code: err.code });
      return;
    }
    console.error('[auth/primary-track]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
