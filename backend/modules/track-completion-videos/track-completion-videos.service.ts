import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/connection';
import { isMissingTableError, warnMissingMigrationOnce } from '../../db/mysqlErrors';
import { parseYoutubeVideoId, youtubeDefaultThumbnail, youtubeEmbedUrl } from './youtube';

export type TrackKey = 'cpp' | 'web';

export interface TrackCompletionVideoRow {
  id: string;
  track: TrackKey;
  youtube_url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
}

export interface TrackCompletionVideoPublic extends TrackCompletionVideoRow {
  video_id: string;
  embed_url: string;
  preview_thumbnail_url: string;
}

function toPublic(row: TrackCompletionVideoRow): TrackCompletionVideoPublic | null {
  const video_id = parseYoutubeVideoId(row.youtube_url);
  if (!video_id) return null;
  const embed_url = youtubeEmbedUrl(video_id);
  const preview_thumbnail_url =
    row.thumbnail_url?.trim() || youtubeDefaultThumbnail(video_id);
  return {
    ...row,
    video_id,
    embed_url,
    preview_thumbnail_url,
  };
}

export async function listTrackCompletionVideos(): Promise<TrackCompletionVideoPublic[]> {
  try {
    const rows = await query<TrackCompletionVideoRow[]>(
      `SELECT id, track, youtube_url, title, description, thumbnail_url
       FROM track_completion_videos
       ORDER BY track ASC`
    );
    const out: TrackCompletionVideoPublic[] = [];
    for (const row of rows) {
      const pub = toPublic(row);
      if (pub) out.push(pub);
    }
    return out;
  } catch (err: unknown) {
    if (isMissingTableError(err)) {
      warnMissingMigrationOnce(
        'track_completion_videos',
        '[track-completion-videos] table missing — run: npm run migrate:006 (from backend/)'
      );
      return [];
    }
    throw err;
  }
}

export async function upsertTrackCompletionVideo(
  track: TrackKey,
  data: {
    youtube_url: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
  }
): Promise<TrackCompletionVideoPublic> {
  const video_id = parseYoutubeVideoId(data.youtube_url);
  if (!video_id) {
    const err = new Error('Invalid YouTube URL') as Error & { code?: string };
    err.code = 'INVALID_YOUTUBE_URL';
    throw err;
  }

  const yt = data.youtube_url.trim();
  const title = data.title.trim();
  const desc = data.description?.trim() || null;
  const thumb = data.thumbnail_url?.trim() || null;
  const id = uuidv4();

  try {
    // Single write: UNIQUE(track) — avoids SELECT/INSERT races and works with mysql2 result shapes.
    await query(
      `INSERT INTO track_completion_videos (id, track, youtube_url, title, description, thumbnail_url)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         youtube_url = VALUES(youtube_url),
         title = VALUES(title),
         description = VALUES(description),
         thumbnail_url = VALUES(thumbnail_url),
         updated_at = CURRENT_TIMESTAMP`,
      [id, track, yt, title, desc, thumb]
    );
  } catch (err: unknown) {
    if (isMissingTableError(err)) {
      const e = new Error('track_completion_videos table missing') as Error & { code?: string };
      e.code = 'TABLE_MISSING';
      throw e;
    }
    throw err;
  }

  const rows = await query<TrackCompletionVideoRow[]>(
    `SELECT id, track, youtube_url, title, description, thumbnail_url
     FROM track_completion_videos WHERE track = ? LIMIT 1`,
    [track]
  );
  if (!Array.isArray(rows) || !rows[0]) {
    const err = new Error('Could not read row after save') as Error & { code?: string };
    err.code = 'UPSERT_READ_FAILED';
    throw err;
  }
  const row = rows[0];
  const pub = toPublic(row);
  if (!pub) {
    const err = new Error('Invalid YouTube URL') as Error & { code?: string };
    err.code = 'INVALID_YOUTUBE_URL';
    throw err;
  }
  return pub;
}

export async function deleteTrackCompletionVideo(track: TrackKey): Promise<boolean> {
  const r = await query<unknown>('DELETE FROM track_completion_videos WHERE track = ?', [track]);
  if (Array.isArray(r)) return false;
  const n = (r as { affectedRows?: number }).affectedRows ?? 0;
  return n > 0;
}
