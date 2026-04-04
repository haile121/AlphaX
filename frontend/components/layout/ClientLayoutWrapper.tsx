'use client';

import { useEffect, useState, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ClientOnly } from '@/components/ClientOnly';
import { cn } from '@/lib/cn';
import { authApi } from '@/lib/api';
import { useGamificationRefresh } from '@/lib/gamificationRefresh';
import type { User } from '@/types';

interface LayoutWrapperProps {
  children: ReactNode;
  variant: 'auth' | 'admin';
}

/** Full-width routes: no sidebar (e.g. diagnostic assessment after sign-up). */
function isFullBleedAuthRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/assessment' || pathname.startsWith('/assessment/');
}

export function ClientLayoutWrapper({ children, variant }: LayoutWrapperProps) {
  const pathname = usePathname();
  const fullBleed = isFullBleedAuthRoute(pathname);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const loadMe = useCallback(async () => {
    if (!Cookies.get('logged_in')) {
      setUser(null);
      return;
    }
    try {
      const res = await authApi.me();
      setUser(res.data.user);
    } catch {
      Cookies.remove('logged_in');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  useGamificationRefresh(loadMe);

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-[#06060c] font-sans selection:bg-accent/30 selection:text-accent"
      suppressHydrationWarning
    >
      <Navbar
        variant={variant}
        userName={user?.display_name}
        userInitial={user?.display_name?.trim()?.[0]?.toUpperCase()}
      />
      {/* ClientOnly: avoid SSR hydration of sidebar + pages when extensions inject DOM attrs */}
      <ClientOnly>
        <>
          {!fullBleed && (
            <Sidebar
              variant={variant}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
              showAdminLink={variant === 'auth' && user?.role === 'admin'}
            />
          )}
          <main
            suppressHydrationWarning
            className={cn(
              'pt-16 min-h-screen transition-all duration-300 ease-in-out will-change-[margin]',
              fullBleed ? 'w-full max-w-none lg:ml-0' : isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            )}
          >
            {children}
          </main>
        </>
      </ClientOnly>
    </div>
  );
}
