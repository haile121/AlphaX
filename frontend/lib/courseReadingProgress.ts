'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { courseReadingsApi } from '@/lib/api';
import { ALL_LESSON_IDS, normalizeLegacyLessonId } from '@/lib/courseCurriculum';
import { readCompletedLessonIds, writeCompletedLessonIds } from '@/lib/lessonProgressClient';

const ALLOWED = new Set(ALL_LESSON_IDS);

function filterAllowed(ids: string[]): string[] {
  return ids.map(normalizeLegacyLessonId).filter((id) => ALLOWED.has(id));
}

function sortByCurriculum(ids: string[]): string[] {
  return [...new Set(ids)].sort((a, b) => ALL_LESSON_IDS.indexOf(a) - ALL_LESSON_IDS.indexOf(b));
}

/** Matches the `logged_in` flag cookie used with httpOnly JWT (see ClientLayoutWrapper). */
export function isLoggedInForSync(): boolean {
  if (typeof document === 'undefined') return false;
  return !!Cookies.get('logged_in');
}

/**
 * Avoid hydration mismatches: cookie is unavailable on the server, so `ready` is false
 * until after mount, then `signedIn` reflects `logged_in`.
 */
export function useAuthSyncHint(): { ready: boolean; signedIn: boolean } {
  const [state, setState] = useState<{ ready: boolean; signedIn: boolean }>({ ready: false, signedIn: false });
  useEffect(() => {
    setState({ ready: true, signedIn: isLoggedInForSync() });
  }, []);
  return state;
}

/**
 * Merge local + server progress when signed in; upload local-only completions to the API.
 * When signed out, returns local cache only.
 */
export async function syncCourseReadingProgressWithServer(): Promise<string[]> {
  const local = sortByCurriculum(filterAllowed(readCompletedLessonIds()));

  if (!isLoggedInForSync()) {
    return local;
  }

  try {
    const { data } = await courseReadingsApi.getProgress();
    const server = sortByCurriculum(filterAllowed(data.completed_lesson_ids));
    const merged = sortByCurriculum([...local, ...server]);

    const needsPush =
      merged.length !== server.length || merged.some((id) => !server.includes(id));

    if (needsPush) {
      const { data: after } = await courseReadingsApi.putProgress(merged);
      writeCompletedLessonIds(after.completed_lesson_ids);
      return after.completed_lesson_ids;
    }

    writeCompletedLessonIds(server);
    return server;
  } catch {
    return local;
  }
}

export type MarkLessonCompleteResult = {
  xp_awarded: number;
  coins_awarded: number;
  /** True when the server accepted the completion (including duplicate idempotent calls). */
  synced: boolean;
};

/** Rewards are only non-zero when the server records a first-time completion for this lesson (signed in). */
export async function markLessonCompleteSynced(lessonId: string): Promise<MarkLessonCompleteResult> {
  const none: MarkLessonCompleteResult = { xp_awarded: 0, coins_awarded: 0, synced: false };
  const id = normalizeLegacyLessonId(lessonId);
  if (!ALLOWED.has(id)) return none;

  const current = sortByCurriculum(filterAllowed(readCompletedLessonIds()));
  if (!current.includes(id)) {
    current.push(id);
    current.sort((a, b) => ALL_LESSON_IDS.indexOf(a) - ALL_LESSON_IDS.indexOf(b));
  }
  writeCompletedLessonIds(current);

  if (!isLoggedInForSync()) return none;

  try {
    const { data } = await courseReadingsApi.postComplete(id);
    writeCompletedLessonIds(data.completed_lesson_ids);
    return {
      xp_awarded: data.xp_awarded ?? 0,
      coins_awarded: data.coins_awarded ?? 0,
      synced: true,
    };
  } catch {
    // Offline or server error — local cache already updated; sync will retry on next load.
    return none;
  }
}
