'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Server, ShieldCheck, KeyRound, Bug } from 'lucide-react';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';

const pillars = [
  {
    icon: KeyRound,
    title: 'Accounts & sessions',
    body: 'Passwords are hashed with modern algorithms. Sessions use secure, HTTP-only cookies where applicable so tokens are not exposed to page scripts.',
  },
  {
    icon: Server,
    title: 'Compiler & sandbox',
    body: 'Code runs in an isolated environment with limits on time and resources—similar in spirit to how Replit and educational sandboxes contain untrusted code.',
  },
  {
    icon: Lock,
    title: 'Transport & storage',
    body: 'Traffic to our app uses HTTPS. We apply least-privilege access for operational data and avoid collecting more than we need to run the service.',
  },
  {
    icon: ShieldCheck,
    title: 'Abuse & availability',
    body: 'We monitor for unusual activity and rate-limit sensitive actions to reduce spam, credential stuffing, and compiler abuse.',
  },
];

export default function SecurityPageClient() {
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
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Trust</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">Security</h1>
            <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              Like Stripe, Linear, and other product-led companies, we publish a high-level overview of how we protect learners and
              their data. This is not an audit report—contact us if you need contractual assurances.
            </p>
          </motion.div>

          <div className="mt-14 space-y-10">
            {pillars.map((p, i) => (
              <motion.section
                key={p.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="flex gap-5"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
                  <p.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{p.title}</h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.body}</p>
                </div>
              </motion.section>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="mt-16 flex flex-col sm:flex-row gap-4 rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50/80 dark:bg-white/[0.02] p-6 sm:p-8"
          >
            <Bug className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0" strokeWidth={1.75} />
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Report a vulnerability</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Found a security issue? Please email us with steps to reproduce. We appreciate responsible disclosure.
              </p>
              <Link href="/contact" className="mt-3 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Contact security →
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
