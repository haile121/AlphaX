/**
 * Seeds course_track_quizzes + course_track_quiz_questions (run from backend/: npm run seed:course-track-quizzes).
 */
import mysql, { type RowDataPacket } from 'mysql2/promise';
import { loadBackendEnv } from './loadBackendEnv';

loadBackendEnv();

type QuizMeta = {
  id: string;
  track: 'cpp' | 'web';
  chapter_slug: string;
  title_en: string;
  title_am: string;
  xp_reward: number;
  coin_reward: number;
  is_final: 0 | 1;
  pass_threshold: number;
  cert_min_score: number | null;
};

type QRow = {
  id: string;
  quiz_id: string;
  sort_order: number;
  question_en: string;
  question_am: string;
  options: string[];
  correct_answer: string;
};

const QUIZZES: QuizMeta[] = [
  { id: 'cpp-ch1', track: 'cpp', chapter_slug: 'chapter-1', title_en: 'Chapter 1 quiz: Getting started', title_am: 'ምዕራፍ 1 ፈተና', xp_reward: 15, coin_reward: 5, is_final: 0, pass_threshold: 70, cert_min_score: null },
  { id: 'cpp-ch2', track: 'cpp', chapter_slug: 'chapter-2', title_en: 'Chapter 2 quiz: Control flow', title_am: 'ምዕራፍ 2 ፈተና', xp_reward: 15, coin_reward: 5, is_final: 0, pass_threshold: 70, cert_min_score: null },
  { id: 'cpp-ch3', track: 'cpp', chapter_slug: 'chapter-3', title_en: 'Chapter 3 quiz: Functions & data', title_am: 'ምዕራፍ 3 ፈተና', xp_reward: 15, coin_reward: 5, is_final: 0, pass_threshold: 70, cert_min_score: null },
  { id: 'cpp-ch4', track: 'cpp', chapter_slug: 'chapter-4', title_en: 'Chapter 4 quiz: Pointers & OOP basics', title_am: 'ምዕራፍ 4 ፈተና', xp_reward: 15, coin_reward: 5, is_final: 0, pass_threshold: 70, cert_min_score: null },
  { id: 'cpp-final', track: 'cpp', chapter_slug: 'cpp-final', title_en: 'C++ module final exam', title_am: 'C++ ሞዱል የመጨረሻ ፈተና', xp_reward: 40, coin_reward: 15, is_final: 1, pass_threshold: 70, cert_min_score: 90 },
  { id: 'web-html', track: 'web', chapter_slug: 'web-html', title_en: 'HTML fundamentals quiz', title_am: 'HTML መሰረት ፈተና', xp_reward: 15, coin_reward: 5, is_final: 0, pass_threshold: 70, cert_min_score: null },
  { id: 'web-css', track: 'web', chapter_slug: 'web-css', title_en: 'CSS fundamentals quiz', title_am: 'CSS መሰረት ፈተና', xp_reward: 15, coin_reward: 5, is_final: 0, pass_threshold: 70, cert_min_score: null },
  { id: 'web-js', track: 'web', chapter_slug: 'web-js', title_en: 'JavaScript fundamentals quiz', title_am: 'JavaScript መሰረት ፈተና', xp_reward: 15, coin_reward: 5, is_final: 0, pass_threshold: 70, cert_min_score: null },
  { id: 'web-final', track: 'web', chapter_slug: 'web-final', title_en: 'Web fundamentals module final exam', title_am: 'የድር መሰረቶች ሞዱል የመጨረሻ ፈተና', xp_reward: 40, coin_reward: 15, is_final: 1, pass_threshold: 70, cert_min_score: 90 },
];

function mc(
  quiz_id: string,
  n: number,
  en: string,
  am: string,
  options: [string, string, string, string],
  correct: string
): QRow {
  return {
    id: `${quiz_id}-q${n}`,
    quiz_id,
    sort_order: n,
    question_en: en,
    question_am: am,
    options: [...options],
    correct_answer: correct,
  };
}

