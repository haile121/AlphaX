/** Shared FAQ copy for the landing page and /faq. */
export type FaqItem = { q: string; a: string };

export const MARKETING_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Is it really free?',
    a: 'Yes. All lessons, the live compiler, and the AI tutor are completely free. Certificates are earned by completing levels. No payment ever required.',
  },
  {
    q: 'Do I need prior programming experience?',
    a: 'No. The diagnostic assessment places you at the right level automatically. Beginners start from absolute zero: variables, types, and basic I/O.',
  },
  {
    q: 'How does the bilingual toggle work?',
    a: 'Every lesson page has a language toggle. Switch between Amharic and English at any point without losing your progress or answers.',
  },
  {
    q: 'What is the AI tutor?',
    a: 'It uses Google Gemini to answer your programming questions in context. Ask in Amharic or English and get a clear, lesson-aware explanation in seconds.',
  },
  {
    q: 'How are certificates verified?',
    a: 'Each certificate has a unique ID and a public verification URL. Anyone (an employer, university, or colleague) can verify it is genuine.',
  },
  {
    q: 'Can I use it on mobile?',
    a: 'Yes. The platform is fully responsive. The compiler, lessons, and AI tutor all work on any screen size.',
  },
  {
    q: 'How do XP, levels, and streaks work?',
    a: 'You earn XP for lessons, quizzes, and other activity on the platform. Your daily streak only counts when you sign in each day—it grows on consecutive login days and is separate from XP.',
  },
  {
    q: 'Which browsers are supported?',
    a: 'Use a recent version of Chrome, Firefox, Safari, or Edge. Enable JavaScript and cookies so sign-in and the compiler session work reliably.',
  },
  {
    q: 'Is my code stored or visible to others?',
    a: 'Your submissions are tied to your account for feedback and progress. They are not published on a public gallery unless we explicitly add that feature later.',
  },
  {
    q: 'Who can I contact for help?',
    a: 'Use the Contact page for bugs, partnerships, or account issues. For quick product questions, this FAQ is the best place to start.',
  },
];
