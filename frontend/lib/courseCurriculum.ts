/**
 * All lesson metadata + ordered list for navigation.
 * Text files live under frontend/content/{chapter1|chapter2|chapter3|chapter4}/partN.txt
 *
 * --- Maintainer source map (not shown to learners) ---
 * ch1-p1, ch1-p2 → study content/ch1/ch1part1.docx (split → content/chapter1/part1.txt, part2.txt)
 * ch1-p3 → study content/ch1/ch1part2 (→ part3.txt)
 * ch1-p4 → study content/ch1/ch1part4.docx (→ part4.txt)
 * ch2-p1…ch2-p4 → content/chapter2/part1.txt … part4.txt (full Ch.2 split into 4 sessions: 2.1–2.4)
 * ch3-p1…ch3-p4 → study content/ch3/ch_3 final(1).docx → chapter3-full.txt, then split-chapter3.cjs → part1.txt … part4.txt
 * ch4-p1…ch4-p6 → study content/ch4/ch4p1.docx + ch4p2.docx + ch4p3.docx → chapter4-full.txt, split-chapter4.cjs → part1…part6
 * web-p1…web-p6 → content/web/part1…part6 (Web track: HTML, CSS, JavaScript — two sessions per topic)
 * After editing Word sources, from frontend/: npm run extract:chapter1 | extract:chapter2 | extract:chapter3 | extract:chapter4
 */

export type ContentDir = 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'web';

export interface CourseLessonMeta {
  id: string;
  /** Set for C++ lessons only (Chapters 1–4). Omitted for the Web track. */
  chapterNumber?: 1 | 2 | 3 | 4;
  part: number;
  contentDir: ContentDir;
  titleEn: string;
  titleAm: string;
  blurbEn: string;
  estMinutes: number;
}

export interface ChapterInfo {
  slug: string;
  /** C++ uses numbered chapters 1–4; Web uses topic sections (HTML, CSS, JavaScript). */
  track: 'cpp' | 'web';
  /** C++ chapters only (1–4). Omitted for Web sections. */
  chapterNumber?: 1 | 2 | 3 | 4;
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  lessons: readonly CourseLessonMeta[];
}

export const CHAPTER_1 = {
  slug: 'chapter-1',
  track: 'cpp' as const,
  chapterNumber: 1 as const,
  titleEn: 'Chapter 1: Introduction & foundations',
  titleAm: 'ምዕራፍ 1: መግቢያ እና መሠረቶች',
  descriptionEn:
    'A full arc from what programming is to how code becomes a running program: languages, computers, flowcharts, hardware and OS ideas, programming styles, then compilers and interpreters.',
  descriptionAm:
    'ፕሮግራሚንግ ምን እንደሆነ፣ ቋንቋዎች፣ ኮምፒውተር እና ፍሰሮች፣ የኮምፒውተር አካል እና ኦፕሬቲንግ ሲስተም፣ የፕሮግራሚንግ አብዮች እና በመጨረሻም ኮምፓይለር እና ኢንተርፕሪተር፣ እስከ ማስኬድ ድረስ።',
  lessons: [
    {
      id: 'ch1-p1',
      chapterNumber: 1,
      part: 1,
      contentDir: 'chapter1',
      titleEn: 'Chapter 1: Introduction & foundations',
      titleAm: 'ምዕራፍ 1: መግቢያ እና መሠረቶች',
      blurbEn:
        'Programming concepts, language generations, syntax, how computers fit in, flowcharts, and exercises: introductory foundations.',
      estMinutes: 45,
    },
    {
      id: 'ch1-p2',
      chapterNumber: 1,
      part: 2,
      contentDir: 'chapter1',
      titleEn: 'Operators & C++ programs',
      titleAm: 'ኦፕሬተሮች እና የ C++ ፕሮግራሞች',
      blurbEn:
        'Operators, expressions, conditionals, loops, and sample C++ walkthroughs: moving from ideas to real code.',
      estMinutes: 50,
    },
    {
      id: 'ch1-p3',
      chapterNumber: 1,
      part: 3,
      contentDir: 'chapter1',
      titleEn: 'Computer organization, OS & programming paradigms',
      titleAm: 'የኮምፒውተር ድርጅት፣ ኦፕሬቲንግ ሲስተም እና የፕሮግራሚንግ አብዮቶች',
      blurbEn:
        'Memory, CPU, ALU, storage, operating systems, and procedural, structured, and object-oriented ways of thinking about programs.',
      estMinutes: 40,
    },
    {
      id: 'ch1-p4',
      chapterNumber: 1,
      part: 4,
      contentDir: 'chapter1',
      titleEn: 'Compilers & interpreters',
      titleAm: 'ኮምፓይለሮች እና ኢንተርፕሪተሮች',
      blurbEn:
        'Language translators, how compilers differ from interpreters, and what “building” or running your code really involves.',
      estMinutes: 30,
    },
  ] satisfies CourseLessonMeta[],
} as const satisfies ChapterInfo;

