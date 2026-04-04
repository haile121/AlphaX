'use client';

import { useEffect, useState, useCallback } from 'react';
import { leaderboardApi, type LeaderboardEntry } from '@/lib/api';
import { useGamificationRefresh } from '@/lib/gamificationRefresh';
import { useDialog } from '@/components/ui/DialogProvider';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

type Tab = 'global' | 'level' | 'friends';

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'text-green-500',
  intermediate: 'text-yellow-500',
  advanced: 'text-red-500',
};

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('global');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { show } = useDialog();

  const loadLeaderboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const fetcher =
      tab === 'global' ? leaderboardApi.global :
      tab === 'level'  ? leaderboardApi.level  :
                         leaderboardApi.friends;

    try {
      const res = await fetcher();
      setData(res.data.leaderboard);
      setMyRank(res.data.myRank);
    } catch {
      if (!silent) {
        show({ variant: 'error', title: 'Error', message: 'Failed to load leaderboard.' });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [tab, show]);

  useEffect(() => {
    void loadLeaderboard(false);
  }, [loadLeaderboard]);

  useGamificationRefresh(() => {
    void loadLeaderboard(true);
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'global', label: 'Global' },
    { key: 'level', label: 'My Level' },
    { key: 'friends', label: 'Friends' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Leaderboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : data.length === 0 && !myRank ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-16">No data yet.</p>
      ) : data.length === 0 && myRank ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No other learners in this view yet. Your rank is shown below.
        </p>
      ) : (
        <div className="space-y-2">
          {data.map((entry) => {
            const isMe = myRank?.user_id === entry.user_id;
            return (
              <div
                key={entry.user_id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  isMe
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                {/* Rank */}
                <span className={`w-8 text-center font-bold text-lg ${
                  entry.rank === 1 ? 'text-yellow-500' :
                  entry.rank === 2 ? 'text-gray-400' :
                  entry.rank === 3 ? 'text-amber-600' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
                </span>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isMe ? 'text-accent' : 'text-gray-900 dark:text-white'}`}>
                    {entry.display_name} {isMe && <span className="text-xs">(you)</span>}
                  </p>
                  {entry.level && (
                    <p className={`text-xs capitalize ${LEVEL_COLORS[entry.level] ?? 'text-gray-400'}`}>
                      {entry.level}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">🔥 {entry.streak}</span>
                  <Badge variant={isMe ? 'success' : 'default'}>{entry.xp.toLocaleString()} XP</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* My rank sticky footer if not in top view */}
      {myRank && !loading && data.findIndex((e) => e.user_id === myRank.user_id) === -1 && (
        <div className="mt-4 p-4 rounded-xl border border-accent bg-accent/5 flex items-center gap-4">
          <span className="font-bold text-accent">#{myRank.rank}</span>
          <span className="flex-1 font-medium text-accent">{myRank.display_name} (you)</span>
          <Badge variant="success">{myRank.xp.toLocaleString()} XP</Badge>
        </div>
      )}
    </div>
  );
}
