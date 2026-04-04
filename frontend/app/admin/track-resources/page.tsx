'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  trackCompletionVideosApi,
  type TrackCompletionVideo,
} from '@/lib/api';
import { parseYoutubeVideoId, youtubeDefaultThumbnail } from '@/lib/youtube';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useDialog } from '@/components/ui/DialogProvider';
import { cn } from '@/lib/cn';

type Track = 'cpp' | 'web';

const emptyForm = { youtube_url: '', title: '', description: '', thumbnail_url: '' };

function TrackForm({
  track,
  label,
  accent,
  initial,
  onSaved,
}: {
  track: Track;
  label: string;
  accent: 'blue' | 'teal';
  initial: TrackCompletionVideo | undefined;
  onSaved: (v: TrackCompletionVideo | null) => void;
}) {
  const { show } = useDialog();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        youtube_url: initial.youtube_url,
        title: initial.title,
        description: initial.description ?? '',
        thumbnail_url: initial.thumbnail_url ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  const previewThumb = useMemo(() => {
    const custom = form.thumbnail_url.trim();
    if (custom) return custom;
    const id = parseYoutubeVideoId(form.youtube_url);
    return id ? youtubeDefaultThumbnail(id) : null;
  }, [form.youtube_url, form.thumbnail_url]);

  async function save() {
    setSaving(true);
    try {
      const r = await trackCompletionVideosApi.upsert(track, {
        youtube_url: form.youtube_url,
        title: form.title,
        description: form.description.trim() || null,
        thumbnail_url: form.thumbnail_url.trim() || null,
      });
      onSaved(r.data.video);
      show({ variant: 'success', title: 'Saved', message: `${label} optional resource updated.` });
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { error?: string; code?: string } };
      };
      const code = ax.response?.data?.code;
      const serverMsg = ax.response?.data?.error;
      const status = ax.response?.status;
      let message =
        code === 'INVALID_YOUTUBE_URL'
          ? 'Enter a valid YouTube link (watch, youtu.be, embed, or shorts).'
          : code === 'TABLE_MISSING'
            ? serverMsg ??
              'Run database migration: in the backend folder, npm run migrate:006 — then try again.'
            : status === 403
              ? 'Your session does not have admin access. Sign out and sign in again after being granted admin.'
              : serverMsg && status && status >= 400
                ? serverMsg
                : 'Try again or check that you are signed in as admin.';
      show({
        variant: 'error',
        title: 'Could not save',
        message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function clear() {
    show({
      variant: 'confirm',
      title: 'Remove optional resource?',
      message: `Learners will no longer see this extra video for ${label}.`,
      primaryAction: {
        label: 'Remove',
        onClick: async () => {
          try {
            await trackCompletionVideosApi.delete(track);
            setForm(emptyForm);
            onSaved(null);
            show({ variant: 'success', title: 'Removed', message: 'Optional resource cleared for this track.' });
          } catch {
            show({ variant: 'error', title: 'Error', message: 'Could not remove. Try again.' });
          }
        },
      },
    });
  }

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 bg-white dark:bg-gray-900/40',
        accent === 'blue'
          ? 'border-blue-200/90 dark:border-blue-900/50'
          : 'border-teal-200/90 dark:border-teal-900/50'
      )}
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{label}</h2>
      <div className="space-y-4 max-w-xl">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">YouTube URL</label>
          <input
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            value={form.youtube_url}
            onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
          <input
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Shown above the video"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
          <textarea
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm min-h-[88px]"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional — supports line breaks"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Custom thumbnail URL <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            value={form.thumbnail_url}
            onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
            placeholder="Leave empty to use YouTube default"
          />
        </div>
      </div>

      {previewThumb ? (
        <div className="mt-6">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Thumbnail preview</p>
          <div className="rounded-xl overflow-hidden max-w-md border border-gray-200 dark:border-gray-700 aspect-video bg-gray-100 dark:bg-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewThumb} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Enter a valid YouTube URL to preview the default thumbnail.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={() => void save()} loading={saving}>
          Save
        </Button>
        {initial?.id ? (
          <Button variant="outline" onClick={() => void clear()}>
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminTrackResourcesPage() {
  const [byTrack, setByTrack] = useState<Partial<Record<Track, TrackCompletionVideo>>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    trackCompletionVideosApi
      .list()
      .then((r) => {
        const next: Partial<Record<Track, TrackCompletionVideo>> = {};
        for (const v of r.data.videos) {
          next[v.track] = v;
        }
        setByTrack(next);
      })
      .catch(() => setByTrack({}))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleSaved(track: Track, video: TrackCompletionVideo | null) {
    if (!video) {
      setByTrack((prev) => {
        const n = { ...prev };
        delete n[track];
        return n;
      });
      return;
    }
    setByTrack((prev) => ({ ...prev, [track]: video }));
  }

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Optional track resources</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 max-w-2xl leading-relaxed">
        Add an extra YouTube link per track (C++ or Web fundamentals) for learners who want more material after they
        finish the readings. Watching is optional — it is not required for progress or certificates. Thumbnail preview
        uses your custom URL if set; otherwise the standard YouTube preview image is used.
      </p>
      <div className="grid gap-8 md:grid-cols-2">
        <TrackForm
          track="cpp"
          label="C++ track"
          accent="blue"
          initial={byTrack.cpp}
          onSaved={(v) => handleSaved('cpp', v)}
        />
        <TrackForm
          track="web"
          label="Web fundamentals"
          accent="teal"
          initial={byTrack.web}
          onSaved={(v) => handleSaved('web', v)}
        />
      </div>
    </div>
  );
}
