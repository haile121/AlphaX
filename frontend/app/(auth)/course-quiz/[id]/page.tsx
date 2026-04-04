'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  courseTrackQuizzesApi,
  type CourseTrackQuizData,
  type SubmitResult,
} from '@/lib/api';
import { requestGamificationRefresh } from '@/lib/gamificationRefresh';
import { getLanguage } from '@/lib/i18n';
import { useDialog } from '@/components/ui/DialogProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Language } from '@/types';

export default function CourseTrackQuizPage() {
  const params = useParams<{ id: string | string[] }>();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const [data, setData] = useState<CourseTrackQuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lang] = useState<Language>(getLanguage());
  const { show } = useDialog();

  useEffect(() => {
    if (!id) return;
    courseTrackQuizzesApi
      .get(id)
      .then((res) => setData(res.data))
      .catch((err: unknown) => {
        const ax = err as { response?: { status?: number; data?: { error?: string } } };
        const status = ax.response?.status;
        const serverMsg = ax.response?.data?.error;
        let msg = 'Failed to load quiz.';
        if (status === 403) msg = serverMsg ?? 'Complete the required reading sessions first.';
        else if (status === 503)
          msg =
            serverMsg ??
            'Course quizzes are not set up on the server. Ask an admin to run: npm run migrate:005 && npm run seed:course-track-quizzes (from backend/).';
        else if (status === 500 && serverMsg) msg = serverMsg;
        else if (serverMsg) msg = serverMsg;
        show({ variant: 'error', title: 'Cannot open quiz', message: msg });
      })
      .finally(() => setLoading(false));
  }, [id, show]);

  async function handleSubmit() {
    if (!data || !id) return;
    setSubmitting(true);
    try {
      const res = await courseTrackQuizzesApi.submit(id, answers);
      setResult(res.data);
      requestGamificationRefresh();
    } catch {
      show({ variant: 'error', title: 'Submit failed', message: 'Could not submit quiz.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">This quiz could not be loaded.</p>
        <Link href="/lessons" className="text-blue-600 dark:text-blue-400 font-medium">
          Back to lessons
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">{result.passed ? '🎉' : '😔'}</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {result.passed ? 'Quiz passed!' : 'Not quite'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Score: {result.score}%</p>
        {result.passed && (
          <div className="flex justify-center gap-3 mb-6">
            <Badge variant="success">+{result.xpAwarded} XP</Badge>
            <Badge variant="secondary">+{result.coinsAwarded} coins</Badge>
          </div>
        )}
        {data && !data.quiz.is_final ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
            For the track certificate, open Lessons and use <strong>Take final exam</strong> at the bottom of this
            track (separate from chapter quizzes).
          </p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => { setResult(null); setAnswers({}); }}>Try again</Button>
          <Link href="/lessons">
            <Button variant="outline">Back to lessons</Button>
          </Link>
        </div>
      </div>
    );
  }

  const title =
    lang === 'am' ? data.quiz.title_am ?? data.quiz.title_en : data.quiz.title_en;

  const isChapterNotFinal = !data.quiz.is_final;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
        {data.quiz.is_final ? 'Module final' : 'Chapter quiz'} ·{' '}
        {data.quiz.track === 'cpp' ? 'C++' : 'Web'}
      </p>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{title}</h1>

      {isChapterNotFinal ? (
        <div
          className="mb-6 rounded-xl border border-amber-200/90 bg-amber-50/90 dark:border-amber-900/50 dark:bg-amber-950/25 px-4 py-3 text-sm text-amber-950 dark:text-amber-100/95 leading-relaxed"
          role="status"
        >
          <p className="font-semibold">This is a chapter quiz, not the module final exam.</p>
          <p className="mt-1.5 text-amber-900/90 dark:text-amber-100/85">
            The PDF track certificate uses your <strong>best score on the module final</strong> only (the large
            &quot;Take final exam&quot; card at the bottom of each track on the Lessons page). Chapter quiz scores
            (HTML / CSS / JavaScript) do not appear on that line.
          </p>
        </div>
      ) : null}

      <div className="space-y-6">
        {data.questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
          >
            <p className="font-medium text-gray-900 dark:text-white mb-3">
              {idx + 1}. {lang === 'am' ? q.question_am : q.question_en}
            </p>

            {q.type === 'multiple_choice' && q.options_json ? (
              <div className="space-y-2">
                {q.options_json.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[q.id] === opt
                        ? 'border-accent bg-accent/5 text-accent'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      className="accent-accent"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < data.questions.length}
        >
          {submitting ? <Spinner size="sm" /> : 'Submit'}
        </Button>
      </div>
    </div>
  );
}