const QUESTIONS: QRow[] = [
  ...[
    mc('cpp-ch1', 1, 'Which function is the conventional entry point of a C++ program?', 'የC++ ፕሮግራም መደበኛ መግቢያ ነጥብ የትኛው ነው?', ['main()', 'start()', 'init()', 'program()'], 'main()'),
    mc('cpp-ch1', 2, 'Which type is most appropriate for storing a whole number like 42?', '42 ያለ አካል ቁጥር ለማከማቸት የትኛው ዓይነት ተስማሚ ነው?', ['int', 'float', 'char', 'bool'], 'int'),
    mc('cpp-ch1', 3, 'Which header is commonly included to use std::cout?', 'std::cout ለመጠቀም ብዙውን ጊዜ የትኛውን ራስጌ ያካትታሉ?', ['<iostream>', '<fstream>', '<vector>', '<string>'], '<iostream>'),
    mc('cpp-ch1', 4, 'What does std::endl often do when sent to std::cout?', 'ወደ std::cout ሲላክ std::endl ብዙውን ጊዜ ምን ያደርጋል?', ['Inserts a newline and may flush the stream', 'Clears the screen', 'Closes the program', 'Declares a variable'], 'Inserts a newline and may flush the stream'),
  ],
  ...[
    mc('cpp-ch2', 1, 'Which keyword starts a conditional block in C++?', 'በC++ ውስጥ የ Konditional ብሎክ የሚጀመረው በየትኛው ቁልፍ ቃል ነው?', ['if', 'loop', 'switching', 'check'], 'if'),
    mc('cpp-ch2', 2, 'A for loop is most often used when…', 'የfor ዙረት ብዙውን ጊዜ ያገለግላል ሲ…', ['You know how many iterations you need', 'You never need to iterate', 'You only read files', 'You avoid variables'], 'You know how many iterations you need'),
    mc('cpp-ch2', 3, 'What does break; do inside a switch statement?', 'ከswitch ውስጥ break; ምን ያደርጋል?', ['Exits the switch (or loop if applicable)', 'Starts the next case always', 'Repeats the case', 'Deletes variables'], 'Exits the switch (or loop if applicable)'),
    mc('cpp-ch2', 4, 'Which loop checks the condition at the bottom at least once?', 'የትኛው ዙረት ኮንዲሽኑን ቢያንስ አንድ ጊዜ በታች ያረጋግጣል?', ['do-while', 'for', 'while', 'foreach'], 'do-while'),
  ],
  ...[
    mc('cpp-ch3', 1, 'What is a function prototype?', 'የተግባር ፕሮቶታይፕ ምንድን ነው?', ['A declaration showing name, parameters, and return type', 'The compiled binary', 'A comment only', 'A type of loop'], 'A declaration showing name, parameters, and return type'),
    mc('cpp-ch3', 2, 'In C++, arrays are indexed starting at…', 'በC++ ውስጥ አረይዎች ከየት ይጀምራሉ?', ['0', '1', '-1', '2'], '0'),
    mc('cpp-ch3', 3, 'Passing a large object by reference avoids…', 'ትልቅ ነገር በሪፈረንስ ማስተላለፍ ያስወግዳል…', ['Copying the whole object by default', 'All errors', 'The need for functions', 'Using headers'], 'Copying the whole object by default'),
    mc('cpp-ch3', 4, 'std::vector is preferred over raw C arrays for many tasks because it…', 'std::vector በብዙ ስራዎች ከንጹህ C አረይዎች ይመረጣል ምክንያቱ…', ['Manages size and reallocation safely', 'Cannot store numbers', 'Has no iterators', 'Is always slower'], 'Manages size and reallocation safely'),
  ],
  ...[
    mc('cpp-ch4', 1, 'What does the address-of operator & produce for a variable x?', 'ለx ተለዋዋጭ ለአድራሻ-የሚመዘግበው ኦፕሬተር & ምን ያመርታል?', ['A pointer to x', 'The value of x doubled', 'A reference count', 'A random number'], 'A pointer to x'),
    mc('cpp-ch4', 2, 'Dereferencing a valid pointer typically uses…', 'ትክክለኛ ጠቋሚን ማውጣት ብዙውን ጊዜ ይጠቀማል…', ['The * operator', 'The + operator', 'sizeof only', 'delete only'], 'The * operator'),
    mc('cpp-ch4', 3, 'In OOP, encapsulation often means…', 'በOOP ውስጥ መከታተል ብዙውን ጊዜ ያመለክታል…', ['Hiding internal state behind an interface', 'Removing all functions', 'Using only global variables', 'Disabling classes'], 'Hiding internal state behind an interface'),
    mc('cpp-ch4', 4, 'A class member function is also called a…', 'የክላስ አባል ተግባር ደግሞ ይባላል…', ['Method', 'Macro', 'Header', 'Literal'], 'Method'),
  ],
  ...[
    mc('cpp-final', 1, 'Which of the following is a valid C++ integer literal?', 'የሚከተለው ውስጥ የሚሰራ C++ አካል ቁጥር ሊተረጉም ነው?', ['42', '4.2.1', '"42"', '4e2.3'], '42'),
    mc('cpp-final', 2, 'What is the purpose of #include?', '#include ዓላማው ምንድን ነው?', ['Pull in declarations from a header', 'Run the program faster', 'Create a new OS', 'Compile without source'], 'Pull in declarations from a header'),
    mc('cpp-final', 3, 'If a function is declared void f(), what does void mean here?', 'void f() ከተዘጋጀ void እዚህ ምን ያመለክታል?', ['No return value to the caller', 'Returns any type', 'Returns only int', 'Undefined behavior'], 'No return value to the caller'),
    mc('cpp-final', 4, 'Which statement best describes a reference in C++?', 'በC++ ሪፈረንስን በጥሩ ሁኔታ የሚገልጽው የትኛው ነው?', ['An alias for an existing object', 'A copy that cannot be changed', 'A pointer that is always null', 'A new heap allocation'], 'An alias for an existing object'),
    mc('cpp-final', 5, 'What does new typically do in C++?', 'በC++ new ብዙውን ጊዜ ምን ያደርጋል?', ['Allocates dynamic storage', 'Frees memory', 'Opens a file', 'Starts a thread'], 'Allocates dynamic storage'),
    mc('cpp-final', 6, 'Which access specifier hides members from outside the class?', 'ከክላስ ውጭ አባላትን የሚደብቀው የትኛው የመዳረሻ ምድብ ነው?', ['private', 'public', 'static', 'inline'], 'private'),
    mc('cpp-final', 7, 'A compile-time error is detected by…', 'የኮምፓይል ጊዜ ስህተት ይገኛል በ…', ['The compiler before running', 'Only at runtime always', 'The user manually', 'The CPU fan speed'], 'The compiler before running'),
    mc('cpp-final', 8, 'std::string is safer than fixed char[] for many text tasks because it…', 'std::string ለብዙ ጽሑፍ ስራዎች ከተወሰነ char[] ይደህን ምክንያቱ…', ['Tracks length and manages memory', 'Cannot grow', 'Ignores null terminators always', 'Only stores numbers'], 'Tracks length and manages memory'),
  ],
  ...[
    mc('web-html', 1, 'Which element is most appropriate for the main unique content of a page?', 'ለገጽ ዋና ልዩ ይዘት የትኛው አካል ተስማሚ ነው?', ['<main>', '<div> only', '<meta>', '<br>'], '<main>'),
    mc('web-html', 2, 'What does <!DOCTYPE html> declare?', '<!DOCTYPE html> ምን ያስታውቃል?', ['That the document is HTML5', 'That CSS is disabled', 'That JavaScript runs on server only', 'That the page has no text'], 'That the document is HTML5'),
    mc('web-html', 3, 'Which attribute provides alternative text for images?', 'ለምስሎች አማራጭ ጽሑፍ የሚሰጠው ባህሪ የትኛው ነው?', ['alt', 'src', 'href', 'title'], 'alt'),
    mc('web-html', 4, 'Semantic HTML helps with…', 'ስማንቲክ HTML ይረዳል በ…', ['Accessibility and meaning', 'Making images heavier', 'Disabling links', 'Removing CSS'], 'Accessibility and meaning'),
  ],
  ...[
    mc('web-css', 1, 'Which property controls spacing outside an element’s border?', 'ከአካል ድንበር ውጭ ክፍተት የሚቆጣጠረው ባህሪ የትኛው ነው?', ['margin', 'padding', 'color', 'font-size'], 'margin'),
    mc('web-css', 2, 'display: flex on a container enables…', 'display: flex በኮንቴነር ላይ ያንቃል…', ['Flexbox layout along axes', 'Only tables', 'Only fixed pixels', 'Server-side rendering'], 'Flexbox layout along axes'),
    mc('web-css', 3, 'Which selector targets an element with id="nav"?', 'id="nav" ያለውን አካል የሚመለከተው ሴሌክተር የትኛው ነው?', ['#nav', '.nav', 'nav()', '*nav'], '#nav'),
    mc('web-css', 4, 'Media queries are primarily used for…', 'ሚዲያ ጥያቄዎች በዋናነት ያገለግላሉ ለ…', ['Responsive design', 'Database access', 'C++ compilation', 'Email sending'], 'Responsive design'),
  ],
  ...[
    mc('web-js', 1, 'Which keyword declares a block-scoped variable that can be reassigned?', 'የብሎክ ወሰን ተለዋዋጭ የሚገለጽበት ቁልፍ ቃል የትኛው ነው?', ['let', 'const', 'var only in strict blocks', 'static'], 'let'),
    mc('web-js', 2, 'document.querySelector() returns…', 'document.querySelector() ይመልሳል…', ['The first matching element or null', 'Always an array', 'Always a number', 'A CSS file'], 'The first matching element or null'),
    mc('web-js', 3, 'addEventListener is used to…', 'addEventListener ያገለግላል ለ…', ['React to user or browser events', 'Compile TypeScript', 'Style elements only', 'Create databases'], 'React to user or browser events'),
    mc('web-js', 4, 'JSON.stringify converts…', 'JSON.stringify ይቀይራል…', ['A JavaScript value to a JSON string', 'HTML to PDF', 'CSS to JS', 'Images to text'], 'A JavaScript value to a JSON string'),
  ],
  ...[
    mc('web-final', 1, 'Which HTTP method is idempotent and commonly used to fetch a resource?', 'የትኛው HTTP ዘዴ ኢዴምፖቴንት ነው እና ሀብት ለማምጣት ይጠቀማል?', ['GET', 'POST', 'PATCH', 'CONNECT'], 'GET'),
    mc('web-final', 2, 'In the box model, padding is…', 'በbox ሞዴል ውስጥ ፓዲንግ ነው…', ['Space between content and border', 'Space outside the border', 'The border width only', 'The viewport size'], 'Space between content and border'),
    mc('web-final', 3, 'What does DOM stand for?', 'DOM ምን ያመለክታል?', ['Document Object Model', 'Data Object Memory', 'Dynamic Output Method', 'Domain Origin Map'], 'Document Object Model'),
    mc('web-final', 4, 'Which tag is used for the largest heading by default?', 'በነባሪ ትልቁን ርዕስ የሚያስቀምጠው መሰረት የትኛው ነው?', ['<h1>', '<h6>', '<head>', '<header>'], '<h1>'),
    mc('web-final', 5, 'CSS specificity: an ID selector generally beats…', 'የCSS ስፔሲፊስቲ ከID ሴሌክተር በአጠቃላይ ያሸንፋል…', ['A single class selector', 'Inline styles', '!important on everything', 'The browser'], 'A single class selector'),
    mc('web-final', 6, 'const in JavaScript means the binding…', 'በJavaScript const ማለት ግንኙነቱ…', ['Cannot be reassigned', 'Is always deep-frozen', 'Is hoisted differently than let', 'Only works in browsers'], 'Cannot be reassigned'),
    mc('web-final', 7, 'A <form> submit can be prevented with…', 'የ<form> ማስረከብ ሊከለከል ይችላል በ…', ['event.preventDefault() in a handler', 'Deleting the form tag', 'Using only CSS', 'Setting method="none"'], 'event.preventDefault() in a handler'),
    mc('web-final', 8, 'Progressive enhancement means…', 'ፕሮግረሲቭ ኢንሃንስመንት ማለት…', ['Start with a baseline that works, then add features', 'Only support the newest browsers', 'Remove HTML', 'Disable JavaScript always'], 'Start with a baseline that works, then add features'),
  ],
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'amharic_cpp_platform',
    charset: 'utf8mb4',
  });

  try {
    const [countRows] = await conn.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS c FROM course_track_quizzes WHERE id = ?',
      ['cpp-ch1']
    );
    const count = Number((countRows[0] as { c: number }).c ?? 0);
    if (count > 0) {
      console.log('Course track quizzes already seeded (cpp-ch1 exists). Skipping.');
      return;
    }

    await conn.beginTransaction();

    for (const q of QUIZZES) {
      await conn.query(
        `INSERT INTO course_track_quizzes
         (id, track, chapter_slug, title_en, title_am, xp_reward, coin_reward, is_final, pass_threshold, cert_min_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          q.id,
          q.track,
          q.chapter_slug,
          q.title_en,
          q.title_am,
          q.xp_reward,
          q.coin_reward,
          q.is_final,
          q.pass_threshold,
          q.cert_min_score,
        ]
      );
    }

    for (const row of QUESTIONS) {
      await conn.query(
        `INSERT INTO course_track_quiz_questions
         (id, quiz_id, sort_order, question_en, question_am, options_json, correct_answer)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.quiz_id,
          row.sort_order,
          row.question_en,
          row.question_am,
          JSON.stringify(row.options),
          row.correct_answer,
        ]
      );
    }

    await conn.commit();
    console.log(`Seeded ${QUIZZES.length} quizzes and ${QUESTIONS.length} questions.`);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
