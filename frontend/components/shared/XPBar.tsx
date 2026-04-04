interface XPBarProps {
  xp: number;
  nextLevelXp?: number;
  className?: string;
}

export function XPBar({ xp, nextLevelXp = 1000, className = '' }: XPBarProps) {
  const pct = Math.min((xp / nextLevelXp) * 100, 100);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-16 shrink-0">
        {xp} XP
      </span>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500 w-16 text-right shrink-0">
        {nextLevelXp} XP
      </span>
    </div>
  );
}
