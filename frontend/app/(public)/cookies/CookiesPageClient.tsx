'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';

const rows = [
  {
    name: 'Session & auth',
    purpose: 'Keeps you signed in securely across pages.',
    type: 'First-party, HTTP-only where applicable',
  },
  {
    name: 'Preferences',
    purpose: 'Remembers theme (light/dark) and similar UI choices.',
    type: 'Local storage / first-party cookies',
  },
  {
    name: 'Analytics (if enabled)',
    purpose: 'Helps us understand usage to improve lessons—only if we turn on a privacy-preserving tool.',
    type: 'Third-party only if disclosed here when active',
  },
];

export default function CookiesPageClient() {
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
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">Cookie policy</h1>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Last updated: April 3, 2026</p>
            <p className="mt-8 text-gray-600 dark:text-gray-400 leading-relaxed">
              Similar to cookie notices on GitHub, Google, and European SaaS sites—this page summarizes how AlphaX Programming uses cookies
              and similar technologies. For broader data practices, see our{' '}
              <Link href="/privacy" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Privacy policy
              </Link>
              .
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-12 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/8"
          >
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/8 bg-gray-50/80 dark:bg-white/[0.03]">
                  <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Category</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white hidden sm:table-cell">Purpose</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white hidden md:table-cell">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/8">
                {rows.map((row) => (
                  <tr key={row.name} className="bg-white dark:bg-white/[0.02]">
                    <td className="px-4 py-4 align-top font-medium text-gray-900 dark:text-white">{row.name}</td>
                    <td className="px-4 py-4 align-top text-gray-600 dark:text-gray-400 hidden sm:table-cell">{row.purpose}</td>
                    <td className="px-4 py-4 align-top text-gray-500 dark:text-gray-500 text-xs hidden md:table-cell">{row.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-4 py-4 text-xs text-gray-500 dark:text-gray-500 sm:hidden border-t border-gray-100 dark:border-white/8">
              Full details visible on wider screens or in the privacy policy.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mt-10 space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            <p>
              You can control cookies through your browser settings (block, delete, or alert). Blocking essential cookies may prevent
              sign-in or break parts of the lesson experience.
            </p>
            <p>
              Questions?{' '}
              <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Contact us
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
