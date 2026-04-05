import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';

// Routers
import authRouter from '../modules/auth/auth.router';
import assessmentRouter from '../modules/assessment/assessment.router';
import lessonsRouter from '../modules/lessons/lessons.router';
import compilerRouter from '../modules/compiler/compiler.router';
import aiTutorRouter, { warmupAiTutorGeminiCache } from '../modules/ai-tutor/ai-tutor.router';
import quizzesRouter from '../modules/quizzes/quizzes.router';
import examsRouter from '../modules/exams/exams.router';
import gamificationRouter from '../modules/gamification/gamification.router';
import leaderboardRouter from '../modules/leaderboard/leaderboard.router';
import progressRouter from '../modules/progress/progress.router';
import courseReadingsRouter from '../modules/course-readings/course-readings.router';
import certificatesRouter from '../modules/certificates/certificates.router';
import courseTrackQuizzesRouter from '../modules/course-track-quizzes/course-track-quizzes.router';
import chatRouter from '../modules/chat/chat.router';
import friendsRouter from '../modules/chat/friends.router';
import adminRouter from '../modules/admin/admin.router';
import trackCompletionVideosRouter from '../modules/track-completion-videos/track-completion-videos.router';

// WebSocket
import { attachWebSocketServer } from '../modules/chat/chat.ws';

// Cron jobs
import { runStreakWarningCron } from '../modules/notifications/streak-warning.cron';
import { runReEngagementCron } from '../modules/notifications/re-engagement.cron';

// Middleware
import { errorHandler } from '../middleware/errorHandler';

// Prefer backend/.env so the API uses the same DB as migrations (npm run migrate:* from backend/).
// If monorepo root .env is loaded first, DB_NAME can differ and course_track_* tables appear "missing".
(() => {
  const candidates = [
    path.resolve(process.cwd(), 'backend', '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '..', '.env'),
    path.resolve(process.cwd(), '.env'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      dotenv.config({ path: p });
      return;
    }
  }
  dotenv.config();
})();

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(helmet());
const allowedCorsOrigins = new Set([
  process.env.FRONTEND_URL ?? 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedCorsOrigins.has(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser() as any);

// Serve certificate PDFs statically
app.use('/certificates', express.static('public/certificates'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/assessment', assessmentRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/compiler', compilerRouter);
app.use('/api/ai-tutor', aiTutorRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/exams', examsRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/progress', progressRouter);
app.use('/api/course-readings', courseReadingsRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/course-track-quizzes', courseTrackQuizzesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/track-completion-videos', trackCompletionVideosRouter);

// Global error handler (must be last)
app.use(errorHandler);

// Create HTTP server and attach WebSocket
const server = http.createServer(app);
attachWebSocketServer(server);

// Cron jobs — run hourly check for streak warnings, daily for re-engagement
setInterval(runStreakWarningCron, 60 * 60 * 1000); // every hour

// Daily at 08:00 UTC
function scheduleDailyCron() {
  const now = new Date();
  const next8am = new Date(now);
  next8am.setUTCHours(8, 0, 0, 0);
  if (next8am <= now) next8am.setUTCDate(next8am.getUTCDate() + 1);
  const delay = next8am.getTime() - now.getTime();
  setTimeout(() => {
    runReEngagementCron();
    setInterval(runReEngagementCron, 24 * 60 * 60 * 1000);
  }, delay);
}
scheduleDailyCron();

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  setImmediate(() => {
    void warmupAiTutorGeminiCache();
  });
});

export default app;
