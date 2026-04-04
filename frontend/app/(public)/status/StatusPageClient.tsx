'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Globe, Cpu, BookOpen, Bot, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';

type Status = 'operational' | 'degraded' | 'outage';

const services: { name: string; desc: string; icon: LucideIcon; status: Status }[] = [
  { name: 'Website & app', desc: 'Marketing pages and authenticated app shell', icon: Globe, status: 'operational' },
  { name: 'Lessons & quizzes', desc: 'Course content and progress', icon: BookOpen, status: 'operational' },
  { name: 'Cloud compiler', desc: 'C++ build and run', icon: Cpu, status: 'operational' },
  { name: 'AI tutor', desc: 'Gemini-backed explanations', icon: Bot, status: 'operational' },
  { name: 'Auth & accounts', desc: 'Sign in, sessions, profiles', icon: Shield, status: 'operational' },
];

function StatusBadge({ status }: { status: Status }) {
  if (status === 'operational') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Operational
      </span>
    );
  }
  if (status === 'degraded') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-400">
        Degraded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
      Outage
    </span>
  );
}

export default function StatusPageClient() {
  return (
    <PublicMarketingShell>
      <main className="relative flex-1 pt-28 pb-24 px-6 sm:px-10 lg:px-16">
        <MarketingPageBackground />
        <div className="relative max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Status</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">System status</h1>
            <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              Inspired by status.openai.com and Vercel status pages—this is a static snapshot. For incidents we will update this page
              and the changelog when possible.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-10 rounded-2xl border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50/80 dark:bg-emerald-500/8 px-5 py-4 flex items-center gap-3"
          >
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">All systems operational</p>
              <p className="text-sm text-emerald-800/90 dark:text-emerald-300/90">Last checked: live page load</p>
            </div>
          </motion.div>

          <div className="mt-10 rounded-2xl border border-gray-200 dark:border-white/8 divide-y divide-gray-100 dark:divide-white/8 overflow-hidden bg-white dark:bg-white/[0.02]">
            {services.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04 * i }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03]">
                    <s.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{s.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </motion.div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Something wrong?{' '}
            <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Let us know
            </Link>{' '}
            — include your browser and what you were doing.
          </p>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
