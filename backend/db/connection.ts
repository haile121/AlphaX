import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'amharic_cpp_platform',
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 10,
      /** Return DECIMAL as JS numbers so certificate / final-score queries parse reliably. */
      decimalNumbers: true,
    });
  }
  return pool;
}

/** Run queries atomically (e.g. replace progress without partial deletes). */
export async function withTransaction<T>(fn: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T> {
  try {
    const [rows] = await getPool().query(sql, params);
    return rows as T;
  } catch (error: any) {
    // Keep the backend usable even without DB during local setup.
    if (
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ER_ACCESS_DENIED_ERROR' ||
      error?.code === 'ER_BAD_DB_ERROR' ||
      error?.code === 'ER_HOST_NOT_PRIVILEGED' ||
      error?.code === 'ENOTFOUND'
    ) {
      console.warn('[db] connection not available; returning empty result');
      return [] as T;
    }
    throw error;
  }
}
