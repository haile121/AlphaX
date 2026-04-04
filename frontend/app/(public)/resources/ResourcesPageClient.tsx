'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Mail,
  BookOpen,
  Shield,
  FileText,
  Sparkles,
  History,
  ArrowUpRight,
  Building2,
  Accessibility,
  ShieldCheck,
  Users,
  Newspaper,
  Activity,
  Cookie,
} from 'lucide-react';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';
import { cn } from '@/lib/cn';

const helpCards = [
  {
    href: '/faq',
    title: 'FAQ',
    desc: 'Answers about lessons, compiler, AI tutor, certificates, and accounts.',
    icon: HelpCircle,
    color: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
  },
  {
    href: '/pricing',
    title: 'Pricing',
    desc: 'What’s included in our free plan—no surprises, no paywalls.',
    icon: Sparkles,
    color: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  },
  {
    href: '/contact',
    title: 'Contact',
    desc: 'Bug reports, partnerships, press, or help with your account.',
    icon: Mail,
    color: 'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400',
  },
  {
    href: '/changelog',
    title: 'Changelog',
    desc: 'Product updates, new features, and release notes.',
    icon: History,
    color: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
  },
  {
    href: '/privacy',
    title: 'Privacy',
    desc: 'How we handle data, cookies, and the AI tutor.',
    icon: Shield,
    color: 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300',
  },
  {
    href: '/terms',
    title: 'Terms of service',
    desc: 'Rules for using the platform and acceptable use.',
    icon: FileText,
    color: 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300',
  },
  {
    href: '/about',
    title: 'About us',
    desc: 'Mission, values, and why we built AlphaX Programming.',
    icon: Building2,
    color: 'bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20 text-sky-600 dark:text-sky-400',
  },
  {
    href: '/accessibility',
    title: 'Accessibility',
    desc: 'Keyboard, themes, and how we improve inclusive design.',
    icon: Accessibility,
    color: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400',
  },
];

const trustCards = [
  {
    href: '/security',
    title: 'Security',
    desc: 'Accounts, compiler sandbox, and how we protect learners.',
    icon: ShieldCheck,
    color: 'bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/25 text-slate-700 dark:text-slate-300',
  },
  {
    href: '/status',
    title: 'Status',
    desc: 'Uptime-style view of core services (lessons, compiler, auth).',
    icon: Activity,
    color: 'bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-500/20 text-teal-700 dark:text-teal-400',
  },
  {
    href: '/community',
    title: 'Community',
    desc: 'Discord (when live) and social channels—learn with others.',
    icon: Users,
    color: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  },
  {
    href: '/press',
    title: 'Press',
    desc: 'Media inquiries, boilerplate, and logo usage.',
    icon: Newspaper,
    color: 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20 text-orange-700 dark:text-orange-400',
  },
  {
    href: '/cookies',
    title: 'Cookie policy',
    desc: 'What we store in cookies and local storage.',
    icon: Cookie,
    color: 'bg-lime-50 dark:bg-lime-500/10 border-lime-100 dark:border-lime-500/20 text-lime-800 dark:text-lime-400',
  },
];

function CardGrid({
  cards,
  startDelay = 0,
}: {
  cards: typeof helpCards;
  startDelay?: number;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((c, i) => (
        <motion.div
          key={c.href}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: startDelay + 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={c.href}
            className={cn(
              'group flex flex-col h-full rounded-2xl border p-6 transition-all duration-200',
              'border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02]',
              'hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-none'
            )}
          >
            <span className={cn('inline-flex h-11 w-11 items-center justify-center rounded-xl border', c.color)}>
              <c.icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="mt-4 flex items-center gap-1.5 text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {c.title}
              <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
            </span>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{c.desc}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export default function ResourcesPageClient() {
  return (
    <PublicMarketingShell>
      <main className="relative flex-1 pt-28 pb-24 px-6 sm:px-10 lg:px-16">
        <MarketingPageBackground />
        <div className="relative max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-6">
              <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Resources
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Help, legal & trust
            </h1>
            <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              The same kinds of pages you will find on Duolingo, Coursera, Notion, or Stripe—FAQs, policies, security, status, press,
              and community—all linked from one hub.
            </p>
          </motion.div>

          <h2 className="mt-14 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Help & policy</h2>
          <div className="mt-5">
            <CardGrid cards={helpCards} />
          </div>

          <h2 className="mt-16 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Trust & company</h2>
          <div className="mt-5">
            <CardGrid cards={trustCards} startDelay={0.15} />
          </div>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
