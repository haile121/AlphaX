'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { ArrowRight, ArrowUp, BookMarked, Check, ChevronLeft, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { LessonChapterNav } from '@/components/lessons/LessonChapterNav';
import {
  ALL_LESSONS,
  getChapter1LessonIndex,
  getChapterForLesson,
  type Chapter1LessonMeta,
} from '@/lib/chapter1Curriculum';
import { useAuthSyncHint, markLessonCompleteSynced, syncCourseReadingProgressWithServer } from '@/lib/courseReadingProgress';
import { requestGamificationRefresh } from '@/lib/gamificationRefresh';
import { useDialog } from '@/components/ui/DialogProvider';
import { Spinner } from '@/components/ui/Spinner';
import { authApi } from '@/lib/api';
import { canAccessLessonTrack, isWebLessonId } from '@/lib/trackAccess';
import type { User } from '@/types';
import { cn } from '@/lib/cn';

function estimateReadMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

interface LessonReaderProps {
  lessonId: string;
  meta: Chapter1LessonMeta;
  body: string;
}

export function LessonReader({ lessonId, meta, body }: LessonReaderProps) {
  const authHint = useAuthSyncHint();
  const { show } = useDialog();
  const chapter = getChapterForLesson(meta);
  const sessionInChapter = chapter.lessons.findIndex((l) => l.id === lessonId) + 1;
  const sessionTotal = chapter.lessons.length;
  const idx = getChapter1LessonIndex(lessonId);
  const prev = idx > 0 ? ALL_LESSONS[idx - 1] : null;
  const next = idx >= 0 && idx < ALL_LESSONS.length - 1 ? ALL_LESSONS[idx + 1] : null;
  const nextIsNewChapter = next
    ? getChapterForLesson(next).slug !== chapter.slug
    : false;
  const [completed, setCompleted] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [showBackTop, setShowBackTop] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);
  const [gateUser, setGateUser] = useState<User | null | undefined>(undefined);

  const readMin = estimateReadMinutes(body);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ids = await syncCourseReadingProgressWithServer();
      if (!cancelled) setCompleted(ids.includes(lessonId));
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

  const onScroll = useCallback(() => {
    const el = document.documentElement;
    const scrollTop = window.scrollY;
    const docHeight = el.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 100;
    setScrollPct(pct);
    setShowBackTop(scrollTop > 360);
    setCompactHeader(scrollTop > 120);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll, lessonId, body]);

  useEffect(() => {
    if (!Cookies.get('logged_in')) {
      setGateUser(null);
      return;
    }
    let cancelled = false;
    void authApi
      .me()
      .then((r) => {
        if (!cancelled) setGateUser(r.data.user);
      })
      .catch(() => {
        if (!cancelled) setGateUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  async function markComplete() {
    const { xp_awarded, coins_awarded, synced } = await markLessonCompleteSynced(lessonId);
    setCompleted(true);
    if (synced) requestGamificationRefresh();
    if (xp_awarded > 0 || coins_awarded > 0) {
      const parts: string[] = [];
      if (xp_awarded > 0) parts.push(`+${xp_awarded} XP`);
      if (coins_awarded > 0) parts.push(`+${coins_awarded} coins`);
      show({
        variant: 'success',
        title: 'Lesson marked as read',
        message: `${parts.join(' · ')} added to your progress.`,
      });
    }
  }

  if (gateUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (gateUser && !canAccessLessonTrack(gateUser, lessonId)) {
    const track = isWebLessonId(lessonId) ? 'web' : 'cpp';
    const label = track === 'web' ? 'Web fundamentals' : 'C++';
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 mb-6 ring-1 ring-black/5 dark:ring-white/10">
          <Lock className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{label} lessons are locked</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Take the short placement test for this track to unlock all reading sessions and progress tracking.
        </p>
        <Link
          href={`/assessment?track=${track}`}
          className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 shadow-md shadow-blue-600/20"
        >
          Start placement test
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <p className="mt-6">
          <Link href="/lessons" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to lessons
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Reading progress — sits under fixed navbar (h-16) */}
      <div
        className="fixed top-16 left-0 right-0 z-[35] h-1 bg-gray-200/90 dark:bg-gray-800/90 pointer-events-none"
        aria-hidden
      >
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 transition-[width] duration-150 ease-out"
          style={{ width: `${scrollPct}%` }}
        />
      </div>

      {/* Sticky lesson title — mobile / tablet (docs-style) */}
      <div
        className={cn(
          'fixed top-16 left-0 right-0 z-[34] lg:hidden border-b border-gray-200/80 dark:border-gray-800',
          'bg-white/90 dark:bg-gray-950/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-950/80',
          'transition-[opacity,transform] duration-200 ease-out',
          compactHeader ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
        )}
        aria-hidden={!compactHeader}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 min-w-0">
          <Link
            href="/lessons"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0 hover:underline underline-offset-2"
          >
            All lessons
          </Link>
          <span className="text-gray-300 dark:text-gray-600" aria-hidden>
            /
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{meta.titleEn}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-36 sm:pb-40">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 xl:gap-12 lg:items-start">
          <div className="min-w-0 max-w-3xl lg:max-w-none">
            <nav
              aria-label="Breadcrumb"
              className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex flex-wrap items-center gap-x-1 gap-y-1"
            >
              <Link
                href="/lessons"
                className="hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
              >
                Lessons
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
              <span className="text-gray-600 dark:text-gray-300 truncate max-w-[min(100%,12rem)] sm:max-w-none">
                {chapter.titleEn}
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
              <span className="text-gray-900 dark:text-white font-medium truncate">Part {meta.part}</span>
            </nav>

            <div className="mb-6 lg:hidden">
              <CollapsibleSection
                title="On this page"
                description="Sessions in this chapter — jump without leaving the course."
                defaultOpen={false}
                variant="nested"
                panelClassName="pt-2"
              >
                <LessonChapterNav chapter={chapter} currentLessonId={lessonId} />
              </CollapsibleSection>
            </div>

            <header className="mb-8 space-y-3 scroll-mt-28">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 font-semibold text-blue-700 dark:text-blue-300">
                  {chapter.track === 'web'
                    ? `Web fundamentals · Session ${sessionInChapter}/${sessionTotal}`
                    : `Chapter ${chapter.chapterNumber} · Session ${sessionInChapter}/${sessionTotal}`}
                </span>
                <span className="text-gray-400 dark:text-gray-500">·</span>
                <span>~{readMin} min read</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight text-balance">
                {meta.titleEn}
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                {meta.titleAm}
              </p>
            </header>

            <article
              className="rounded-2xl border border-gray-200/90 dark:border-gray-700/90 bg-gradient-to-b from-white to-gray-50/90 dark:from-gray-900 dark:to-gray-950/80 shadow-sm overflow-hidden ring-1 ring-black/[0.03] dark:ring-white/[0.04]"
              aria-label="Lesson content"
            >
              <div className="px-4 sm:px-8 py-8 sm:py-11">
                <div
                  className={cn(
                    'whitespace-pre-wrap font-sans text-[16px] sm:text-[17px] leading-[1.75] sm:leading-[1.8]',
                    'text-gray-800 dark:text-gray-200 break-words selection:bg-blue-200/80 dark:selection:bg-blue-900/50',
                    'max-w-[65ch]'
                  )}
                >
                  {body}
                </div>
              </div>
            </article>

            <div className="mt-8 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-900/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Button
                type="button"
                variant={completed ? 'outline' : 'primary'}
                size="lg"
                className={cn('w-full sm:w-auto transition-transform', completed && 'opacity-90')}
                onClick={markComplete}
                disabled={completed}
                aria-pressed={completed}
              >
                {completed ? (
                  <>
                    <Check className="h-4 w-4 mr-2" aria-hidden />
                    Marked as read
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" aria-hidden />
                    Mark as read
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right max-w-sm sm:max-w-md leading-relaxed">
                {!authHint.ready
                  ? 'Marked as read syncs to your account when you’re signed in; it’s also stored in this browser. The bar under the header shows scroll position on this page.'
                  : authHint.signedIn
                    ? 'Marked as read is saved to your account when online and cached here. The thin bar under the header shows scroll position on this page only.'
                    : 'Marked as read stays on this device until you sign in. The bar under the header shows scroll position on this page.'}
              </p>
            </div>

            <section className="mt-10" aria-labelledby="next-read-heading">
              {next ? (
                <CollapsibleSection
                  title="Next up"
                  description={next.titleEn}
                  defaultOpen
                  trailing={
                    <span className="rounded-md bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                      {nextIsNewChapter ? 'Next chapter' : 'Next session'}
                    </span>
                  }
                  panelClassName="pt-2"
                >
                  <div className="rounded-xl border border-blue-200/70 dark:border-blue-900/45 bg-gradient-to-br from-blue-50/90 to-indigo-50/40 dark:from-blue-950/35 dark:to-indigo-950/20 p-4 sm:p-5 ring-1 ring-blue-100/60 dark:ring-blue-900/25">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                        <BookMarked className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <h2 id="next-read-heading" className="sr-only">
                          Next lesson
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {nextIsNewChapter
                            ? "When you're ready, continue with the next chapter — new topics from your notes."
                            : "When you're ready, keep going with the next session — same chapter, new topics."}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 italic border-l-2 border-blue-300 dark:border-blue-700 pl-3">
                          ወደ ቀጣዩ ክፍል ይሂዱ — ተመሳሳይ ምዕራፍ፣ አዲስ ርዕሶች።
                        </p>
                        <div className="pt-1">
                          <p className="text-base font-semibold text-gray-900 dark:text-white">{next.titleEn}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{next.titleAm}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 line-clamp-3">{next.blurbEn}</p>
                        </div>
                        <Link
                          href={`/lessons/${next.id}`}
                          className={cn(
                            'mt-3 inline-flex items-center justify-center gap-2 w-full sm:w-auto',
                            'px-5 py-3 text-sm font-semibold rounded-xl transition-colors',
                            'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:ring-offset-gray-950'
                          )}
                        >
                          Continue to next lesson
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              ) : (
                <CollapsibleSection title="All caught up" description="Last published lesson for now — explore the app." defaultOpen>
                  <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/90 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/15 p-4 sm:p-5 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                        <Sparkles className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <h2 id="next-read-heading" className="sr-only">
                          What&apos;s next
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          Review the lesson list anytime, or try the compiler and quizzes when you&apos;re ready.
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 italic border-l-2 border-emerald-300 dark:border-emerald-800 pl-3">
                          ምዕራፉን አጠናቀዋል። ዝግጅት ሲሆኑ ወደ ልምምድ ይሂዱ።
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <Link
                            href="/lessons"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          >
                            Back to all lessons
                            <ArrowRight className="h-4 w-4" aria-hidden />
                          </Link>
                          <Link
                            href="/compiler"
                            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-800"
                          >
                            Try the compiler
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              )}
            </section>
          </div>

          <aside className="hidden lg:block min-w-0">
            <div className="sticky top-20 xl:top-24 max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-gray-200/90 dark:border-gray-700/90 bg-white/90 dark:bg-gray-900/80 p-4 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
              <LessonChapterNav chapter={chapter} currentLessonId={lessonId} />
            </div>
          </aside>
        </div>
      </div>

      {showBackTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-28 sm:bottom-32 right-4 sm:right-6 z-[36] flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-[35] border-t border-gray-200/90 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-stretch sm:items-center justify-between gap-3">
          {prev ? (
            <Link
              href={`/lessons/${prev.id}`}
              className="group inline-flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 text-left min-w-0 flex-1 sm:flex-none rounded-lg -m-1 p-1 hover:bg-gray-50 dark:hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {prev.titleEn}
              </span>
            </Link>
          ) : (
            <div className="text-sm text-gray-400 dark:text-gray-600 py-1">First lesson</div>
          )}

          {next ? (
            <Link
              href={`/lessons/${next.id}`}
              className="group inline-flex flex-col sm:flex-row sm:items-center sm:justify-end gap-0.5 sm:gap-1.5 text-right min-w-0 flex-1 sm:flex-none rounded-lg -m-1 p-1 hover:bg-gray-50 dark:hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 sm:order-2">
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:underline sm:order-1">
                {next.titleEn}
              </span>
            </Link>
          ) : (
            <Link
              href="/lessons"
              className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              All lessons
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
