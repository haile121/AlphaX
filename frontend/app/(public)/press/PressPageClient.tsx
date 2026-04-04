'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Newspaper, ImageIcon, Mail } from 'lucide-react';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';
import { PRESS_EMAIL } from '@/lib/siteContact';

export default function PressPageClient() {
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
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Press</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">Media & press</h1>
            <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              Like Notion, Figma, and Coursera press pages—we welcome journalists, podcasters, and educators covering bilingual CS
              education in Ethiopia and beyond.
            </p>
          </motion.div>

          <div className="mt-14 space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100/80 dark:border-blue-500/20">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Press inquiries</h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    For interviews, data requests, or fact-checking, email us. We typically respond within a few business days.
                  </p>
                  <a
                    href={`mailto:${PRESS_EMAIL}?subject=${encodeURIComponent('Press inquiry — AlphaX Programming')}`}
                    className="mt-4 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {PRESS_EMAIL}
                  </a>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50/80 dark:bg-white/[0.02] p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
                  <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Logos & brand</h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Use the logo from the site header for articles. Do not stretch, recolor off-brand, or imply endorsement without
                    permission. Need vector assets? Ask via the press email above.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex gap-4 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8"
            >
              <Newspaper className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Boilerplate:</span> AlphaX Programming is a free bilingual
                platform for learning C++, HTML, CSS, and JavaScript in Amharic and English, with lessons, a cloud compiler, and an AI tutor—built for Ethiopian
                students and anyone who prefers learning in Amharic.
              </p>
            </motion.section>
          </div>

          <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
            General support (not press-specific)?{' '}
            <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Contact
            </Link>
            .
          </p>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
