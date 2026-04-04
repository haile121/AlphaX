import { Flame } from 'lucide-react';

interface StreakIndicatorProps {
  streak: number;
  className?: string;
}

export function StreakIndicator({ streak, className = '' }: StreakIndicatorProps) {
  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      title="Consecutive calendar days you signed in (not from XP or lessons)"
    >
      <Flame className="w-4 h-4" aria-hidden />
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{streak}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">sign-in days</span>
    </div>
  );
}
