'use client';

import { useState, useRef, useEffect } from 'react';
import { aiTutorApi } from '@/lib/api';
import { getLanguage, setLanguage } from '@/lib/i18n';
import { useDialog } from '@/components/ui/DialogProvider';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AiTutorMarkdown } from '@/components/ai-tutor/AiTutorMarkdown';
import type { Language } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiTutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [lang, setLang] = useState<Language>('en');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { show } = useDialog();

  useEffect(() => {
    setLang(getLanguage());
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoadingSeconds(0);
      return;
    }
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setLoadingSeconds(Math.floor((Date.now() - t0) / 1000));
    }, 500);
    return () => window.clearInterval(id);
  }, [loading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function toggleLang() {
    const next: Language = lang === 'en' ? 'am' : 'en';
    setLang(next);
    setLanguage(next);
  }

  async function handleSend() {
    const q = input.trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiTutorApi.ask(q, lang);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'AI tutor is currently unavailable.';
      show({ variant: 'error', title: 'AI Tutor Error', message: msg });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {lang === 'am' ? 'AI አስተማሪ' : 'AI Tutor'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === 'am'
              ? 'ስለ C++ ወይም የ ድር መሠረቶች (HTML፣ CSS፣ JS) ጥያቄዎን ይጠይቁ — ምክሮች እንጂ ተዘርዝሮ መልስ አይደለም'
              : 'Ask questions about C++ or Web fundamentals (HTML, CSS, JS) — get hints, not answers'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {lang === 'am'
              ? 'ምላሽ ለመጠበቅ 5–30 ሰከንድ ሊወስድ ይችላል — ይህ ነጋዕማዊ ነው።'
              : 'Replies often take 5–30s — the model runs on Google/OpenAI servers.'}
          </p>
        </div>
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-accent hover:text-accent transition-colors"
        >
          {lang === 'en' ? '🇪🇹 አማርኛ' : '🇬🇧 English'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-600 gap-2">
            <span className="text-4xl">🤖</span>
            <p className="text-sm">
              {lang === 'am'
                ? 'ስለ C++ ወይም የ ድር (HTML፣ CSS፣ JavaScript) ማንኛውም ጥያቄ ይጠይቁ — በምክር እመራዎታለሁ።'
                : 'Ask me anything about C++ or web topics (HTML, CSS, JavaScript). I’ll guide you with hints.'}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-sm whitespace-pre-wrap break-words'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <AiTutorMarkdown content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-3 animate-pulse">
              <Spinner size="sm" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {lang === 'am' ? 'በመመርመር ላይ…' : 'Thinking…'}
                {loadingSeconds > 0 ? (
                  <span className="tabular-nums text-gray-400 dark:text-gray-500"> · {loadingSeconds}s</span>
                ) : null}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            lang === 'am'
              ? 'ስለ C++ ወይም ድር ጥያቄዎን ይጻፉ… (Enter ለመላክ)'
              : 'Ask about C++ or web (HTML/CSS/JS)… (Enter to send)'
          }
          rows={2}
          className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()} size="sm" className="h-[52px]">
          {loading ? <Spinner size="sm" /> : '↑ Send'}
        </Button>
      </div>
    </div>
  );
}
