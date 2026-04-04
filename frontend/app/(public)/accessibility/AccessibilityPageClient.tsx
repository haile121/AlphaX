'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Keyboard, Contrast, MessageCircle } from 'lucide-react';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';

const commitments = [
  {
    icon: Keyboard,
    title: 'Keyboard & focus',
    body: 'We aim for logical tab order and visible focus states on interactive elements so you can navigate without a mouse.',
  },
  {
    icon: Contrast,
    title: 'Readable themes',
    body: 'Light and dark modes use sufficient contrast for body text and controls. You can switch theme from the header.',
  },
  {
    icon: Eye,
    title: 'Scalable UI',
    body: 'Layouts respond to zoom and viewport size so lessons and the compiler remain usable on phones and small laptops.',
  },
  {
    icon: MessageCircle,
    title: 'Feedback loop',
    body: 'If something blocks you—whether a screen reader issue, color contrast, or a lesson flow—tell us via Contact and we will prioritize fixes.',
  },
];

export default function AccessibilityPageClient() {
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
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Accessibility</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Learning should work for everyone
            </h1>
            <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              Like public education platforms and modern SaaS products, we treat accessibility as a product requirement—not an afterthought.
              We are not perfect on day one; we are committed to improving over time.
            </p>
          </motion.div>

          <div className="mt-14 space-y-10">
            {commitments.map((c, i) => (
              <motion.section
                key={c.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="flex gap-5"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
                  <c.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{c.title}</h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{c.body}</p>
                </div>
              </motion.section>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-16 rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50/80 dark:bg-white/[0.02] p-8"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              This policy is informational. For specific accessibility standards or legal requirements in your jurisdiction, consult
              qualified professionals. If you need a reasonable accommodation, reach out via{' '}
              <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Contact
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
