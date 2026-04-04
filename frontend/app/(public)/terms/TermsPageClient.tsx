'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';

const sections: { title: string; paragraphs?: string[]; bullets?: string[] }[] = [
  {
    title: 'Agreement',
    paragraphs: [
      'By creating an account or using AlphaX Programming, you agree to these terms. If you do not agree, do not use the service.',
    ],
  },
  {
    title: 'The service',
    bullets: [
      'We provide educational content, tools (including a hosted compiler), quizzes, certificates, and optional AI-assisted help.',
      'We strive for high availability but do not guarantee uninterrupted access. We may change, suspend, or discontinue features with reasonable notice when practical.',
    ],
  },
  {
    title: 'Accounts and security',
    bullets: [
      'You must provide accurate registration information and keep your credentials confidential.',
      'You are responsible for activity under your account. Notify us promptly if you suspect unauthorized access.',
    ],
  },
  {
    title: 'Acceptable use',
    bullets: [
      'Do not misuse the platform: no harassment, illegal content, attempts to break security, overload systems, or scrape at scale without permission.',
      'Compiler and AI features must not be used to develop or distribute malware, or to process unlawful data.',
    ],
  },
  {
    title: 'User content',
    bullets: [
      'You retain rights to code and content you submit. You grant us a license to host, process, and display it solely to operate and improve the service.',
      'You represent that your submissions do not violate others’ rights.',
    ],
  },
  {
    title: 'AI outputs',
    bullets: [
      'AI-generated explanations may be imperfect. They are learning aids, not professional, legal, or safety advice.',
    ],
  },
  {
    title: 'Certificates',
    bullets: [
      'Certificates reflect completion of platform requirements at the time issued. Verification links are provided for good-faith checking by third parties.',
    ],
  },
  {
    title: 'Disclaimer',
    paragraphs: [
      'The service is provided “as is” to the fullest extent permitted by law. We disclaim warranties not expressly stated here.',
    ],
  },
  {
    title: 'Limitation of liability',
    paragraphs: [
      'To the extent permitted by law, our total liability arising from the service is limited to the greater of amounts you paid us in the twelve months before the claim (if any) or zero, and we are not liable for indirect or consequential damages.',
    ],
  },
  {
    title: 'Termination',
    bullets: [
      'You may stop using the service at any time. We may suspend or terminate accounts that violate these terms or create risk.',
    ],
  },
  {
    title: 'Governing law',
    paragraphs: [
      'These terms are governed by applicable local laws where we operate, without regard to conflict-of-law rules, except where prohibited.',
    ],
  },
  {
    title: 'Contact',
    paragraphs: [
      'For questions about these terms, use the contact options on our Contact page.',
    ],
  },
];

export default function TermsPageClient() {
  return (
    <PublicMarketingShell>
      <main className="relative flex-1 pt-28 pb-20 px-6 sm:px-10 lg:px-16">
        <MarketingPageBackground />
        <div className="relative max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">Terms of service</h1>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Last updated: April 3, 2026</p>
            <p className="mt-8 text-gray-600 dark:text-gray-400 leading-relaxed">
              These terms govern your use of AlphaX Programming. They are a practical summary; where required, statutory rights still apply.
            </p>
          </motion.div>

          <div className="mt-14 space-y-12">
            {sections.map((s, i) => (
              <motion.section
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{s.title}</h2>
                {s.paragraphs && (
                  <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {s.paragraphs.map((p) => (
                      <p key={p.slice(0, 64)}>{p}</p>
                    ))}
                  </div>
                )}
                {s.bullets && (
                  <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed list-disc pl-5">
                    {s.bullets.map((line) => (
                      <li key={line.slice(0, 48)}>{line}</li>
                    ))}
                  </ul>
                )}
              </motion.section>
            ))}
          </div>

          <p className="mt-16 text-sm text-gray-500 dark:text-gray-400">
            Questions?{' '}
            <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Contact us
            </Link>{' '}
            or read our{' '}
            <Link href="/privacy" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Privacy policy
            </Link>
            .
          </p>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
