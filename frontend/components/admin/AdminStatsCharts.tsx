'use client';

import { useId, type ReactNode } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

/**
 * Brand blues — match tailwind.config.ts `accent.DEFAULT` / `accent.dark`
 * (#2563EB / #3B82F6). Charts stay minimal but clearly on-brand.
 */
const BRAND = {
  DEFAULT: '#2563EB',
  light: '#3B82F6',
  soft: '#60A5FA',
  pale: '#93C5FD',
  wash: '#BFDBFE',
  mist: '#DBEAFE',
};

const Z = {
  muted: '#64748b',
  hairline: 'rgba(37, 99, 235, 0.07)',
  cursor: 'rgba(37, 99, 235, 0.06)',
};

/** Monochrome blue ramp for level breakdown */
const PIE_LEVEL = [BRAND.mist, BRAND.wash, BRAND.pale, BRAND.soft, BRAND.light, BRAND.DEFAULT];

const axisTick = { fill: Z.muted, fontSize: 10, fontWeight: 400 as const };
interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: { name?: string; value?: number | string; color?: string }[];
}

function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border border-blue-200/80 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur-sm dark:border-blue-900/60 dark:bg-zinc-900/95"
      style={{ boxShadow: '0 4px 24px rgba(37, 99, 235, 0.08)' }}
    >
      {label != null && label !== '' && (
        <div className="mb-1 font-medium text-zinc-500 dark:text-zinc-400">{String(label)}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: p.color ?? BRAND.DEFAULT }}
          />
          <span className="text-zinc-500 dark:text-zinc-400">{p.name}</span>
          <span className="ml-auto tabular-nums font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export interface AdminStatsPayload {
  total_users: number;
  active_users: number;
  avg_quiz_score: number;
  total_quiz_attempts: number;
  lesson_completion_rate: number;
  streak_distribution: { streak: number; count: number }[];
  signups_by_day: { date: string; count: number }[];
  users_by_level: { level: string; count: number }[];
  role_breakdown: { role: string; count: number }[];
  quiz_score_buckets: { label: string; count: number }[];
  total_lessons: number;
  published_lessons: number;
}

function shortDate(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const legendProps = {
  iconType: 'circle' as const,
  iconSize: 6,
  wrapperStyle: { fontSize: '11px', paddingTop: '12px' },
  formatter: (value: string) => <span className="text-zinc-500 dark:text-zinc-400">{value}</span>,
};

export function AdminStatsCharts({ stats }: { stats: AdminStatsPayload }) {
  const uid = useId().replace(/:/g, '');
  const gradArea = `area-${uid}`;
  const gradBar = `bar-${uid}`;

  const signups = stats.signups_by_day.map((d) => ({
    ...d,
    label: shortDate(d.date),
  }));

  const streakData = stats.streak_distribution.map((s) => ({
    name: `${s.streak}d`,
    streak: s.streak,
    users: s.count,
  }));
  const maxStreak = Math.max(1, ...streakData.map((d) => d.users));

  const levelData = stats.users_by_level.map((u) => ({
    name: u.level,
    value: u.count,
  }));

  const roleData = stats.role_breakdown.map((r) => ({
    name: r.role,
    value: r.count,
  }));

  const quizBuckets = stats.quiz_score_buckets.map((b) => ({
    range: b.label,
    attempts: b.count,
  }));

  return (
    <div className="space-y-6 text-zinc-600 dark:text-zinc-400">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartShell
          title="New signups"
          subtitle="Last 14 days · daily registrations"
        >
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signups} margin={{ top: 12, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradArea} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND.DEFAULT} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={BRAND.DEFAULT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={Z.hairline} strokeWidth={1} />
                <XAxis
                  dataKey="label"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: BRAND.soft, strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Signups"
                  stroke={BRAND.DEFAULT}
                  strokeWidth={1.5}
                  fill={`url(#${gradArea})`}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0, fill: BRAND.light }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartShell>

        <ChartShell title="Quiz scores" subtitle="Attempts by score band">
          <div className="h-[240px] w-full">
            {quizBuckets.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizBuckets} margin={{ top: 12, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradBar} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND.soft} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={BRAND.mist} stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={Z.hairline} strokeWidth={1} />
                  <XAxis dataKey="range" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: Z.cursor }} />
                  <Bar dataKey="attempts" name="Attempts" fill={`url(#${gradBar})`} radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartShell>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartShell title="Users by level" subtitle="Assessment tier">
          <div className="h-[240px] w-full">
            {levelData.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={levelData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={3}
                    stroke="none"
                    label={false}
                  >
                    {levelData.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_LEVEL[i % PIE_LEVEL.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    {...legendProps}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartShell>

        <ChartShell title="Roles" subtitle="Student vs admin">
          <div className="h-[240px] w-full">
            {roleData.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={4}
                    stroke="none"
                    label={false}
                  >
                    {roleData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.name === 'admin' ? BRAND.DEFAULT : BRAND.wash}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend {...legendProps} layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartShell>
      </div>

      <ChartShell title="Streaks" subtitle="Learners by current streak length">
        <div className="h-[260px] w-full">
          {streakData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streakData} layout="vertical" margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                <CartesianGrid horizontal={false} stroke={Z.hairline} strokeWidth={1} />
                <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} domain={[0, maxStreak]} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={axisTick} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: Z.cursor }} />
                <Bar
                  dataKey="users"
                  name="Users"
                  fill={BRAND.light}
                  radius={[0, 3, 3, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartShell>
    </div>
  );
}

function ChartShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-blue-200/40 bg-blue-50/35 p-5 dark:border-blue-950/60 dark:bg-blue-950/25">
      <div className="mb-1">
        <h3 className="text-[13px] font-medium tracking-tight text-zinc-800 dark:text-zinc-100">{title}</h3>
        <p className="mt-0.5 text-[11px] font-normal leading-relaxed text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <p className="flex h-[200px] items-center justify-center text-[13px] text-zinc-400 dark:text-zinc-500">
      No data yet
    </p>
  );
}
