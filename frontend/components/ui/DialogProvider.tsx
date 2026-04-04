'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Dialog } from './Dialog';
import type { DialogConfig } from '@/types';

interface DialogContextValue {
  show: (config: DialogConfig) => void;
  hide: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<DialogConfig | null>(null);

  const show = useCallback((cfg: DialogConfig) => {
    setConfig(cfg);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <DialogContext.Provider value={{ show, hide }}>
      {children}
      {config && (
        <Dialog
          open={open}
          variant={config.variant}
          title={config.title}
          message={config.message}
          primaryAction={config.primaryAction}
          secondaryAction={config.secondaryAction}
          onClose={hide}
        />
      )}
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return ctx;
}