export const CHAPTER_2 = {
  slug: 'chapter-2',
  track: 'cpp' as const,
  chapterNumber: 2 as const,
  titleEn: 'Chapter 2: Basics of C++',
  titleAm: 'ምዕራፍ 2: የ C++ መሰረቶች',
  descriptionEn:
    'Four sessions from program structure to functions: the parts of a program, cout/cin, comments, and a first look at calling your own functions.',
  descriptionAm:
    'ከፕሮግራም መዋቅር እስከ ፋንክሽን፣ አራት ክፍሎች፦ አካላት፣ cout/cin፣ አስተያየት (comment)፣ እና Function መጀመሪያ።',
  lessons: [
    {
      id: 'ch2-p1',
      chapterNumber: 2,
      part: 1,
      contentDir: 'chapter2',
      titleEn: '2.1: The parts of a C++ program',
      titleAm: '2.1: የ C++ ፕሮግራም አካላት',
      blurbEn:
        'Preprocessor, #include, main(), braces, statements, and cout: the anatomy of a simple C++ program.',
      estMinutes: 35,
    },
    {
      id: 'ch2-p2',
      chapterNumber: 2,
      part: 2,
      contentDir: 'chapter2',
      titleEn: '2.2: cout and cin',
      titleAm: '2.2: cout እና cin',
      blurbEn:
        'Output and input streams, << and >>, chaining, and a small interactive example.',
      estMinutes: 35,
    },
    {
      id: 'ch2-p3',
      chapterNumber: 2,
      part: 3,
      contentDir: 'chapter2',
      titleEn: '2.3: Comments in C++',
      titleAm: '2.3: በ C++ አስተያየት (comment)',
      blurbEn:
        'Single-line // and multi-line /* */ comments, plus guidelines for readable code.',
      estMinutes: 25,
    },
    {
      id: 'ch2-p4',
      chapterNumber: 2,
      part: 4,
      contentDir: 'chapter2',
      titleEn: '2.4: A brief look at functions',
      titleAm: '2.4: አጭር እይታ በ function ላይ',
      blurbEn:
        'What functions are, headers and bodies, parameters vs arguments, return and void, with a demoFunction example.',
      estMinutes: 35,
    },
  ] satisfies CourseLessonMeta[],
} as const satisfies ChapterInfo;

