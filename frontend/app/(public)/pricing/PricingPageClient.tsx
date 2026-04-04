'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';

const included = [
  'Full curriculum: Beginner → Advanced',
  'Bilingual lessons & quizzes (Amharic / English)',
  'Cloud C++ compiler with instant runs',
  'AI tutor in context (Gemini)',
  'XP, streaks, leaderboard & coins',
  'Verified PDF certificates per level',
  'Works on mobile and desktop browsers',
];

const compare = [
  { label: 'Lessons & quizzes', free: true },
  { label: 'Live compiler', free: true },
  { label: 'AI tutor', free: true },
  { label: 'Certificates', free: true },
  { label: 'Account & progress sync', free: true },
];

export default function PricingPageClient() {
  return (
    <PublicMarketingShell>
      <main className="relative flex-1 pt-28 pb-24 px-6 sm:px-10 lg:px-16">
        <MarketingPageBackground />
        <div className="relative max-w-screen-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-500/25 bg-blue-50 dark:bg-blue-500/8 px-4 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              No credit card · No trial limits
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              One plan. <span className="text-blue-600 dark:text-blue-500">Everything included.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              Built like modern learning platforms you know—except the price tag stays at zero. Serious C++ education for Ethiopian
              learners, funded for access—not paywalls.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-14 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-8 sm:p-12 shadow-xl shadow-gray-200/40 dark:shadow-none"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-gray-100 dark:border-white/8 pb-8">
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Community</p>
                <p className="mt-2 text-5xl sm:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
                  $0
                  <span className="text-lg sm:text-xl font-semibold text-gray-400 dark:text-gray-500 ml-2">/ forever</span>
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Full platform access. Same experience for everyone.</p>
              </div>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition-colors whitespace-nowrap"
              >
                Start learning free
              </Link>
            </div>
            <ul className="mt-8 grid sm:grid-cols-2 gap-3">
              {included.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="mt-12 rounded-2xl border border-gray-200 dark:border-white/8 overflow-hidden"
          >
            <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/8">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Compare</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">What you get on the free plan</p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/8">
              {compare.map((row) => (
                <div key={row.label} className="flex items-center justify-between px-6 py-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{row.label}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Included</span>
                </div>
              ))}
            </div>
          </motion.div>

          <p className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Questions? See the{' '}
            <Link href="/faq" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              FAQ
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
