'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, ArrowRight, Github, Linkedin, Twitter, Youtube, Instagram } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';
import { CONTACT_EMAIL } from '@/lib/siteContact';
import { CONTACT_SOCIAL_LINKS } from '@/lib/siteSocial';
import { cn } from '@/lib/cn';

const SOCIAL_ICONS: Record<(typeof CONTACT_SOCIAL_LINKS)[number]['id'], LucideIcon> = {
  github: Github,
  x: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  instagram: Instagram,
};

export default function ContactPageClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const openMailto = () => {
    const subject = encodeURIComponent(`AlphaX Programming — message from ${name || 'visitor'}`);
    const body = encodeURIComponent(
      `${message}\n\n---\nName: ${name || '(not provided)'}\nReply-to: ${email || '(not provided)'}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <PublicMarketingShell>
      <main className="relative flex-1 pt-28 pb-20 px-6 sm:px-10 lg:px-16">
        <MarketingPageBackground />
        <div className="relative max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-14 lg:gap-20 items-start">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Contact</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
              We read every message
            </h1>
            <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              Bug reports, partnership ideas, or feedback on lessons—send it. For account issues, include the email you signed up with.
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-10 flex items-start gap-4 rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50/80 dark:bg-white/[0.02] p-5 hover:border-gray-300 dark:hover:border-white/15 transition-colors group"
            >
              <span className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100/80 dark:border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</span>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white mt-1 break-all group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {CONTACT_EMAIL}
                </span>
              </span>
            </a>

            <div className="mt-10">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Social</p>
              <ul className="flex flex-wrap gap-2.5" role="list">
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
                          'inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-all',
                          'border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03]',
                          'text-gray-600 dark:text-gray-400',
                          'hover:border-blue-300 dark:hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400',
                          'hover:bg-blue-50/80 dark:hover:bg-blue-500/10 hover:-translate-y-0.5 shadow-sm'
                        )}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-8 sm:p-10 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-8">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
                Write to us
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(
                      'w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#080810]',
                      'px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50'
                    )}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Reply email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      'w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#080810]',
                      'px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50'
                    )}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={cn(
                      'w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#080810]',
                      'px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 resize-y min-h-[120px]',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50'
                    )}
                    placeholder="What would you like us to know?"
                  />
                </div>

                <button
                  type="button"
                  onClick={openMailto}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all shadow-md shadow-blue-500/15"
                >
                  Open in email app
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Opens your default mail client with this message pre-filled. No data is sent from our servers.
                </p>
              </div>
            </div>

            <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                ← Back to home
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
