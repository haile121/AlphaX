'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { examsApi, type SubmitResult } from '@/lib/api';
import { requestGamificationRefresh } from '@/lib/gamificationRefresh';
import { useDialog } from '@/components/ui/DialogProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<{ id: string; title_en: string; title_am: string; time_limit_minutes: number } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { show } = useDialog();

  useEffect(() => {
    examsApi
      .get(id)
      .then((res) => setExam(res.data.exam))
      .catch((err) => {
        const remaining = err?.response?.data?.remaining;
        if (remaining) {
          show({
            variant: 'warning',
            title: 'Prerequisites Not Met',
            message: `Complete all lessons and quizzes before taking this exam.\n\nRemaining: ${remaining.map((r: { title: string }) => r.title).join(', ')}`,
          });
        } else {
          show({ variant: 'error', title: 'Error', message: 'Failed to load exam.' });
        }
      })
      .finally(() => setLoading(false));
  }, [id, show]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await examsApi.submit(id, answers);
      setResult(res.data);
      requestGamificationRefresh();
    } catch {
      show({ variant: 'error', title: 'Submit Failed', message: 'Could not submit exam.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!exam) return null;

  if (result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">{result.passed ? '🏆' : '😔'}</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {result.passed ? 'Exam Passed!' : 'Not Quite'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Score: {result.score}%</p>
        {result.passed && (
          <div className="flex justify-center gap-3">
            <Badge variant="success">+{result.xpAwarded} XP</Badge>
            <Badge variant="secondary">+{result.coinsAwarded} Coins</Badge>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{exam.title_en}</h1>
        <Badge variant="default">⏱ {exam.time_limit_minutes} min</Badge>
      </div>

      <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
        Answer all questions below. You need 70% or higher to pass.
      </p>

      {/* Exam questions would be loaded similarly to quiz — placeholder for now */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500">
        Exam questions will appear here once loaded from the backend.
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? <Spinner size="sm" /> : 'Submit Exam'}
        </Button>
      </div>
    </div>
  );
}
