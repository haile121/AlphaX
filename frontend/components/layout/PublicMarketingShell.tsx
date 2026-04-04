'use client';

import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { PublicMarketingFooter } from '@/components/layout/PublicMarketingFooter';

export function PublicMarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#080810] text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-200 flex flex-col">
      <Navbar variant="public" />
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
      <PublicMarketingFooter />
    </div>
  );
}
