import { runInSandbox } from './sandbox';
import { runCssPreview, runHtmlPreview, runJavaScript } from './sandbox-web';
import type { SandboxWebResult } from './sandbox-types';

export type CompilerLanguage = 'cpp' | 'html' | 'css' | 'javascript';

export async function runCompiler(
  language: CompilerLanguage,
  sourceCode: string
): Promise<SandboxWebResult> {
  switch (language) {
    case 'cpp':
      return runInSandbox(sourceCode);
    case 'javascript':
      return runJavaScript(sourceCode);
    case 'html':
      return runHtmlPreview(sourceCode);
    case 'css':
      return runCssPreview(sourceCode);
    default: {
      const _exhaustive: never = language;
      return _exhaustive;
    }
  }
}
