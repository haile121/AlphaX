/** Product updates for /changelog — append new entries at the top. */
export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  items: string[];
};

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: '2026.4.1',
    date: 'April 2026',
    title: 'Trust & community pages',
    items: [
      'Added Security, Community, Press, Status, and Cookies pages (common on major SaaS and edtech sites).',
      'Footer reorganized into Product, Company, Legal & trust, and Account.',
    ],
  },
  {
    version: '2026.4',
    date: 'April 2026',
    title: 'Marketing & help',
    items: [
      'Added public pages: About, FAQ, Contact, Privacy, Terms, Pricing, Resources, Careers, Changelog, and Accessibility.',
      'Centralized FAQ copy so the homepage and help center stay in sync.',
    ],
  },
  {
    version: '2026.3',
    date: 'March 2026',
    title: 'Learning experience',
    items: [
      'Bilingual lessons with Amharic and English toggles across lessons and quizzes.',
      'Live C++ compiler in the browser with instant feedback.',
      'AI tutor powered by Gemini for in-context explanations.',
    ],
  },
];
