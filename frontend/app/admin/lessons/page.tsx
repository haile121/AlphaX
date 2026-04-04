'use client';

import { useEffect, useState } from 'react';
import { lessonsApi, type LessonSummary } from '@/lib/api';
import { useDialog } from '@/components/ui/DialogProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import api from '@/lib/api';

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useDialog();

  // Admin can see all lessons — use a direct API call
  useEffect(() => {
    api.get<{ lessons: LessonSummary[] }>('/api/lessons?admin=true')
      .then((r) => setLessons(r.data.lessons))
      .catch(() => lessonsApi.list().then((r) => setLessons(r.data.lessons)))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(lesson: LessonSummary) {
    show({
      variant: 'confirm',
      title: 'Delete Lesson',
      message: `Delete "${lesson.title_en}"? This may affect prerequisite chains.`,
      primaryAction: {
        label: 'Delete',
        onClick: async () => {
          try {
            await api.delete(`/api/lessons/${lesson.id}`);
            setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
          } catch (err: unknown) {
            const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
            if (code === 'IS_PREREQUISITE') {
              show({
                variant: 'warning',
                title: 'Lesson is a Prerequisite',
                message: 'This lesson is required by other lessons. Use force delete to remove it anyway.',
                primaryAction: {
                  label: 'Force Delete',
                  onClick: async () => {
                    await api.delete(`/api/lessons/${lesson.id}?force=true`);
                    setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
                  },
                },
              });
            }
          }
        },
      },
    });
  }

  if (loading) return <div className="flex justify-center p-16"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Lessons ({lessons.length})</h1>
        <Button size="sm">+ New Lesson</Button>
      </div>

      <div className="space-y-2">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{lesson.title_en}</p>
              <p className="text-xs text-gray-500 mt-0.5">Order: {lesson.order_index}</p>
            </div>
            <div className="flex items-center gap-2">
              {lesson.is_published ? <Badge variant="success">Published</Badge> : <Badge variant="default">Draft</Badge>}
              {lesson.is_downloadable && <Badge variant="secondary">PDF</Badge>}
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(lesson)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
