'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell';
import { MarketingPageBackground } from '@/components/layout/MarketingPageBackground';

const sections: { title: string; paragraphs?: string[]; bullets?: string[] }[] = [
  {
    title: 'Who we are',
    paragraphs: [
      'AlphaX Programming (“we”, “us”) operates the learning platform available at this website and related services. This policy explains what we collect, why we collect it, and the choices you have.',
    ],
  },
  {
    title: 'Information you provide',
    bullets: [
      'Account details such as your name, email address, and password (stored using industry-standard hashing).',
      'Content you submit in lessons, quizzes, the compiler, or when contacting support.',
      'Optional profile information you choose to add.',
    ],
  },
  {
    title: 'Information collected automatically',
    bullets: [
      'Usage data such as pages viewed, lesson progress, device type, and approximate region (for reliability and abuse prevention).',
      'Technical logs needed to operate the service (for example errors and performance metrics).',
      'Cookies and similar technologies that keep you signed in and remember preferences such as theme.',
    ],
  },
  {
    title: 'AI tutor',
    paragraphs: [
      'When you use the AI tutor, your questions and relevant lesson context may be sent to our model provider to generate a response. Do not paste secrets, passwords, or highly sensitive personal data into the tutor.',
    ],
  },
  {
    title: 'How we use information',
    bullets: [
      'To provide and improve lessons, assessments, certificates, and platform features.',
      'To secure accounts, detect fraud, and enforce our terms.',
      'To communicate with you about the service (for example verification or important notices).',
    ],
  },
  {
    title: 'Sharing',
    paragraphs: [
      'We do not sell your personal information. We share data only with service providers who help us run the platform (for example hosting, email, or AI inference), under appropriate safeguards, or when required by law.',
    ],
  },
  {
    title: 'Retention',
    paragraphs: [
      'We keep information as long as your account is active and for a reasonable period afterward for backups, legal obligations, and dispute resolution.',
    ],
  },
  {
    title: 'Your choices',
    bullets: [
      'You may update certain profile information in your account settings.',
      'You may request account deletion or other privacy requests by contacting us (see Contact). We will respond in line with applicable law.',
    ],
  },
  {
    title: 'Children',
    paragraphs: [
      'If you are under the age required in your country to consent to data processing, a parent or guardian should review this policy and supervise use of the platform.',
    ],
  },
  {
    title: 'International users',
    paragraphs: [
      'Your information may be processed in countries where we or our providers operate. We take steps designed to protect your information in line with this policy.',
    ],
  },
  {
    title: 'Changes',
    paragraphs: [
      'We may update this policy from time to time. We will post the new version on this page and adjust the “Last updated” date below.',
    ],
  },
];

export default function PrivacyPageClient() {
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
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">Privacy policy</h1>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Last updated: April 3, 2026</p>
            <p className="mt-8 text-gray-600 dark:text-gray-400 leading-relaxed">
              This policy is provided in plain language to help you understand our practices. It is not legal advice; if you need
              specific advice, consult a qualified professional.
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
            </Link>
            .
          </p>
        </div>
      </main>
    </PublicMarketingShell>
  );
}
