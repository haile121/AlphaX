'use client';

import { useEffect, useState, useCallback } from 'react';
import { progressApi, type ProgressData, type NotificationItem } from '@/lib/api';
import { useGamificationRefresh } from '@/lib/gamificationRefresh';
import { useDialog } from '@/components/ui/DialogProvider';
import { XPBar } from '@/components/shared/XPBar';
import { StreakIndicator } from '@/components/shared/StreakIndicator';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

function formatNotificationDate(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useDialog();

  const refreshProgress = useCallback(async () => {
    try {
      const [progressRes, notifRes] = await Promise.all([
        progressApi.get(),
        progressApi.notifications(),
      ]);
      setData(progressRes.data);
      setNotifications(notifRes.data.notifications);
    } catch {
      /* keep existing data on background refresh */
    }
  }, []);

  const fetchInitial = useCallback(async () => {
    try {
      const [progressRes, notifRes] = await Promise.all([
        progressApi.get(),
        progressApi.notifications(),
      ]);
      setData(progressRes.data);
      setNotifications(notifRes.data.notifications);
    } catch {
      show({ variant: 'error', title: 'Error', message: 'Failed to load progress data.' });
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    void fetchInitial();
    const interval = setInterval(() => {
      progressApi.notifications().then((r) => setNotifications(r.data.notifications)).catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchInitial]);

  useGamificationRefresh(refreshProgress);

  async function markAllRead() {
    await progressApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!data) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Progress</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'XP', value: data.xp.toLocaleString(), icon: '⚡' },
          { label: 'Coins', value: data.coins.toLocaleString(), icon: '🪙' },
          { label: 'Badges', value: data.badge_count, icon: '🏅' },
          { label: 'Level', value: data.level ?? '—', icon: '📊' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white capitalize">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Streak + XP bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <StreakIndicator streak={data.streak} />
        <XPBar xp={data.xp} />
      </div>

      {/* Per-level progress */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Level Progress</h2>
        <div className="space-y-4">
          {data.levels.map((lvl) => (
            <div key={lvl.level_id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900 dark:text-white capitalize">{lvl.label_en}</span>
                <Badge variant={lvl.completion_pct === 100 ? 'success' : 'default'}>{lvl.completion_pct}%</Badge>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${lvl.completion_pct}%` }}
                />
              </div>
              <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>📖 {lvl.lessons.completed}/{lvl.lessons.total} lessons</span>
                <span>📝 {lvl.quizzes.passed}/{lvl.quizzes.total} quizzes</span>
                <span>🎓 {lvl.exams.passed}/{lvl.exams.total} exams</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications {unreadCount > 0 && <Badge variant="default">{unreadCount}</Badge>}
          </h2>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-accent hover:underline">
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications yet.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border text-sm ${
                  n.is_read
                    ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    : 'border-accent/30 bg-accent/5 text-gray-900 dark:text-white'
                }`}
              >
                <p className="font-medium">{n.title_en}</p>
                <p className="mt-0.5">{n.body_en}</p>
                <p className="text-xs text-gray-400 mt-1">{formatNotificationDate(n.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
