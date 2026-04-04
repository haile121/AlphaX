'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useDialog } from '@/components/ui/DialogProvider';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';

const cards = [
  {
    track: 'cpp' as const,
    title: 'C++ programming',
    description:
      'Chapters 1–4: foundations, control flow, functions, arrays, and more — with a live compiler and bilingual notes.',
    icon: Code2,
    accent: 'from-blue-600/15 to-indigo-600/10 border-blue-200/80 dark:border-blue-500/25',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    track: 'web' as const,
    title: 'Web fundamentals',
    description:
      'HTML, CSS & JavaScript in six sessions — structure, styling, layout, and browser scripting with bilingual notes.',
    icon: Globe,
    accent: 'from-teal-600/15 to-cyan-600/10 border-teal-200/80 dark:border-teal-500/25',
    iconClass: 'text-teal-700 dark:text-teal-400',
  },
];

export default function AssessmentTrackPage() {
  const router = useRouter();
  const { show } = useDialog();
  const [loading, setLoading] = useState<false | 'cpp' | 'web'>(false);

  async function choose(track: 'cpp' | 'web') {
    setLoading(track);
    try {
      await authApi.setPrimaryTrack(track);
      router.push(`/assessment?track=${track}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save your choice. Try again.';
      show({ variant: 'error', title: 'Something went wrong', message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100/80 dark:from-gray-950 dark:to-[#0a0a12] px-4 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 dark:border-blue-500/30 bg-white/80 dark:bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-4">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Step 1 of 2
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            What do you want to learn first?
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
            Choose your main track. You&apos;ll take a short placement test next. The other track stays locked until you
            complete its placement from the Lessons page.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5">
          {cards.map((c) => (
            <button
              key={c.track}
              type="button"
              disabled={loading !== false}
              onClick={() => void choose(c.track)}
              className={cn(
                'relative text-left rounded-2xl border bg-white/90 dark:bg-white/[0.03] backdrop-blur-sm p-6 sm:p-7 transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:ring-offset-gray-950',
                'disabled:opacity-60 disabled:pointer-events-none',
                c.accent
              )}
            >
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-white/10 shadow-sm',
                    c.iconClass
                  )}
                >
                  {loading === c.track ? (
                    <Spinner size="sm" />
                  ) : (
                    <c.icon className="h-6 w-6" aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{c.title}</h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{c.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Continue
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
          You can unlock the other track later from Lessons — it only takes another placement quiz.
        </p>
      </div>
    </div>
  );
}
