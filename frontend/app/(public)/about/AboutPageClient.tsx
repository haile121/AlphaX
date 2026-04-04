'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';
import { cn } from '@/lib/cn';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
      <span className="w-4 h-px bg-current" />
      {children}
      <span className="w-4 h-px bg-current" />
    </span>
  );
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

const values = [
  {
    icon: Sparkles,
    title: 'Clarity over complexity',
    body: 'We strip away jargon so concepts land the first time—whether you read in Amharic or English.',
  },
  {
    icon: Heart,
    title: 'Access for everyone',
    body: 'Core lessons, the compiler, and the AI tutor stay free. No paywalls on the path to your first real program.',
  },
  {
    icon: Users,
    title: 'Built with learners',
    body: 'Feedback from students and educators shapes what we ship next, from quizzes to certificates.',
  },
];

export default function AboutPageClient() {
  return (
    <PublicMarketingShell>
      <main className="relative flex-1 pt-28 pb-20 px-6 sm:px-10 lg:px-16">
        <MarketingPageBackground />

        <div className="relative max-w-screen-xl mx-auto">
          {/* Hero */}
          <div className="max-w-3xl">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm text-xs font-medium text-gray-600 dark:text-gray-400 mb-8">
                About AlphaX Programming
              </div>
            </FadeUp>
            <FadeUp delay={0.05}>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-[-0.035em] leading-[1.08]">
                <span className="text-gray-900 dark:text-white">Teaching C++ the way</span>
                <br />
                <span className="text-blue-600 dark:text-blue-500">Ethiopia learns best</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.12}>
              <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                We are a small team obsessed with one thing: removing the language barrier between Ethiopian students and
                serious programming skills—without compromising depth, rigor, or joy.
              </p>
            </FadeUp>
          </div>

          {/* Mission band */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50/80 dark:bg-white/[0.02] p-8 sm:p-12 lg:p-14"
          >
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              <div className="lg:col-span-5">
                <SectionLabel>Mission</SectionLabel>
                <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                  Make world-class C++ education feel local, immediate, and yours.
                </h2>
              </div>
              <div className="lg:col-span-7 space-y-5 text-gray-600 dark:text-gray-400 leading-relaxed text-[15px] sm:text-base">
                <p>
                  Most platforms assume you think in English first. We built AlphaX Programming because that assumption leaves
                  millions of learners behind—not for lack of talent, but for lack of a bridge.
                </p>
                <p>
                  Every screen is bilingual by design. The compiler runs in the cloud so a phone is enough to practice.
                  When you are stuck, the AI tutor meets you in the language you prefer—without dumbing down the
                  material.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Values */}
          <div className="mt-24">
            <div className="mb-12">
              <SectionLabel>Principles</SectionLabel>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Simple surface. Serious underneath.
              </h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl">
                The product looks calm on purpose—so your attention stays on code, not noise.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'group rounded-2xl border p-7 flex flex-col gap-4',
                    'border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02]',
                    'hover:border-gray-300 dark:hover:border-white/15 transition-colors'
                  )}
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100/80 dark:border-blue-500/20 flex items-center justify-center">
                    <v.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{v.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.body}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Proof row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-24 rounded-2xl border border-gray-200 dark:border-white/8 overflow-hidden"
          >
            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-white/8">
              {[
                { k: '500+', l: 'Learners on the platform' },
                { k: '50+', l: 'Structured lessons' },
                { k: '2', l: 'Languages, one experience' },
              ].map((row) => (
                <div key={row.l} className="px-8 py-10 text-center sm:text-left bg-gray-50/50 dark:bg-white/[0.015]">
                  <p className="text-3xl sm:text-4xl font-bold tabular-nums text-gray-900 dark:text-white">{row.k}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">{row.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-24 relative rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] px-8 sm:px-12 py-14 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Ready to write your first line?
                </h2>
                <ul className="mt-5 space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                  {['Bilingual lessons & quizzes', 'Live compiler in the browser', 'AI tutor when you need a nudge'].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all shadow-md shadow-blue-500/15"
                >
                  Create free account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Back to home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
