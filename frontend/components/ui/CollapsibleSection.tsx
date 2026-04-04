'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

type CollapsibleSectionProps = {
  title: string;
  description?: string;
  /** Shown next to title (e.g. progress chip) */
  trailing?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  /** Panel padding variant */
  panelClassName?: string;
  /** Visually lighter header (nested accordions) */
  variant?: 'default' | 'nested';
};

export function CollapsibleSection({
  title,
  description,
  trailing,
  defaultOpen = true,
  children,
  className,
  panelClassName,
  variant = 'default',
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200/90 dark:border-gray-700/90 bg-white/80 dark:bg-gray-900/80 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]',
        className
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        id={`${panelId}-btn`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-start justify-between gap-3 text-left transition-colors',
          variant === 'nested' ? 'px-4 py-3 sm:px-5 sm:py-3.5' : 'px-5 py-4 sm:px-6 sm:py-5',
          'hover:bg-gray-50/80 dark:hover:bg-gray-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40'
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
            <span
              className={cn(
                'font-semibold text-gray-900 dark:text-white shrink-0',
                variant === 'nested' ? 'text-sm sm:text-base' : 'text-base'
              )}
            >
              {title}
            </span>
            {trailing ? (
              <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end sm:ml-auto">{trailing}</div>
            ) : null}
          </div>
          {description ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-snug max-w-prose break-words">
              {description}
            </p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500 mt-0.5 transition-transform duration-200 ease-out',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div
          className={cn(
            'min-h-0',
            open ? 'overflow-x-auto overflow-y-visible' : 'overflow-hidden',
            !open && 'pointer-events-none'
          )}
        >
          <div
            id={panelId}
            role="region"
            aria-labelledby={`${panelId}-btn`}
            className={cn(
              'border-t border-gray-100 dark:border-gray-800/80 min-w-0',
              variant === 'nested' ? 'px-4 pb-4 pt-0 sm:px-5' : 'px-4 pb-5 pt-0 sm:px-6 sm:pb-6',
              panelClassName
            )}
            aria-hidden={!open}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