export const CHAPTER_3 = {
  slug: 'chapter-3',
  track: 'cpp' as const,
  chapterNumber: 3 as const,
  titleEn: 'Chapter 3: Program control constructs',
  titleAm: 'ምዕራፍ 3: የፕሮግራም መቆጣጠሪያ መዋቅሮች',
  descriptionEn:
    'Flow of control: sequential execution, selection (if, switch), and repetition (for, while, do-while) with examples and practice — the full Chapter Three notes.',
  descriptionAm:
    'የፍሰት ቁጥጥር፦ ቅደም ተከተላዊ፣ ምርጫ (if፣ switch) እና ተደጋጋሚ ስራ (for፣ while፣ do-while) በምሳሌዎች እና በልምምድ ጥያቄዎች።',
  lessons: [
    {
      id: 'ch3-p1',
      chapterNumber: 3,
      part: 1,
      contentDir: 'chapter3',
      titleEn: '3.1: Flow of control, sequential & the if statement',
      titleAm: '3.1: የፍሰት ቁጥጥር፣ ቅደም ተከተል እና if',
      blurbEn:
        'Intro to flow control, sequential statements, selection overview, and the if statement (simple, if-else, nested).',
      estMinutes: 35,
    },
    {
      id: 'ch3-p2',
      chapterNumber: 3,
      part: 2,
      contentDir: 'chapter3',
      titleEn: '3.2: The switch statement',
      titleAm: '3.2: የ switch ዓረፍተ ነገር',
      blurbEn: 'Multiple-choice control flow: switch, case, break, default, and operator examples.',
      estMinutes: 30,
    },
    {
      id: 'ch3-p3',
      chapterNumber: 3,
      part: 3,
      contentDir: 'chapter3',
      titleEn: '3.3: Repetition — for, while, and do-while',
      titleAm: '3.3: መደጋገም — for፣ while እና do-while',
      blurbEn: 'The three C++ loops: syntax, execution steps, and typical patterns.',
      estMinutes: 40,
    },
    {
      id: 'ch3-p4',
      chapterNumber: 3,
      part: 4,
      contentDir: 'chapter3',
      titleEn: '3.4: Loop pitfalls, types, continue & break',
      titleAm: '3.4: የ loop ስህተቶች፣ አይነቶች፣ continue እና break',
      blurbEn:
        'Infinite loops, off-by-one errors, count- vs event-controlled loops, then continue and break.',
      estMinutes: 35,
    },
  ] satisfies CourseLessonMeta[],
} as const satisfies ChapterInfo;

export const CHAPTER_4 = {
  slug: 'chapter-4',
  track: 'cpp' as const,
  chapterNumber: 4 as const,
  titleEn: 'Chapter 4: Functions',
  titleAm: 'ምዕራፍ 4: ተግባራት (Functions)',
  descriptionEn:
    'From function basics and prototypes to parameters, scope, static and inline functions, defaults, overloading, and practice exercises.',
  descriptionAm:
    'ከተግባር መሰረቶች እስከ ፓራሜተሮች፣ የክልል ቁጥጥር፣ static እና inline፣ ነባሪ ክርክሮች፣ overloading እና ልምምድ ጥያቄዎች።',
  lessons: [
    {
      id: 'ch4-p1',
      chapterNumber: 4,
      part: 1,
      contentDir: 'chapter4',
      titleEn: 'Foundations: what is a function? Declare, define & call',
      titleAm: 'መሰረት፦ ተግባር ምንድን? ማወጃ፣ መግለጽ እና ጥሪ',
      blurbEn:
        'Function purpose, rules, declaring, defining, and calling functions — English notes plus Amharic walkthrough.',
      estMinutes: 35,
    },
    {
      id: 'ch4-p2',
      chapterNumber: 4,
      part: 2,
      contentDir: 'chapter4',
      titleEn: 'Parameters & arguments — pass by value and by reference',
      titleAm: 'ፓራሜተሮች — በዋጋ እና በማመሳከሪያ',
      blurbEn: 'Passing by value vs by reference, with examples and side effects.',
      estMinutes: 30,
    },
    {
      id: 'ch4-p3',
      chapterNumber: 4,
      part: 3,
      contentDir: 'chapter4',
      titleEn: 'Global vs local variables & the scope operator (::)',
      titleAm: 'Global እና local variables እና ::',
      blurbEn: 'Scope, nested blocks, and using :: to reach the global name.',
      estMinutes: 25,
    },
    {
      id: 'ch4-p4',
      chapterNumber: 4,
      part: 4,
      contentDir: 'chapter4',
      titleEn: 'Automatic vs static variables & inline functions',
      titleAm: 'Automatic vs static እና inline functions',
      blurbEn: 'Storage duration, static locals, and when to use inline.',
      estMinutes: 30,
    },
    {
      id: 'ch4-p5',
      chapterNumber: 4,
      part: 5,
      contentDir: 'chapter4',
      titleEn: 'Default arguments & function overloading',
      titleAm: 'ነባሪ ክርክሮች እና function overloading',
      blurbEn: 'Default parameters (right-hand rule) and overload resolution.',
      estMinutes: 30,
    },
    {
      id: 'ch4-p6',
      chapterNumber: 4,
      part: 6,
      contentDir: 'chapter4',
      titleEn: 'Practice exercises & solutions',
      titleAm: 'ልምምድ ጥያቄዎች እና መፍትሄዎች',
      blurbEn: 'Worked examples (e.g. factorial, e approximation, isEven) with full code.',
      estMinutes: 25,
    },
  ] satisfies CourseLessonMeta[],
} as const satisfies ChapterInfo;

