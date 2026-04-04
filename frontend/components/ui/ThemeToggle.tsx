'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/cn';

export function ThemeToggle({ className }: { className?: string }) {
  /**
   * `null` until after mount so server HTML matches the first client render.
   * Theme on `<html>` is already applied by `theme-init` in root layout before React runs.
   */
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = useCallback(() => {
    setIsDark((was) => {
      const next = !was!;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  if (isDark === null) {
    return (
      <div
        className={cn('inline-flex w-8 h-8 shrink-0 items-center justify-center', className)}
        suppressHydrationWarning
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'inline-flex p-2 rounded-lg text-gray-500 dark:text-gray-400',
        'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
        className
      )}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
