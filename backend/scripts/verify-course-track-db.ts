/**
 * Prints which DB is configured and whether course-track tables exist.
 * Run from backend/: npm run check:course-db
 */
import mysql from 'mysql2/promise';
import { loadBackendEnv } from './loadBackendEnv';

loadBackendEnv();

async function main() {
  const host = process.env.DB_HOST ?? '127.0.0.1';
  const port = Number(process.env.DB_PORT ?? 3306);
  const database = process.env.DB_NAME ?? 'amharic_cpp_platform';

  console.log(`Checking MySQL ${host}:${port} database "${database}"…`);

  const conn = await mysql.createConnection({
    host,
    port,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database,
    charset: 'utf8mb4',
  });

  try {
    const [rows] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) AS c FROM information_schema.tables
       WHERE table_schema = ? AND table_name = 'course_track_quizzes'`,
      [database]
    );
    const c = Number((rows[0] as { c: number }).c ?? 0);
    if (c > 0) {
      const [count] = await conn.query<mysql.RowDataPacket[]>(
        'SELECT COUNT(*) AS n FROM course_track_quizzes'
      );
      const n = Number((count[0] as { n: number }).n ?? 0);
      console.log(`OK: course_track_quizzes exists with ${n} quiz row(s).`);
      if (n === 0) {
        console.log('Run: npm run seed:course-track-quizzes');
        process.exitCode = 1;
      }
    } else {
      console.log('MISSING: course_track_quizzes — run: npm run migrate:005 && npm run seed:course-track-quizzes');
      console.log('If you use a monorepo root .env, ensure backend/.env has the same DB_NAME as migrations.');
      process.exitCode = 1;
    }
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
