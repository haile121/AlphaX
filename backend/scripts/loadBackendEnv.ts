import path from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

/** Prefer `backend/.env` over the monorepo root `.env` so migrations hit the same DB as `npm run dev` in backend/. */
export function loadBackendEnv(): void {
  const candidates = [
    path.resolve(process.cwd(), 'backend', '.env'),
    path.join(__dirname, '..', '.env'),
    path.resolve(process.cwd(), '.env'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      dotenv.config({ path: p });
      return;
    }
  }
  dotenv.config();
}
