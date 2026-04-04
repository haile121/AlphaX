'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  LogIn,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import type { DialogVariant } from '@/types';

export interface DialogProps {
  open: boolean;
  variant: DialogVariant;
  title: string;
  message: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  onClose: () => void;
}

const variantConfig: Record<
  DialogVariant,
  { icon: React.ElementType; iconClass: string; titleClass: string }
> = {
  error: {
    icon: AlertCircle,
    iconClass: 'text-red-500',
    titleClass: 'text-red-600 dark:text-red-400',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-500',
    titleClass: 'text-gray-900 dark:text-gray-100',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    titleClass: 'text-amber-700 dark:text-amber-400',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-green-500',
    titleClass: 'text-green-700 dark:text-green-400',
  },
  confirm: {
    icon: HelpCircle,
    iconClass: 'text-gray-500',
    titleClass: 'text-gray-900 dark:text-gray-100',
  },
  'auth-required': {
    icon: LogIn,
    iconClass: 'text-accent dark:text-accent-dark',
    titleClass: 'text-gray-900 dark:text-gray-100',
  },
};

export function Dialog({
  open,
  variant,
  title,
  message,
  primaryAction,
  secondaryAction,
  onClose,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const config = variantConfig[variant];
  const Icon = config.icon;

  // Auto-dismiss for success after 3s
  useEffect(() => {
    if (open && variant === 'success') {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, variant, onClose]);

  // ESC key closes dialog
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus trap: focus the dialog container
      dialogRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  // Auth-required variant uses its own action buttons
  const isAuthRequired = variant === 'auth-required';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-message"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full max-w-md rounded-card bg-white dark:bg-gray-900',
          'border border-gray-200 dark:border-gray-700 shadow-xl',
          'focus:outline-none p-6'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-3">
          <Icon className={cn('mt-0.5 shrink-0', config.iconClass)} size={22} />
          <h2
            id="dialog-title"
            className={cn('text-base font-semibold leading-snug', config.titleClass)}
          >
            {title}
          </h2>
        </div>

        {/* Message */}
        <p
          id="dialog-message"
          className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed"
        >
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          {isAuthRequired ? (
            <>
              {secondaryAction && (
                <Button variant="secondary" size="sm" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction && (
                <Button variant="primary" size="sm" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              )}
            </>
          ) : (
            <>
              {secondaryAction && (
                <Button variant="secondary" size="sm" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction ? (
                <Button
                  variant={variant === 'error' ? 'danger' : 'primary'}
                  size="sm"
                  onClick={primaryAction.onClick}
                >
                  {primaryAction.label}
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={onClose}>
                  Dismiss
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
