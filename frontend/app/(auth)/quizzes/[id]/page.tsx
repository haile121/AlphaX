'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { quizzesApi, type QuizData, type SubmitResult } from '@/lib/api';
import { requestGamificationRefresh } from '@/lib/gamificationRefresh';
import { getLanguage } from '@/lib/i18n';
import { useDialog } from '@/components/ui/DialogProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Language } from '@/types';

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lang] = useState<Language>(getLanguage());
  const { show } = useDialog();

  useEffect(() => {
    quizzesApi
      .get(id)
      .then((res) => setData(res.data))
      .catch(() => show({ variant: 'error', title: 'Error', message: 'Failed to load quiz.' }))
      .finally(() => setLoading(false));
  }, [id, show]);

  async function handleSubmit() {
    if (!data) return;
    setSubmitting(true);
    try {
      const res = await quizzesApi.submit(id, answers);
      setResult(res.data);
      requestGamificationRefresh();
    } catch {
      show({ variant: 'error', title: 'Submit Failed', message: 'Could not submit quiz.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!data) return null;

  if (result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className={`text-6xl mb-4 ${result.passed ? '' : ''}`}>{result.passed ? '🎉' : '😔'}</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {result.passed ? 'Quiz Passed!' : 'Not Quite'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Score: {result.score}%</p>
        {result.passed && (
          <div className="flex justify-center gap-3 mb-6">
            <Badge variant="success">+{result.xpAwarded} XP</Badge>
            <Badge variant="secondary">+{result.coinsAwarded} Coins</Badge>
          </div>
        )}
        <Button onClick={() => { setResult(null); setAnswers({}); }}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {lang === 'am' ? data.quiz.title_am ?? data.quiz.title_en : data.quiz.title_en}
      </h1>

      <div className="space-y-6">
        {data.questions.map((q, idx) => (
          <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
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
            ) : (
              <input
                type="text"
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Your answer…"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < data.questions.length}
        >
          {submitting ? <Spinner size="sm" /> : 'Submit Quiz'}
        </Button>
      </div>
    </div>
  );
}
