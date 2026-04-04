'use client';

import Link from 'next/link';
import { ListTree } from 'lucide-react';
import type { ChapterInfo } from '@/lib/courseCurriculum';
import { cn } from '@/lib/cn';

type Props = {
  chapter: ChapterInfo;
  currentLessonId: string;
  className?: string;
};

export function LessonChapterNav({ chapter, currentLessonId, className }: Props) {
  return (
    <nav aria-label="Lessons in this chapter" className={cn('space-y-0.5', className)}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
        <ListTree className="h-3.5 w-3.5 opacity-70" aria-hidden />
        This chapter
      </p>
      <ul className="space-y-0.5">
        {chapter.lessons.map((lesson, i) => {
          const active = lesson.id === currentLessonId;
          return (
            <li key={lesson.id}>
              <Link
                href={`/lessons/${lesson.id}`}
                className={cn(
                  'flex gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors border border-transparent',
                  active
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-medium border-blue-200/80 dark:border-blue-800/60 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/80 hover:border-gray-200/80 dark:hover:border-gray-700'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums',
                    active ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 leading-snug line-clamp-3">{lesson.titleEn}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
