'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

/** Ensures only admins can view /admin routes (role from /api/auth/me). */
export function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await authApi.me();
        if (cancelled) return;
        if (res.data.user.role !== 'admin') {
          router.replace('/dashboard');
          return;
        }
        setAllowed(true);
      } catch {
        if (!cancelled) router.replace('/sign-in');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (allowed !== true) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