/** HTML — two sessions: document structure, then forms & media. */
export const WEB_HTML = {
  slug: 'web-html',
  track: 'web' as const,
  titleEn: 'HTML: documents & meaning',
  titleAm: 'HTML፦ ሰነዶች እና ትርጉም',
  descriptionEn:
    'How HTML describes structure and meaning: valid documents, semantic sections, text, lists, and links — the foundation before styling or scripting.',
  descriptionAm:
    'HTML የድር ገጽ አቀራረብ እና ትርጉም እንዴት እንደሚገልጽ፦ ትክክለኛ ሰነዶች፣ የትርጉም ክፍሎች፣ ጽሑፍ፣ ዝርዝሮች እና አገናኞች።',
  lessons: [
    {
      id: 'web-p1',
      part: 1,
      contentDir: 'web',
      titleEn: 'HTML — document outline & semantic structure',
      titleAm: 'HTML — የሰነድ አቀራረብ እና ትርጉማዊ መዋቅር',
      blurbEn:
        'Doctype, html/head/body, metadata, heading hierarchy, paragraphs, lists, links, images, and landmark regions — building a readable outline for users and machines.',
      estMinutes: 45,
    },
    {
      id: 'web-p2',
      part: 2,
      contentDir: 'web',
      titleEn: 'HTML — forms, tables & accessibility basics',
      titleAm: 'HTML — ቅጾች፣ ሰንጠረዶች እና ተደራሽነት',
      blurbEn:
        'Forms and inputs with labels, tables for tabular data, media elements, and practical accessibility: focus, alt text, and associating controls correctly.',
      estMinutes: 45,
    },
  ] satisfies CourseLessonMeta[],
} as const satisfies ChapterInfo;

/** CSS — two sessions: rules and type, then layout systems. */
export const WEB_CSS = {
  slug: 'web-css',
  track: 'web' as const,
  titleEn: 'CSS: presentation & layout',
  titleAm: 'CSS፦ መልክ እና አቀማመጥ',
  descriptionEn:
    'From selectors and the cascade to the box model, flexbox, grid, and responsive breakpoints — controlling how HTML looks on different screens.',
  descriptionAm:
    'ከ selector እና cascade እስከ box model፣ Flexbox፣ Grid እና responsive breakpoint — HTML በተለያዩ ስክሪኖች ላይ እንዴት እንደሚታይ።',
  lessons: [
    {
      id: 'web-p3',
      part: 3,
      contentDir: 'web',
      titleEn: 'CSS — selectors, cascade & visual design',
      titleAm: 'CSS — selectors፣ cascade እና ውበት',
      blurbEn:
        'Selector types, specificity, inheritance, typography, color spaces, units (rem, em, %), and simple transitions — styling text and components predictably.',
      estMinutes: 45,
    },
    {
      id: 'web-p4',
      part: 4,
      contentDir: 'web',
      titleEn: 'CSS — box model, flex, grid & responsive',
      titleAm: 'CSS — box model፣ flex፣ grid እና responsive',
      blurbEn:
        'Box sizing and spacing, flexbox and grid for real layouts, positioning, and media queries so layouts adapt instead of breaking.',
      estMinutes: 50,
    },
  ] satisfies CourseLessonMeta[],
} as const satisfies ChapterInfo;

