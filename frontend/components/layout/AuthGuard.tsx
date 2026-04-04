'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useDialog } from '@/components/ui/DialogProvider';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { show } = useDialog();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // The JWT is httpOnly (not readable by JS), so we check the
    // non-httpOnly "logged_in" flag cookie set by the backend on login/register.
    const loggedIn = Cookies.get('logged_in');

    if (!loggedIn) {
      show({
        variant: 'auth-required',
        title: 'Sign in to continue',
        message:
          'You need a free account to access this feature. Join thousands of students learning programming in Amharic and English.',
        primaryAction: { label: 'Sign In', onClick: () => router.push('/sign-in') },
        secondaryAction: { label: 'Sign Up', onClick: () => router.push('/sign-up') },
      });
      setChecked(true);
      setAuthed(false);
      return;
    }

    setAuthed(true);
    setChecked(true);
  }, [router, show]);

  if (!checked) return null;
  if (!authed) return null;

  return <>{children}</>;
}
