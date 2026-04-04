'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';
import { CHANGELOG_ENTRIES } from '@/lib/changelog';

export default function ChangelogPageClient() {
  return (
    <PublicMarketingShell>
      <main className="relative flex-1 pt-28 pb-24 px-6 sm:px-10 lg:px-16">
        <MarketingPageBackground />
        <div className="relative max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-6">
              <History className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Product updates
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">Changelog</h1>
            <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              New features and improvements—similar to release notes on Linear, Notion, or Vercel. Follow along as we ship.
            </p>
          </motion.div>

          <div className="mt-14 relative">
            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gray-200 dark:bg-white/10" aria-hidden />
            <ul className="space-y-12">
              {CHANGELOG_ENTRIES.map((entry, i) => (
                <motion.li
                  key={entry.version}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.06 * i }}
                  className="relative pl-10"
                >
                  <span className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-2 border-blue-500 bg-white dark:bg-[#080810]" />
                  <div className="flex flex-wrap items-baseline gap-3 gap-y-1">
                    <span className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">{entry.version}</span>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{entry.date}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{entry.title}</h2>
                  <ul className="mt-4 space-y-2.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed list-disc pl-5">
                    {entry.items.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ul>
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="mt-16 text-sm text-gray-500 dark:text-gray-400">
            Have feedback?{' '}
            <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
