'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import { useState, useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  useMotionTemplate,
  AnimatePresence,
} from 'framer-motion';
import {
  Globe,
  Cpu,
  Bot,
  User,
  Sprout,
  Zap,
  Flame,
  Calculator,
  Dice5,
  ContactRound,
  Landmark,
  Search,
  Sigma,
  Target,
  BookOpenCheck,
  Medal,
  Coins,
  Trophy,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { PublicMarketingFooter } from '@/components/layout/PublicMarketingFooter';
import { SITE_LOGO_PATH } from '@/lib/siteAssets';
import { MARKETING_FAQ_ITEMS } from '@/lib/marketingFaq';
import { cn } from '@/lib/cn';

// ── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Intersection observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Data ─────────────────────────────────────────────────────────────────────
const codeLines = [
  { tokens: [{ t: '#include ', c: 'text-pink-500 dark:text-pink-400' }, { t: '<iostream>', c: 'text-yellow-600 dark:text-yellow-300' }] },
  { tokens: [{ t: 'using namespace ', c: 'text-pink-500 dark:text-pink-400' }, { t: 'std', c: 'text-blue-600 dark:text-blue-300' }, { t: ';', c: 'text-gray-500' }] },
  { tokens: [] },
  { tokens: [{ t: 'int ', c: 'text-pink-500 dark:text-pink-400' }, { t: 'main', c: 'text-yellow-600 dark:text-yellow-300' }, { t: '() {', c: 'text-gray-600 dark:text-gray-300' }] },
  { tokens: [{ t: '    cout ', c: 'text-blue-600 dark:text-blue-300' }, { t: '<< ', c: 'text-pink-500 dark:text-pink-400' }, { t: '"ሰላም ዓለም!" ', c: 'text-green-600 dark:text-green-400' }, { t: '<< endl;', c: 'text-gray-500' }] },
  { tokens: [{ t: '    cout ', c: 'text-blue-600 dark:text-blue-300' }, { t: '<< ', c: 'text-pink-500 dark:text-pink-400' }, { t: '"Hello, World!" ', c: 'text-green-600 dark:text-green-400' }, { t: '<< endl;', c: 'text-gray-500' }] },
  { tokens: [{ t: '    return ', c: 'text-pink-500 dark:text-pink-400' }, { t: '0', c: 'text-orange-500 dark:text-orange-300' }, { t: ';', c: 'text-gray-500' }] },
  { tokens: [{ t: '}', c: 'text-gray-600 dark:text-gray-300' }] },
];

const learningPath = [
  { level: 'Beginner', color: 'bg-emerald-500', lessons: ['Variables & Types', 'Input / Output', 'Conditionals', 'Loops', 'Functions'], icon: Sprout },
  { level: 'Intermediate', color: 'bg-blue-500', lessons: ['Arrays & Strings', 'Pointers', 'Structs', 'File I/O', 'OOP Basics'], icon: Zap },
  { level: 'Advanced', color: 'bg-teal-600', lessons: ['Templates', 'STL', 'Memory Mgmt', 'Algorithms', 'Design Patterns'], icon: Flame },
];

const features = [
  {
    id: 'bilingual',
    icon: Globe,
    title: 'Bilingual by design',
    headline: 'Learn in the language you think in',
    body: 'Every lesson, quiz, and AI explanation is available in both Amharic and English. Switch mid-lesson with one tap. Your progress is never lost.',
    visual: (
      <div className="space-y-3">
        {[
          { lang: 'አማ', text: 'ተለዋዋጭ ማለት ዋጋ ለማስቀመጥ የሚያገለግል ቦታ ነው።', active: true },
          { lang: 'EN', text: 'A variable is a named storage location for a value.', active: false },
        ].map((l) => (
          <div key={l.lang} className={cn('flex items-start gap-3 p-4 rounded-xl border transition-all', l.active ? 'border-blue-200 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]')}>
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5', l.active ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400')}>{l.lang}</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{l.text}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'compiler',
    icon: Cpu,
    title: 'Live compiler',
    headline: 'Write real C++. See real output.',
    body: 'A full GCC compiler runs in the cloud. Write code, hit run, see output in milliseconds. No installs, no configuration, no excuses.',
    visual: (
      <div className="rounded-xl bg-gray-900 dark:bg-black/60 border border-gray-700 dark:border-white/10 overflow-hidden font-mono text-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-700 dark:border-white/10 bg-gray-800 dark:bg-white/[0.03]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-gray-400">main.cpp</span>
        </div>
        <div className="p-4 space-y-0.5">
          <p><span className="text-pink-400">int </span><span className="text-yellow-300">main</span><span className="text-gray-300">() {'{'}</span></p>
          <p><span className="text-blue-300">  cout </span><span className="text-pink-400">&lt;&lt; </span><span className="text-green-400">"ሰላም!"</span><span className="text-gray-400"> &lt;&lt; endl;</span></p>
          <p><span className="text-pink-400">  return </span><span className="text-orange-300">0</span><span className="text-gray-400">;</span></p>
          <p><span className="text-gray-300">{'}'}</span></p>
        </div>
        <div className="px-4 py-3 border-t border-gray-700 dark:border-white/10 bg-black/40">
          <p className="text-xs text-gray-500 mb-1">Output</p>
          <p className="text-green-400">ሰላም!</p>
        </div>
      </div>
    ),
  },
  {
    id: 'ai',
    icon: Bot,
    title: 'AI tutor',
    headline: 'Never get stuck for more than 30 seconds',
    body: 'Powered by Google Gemini. Ask anything about the lesson in Amharic or English. Get a clear, context-aware explanation instantly.',
    visual: (
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm flex-shrink-0">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="bg-gray-100 dark:bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-[80%]">
            ፖይንተር ምንድን ነው?
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white max-w-[85%]">
            ፖይንተር የሌላ ተለዋዋጭ የማህደረ ትውስታ አድራሻ የሚያስቀምጥ ተለዋዋጭ ነው። <span className="opacity-70">int* p = &x;</span> ማለት p የ x አድራሻ ይዟል።
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    ),
  },
];

const testimonials = [
  { name: 'Abebe T.', role: 'Software Engineering Student', text: 'I struggled with C++ for two years. This platform explained pointers in Amharic in a way no English textbook ever could.', avatar: 'AT', color: '#2563EB' },
  { name: 'Tigist M.', role: 'Self-taught Developer', text: 'The live compiler is a game changer. I practice on my phone during commutes. No laptop needed.', avatar: 'TM', color: '#0d9488' },
  { name: 'Dawit K.', role: 'High School Student', text: 'I earned my Beginner certificate in 3 weeks. The streak system made me open the app every single day.', avatar: 'DK', color: '#059669' },
  { name: 'Sara H.', role: 'University Lecturer', text: 'I recommend this to all my students. The bilingual approach removes the language barrier that blocks most Ethiopian learners.', avatar: 'SH', color: '#d97706' },
  { name: 'Yonas A.', role: 'Bootcamp Graduate', text: 'The AI tutor answered my questions better than Stack Overflow. And it speaks Amharic.', avatar: 'YA', color: '#dc2626' },
  { name: 'Hana G.', role: 'Intermediate Learner', text: 'Went from not knowing what a variable is to writing OOP code. The learning path is perfectly structured.', avatar: 'HG', color: '#0891b2' },
];

const faqs = MARKETING_FAQ_ITEMS.slice(0, 6);

// ── Sub-components ───────────────────────────────────────────────────────────

// Infinite horizontal marquee (CSS animation, no JS scroll)
const marqueeItems = [
  '🌐 Bilingual Lessons', '⚙️ Live C++ & Web Compiler', '🤖 AI Tutor in Amharic',
  '🏆 XP & Leaderboard', '🎓 Verified Certificates', '🔥 Daily Streaks',
  '📝 Quizzes & Exams', '🌱 Beginner Friendly', '🔬 Advanced Topics',
  '📱 Works on Mobile', '🆓 Free Forever', '⚡ Instant Feedback',
];

function InfiniteMarquee() {
  const items = [...marqueeItems, ...marqueeItems];
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative overflow-hidden py-6 select-none">
      <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-white dark:from-[#080810] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-white dark:from-[#080810] to-transparent z-10 pointer-events-none" />
      <div className="flex gap-3 w-max" style={{ animation: 'marquee 36s linear infinite' }}>
        {items.map((item, i) => (
          <motion.span
            key={i}
            whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2 }}
            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200/90 dark:border-white/10 bg-white/90 dark:bg-white/[0.05] backdrop-blur-md text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap shadow-sm hover:border-blue-200/80 dark:hover:border-blue-500/25 hover:shadow-md cursor-default"
          >
            {item}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// Scroll-triggered fade-up wrapper
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
      <span className="w-4 h-px bg-current" />{children}<span className="w-4 h-px bg-current" />
    </span>
  );
}

function StatCard({ value, suffix, label, start }: { value: number; suffix: string; label: string; start: boolean }) {
  const count = useCountUp(value, 1600, start);
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="relative text-center rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-black/40 transition-shadow duration-300 group overflow-hidden"
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/[0.06] via-transparent to-teal-500/[0.06] pointer-events-none" />
      <div className="relative">
        <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">
          {count.toLocaleString()}
          <span className="text-blue-600 dark:text-blue-400">{suffix}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-white/5 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group rounded-lg -mx-1 px-1 hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors"
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {q}
        </span>
        <span
          className={cn(
            'flex-shrink-0 w-7 h-7 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 text-sm transition-transform duration-300 bg-white/50 dark:bg-white/[0.04]',
            open && 'rotate-45 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400'
          )}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed pr-10">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Full-page cursor-following ambient light (smooth spring). */
function CursorSpotlight() {
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(-400);
  const mouseY = useMotionValue(-400);
  const springX = useSpring(mouseX, { stiffness: 210, damping: 32, mass: 0.35 });
  const springY = useSpring(mouseY, { stiffness: 210, damping: 32, mass: 0.35 });

  useEffect(() => {
    if (reduceMotion) return;
    const handle = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => window.removeEventListener('mousemove', handle);
  }, [mouseX, mouseY, reduceMotion]);

  const lightSpot = useMotionTemplate`radial-gradient(580px circle at ${springX}px ${springY}px, rgba(59, 130, 246, 0.16), rgba(147, 197, 253, 0.06) 38%, transparent 58%)`;
  const darkSpot = useMotionTemplate`radial-gradient(640px circle at ${springX}px ${springY}px, rgba(59, 130, 246, 0.14), transparent 52%), radial-gradient(420px circle at ${springX}px ${springY}px, rgba(13, 148, 136, 0.12), transparent 48%)`;

  if (reduceMotion) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[1] dark:hidden"
        style={{ background: lightSpot }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none fixed inset-0 z-[1] hidden dark:block"
        style={{ background: darkSpot }}
        aria-hidden
      />
    </>
  );
}

const heroStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function HeroSection({
  isLoggedIn,
  typedLines,
}: {
  isLoggedIn: boolean;
  typedLines: number;
}) {
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 320, damping: 32, mass: 0.8 });
  const springY = useSpring(mouseY, { stiffness: 320, damping: 32, mass: 0.8 });
  const rotateX = useTransform(springY, [-0.5, 0.5], reduceMotion ? [0, 0] : [7, -7]);
  const rotateY = useTransform(springX, [-0.5, 0.5], reduceMotion ? [0, 0] : [-7, 7]);

  function onCardPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onCardPointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section className="relative pt-28 pb-36 px-6 sm:px-10 lg:px-16 overflow-hidden">
      {/* Layered grid + animated mesh */}
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60 dark:opacity-70 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none hidden dark:block overflow-hidden">
        <div
          className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[min(1100px,110vw)] h-[560px] rounded-full blur-[120px] opacity-90"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgb(37 99 235 / 0.14), transparent 55%)',
            animation: reduceMotion ? undefined : 'hero-blob-1 22s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-[25%] right-[-8%] w-[480px] h-[480px] rounded-full blur-[100px] opacity-80"
          style={{
            background: 'radial-gradient(circle at center, rgb(13 148 136 / 0.14), transparent 65%)',
            animation: reduceMotion ? undefined : 'hero-blob-2 28s ease-in-out infinite',
          }}
        />
        <div className="absolute bottom-0 left-[-10%] w-[420px] h-[320px] rounded-full blur-[90px] bg-cyan-500/[0.06]" />
      </div>
      <div className="absolute inset-0 pointer-events-none dark:hidden overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(900px,100vw)] h-[420px] rounded-full blur-[90px]"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgb(219 234 254), transparent 70%)',
            animation: reduceMotion ? undefined : 'hero-blob-2 26s ease-in-out infinite',
          }}
        />
      </div>

      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/25 dark:via-blue-400/20 to-transparent pointer-events-none" />

      <div className="relative max-w-screen-xl mx-auto z-[1]">
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative group"
          >
            <div
              className="absolute -inset-px rounded-full bg-gradient-to-r from-blue-500/40 via-teal-500/30 to-cyan-500/40 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"
              aria-hidden
            />
            <div className="relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-blue-200/90 dark:border-blue-500/30 bg-white/80 dark:bg-[#0c1220]/80 backdrop-blur-md text-blue-700 dark:text-blue-300 text-sm font-medium shadow-sm shadow-blue-500/5 dark:shadow-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 ring-2 ring-blue-400/30" />
              </span>
              The programming platform built for Ethiopian students
            </div>
          </motion.div>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="visible"
            className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0"
          >
            <motion.div variants={heroItem}>
              <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.03em] leading-[1.04]">
                <span className="text-gray-900 dark:text-white">Master Programming</span>
                <br />
                <span className="inline-block mt-1 bg-gradient-to-r from-blue-600 via-teal-600 to-blue-600 dark:from-blue-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent animate-hero-gradient-text">
                  in Amharic
                </span>
              </h1>
            </motion.div>
            <motion.p
              variants={heroItem}
              className="mt-6 text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              Bilingual lessons, a live compiler, and an AI tutor. All in one platform. Free forever.
            </motion.p>

            <motion.div variants={heroItem} className="mt-10 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {isLoggedIn ? (
                <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
                  <Link
                    href="/dashboard"
                    className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-500/30 transition-shadow duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                    Go to Dashboard
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
                    <Link
                      href="/sign-up"
                      className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-500/30 transition-shadow duration-300 overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                      Start learning, it&apos;s free
                      <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.99 }}>
                    <Link
                      href="/sign-in"
                      className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-gray-200 dark:border-white/12 text-gray-700 dark:text-gray-300 font-semibold text-base bg-white/50 dark:bg-white/[0.04] backdrop-blur-sm hover:border-blue-300/80 dark:hover:border-blue-500/35 hover:bg-gray-50/90 dark:hover:bg-white/[0.07] transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Sign in
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>

            <motion.div
              variants={heroItem}
              className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {['AT', 'TM', 'DK', 'SH', 'YA'].map((init, i) => (
                    <motion.div
                      key={init}
                      initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: reduceMotion ? 0 : 0.45 + i * 0.06, type: 'spring', stiffness: 400, damping: 22 }}
                      className="w-9 h-9 rounded-full border-2 border-white dark:border-[#080810] flex items-center justify-center text-[10px] font-bold text-white shadow-md"
                      style={{ background: ['#2563EB', '#0d9488', '#059669', '#d97706', '#dc2626'][i] }}
                    >
                      {init}
                    </motion.div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : 0.75 + i * 0.05 }}
                        className="text-amber-400 text-xs"
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span className="font-semibold text-gray-900 dark:text-white">500+</span> students learning
                  </p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-gray-200 dark:via-white/15 to-transparent" />
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <motion.span
                  className="flex items-center gap-1.5"
                  whileHover={reduceMotion ? undefined : { x: 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <span className="text-green-500">✓</span> No credit card
                </motion.span>
                <motion.span
                  className="flex items-center gap-1.5"
                  whileHover={reduceMotion ? undefined : { x: 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <span className="text-green-500">✓</span> No setup
                </motion.span>
              </div>
            </motion.div>
          </motion.div>

          {/* Code preview — 3D tilt */}
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0 w-full max-w-[440px] [perspective:1200px]"
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-3 rounded-[1.35rem] opacity-70 dark:opacity-90 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 180deg at 50% 50%, rgb(59 130 246 / 0.15), rgb(13 148 136 / 0.14), rgb(34 211 238 / 0.12), rgb(59 130 246 / 0.15))',
                  filter: 'blur(24px)',
                }}
                animate={
                  reduceMotion
                    ? undefined
                    : { rotate: [0, 3, 0, -3, 0] }
                }
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/15 via-transparent to-teal-500/15 rounded-3xl blur-xl pointer-events-none" />

              {[
                { text: 'int', x: '-16%', y: '12%', delay: 0, dur: 8 },
                { text: '{}', x: '108%', y: '18%', delay: 1.4, dur: 9 },
                { text: '<<', x: '-18%', y: '62%', delay: 0.7, dur: 10 },
                { text: '++', x: '110%', y: '55%', delay: 2, dur: 8 },
              ].map((el) => (
                <motion.span
                  key={el.text + el.x}
                  className="absolute font-mono font-bold text-gray-200 dark:text-white/[0.06] select-none text-xl pointer-events-none z-0"
                  style={{ left: el.x, top: el.y }}
                  animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
                  transition={{ duration: el.dur, delay: el.delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {el.text}
                </motion.span>
              ))}

              <motion.div
                className="relative z-10"
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                onPointerMove={onCardPointerMove}
                onPointerLeave={onCardPointerLeave}
              >
                <div className="rounded-2xl bg-white dark:bg-[#0d1117] border border-gray-200/90 dark:border-white/[0.09] shadow-[0_24px_80px_-12px_rgba(15,23,42,0.2)] dark:shadow-[0_28px_90px_-16px_rgba(0,0,0,0.65)] overflow-hidden ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/5 bg-gray-50/90 dark:bg-white/[0.025] backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400/95 shadow-sm" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400/95 shadow-sm" />
                      <span className="w-3 h-3 rounded-full bg-green-400/95 shadow-sm" />
                    </div>
                    <span className="text-xs text-gray-400 font-mono">main.cpp</span>
                    <motion.span
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-100/80 dark:border-blue-500/20"
                      animate={reduceMotion ? undefined : { opacity: [1, 0.75, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      C++
                    </motion.span>
                  </div>
                  <div className="p-5 font-mono text-sm leading-7 min-h-[230px] bg-white dark:bg-transparent">
                    {codeLines.slice(0, typedLines).map((line, i) => (
                      <div key={i} className="flex">
                        <span className="w-6 text-gray-300 dark:text-gray-700 select-none text-right mr-5 text-xs leading-7">
                          {i + 1}
                        </span>
                        <span>
                          {line.tokens.map((tok, j) => (
                            <span key={j} className={tok.c}>
                              {tok.t}
                            </span>
                          ))}
                          {i === typedLines - 1 && (
                            <span className="inline-block w-0.5 h-4 bg-blue-600 ml-0.5 animate-pulse align-middle" />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  {typedLines >= codeLines.length && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="px-5 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-black/35 overflow-hidden"
                    >
                      <p className="text-xs font-mono text-gray-400 mb-1.5">$ g++ main.cpp && ./a.out</p>
                      <p className="text-sm font-mono text-green-600 dark:text-green-400">ሰላም ዓለም!</p>
                      <p className="text-sm font-mono text-green-600 dark:text-green-400">Hello, World!</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-6 hidden lg:block z-10"
                animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
                transition={{ duration: 8, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="px-3 py-2 rounded-lg border border-gray-200/90 dark:border-white/12 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/40">
                  <p className="font-mono text-xs text-green-600 dark:text-green-400">✓ Compiled</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute -top-4 -right-6 hidden lg:block z-10"
                animate={reduceMotion ? undefined : { y: [0, -9, 0] }}
                transition={{ duration: 9, delay: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="px-3 py-2 rounded-lg border border-gray-200/90 dark:border-white/12 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-md shadow-lg">
                  <p className="font-mono text-xs text-blue-600 dark:text-blue-400">+120 XP</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -right-6 hidden lg:block z-10"
                animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 10, delay: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="px-3 py-2 rounded-lg border border-gray-200/90 dark:border-white/12 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-md shadow-lg">
                  <p className="font-mono text-xs text-orange-500 dark:text-orange-400">🔥 14 day streak</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-[#080810] dark:via-[#080810]/85 dark:to-transparent"
        aria-hidden
      />
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [typedLines, setTypedLines] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { ref: statsRef, inView: statsInView } = useInView(0.3);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${baseURL}/api/auth/session`, { credentials: 'include' });
        const data = (await res.json()) as { authenticated?: boolean };
        if (data.authenticated) {
          setIsLoggedIn(true);
        } else {
          Cookies.remove('logged_in');
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (typedLines >= codeLines.length) return;
    const t = setTimeout(() => setTypedLines(n => n + 1), 180);
    return () => clearTimeout(t);
  }, [typedLines]);

  // Auto-rotate features
  useEffect(() => {
    const t = setInterval(() => setActiveFeature(v => (v + 1) % features.length), 4000);
    return () => clearInterval(t);
  }, []);

  const reduceMotion = useReducedMotion();

  return (
    <div className="relative isolate min-h-screen bg-white dark:bg-[#080810] text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-200">
      <CursorSpotlight />

      <div className="relative z-10">
        <Navbar variant="public" />

        <HeroSection isLoggedIn={isLoggedIn} typedLines={typedLines} />

        {/* ══ ANIMATED STATS ════════════════════════════════════════════════════ */}
        <section
          ref={statsRef}
          className="py-16 sm:py-20 px-6 sm:px-10 lg:px-16 border-y border-gray-100/90 dark:border-white/[0.06] bg-gradient-to-b from-slate-50/95 via-white to-slate-50/90 dark:from-[#0a0d14] dark:via-[#080810] dark:to-[#0c1018]"
        >
          <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            <StatCard value={500} suffix="+" label="Active learners" start={statsInView} />
            <StatCard value={50} suffix="+" label="Lessons available" start={statsInView} />
            <StatCard value={3} suffix="" label="Skill levels" start={statsInView} />
            <StatCard value={100} suffix="%" label="Free to start" start={statsInView} />
          </div>
        </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════════════════ */}
      <section className="py-4 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#080810]">
        <InfiniteMarquee />
      </section>

      {/* ══ LEARNING PATH PREVIEW ═════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.03] dark:via-blue-500/[0.04] to-transparent pointer-events-none" />
        <div className="max-w-screen-xl mx-auto relative">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 max-w-lg">
              <SectionLabel>Curriculum</SectionLabel>
              <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                A structured path from zero to advanced
              </h2>
              <p className="mt-5 text-gray-500 dark:text-gray-400 leading-relaxed">
                The diagnostic assessment places you at the right level. Then you follow a carefully sequenced curriculum. No jumping around, no confusion.
              </p>
              <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:gap-3 transition-all duration-200">
                Take the diagnostic test →
              </Link>
            </div>

            <div className="flex-1 w-full space-y-4">
              {learningPath.map((level, li) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: li * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={reduceMotion ? undefined : { y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                  className="group relative rounded-2xl border border-gray-200/90 dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-black/30 transition-shadow duration-300"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-500/[0.04] via-transparent to-teal-500/[0.06] pointer-events-none" />
                  <div className="relative flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-white/5">
                    <span className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-inner group-hover:border-blue-200/60 dark:group-hover:border-blue-500/25 transition-colors">
                      <level.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{level.level}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{level.lessons.length} lessons</p>
                    </div>
                    <div className={cn('w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#080810]', level.color)} />
                  </div>
                  <div className="relative px-6 py-4 flex flex-wrap gap-2">
                    {level.lessons.map((lesson) => (
                      <span key={lesson} className="px-3 py-1 rounded-full bg-gray-50/90 dark:bg-white/[0.05] border border-gray-100/90 dark:border-white/[0.06] text-xs text-gray-600 dark:text-gray-400 font-medium group-hover:border-gray-200 dark:group-hover:border-white/10 transition-colors">
                        {lesson}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHAT YOU'LL BUILD — HORIZONTAL SCROLL ════════════════════════════ */}
      <section className="py-24 overflow-hidden border-y border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.015]">
        <div className="px-6 sm:px-10 lg:px-16 mb-10">
          <FadeUp>
            <SectionLabel>Projects</SectionLabel>
            <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              What you'll build
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-lg">
              Real programs, not toy examples. Every level ends with a project you can actually show.
            </p>
          </FadeUp>
        </div>

        {/* Horizontal scroll container */}
        <div className="flex gap-5 overflow-x-auto pb-6 px-6 sm:px-10 lg:px-16 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { level: 'Beginner', icon: Calculator, title: 'Calculator', desc: 'A command-line calculator that handles +, −, ×, ÷ with error handling for division by zero.', tags: ['Variables', 'Conditionals', 'Functions'], color: 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5' },
              { level: 'Beginner', icon: Dice5, title: 'Number Guessing Game', desc: 'Random number generator with hints. Tracks attempts and shows a score at the end.', tags: ['Loops', 'Random', 'I/O'], color: 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5' },
              { level: 'Intermediate', icon: ContactRound, title: 'Contact Book', desc: 'Store, search, and delete contacts using structs and file I/O. Data persists between runs.', tags: ['Structs', 'File I/O', 'Arrays'], color: 'border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5' },
              { level: 'Intermediate', icon: Landmark, title: 'Bank Account System', desc: 'OOP-based bank system with deposit, withdraw, and balance tracking using classes.', tags: ['OOP', 'Classes', 'Encapsulation'], color: 'border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5' },
              { level: 'Advanced', icon: Search, title: 'Search Engine (Mini)', desc: 'Index a set of text files and search them by keyword using STL maps and vectors.', tags: ['STL', 'Templates', 'Algorithms'], color: 'border-teal-200 dark:border-teal-500/25 bg-teal-50/60 dark:bg-teal-500/8' },
              { level: 'Advanced', icon: Sigma, title: 'Matrix Library', desc: 'A templated matrix class with addition, multiplication, and determinant calculation.', tags: ['Templates', 'Memory', 'Operators'], color: 'border-teal-200 dark:border-teal-500/25 bg-teal-50/60 dark:bg-teal-500/8' },
            ].map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}
              className={cn(
                'flex-shrink-0 w-72 snap-start rounded-2xl border p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-shadow duration-300',
                project.color
              )}
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
                  <project.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </span>
                <span className={cn(
                  'text-xs font-semibold px-2.5 py-1 rounded-full',
                  project.level === 'Beginner' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
                  project.level === 'Intermediate' ? 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400' :
                  'bg-teal-100 dark:bg-teal-500/15 text-teal-800 dark:text-teal-400'
                )}>{project.level}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1.5">{project.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{project.desc}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {project.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/8 text-gray-600 dark:text-gray-400 font-medium">{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ INTERACTIVE FEATURE SHOWCASE ══════════════════════════════════════ */}
      <section className="py-28 px-6 sm:px-10 lg:px-16 bg-gray-50 dark:bg-white/[0.015] border-y border-gray-100 dark:border-white/5">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Features</SectionLabel>
            <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              Built for how you actually learn
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Tap a pillar to explore — tabs advance automatically every few seconds.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Tab list */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 flex-shrink-0 lg:w-64">
              {features.map((f, i) => (
                <motion.button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFeature(i)}
                  whileHover={reduceMotion ? undefined : { x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={cn(
                    'flex items-center gap-3 px-5 py-4 rounded-xl border text-left transition-colors duration-200 flex-shrink-0 lg:flex-shrink',
                    activeFeature === i
                      ? 'border-blue-200 dark:border-blue-500/40 bg-white dark:bg-blue-500/10 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10'
                      : 'border-transparent bg-transparent hover:bg-white/90 dark:hover:bg-white/[0.04]'
                  )}
                >
                  <span className={cn(
                    'w-8 h-8 rounded-lg border flex items-center justify-center transition-colors',
                    activeFeature === i
                      ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-200/80 dark:border-blue-500/30'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10'
                  )}>
                    <f.icon className="w-4.5 h-4.5 text-gray-700 dark:text-gray-300" />
                  </span>
                  <div className="text-left">
                    <p className={cn('text-sm font-semibold', activeFeature === i ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300')}>{f.title}</p>
                  </div>
                  {activeFeature === i && <ArrowRight className="ml-auto w-4 h-4 text-blue-600 dark:text-blue-400 hidden lg:block" />}
                </motion.button>
              ))}
            </div>

            {/* Content panel */}
            <div className="flex-1 rounded-2xl border border-gray-200/90 dark:border-white/[0.09] bg-white/90 dark:bg-white/[0.03] backdrop-blur-sm p-8 lg:p-10 shadow-lg shadow-gray-200/40 dark:shadow-black/40 min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                  transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{features[activeFeature].headline}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">{features[activeFeature].body}</p>
                  {features[activeFeature].visual}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade-center opacity-60 dark:opacity-70 pointer-events-none" />
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Process</SectionLabel>
            <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              A clear path from day one
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Know your level, learn at your pace, and earn certificates you can verify and share.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-14 left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] h-px border-t border-dashed border-gray-200 dark:border-white/10" />
            {[
              { num: '01', icon: Target, title: 'Take the diagnostic', desc: 'Answer 15 programming questions. We place you at Beginner, Intermediate, or Advanced automatically.' },
              { num: '02', icon: BookOpenCheck, title: 'Follow your path', desc: 'Work through bilingual lessons at your level. Run code in the browser. Ask the AI tutor when stuck.' },
              { num: '03', icon: Medal, title: 'Earn your certificate', desc: 'Pass quizzes, complete the level, and receive a verified certificate with a public verification link.' },
            ].map((s, si) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: si * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduceMotion ? undefined : { y: -6 }}
                className="relative p-8 rounded-2xl border border-gray-200/90 dark:border-white/[0.08] bg-white/90 dark:bg-white/[0.03] backdrop-blur-sm hover:border-blue-200/90 dark:hover:border-blue-500/35 hover:shadow-lg hover:shadow-blue-500/5 transition-shadow duration-300 group"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/[0.04] to-teal-500/[0.06] pointer-events-none" />
                <div className="relative flex items-start gap-5 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <s.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-5xl font-black text-gray-100 dark:text-white/8 font-mono select-none leading-none mt-1">{s.num}</span>
                </div>
                <h3 className="relative font-bold text-gray-900 dark:text-white text-lg mb-2">{s.title}</h3>
                <p className="relative text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS — MASONRY GRID ═══════════════════════════════════════ */}
      <section className="py-28 px-6 sm:px-10 lg:px-16 bg-gray-50 dark:bg-white/[0.015] border-y border-gray-100 dark:border-white/5">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              Real students. Real results.
            </h2>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {testimonials.map((t, ti) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.45, delay: (ti % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduceMotion ? undefined : { y: -4, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
                className="break-inside-avoid rounded-2xl border border-gray-200/90 dark:border-white/[0.08] bg-white/95 dark:bg-white/[0.03] backdrop-blur-sm p-6 hover:border-amber-200/80 dark:hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5 transition-shadow duration-300"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_,i) => <span key={i} className="text-amber-400 text-sm drop-shadow-sm">★</span>)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ring-2 ring-white dark:ring-[#0a0a12] shadow-md" style={{ background: t.color }}>{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOLD STATEMENT ════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade-center opacity-60 dark:opacity-70 pointer-events-none" />
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/[0.02] px-8 sm:px-16 py-16 text-center relative overflow-hidden"
          >
            {/* Decorative large text behind */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <span className="text-[200px] font-black text-gray-100 dark:text-white/[0.03] leading-none">C++</span>
            </div>
            <div className="relative">
              <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase tracking-widest mb-6">The numbers speak</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-0 sm:divide-x divide-gray-200 dark:divide-white/8">
                {[
                  { num: '500+', label: 'Students learning right now' },
                  { num: '3', label: 'Levels from zero to advanced' },
                  { num: '100%', label: 'Free, no hidden costs' },
                ].map((s) => (
                  <div key={s.label} className="px-8">
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white tabular-nums"
                    >
                      {s.num}
                    </motion.p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 sm:px-10 lg:px-16">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-16">
          <div className="lg:w-80 flex-shrink-0">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
              Questions? We have answers.
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Still not sure? Reach out. We're happy to help.
            </p>
            <Link href="/faq" className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:gap-3 transition-all duration-200">
              View all FAQs →
            </Link>
            <Link href="/sign-up" className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:gap-3 transition-all duration-200">
              Get started free →
            </Link>
          </div>
          <div className="flex-1 rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] px-6 divide-y divide-gray-100 dark:divide-white/5">
            {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ══ GAMIFICATION SHOWCASE ═════════════════════════════════════════ */}
      <section className="py-28 px-6 sm:px-10 lg:px-16">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left: visual */}
            <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0 space-y-4">
              {/* XP bar card */}
              <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">IL</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Intermediate Learner</p>
                      <p className="text-xs text-gray-400">Level 12 · Intermediate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">2,450 XP</p>
                    <p className="text-xs text-gray-400">550 to next level</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              {/* Streak + badges row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">14</p>
                    <p className="text-xs text-gray-400">Day streak</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">340</p>
                    <p className="text-xs text-gray-400">Coins earned</p>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Badges earned</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Sprout, label: 'First Lesson', color: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' },
                    { icon: Zap, label: '7-Day Streak', color: 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-100 dark:border-yellow-500/20' },
                    { icon: Target, label: 'Perfect Quiz', color: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' },
                    { icon: Trophy, label: 'Top 10', color: 'bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-500/20' },
                    { icon: Flame, label: '14-Day Streak', color: 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20' },
                  ].map((b) => (
                    <div key={b.label} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium text-gray-700 dark:text-gray-300', b.color)}>
                      <b.icon className="w-4 h-4" />{b.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: copy */}
            <div className="flex-1 max-w-lg">
              <SectionLabel>Gamification</SectionLabel>
              <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                Learning that keeps you coming back
              </h2>
              <p className="mt-5 text-gray-500 dark:text-gray-400 leading-relaxed">
                Every lesson earns XP. Every quiz earns coins. Maintain your streak and climb the leaderboard. The platform is designed to make consistent learning feel rewarding, not like a chore.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Zap, title: 'XP & Levels', desc: 'Earn experience points for every lesson and quiz you complete.' },
                  { icon: Flame, title: 'Daily Streaks', desc: 'Grows when you sign in each day—separate from XP from lessons and quizzes.' },
                  { icon: Trophy, title: 'Leaderboard', desc: 'Compete with friends and students at your level.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/8 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4.5 h-4.5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CERTIFICATE PREVIEW ═══════════════════════════════════════════════ */}
      <section className="py-28 px-6 sm:px-10 lg:px-16 bg-gray-50 dark:bg-white/[0.015] border-y border-gray-100 dark:border-white/5">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left: copy */}
            <div className="flex-1 max-w-lg">
              <SectionLabel>Certificates</SectionLabel>
              <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                Proof of what you've learned
              </h2>
              <p className="mt-5 text-gray-500 dark:text-gray-400 leading-relaxed">
                Complete a level and earn a PDF certificate with your name, level, and a unique verification ID. Share it on LinkedIn, send it to employers, or just keep it for yourself.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  'Unique verification URL. Anyone can confirm it\'s real',
                  'PDF download, ready to attach to any application',
                  'Separate certificate for each level completed',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">{point}</p>
                  </div>
                ))}
              </div>
              <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:gap-3 transition-all duration-200">
                Start earning your certificate →
              </Link>
            </div>

            {/* Right: certificate mockup */}
            <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/8 to-teal-500/10 rounded-3xl blur-xl" />
                <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d1117] shadow-xl overflow-hidden">
                  {/* Certificate header */}
                  <div className="bg-blue-600 px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={SITE_LOGO_PATH}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-auto object-contain rounded-md bg-white/10 p-1"
                      />
                      <div>
                        <p className="text-white font-bold text-sm">AlphaX Programming</p>
                        <p className="text-blue-200 text-xs">Learning Platform</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-200 text-xs uppercase tracking-widest">Certificate of</p>
                      <p className="text-white font-bold">Completion</p>
                    </div>
                  </div>
                  {/* Certificate body */}
                  <div className="px-8 py-8">
                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">This certifies that</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">A Verified Learner</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">has successfully completed the</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 mb-6">
                      <Sprout className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">Beginner Level: C++ Programming</span>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Issued</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">March 2026</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">Verification ID</p>
                        <p className="text-xs font-mono text-blue-600 dark:text-blue-400">CPP-BEG-2026-4F8A</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 sm:px-10 lg:px-16 bg-gray-50 dark:bg-white/[0.015] border-t border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade-bottom opacity-60 dark:opacity-70 pointer-events-none" />
        <div className="max-w-screen-xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 px-10 sm:px-16 py-16">
              <div className="text-center md:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Start learning today.
                </h2>
                <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md">
                  Free forever. No credit card. No setup. Just open your browser and write your first program in Amharic.
                </p>
                <div className="mt-5 flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Bilingual lessons</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Live compiler</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> AI tutor</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Certificates</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0 w-full sm:w-auto">
                {isLoggedIn ? (
                  <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-500 transition-all duration-200 shadow-md shadow-blue-500/15 hover:-translate-y-0.5 whitespace-nowrap">
                    Go to Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-500 transition-all duration-200 shadow-md shadow-blue-500/15 hover:-translate-y-0.5 whitespace-nowrap">
                      Create free account →
                    </Link>
                    <Link href="/sign-in" className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold text-base hover:bg-gray-50 dark:hover:bg-white/5 transition-colors whitespace-nowrap text-center">
                      Already have an account? Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/35 to-transparent" />
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
      <PublicMarketingFooter />
      </div>
    </div>
  );
}
