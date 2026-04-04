/**
 * Prints DB name, course_track_quiz_attempts rows, and final quiz rows.
 * Run from backend/: npx tsx scripts/diagnose-track-cert.ts
 */
import mysql from 'mysql2/promise';
import { loadBackendEnv } from './loadBackendEnv';

loadBackendEnv();

async function main() {
  const host = process.env.DB_HOST ?? '127.0.0.1';
  const port = Number(process.env.DB_PORT ?? 3306);
  const database = process.env.DB_NAME ?? 'amharic_cpp_platform';
  const user = process.env.DB_USER ?? 'root';
  const password = process.env.DB_PASSWORD ?? '';

  console.log(`DB: ${database} @ ${host}:${port} (user ${user})`);

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    charset: 'utf8mb4',
  });

  try {
    const [tables] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) AS c FROM information_schema.tables
       WHERE table_schema = ? AND table_name = 'course_track_quiz_attempts'`,
      [database]
    );
    if (Number((tables[0] as { c: number }).c) === 0) {
      console.log('MISSING table course_track_quiz_attempts — run npm run migrate:005');
      return;
    }

    const [attempts] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) AS c FROM course_track_quiz_attempts`
    );
    console.log('course_track_quiz_attempts total rows:', (attempts[0] as { c: number }).c);

    const [byQuiz] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT quiz_id, COUNT(*) AS n FROM course_track_quiz_attempts GROUP BY quiz_id ORDER BY n DESC`
    );
    console.log('By quiz_id:', byQuiz);

    const [finals] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT id, track, is_final FROM course_track_quizzes WHERE id IN ('web-final','cpp-final')`
    );
    console.log('Final quiz rows:', finals);

    const [sample] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT user_id, quiz_id, score, passed FROM course_track_quiz_attempts
       WHERE quiz_id IN ('web-final','cpp-final') ORDER BY created_at DESC LIMIT 8`
    );
    console.log('Recent final attempts:', sample);

    const [reading] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) AS c FROM course_reading_progress`
    );
    console.log('course_reading_progress rows:', (reading[0] as { c: number }).c);
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
