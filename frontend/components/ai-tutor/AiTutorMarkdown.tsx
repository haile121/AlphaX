'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const assistantProse = {
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-gray-900 dark:text-white mt-3 mb-2 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-gray-900 dark:text-white mt-3 mb-2 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-3 mb-1.5 first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-2 mb-1">{children}</h4>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-accent/50 pl-3 my-2 text-gray-600 dark:text-gray-300 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-gray-200 dark:border-gray-600" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent font-medium underline underline-offset-2 hover:opacity-90"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-50">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ className, children, ...props }) => {
    const isFenced = Boolean(/language-\w+/.exec(className || ''));
    if (isFenced) {
      return (
        <code
          className={`${className ?? ''} block whitespace-pre text-[13px] font-mono leading-relaxed text-gray-100`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-900/90 text-[0.9em] font-mono text-gray-800 dark:text-gray-100"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 rounded-lg bg-gray-950 dark:bg-black/60 border border-gray-700/50 p-3 overflow-x-auto text-gray-100">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
      <table className="min-w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-100 dark:bg-gray-900/80">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-gray-200 dark:border-gray-600 px-2 py-1.5 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-200 dark:border-gray-600 px-2 py-1.5 align-top">{children}</td>
  ),
} satisfies Components;

interface AiTutorMarkdownProps {
  content: string;
}

/** Renders AI tutor replies as Markdown (headings, lists, fenced code, bold, etc.). */
export function AiTutorMarkdown({ content }: AiTutorMarkdownProps) {
  return (
    <div className="ai-tutor-md text-sm text-gray-800 dark:text-gray-200 [&>*:first-child]:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={assistantProse}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
