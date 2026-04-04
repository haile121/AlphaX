'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SITE_LOGO_PATH } from '@/lib/siteAssets';

const footerGroups = [
  {
    title: 'Product',
    links: [
      { href: '/', label: 'Home' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/resources', label: 'Resources' },
      { href: '/faq', label: 'FAQ' },
      { href: '/status', label: 'Status' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/careers', label: 'Careers' },
      { href: '/community', label: 'Community' },
      { href: '/press', label: 'Press' },
      { href: '/changelog', label: 'Changelog' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal & trust',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/cookies', label: 'Cookies' },
      { href: '/security', label: 'Security' },
      { href: '/accessibility', label: 'Accessibility' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/sign-up', label: 'Sign up' },
      { href: '/sign-in', label: 'Sign in' },
      { href: '/verify', label: 'Verify certificate' },
    ],
  },
] as const;

export function PublicMarketingFooter() {
  return (
    <footer className="border-t border-gray-100 dark:border-white/5">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">{group.title}</p>
              <ul className="space-y-3" role="list">
                {group.links.map(({ href, label }) => (
                  <li key={href + label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-10 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Image src={SITE_LOGO_PATH} alt="" width={36} height={36} className="h-9 w-auto object-contain" />
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">AlphaX Programming</span>
          </div>
          <p className="text-xs text-gray-400 text-center sm:text-right">© 2026 AlphaX Programming Learning Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
