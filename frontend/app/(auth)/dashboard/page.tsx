'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { authApi } from '@/lib/api';
import { gamificationApi } from '@/lib/api';
import { useGamificationRefresh } from '@/lib/gamificationRefresh';
import { syncCourseReadingProgressWithServer } from '@/lib/courseReadingProgress';
import { XPBar } from '@/components/shared/XPBar';
import { StreakIndicator } from '@/components/shared/StreakIndicator';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';
import type { Level, User } from '@/types';
import { CPP_CHAPTERS, WEB_CHAPTERS } from '@/lib/chapter1Curriculum';
import { BookOpen, Terminal, Bot, Trophy, BarChart, MessageSquare, Coins, ChevronRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/cn';

const CPP_LESSON_IDS = CPP_CHAPTERS.flatMap((c) => c.lessons.map((l) => l.id));
const WEB_LESSON_IDS = WEB_CHAPTERS.flatMap((c) => c.lessons.map((l) => l.id));

function formatPlacementLevel(level: Level | null | undefined): string {
  if (!level) return 'Not assessed';
  const labels: Record<Level, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return labels[level] ?? level;
}

const QUICK_LINKS = [
  { href: '/lessons', label: 'Lessons', icon: BookOpen, desc: 'Continue learning C++', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { href: '/compiler', label: 'Compiler', icon: Terminal, desc: 'Write and run C++ code', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { href: '/ai-tutor', label: 'AI Tutor', icon: Bot, desc: 'Get hints and guidance', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy, desc: 'See how you rank', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { href: '/progress', label: 'Progress', icon: BarChart, desc: 'Track your journey', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { href: '/chat', label: 'Chat', icon: MessageSquare, desc: 'Talk with friends', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ xp: number; coins: number; streak: number } | null>(null);
  const [readingDone, setReadingDone] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    try {
      const [meRes, profRes, completedIds] = await Promise.all([
        authApi.me(),
        gamificationApi.profile(),
        syncCourseReadingProgressWithServer(),
      ]);
      setUser(meRes.data.user);
      setProfile(profRes.data.profile);
      setReadingDone(completedIds);
    } catch {
      // keep previous snapshot
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refreshStats();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshStats]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void refreshStats();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [refreshStats]);

  useGamificationRefresh(refreshStats);

  const cppReading = useMemo(() => {
    const done = CPP_LESSON_IDS.filter((id) => readingDone.includes(id)).length;
    const total = CPP_LESSON_IDS.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [readingDone]);

  const webReading = useMemo(() => {
    const done = WEB_LESSON_IDS.filter((id) => readingDone.includes(id)).length;
    const total = WEB_LESSON_IDS.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [readingDone]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;

  return (
    <motion.div 
      className="max-w-5xl mx-auto px-4 py-10 sm:py-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Welcome */}
      <motion.div variants={itemVariants} className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Welcome back, <span className="text-accent">{user?.display_name ?? 'there'}</span> 👋
        </h1>
        <div className="mt-3 space-y-2 text-left max-w-xl mx-auto sm:mx-0">
          {user?.primary_track ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Primary focus:{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {user.primary_track === 'cpp' ? 'C++' : 'Web fundamentals'}
              </span>
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-8 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <span className="text-gray-500 dark:text-gray-500">C++</span>
              {' · '}
              Level:{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                {formatPlacementLevel(user?.cpp_level)}
              </span>
            </p>
            <p>
              <span className="text-gray-500 dark:text-gray-500">Web fundamentals</span>
              {' · '}
              Level:{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                {formatPlacementLevel(user?.web_level)}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Per-track reading progress */}
      <motion.div
        variants={itemVariants}
        className="mb-10 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Reading progress (separate by track)
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">C++</span>
              <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                {cppReading.done}/{cppReading.total} sessions · {cppReading.pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500 transition-[width] duration-500"
                style={{ width: `${cppReading.pct}%` }}
              />
            </div>
            <Link
              href="/lessons"
              className="mt-2 inline-block text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Open C++ lessons
            </Link>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Web fundamentals</span>
              <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                {webReading.done}/{webReading.total} sessions · {webReading.pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-[width] duration-500',
                  'from-violet-600 to-fuchsia-500'
                )}
                style={{ width: `${webReading.pct}%` }}
              />
            </div>
            <Link
              href="/lessons"
              className="mt-2 inline-block text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              Open Web lessons
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      {profile && (
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl font-medium">
              <StreakIndicator streak={profile.streak} />
            </div>
            <div className="flex items-center bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl font-medium">
              <Coins className="w-5 h-5 mr-2" />
              <span>{profile.coins} coins</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
              <span>Experience</span>
              <span className="text-accent">{profile.xp} XP</span>
            </div>
            <XPBar xp={profile.xp} />
          </div>
        </motion.div>
      )}

      {/* Quick links */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
          >
            <motion.div 
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full shadow-sm hover:shadow-md hover:border-accent/30 dark:hover:border-accent/40 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className={`w-12 h-12 rounded-xl ${link.bg} ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <link.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-accent transition-colors">
                {link.label}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {link.desc}
              </p>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
