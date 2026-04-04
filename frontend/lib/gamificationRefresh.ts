'use client';

import { useEffect, useRef } from 'react';

/** Dispatched after XP/coins/streak/badges may have changed server-side. */
export const GAMIFICATION_UPDATED_EVENT = 'gamification:updated';

export function requestGamificationRefresh(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(GAMIFICATION_UPDATED_EVENT));
}

/**
 * Re-run the given callback when gamification data may have changed (e.g. after a quiz pass).
 * Uses a ref so the window listener stays registered once while always invoking the latest callback.
 */
export function useGamificationRefresh(callback: () => void): void {
  const ref = useRef(callback);
  ref.current = callback;
  useEffect(() => {
    const handler = () => ref.current();
    window.addEventListener(GAMIFICATION_UPDATED_EVENT, handler);
    return () => window.removeEventListener(GAMIFICATION_UPDATED_EVENT, handler);
  }, []);
}
