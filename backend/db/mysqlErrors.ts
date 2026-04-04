/** MySQL "table doesn't exist" — e.g. migration not applied yet. */
export function isMissingTableError(err: unknown): boolean {
  const unwrap = (e: unknown): unknown => {
    if (e && typeof e === 'object' && 'cause' in e && (e as { cause: unknown }).cause) {
      return unwrap((e as { cause: unknown }).cause);
    }
    return e;
  };
  const e = unwrap(err) as { code?: string; errno?: number; sqlMessage?: string; message?: string };
  if (e.code === 'ER_NO_SUCH_TABLE' || e.errno === 1146) return true;
  const msg = String(e.sqlMessage ?? e.message ?? '');
  return /doesn't exist|does not exist/i.test(msg) && /Table|table/i.test(msg);
}

const warnedKeys = new Set<string>();

/** Avoid spamming the console when the same missing-table path hits on every request. */
export function warnMissingMigrationOnce(key: string, message: string): void {
  if (warnedKeys.has(key)) return;
  warnedKeys.add(key);
  console.warn(message);
}

/** Only migration 005 quiz tables — not e.g. course_reading_progress (different migration). */
export function isMissingCourseTrackQuizTableError(err: unknown): boolean {
  if (!isMissingTableError(err)) return false;
  const msg = String(
    (err as { sqlMessage?: string; message?: string }).sqlMessage ??
      (err as { message?: string }).message ??
      ''
  );
  return /course_track_quizzes|course_track_quiz_questions|course_track_quiz_attempts/i.test(msg);
}

/** Any table from migration 005 (quizzes + track certs). */
export function isMissingMigration005TableError(err: unknown): boolean {
  if (!isMissingTableError(err)) return false;
  const msg = String(
    (err as { sqlMessage?: string; message?: string }).sqlMessage ??
      (err as { message?: string }).message ??
      ''
  );
  return /course_track_quizzes|course_track_quiz_questions|course_track_quiz_attempts|track_completion_certificates/i.test(
    msg
  );
}
