'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Renders children only after mount so this subtree is not hydrated from SSR.
 * Prevents hydration mismatches when extensions inject attributes (e.g. bis_skin_checked)
 * into the DOM before React hydrates — see https://nextjs.org/docs/messages/react-hydration-error
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return children;
}
