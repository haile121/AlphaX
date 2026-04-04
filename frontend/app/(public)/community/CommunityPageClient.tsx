'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Heart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Github, Linkedin, Twitter, Youtube, Instagram } from 'lucide-react';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';
import { CONTACT_SOCIAL_LINKS } from '@/lib/siteSocial';
import { COMMUNITY_DISCORD_URL } from '@/lib/siteContact';
import { cn } from '@/lib/cn';

const SOCIAL_ICONS: Record<(typeof CONTACT_SOCIAL_LINKS)[number]['id'], LucideIcon> = {
  github: Github,
  x: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  instagram: Instagram,
};

export default function CommunityPageClient() {
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
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-6">
              <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Community
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Learn with others
            </h1>
            <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              Inspired by Duolingo forums and Discord study groups—connect for motivation, share wins, and stay accountable. Official
              spaces are moderated for respect and safety.
            </p>
          </motion.div>

          <div className="mt-14 grid sm:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-8"
            >
              <MessageCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
              <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Discord</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Study rooms, announcements, and peer help. Be kind, no cheating on graded work.
              </p>
              {COMMUNITY_DISCORD_URL ? (
                <a
                  href={COMMUNITY_DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Join Discord
                </a>
              ) : (
                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                  Discord server coming soon — follow us on social for updates in the meantime.
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50/80 dark:bg-white/[0.02] p-8"
            >
              <Heart className="h-8 w-8 text-rose-500 dark:text-rose-400" strokeWidth={1.5} />
              <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Social</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Follow for tips, release notes, and learner stories—the same links as on our contact page.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" role="list">
                {CONTACT_SOCIAL_LINKS.map(({ id, label, href }) => {
                  const Icon = SOCIAL_ICONS[id];
                  return (
                    <li key={id}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={cn(
                          'inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors',
                          'border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03]',
                          'text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400'
                        )}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>

          <p className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Partnerships or student clubs?{' '}
            <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
