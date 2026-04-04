'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { motion, Variants } from 'framer-motion';
import {
  Users,
  ClipboardList,
  BookOpen,
  Activity,
  BarChart3,
  Library,
} from 'lucide-react';
import {
  AdminStatsCharts,
  type AdminStatsPayload,
} from '@/components/admin/AdminStatsCharts';

const EMPTY_STATS: AdminStatsPayload = {
  total_users: 0,
  active_users: 0,
  avg_quiz_score: 0,
  total_quiz_attempts: 0,
  lesson_completion_rate: 0,
  streak_distribution: [],
  signups_by_day: [],
  users_by_level: [],
  role_breakdown: [],
  quiz_score_buckets: [],
  total_lessons: 0,
  published_lessons: 0,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 320, damping: 26 },
  },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStatsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Partial<AdminStatsPayload>>('/api/admin/stats')
      .then((r) => setStats({ ...EMPTY_STATS, ...r.data }))
      .catch(() => setStats(EMPTY_STATS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!stats) return null;

  const STAT_CARDS = [
    {
      label: 'Total users',
      value: stats.total_users.toLocaleString(),
      sub: `${stats.active_users.toLocaleString()} active`,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Quiz attempts',
      value: stats.total_quiz_attempts.toLocaleString(),
      sub: `Avg score ${stats.avg_quiz_score}%`,
      icon: ClipboardList,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Lesson completion',
      value: `${stats.lesson_completion_rate}%`,
      sub: 'Across curriculum',
      icon: BookOpen,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Lessons',
      value: stats.published_lessons.toLocaleString(),
      sub: `${stats.total_lessons} total in CMS`,
      icon: Library,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Avg quiz score',
      value: `${stats.avg_quiz_score}%`,
      sub: 'All attempts',
      icon: BarChart3,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'Engagement',
      value:
        stats.total_users > 0
          ? `${Math.round((stats.active_users / stats.total_users) * 100)}%`
          : '—',
      sub: 'Active share of accounts',
      icon: Activity,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
  ];

  return (
    <motion.div
      className="max-w-7xl mx-auto px-6 py-10 sm:py-14"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Platform overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Key metrics, trends, and distributions
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12"
      >
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="absolute -right-4 -top-4 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 transition-opacity">
              <s.icon className="w-32 h-32" />
            </div>
            <div
              className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}
            >
              <s.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-0.5">
              {s.value}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">{s.sub}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <AdminStatsCharts stats={stats} />
      </motion.div>
    </motion.div>
  );
}
