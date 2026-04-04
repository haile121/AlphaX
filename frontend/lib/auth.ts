import Cookies from 'js-cookie';

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'student' | 'admin';
  assessment_completed: boolean;
  exp: number;
}

export function getTokenPayload(): JwtPayload | null {
  try {
    const token = Cookies.get('token');
    if (!token) return null;
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const decoded = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const payload = getTokenPayload();
  if (!payload) return false;
  return payload.exp * 1000 > Date.now();
}

export function getToken(): string | null {
  // Token is httpOnly — can't read it from JS
  // Use the ws_token cookie set by the backend for WebSocket auth
  try {
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [k, v] = c.trim().split('=');
      if (k === 'ws_token') return decodeURIComponent(v);
    }
    return null;
  } catch {
    return null;
  }
}
