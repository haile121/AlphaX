'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Globe2, Cpu, Users } from 'lucide-react';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';

const values = [
  { icon: Globe2, title: 'Bilingual by default', body: 'We design for Amharic and English from day one—not as a translation layer.' },
  { icon: Cpu, title: 'Real engineering', body: 'Compiler, infra, and pedagogy matter. We sweat the details learners feel.' },
  { icon: Users, title: 'Students first', body: 'Feedback from classrooms and self-learners shapes what we ship.' },
  { icon: Heart, title: 'Access over ads', body: 'We optimize for learning outcomes, not engagement tricks.' },
];

export default function CareersPageClient() {
  return (
    <PublicMarketingShell>
      <main className="relative flex-1 pt-28 pb-24 px-6 sm:px-10 lg:px-16">
        <MarketingPageBackground />
        <div className="relative max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Careers</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Build education that crosses language barriers
            </h1>
            <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              We are a small, mission-driven team—think early Duolingo or Khan Academy energy: obsessed with pedagogy, product craft, and
              impact. If that resonates, we would love to hear from you.
            </p>
          </motion.div>

          <div className="mt-16 grid sm:grid-cols-2 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100/80 dark:border-blue-500/20">
                  <v.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
                </div>
                <h2 className="mt-4 text-base font-bold text-gray-900 dark:text-white">{v.title}</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-16 rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50/80 dark:bg-white/[0.02] p-8 sm:p-10"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Open roles</h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed pr-4">
              We do not list generic postings yet. Send your portfolio, CV, and a short note about why AlphaX Programming matters to you—we
              read every message.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Get in touch
            </Link>
          </motion.div>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
