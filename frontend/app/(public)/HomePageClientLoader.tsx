'use client';

import dynamic from 'next/dynamic';

/**
 * Client-only landing shell: avoids hydrating SSR HTML that extensions often
 * mutate before React loads (e.g. bis_skin_checked), which causes mismatches.
 */
const LandingPage = dynamic(() => import('./HomePageClient'), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-screen bg-white dark:bg-[#080810]"
      aria-busy="true"
      aria-label="Loading page"
    />
  ),
});

export default function HomePageClientLoader() {
  return <LandingPage />;
}