/** JavaScript — two sessions: language basics, then DOM and events. */
export const WEB_JS = {
  slug: 'web-js',
  track: 'web' as const,
  titleEn: 'JavaScript: language & browser APIs',
  titleAm: 'JavaScript፦ ቋንቋ እና የአሳሽ API',
  descriptionEn:
    'Modern JavaScript syntax and modules, then the DOM, events, and safe patterns for updating the page — how behavior connects to HTML and CSS.',
  descriptionAm:
    'ዘመናዊ JavaScript እና ሞዱሎች፣ ከዚያም DOM፣ ክስተቶች እና ገጹን በደህንነት የመቀየር ዘዴዎች።',
  lessons: [
    {
      id: 'web-p5',
      part: 5,
      contentDir: 'web',
      titleEn: 'JavaScript — syntax, functions & modules',
      titleAm: 'JavaScript — ስንትክስ፣ ተግባራት እና ሞዱሎች',
      blurbEn:
        'let/const, functions and arrow functions, scope, template literals, strict mode, organizing code in files, and loading scripts efficiently.',
      estMinutes: 45,
    },
    {
      id: 'web-p6',
      part: 6,
      contentDir: 'web',
      titleEn: 'JavaScript — DOM, events & safe updates',
      titleAm: 'JavaScript — DOM፣ ክስተቶች እና ደህንነት',
      blurbEn:
        'querySelector, textContent vs innerHTML, addEventListener, event flow, form handling, and avoiding XSS when showing user content.',
      estMinutes: 50,
    },
  ] satisfies CourseLessonMeta[],
} as const satisfies ChapterInfo;

/** C++ only — Chapters 1–4. */
export const CPP_CHAPTERS = [CHAPTER_1, CHAPTER_2, CHAPTER_3, CHAPTER_4] as const;

/** Web track — HTML, then CSS, then JavaScript (two sessions each). */
export const WEB_CHAPTERS = [WEB_HTML, WEB_CSS, WEB_JS] as const;

export const CHAPTERS: readonly ChapterInfo[] = [...CPP_CHAPTERS, ...WEB_CHAPTERS] as const;

export const ALL_LESSONS: CourseLessonMeta[] = [
  ...CHAPTER_1.lessons,
  ...CHAPTER_2.lessons,
  ...CHAPTER_3.lessons,
  ...CHAPTER_4.lessons,
  ...WEB_HTML.lessons,
  ...WEB_CSS.lessons,
  ...WEB_JS.lessons,
];

export const ALL_LESSON_IDS = ALL_LESSONS.map((l) => l.id);

/** Backend `course_track_quizzes.id` for each reading chapter (multiple choice after the chapter). */
export const COURSE_CHAPTER_QUIZ_IDS: Record<string, string> = {
  'chapter-1': 'cpp-ch1',
  'chapter-2': 'cpp-ch2',
  'chapter-3': 'cpp-ch3',
  'chapter-4': 'cpp-ch4',
  'web-html': 'web-html',
  'web-css': 'web-css',
  'web-js': 'web-js',
};

/** End-of-module final exam quiz ids (C++ and Web tracks). */
export const COURSE_TRACK_FINAL_QUIZ_IDS = { cpp: 'cpp-final', web: 'web-final' } as const;

/** Old ids from the removed “Chapter 5” naming — map to `web-p*`. */
export const LEGACY_LESSON_ID_MAP: Record<string, string> = {
  'ch5-p1': 'web-p1',
  'ch5-p2': 'web-p2',
  'ch5-p3': 'web-p3',
};

export function normalizeLegacyLessonId(id: string): string {
  return LEGACY_LESSON_ID_MAP[id] ?? id;
}

/** v2 key; migrates from cpp-course-ch1-completed on first read */
export const STORAGE_KEY_PROGRESS = 'cpp-course-lessons-completed';
export const STORAGE_KEY_LEGACY_CH1 = 'cpp-course-ch1-completed';

export function getCourseLesson(id: string): CourseLessonMeta | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function getCourseLessonIndex(id: string): number {
  return ALL_LESSONS.findIndex((l) => l.id === id);
}

export function getChapterForLesson(lesson: CourseLessonMeta): ChapterInfo {
  return CHAPTERS.find((c) => c.lessons.some((l) => l.id === lesson.id)) ?? CHAPTER_1;
}

/** @deprecated use getCourseLesson */
export const getChapter1Lesson = getCourseLesson;
/** @deprecated use getCourseLessonIndex */
export const getChapter1LessonIndex = getCourseLessonIndex;
export type Chapter1LessonMeta = CourseLessonMeta;
