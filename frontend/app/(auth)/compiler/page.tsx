'use client';

import { useEffect, useMemo, useState } from 'react';
import { compilerApi, type CompilerLanguage, type CompilerResult } from '@/lib/api';
import { useDialog } from '@/components/ui/DialogProvider';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

const SNIPPETS: Record<CompilerLanguage, string> = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  javascript: `console.log('Hello, World!');`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Hello</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 1rem; }
    h1 { color: #2563eb; }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Edit this page and click Run to preview.</p>
</body>
</html>`,
  css: `body {
  font-family: Georgia, serif;
  margin: 0;
  padding: 1.5rem;
  background: #f8fafc;
}
h1 {
  color: #0d9488;
  border-bottom: 2px solid #99f6e4;
}
button {
  background: #0d9488;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}`,
};

const LANGUAGE_LABELS: Record<CompilerLanguage, string> = {
  cpp: 'C++',
  javascript: 'JavaScript',
  html: 'HTML',
  css: 'CSS',
};

export default function CompilerPage() {
  const [language, setLanguage] = useState<CompilerLanguage>('cpp');
  const [code, setCode] = useState(SNIPPETS.cpp);
  const [result, setResult] = useState<CompilerResult | null>(null);
  const [running, setRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { show } = useDialog();

  useEffect(() => {
    setCode(SNIPPETS[language]);
    setResult(null);
  }, [language]);

  useEffect(() => {
    if (!result?.previewHtml) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const blob = new Blob([result.previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [result?.previewHtml]);

  async function handleRun() {
    setRunning(true);
    setResult(null);
    try {
      const res = await compilerApi.run(code, language);
      setResult(res.data);
    } catch {
      show({ variant: 'error', title: 'Compiler Error', message: 'Failed to reach the compiler service.' });
    } finally {
      setRunning(false);
    }
  }

  const hasError = result && (result.stderr || result.exitCode !== 0);
  const showPreview = Boolean(result?.previewHtml && (language === 'html' || language === 'css'));

  const langOptions = useMemo(
    () =>
      (Object.keys(SNIPPETS) as CompilerLanguage[]).map((id) => (
        <option key={id} value={id}>
          {LANGUAGE_LABELS[id]}
        </option>
      )),
    []
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4 h-[calc(100vh-4rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Compiler</h1>
          <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <span className="sr-only">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as CompilerLanguage)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {langOptions}
            </select>
          </label>
        </div>
        <Button onClick={handleRun} disabled={running} size="sm">
          {running ? (
            <>
              <Spinner size="sm" />
              &nbsp;Running…
            </>
          ) : (
            '▶ Run'
          )}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
            Source code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 font-mono text-sm bg-gray-950 text-green-400 rounded-xl border border-gray-700 p-4 resize-none focus:outline-none focus:ring-2 focus:ring-accent min-h-[200px]"
          />
        </div>

        <div className="flex-1 flex flex-col min-h-0 gap-3">
          <div className="flex flex-col min-h-0 flex-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
              {language === 'html' || language === 'css' ? 'Notes / console' : 'Output'}
            </label>
            <div
              className={`flex-1 font-mono text-sm rounded-xl border p-4 overflow-auto whitespace-pre-wrap min-h-[120px] ${
                result?.timedOut
                  ? 'border-yellow-500 bg-yellow-950 text-yellow-300'
                  : hasError
                    ? 'border-red-500 bg-red-950 text-red-300'
                    : 'border-gray-700 bg-gray-950 text-gray-200'
              }`}
            >
              {!result && !running && (
                <span className="text-gray-600">Run your code to see output here.</span>
              )}
              {running && <span className="text-gray-500">Running…</span>}
              {result?.timedOut && (
                <span className="text-yellow-400">⏱ Execution timed out (10s limit exceeded)</span>
              )}
              {result && !result.timedOut && (
                <>
                  {result.stdout && <span className="text-gray-200">{result.stdout}</span>}
                  {result.stderr && <span className="text-red-400">{result.stderr}</span>}
                  {!result.stdout && !result.stderr && !showPreview && (
                    <span className="text-gray-500">(no output)</span>
                  )}
                </>
              )}
            </div>
            {result && !result.timedOut && (language === 'cpp' || language === 'javascript') && (
              <p className="text-xs text-gray-500 mt-1">
                Exit code:{' '}
                <span className={result.exitCode === 0 ? 'text-green-400' : 'text-red-400'}>
                  {result.exitCode}
                </span>
              </p>
            )}
          </div>

          {showPreview && previewUrl && (
            <div className="flex flex-col min-h-0 flex-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                Preview
              </label>
              <iframe
                title="HTML preview"
                src={previewUrl}
                sandbox="allow-scripts allow-forms"
                className="flex-1 min-h-[200px] rounded-xl border border-gray-700 bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
