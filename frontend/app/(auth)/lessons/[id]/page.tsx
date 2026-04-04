import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadCourseLessonById } from '@/lib/loadCourseLesson';
import { ALL_LESSON_IDS, getChapter1Lesson } from '@/lib/chapter1Curriculum';
import { LessonReader } from '@/components/lessons/LessonReader';

export function generateStaticParams() {
  return ALL_LESSON_IDS.map((id) => ({ id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const meta = getChapter1Lesson(id);
  if (!meta) return { title: 'Lesson' };
  return {
    title: `${meta.titleEn} | Lessons`,
    description: meta.blurbEn,
  };
}

export default async function LessonDetailPage({ params }: Props) {
  const { id } = await params;
  const data = loadCourseLessonById(id);
  if (!data) notFound();

  return <LessonReader lessonId={id} meta={data.meta} body={data.body} />;
}
