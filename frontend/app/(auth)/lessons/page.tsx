import { BookOpen } from 'lucide-react';
import { CHAPTER_1 } from '@/lib/chapter1Curriculum';
import { Chapter1LessonList } from '@/components/lessons/Chapter1LessonList';

export default function LessonsPage() {
  return (
    <div className="max-w-4xl mx-auto min-w-0 px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Lessons</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              C++ chapters and Web fundamentals (HTML, CSS & JavaScript) — unlock each track with a placement quiz when you&apos;re signed in.
            </p>
          </div>
        </div>
      </div>

      <Chapter1LessonList />
    </div>
  );
}

export const metadata = {
  title: 'Lessons | AlphaX Programming',
  description: CHAPTER_1.descriptionEn,
};
