/**
 * Applies db/migrations/004_normalize_streaks.sql (run from backend/: npm run migrate:004).
 */
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const sqlPath = path.join(process.cwd(), 'db', 'migrations', '004_normalize_streaks.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Missing file:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'amharic_cpp_platform',
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  try {
    await conn.query(sql);
    console.log('Migration 004 applied successfully.');
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
