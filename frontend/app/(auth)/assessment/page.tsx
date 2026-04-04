'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Noto_Sans_Ethiopic } from 'next/font/google';
import {
  assessmentApi,
  type AssessmentTrack,
  AssessmentQuestion,
  AssessmentAnswer,
  AssessmentResult,
} from '@/lib/api';
import { authApi } from '@/lib/api';
import { requestGamificationRefresh } from '@/lib/gamificationRefresh';
import { getLanguage, setLanguage } from '@/lib/i18n';
import { useDialog } from '@/components/ui/DialogProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';

const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

type Language = 'en' | 'am';

const levelBadgeVariant: Record<string, 'info' | 'warning' | 'success'> = {
  beginner: 'info',
  intermediate: 'warning',
  advanced: 'success',
};

const levelLabel: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

function parseOptions(q: AssessmentQuestion): string[] {
  const o = q.options_json;
  if (Array.isArray(o)) return o;
  if (typeof o === 'string') {
    try {
      const p = JSON.parse(o) as unknown;
      return Array.isArray(p) ? (p as string[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function AssessmentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useDialog();

  const [lang, setLang] = useState<Language>('en');
  const [track, setTrack] = useState<AssessmentTrack | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [wasSecondary, setWasSecondary] = useState(false);

  useEffect(() => {
    setLang(getLanguage());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setInitError(null);
      setAnswers({});
      try {
        const meRes = await authApi.me();
        const user = meRes.data.user;
        if (cancelled) return;

        const param = searchParams.get('track');
        let resolved: AssessmentTrack;

        const secondaryCpp =
          user.assessment_completed && param === 'cpp' && !user.cpp_assessment_completed;
        const secondaryWeb =
          user.assessment_completed && param === 'web' && !user.web_assessment_completed;

        if (user.assessment_completed) {
          if (secondaryCpp || secondaryWeb) {
            resolved = param as AssessmentTrack;
            setWasSecondary(true);
          } else {
            router.replace('/lessons');
            return;
          }
        } else {
          if (!user.primary_track) {
            router.replace('/assessment/track');
            return;
          }
          resolved = param === 'cpp' || param === 'web' ? param : user.primary_track;
          if (resolved !== user.primary_track) {
            router.replace(`/assessment?track=${user.primary_track}`);
            return;
          }
        }

        setTrack(resolved);
        const res = await assessmentApi.getQuestions(resolved);
        if (cancelled) return;
        setQuestions(res.data.questions);
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          'Could not load the placement test.';
        setInitError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  useEffect(() => {
    if (!result) return;
    const dest = wasSecondary ? '/lessons' : '/dashboard';
    const timer = setTimeout(() => router.push(dest), 3000);
    return () => clearTimeout(timer);
  }, [result, router, wasSecondary]);

  const answeredCount = Object.keys(answers).length;
  const totalQs = questions.length;
  const allAnswered = totalQs > 0 && answeredCount === totalQs;

  const handleSelect = useCallback((questionId: string, optionIndex: number) => {
    const q = questions.find((x) => x.id === questionId);
    if (!q) return;
    const enOpts = parseOptions(q);
    const answer = enOpts[optionIndex];
    if (answer !== undefined) {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    }
  }, [questions]);

  const handleSubmit = async () => {
    if (!allAnswered || submitting || !track) return;
    setSubmitting(true);
    try {
      const payload: AssessmentAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const res = await assessmentApi.submit(track, payload);
      setResult(res.data);
      requestGamificationRefresh();
    } catch {
      show({
        variant: 'error',
        title: 'Submission failed',
        message: 'Something went wrong while submitting your assessment. Please try again.',
        primaryAction: { label: 'Dismiss', onClick: () => {} },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">{initError}</p>
        <Button variant="primary" onClick={() => router.push('/lessons')}>
          Back to lessons
        </Button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-md text-center space-y-6 py-12">
          <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
            {result.score} <span className="text-2xl text-gray-400 font-normal">/ 15</span>
          </div>
          <Badge
            variant={levelBadgeVariant[result.level] ?? 'default'}
            size="md"
            className="text-base px-4 py-1.5"
          >
            {levelLabel[result.level]}
          </Badge>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{result.message}</p>
          {result.breakdown && (
            <div className="grid grid-cols-3 gap-3 text-sm">
              {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                <div
                  key={d}
                  className="rounded-xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/[0.02] p-3"
                >
                  <p className="font-bold text-gray-900 dark:text-white">{result.breakdown![d]}/5</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{d}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Redirecting in 3 seconds…
          </p>
        </div>
      </div>
    );
  }

  const pct = totalQs > 0 ? (answeredCount / totalQs) * 100 : 0;
  const trackTitle = track === 'web' ? 'Web fundamentals' : 'C++';

  return (
    <div
      className={cn(
        'min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950',
        lang === 'am' && notoEthiopic.className
      )}
    >
      <div
        className={cn(
          'sticky top-16 z-30 border-b border-gray-200/90 dark:border-gray-800/90',
          'bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-md supports-[backdrop-filter]:bg-gray-50/85 dark:supports-[backdrop-filter]:bg-gray-950/85',
          'shadow-sm'
        )}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {trackTitle} placement
              </p>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                {lang === 'am' ? 'የደረጃ ግምገማ' : 'Diagnostic Assessment'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {lang === 'am'
                  ? `ሁሉንም ${totalQs || 15} ጥያቄዎች መልስ ይስጡ`
                  : `Answer all ${totalQs || 15} questions to determine your level`}
              </p>
            </div>
            <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-btn overflow-hidden text-sm shrink-0">
              <button
                type="button"
                onClick={() => {
                  setLang('en');
                  setLanguage('en');
                }}
                className={cn(
                  'px-3 py-1.5 transition-colors',
                  lang === 'en'
                    ? 'bg-accent text-white dark:bg-accent-dark'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang('am');
                  setLanguage('am');
                }}
                className={cn(
                  'px-3 py-1.5 transition-colors',
                  lang === 'am'
                    ? 'bg-accent text-white dark:bg-accent-dark'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                አማ
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent dark:bg-accent-dark rounded-full transition-all duration-300 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {answeredCount} / {totalQs || 15}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const questionText = lang === 'en' ? q.question_en : q.question_am || q.question_en;
            const selected = answers[q.id];
            const enOpts = parseOptions(q);
            const amOpts = q.options_am_json;
            const displayOpts =
              lang === 'am' && amOpts && amOpts.length === enOpts.length ? amOpts : enOpts;
            return (
              <div
                key={q.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-card p-5 space-y-3"
              >
                <p
                  className={cn(
                    'text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed',
                    lang === 'am' && 'text-[15px]'
                  )}
                >
                  <span className="text-gray-400 dark:text-gray-500 mr-2">{idx + 1}.</span>
                  {questionText}
                </p>
                <div className="space-y-2">
                  {displayOpts.map((label, i) => {
                    const valueEn = enOpts[i];
                    const isSelected = valueEn !== undefined && selected === valueEn;
                    return (
                      <button
                        key={`${q.id}-${i}`}
                        type="button"
                        onClick={() => handleSelect(q.id, i)}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-btn border text-sm transition-colors duration-150',
                          lang === 'am' && 'text-[15px] leading-snug',
                          isSelected
                            ? 'border-accent bg-accent/10 text-accent dark:border-accent-dark dark:bg-accent-dark/10 dark:text-accent-dark font-medium'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pb-10">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!allAnswered}
            loading={submitting}
            onClick={handleSubmit}
          >
            {lang === 'am' ? 'ግምገማውን ላክ' : 'Submit Assessment'}
          </Button>
          {!allAnswered && totalQs > 0 && (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
              {lang === 'am'
                ? `${totalQs - answeredCount} ጥያቄዎች ቀርተዋል`
                : `Answer ${totalQs - answeredCount} more question${totalQs - answeredCount !== 1 ? 's' : ''} to submit`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Spinner size="lg" />
        </div>
      }
    >
      <AssessmentClient />
    </Suspense>
  );
}
