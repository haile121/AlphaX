import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { SandboxWebResult } from './sandbox-types';
import { spawnWithTimeout } from './sandbox-spawn';

const TIMEOUT_MS = 10000;

function escapeStyleClose(css: string): string {
  return css.replace(/<\/style/gi, '<\\/style');
}

export async function runJavaScript(sourceCode: string): Promise<SandboxWebResult> {
  const id = randomUUID();
  const tmpDir = path.join(os.tmpdir(), `js_${id}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  const scriptFile = path.join(tmpDir, 'main.js');
  fs.writeFileSync(scriptFile, sourceCode, 'utf8');
  try {
    return await spawnWithTimeout(process.execPath, [scriptFile], TIMEOUT_MS);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

export function runHtmlPreview(sourceCode: string): SandboxWebResult {
  return {
    stdout:
      'HTML preview is shown in the preview panel. The server does not execute this markup; it is rendered in your browser.',
    stderr: '',
    exitCode: 0,
    timedOut: false,
    previewHtml: sourceCode,
  };
}

export function runCssPreview(sourceCode: string): SandboxWebResult {
  const safe = escapeStyleClose(sourceCode);
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>${safe}</style>
</head>
<body>
  <div class="preview-root">
    <h1>Sample heading</h1>
    <p>Paragraph with <a href="#">a link</a> and <strong>bold</strong>.</p>
    <button type="button">Button</button>
    <ul><li>List item</li></ul>
  </div>
</body>
</html>`;
  return {
    stdout: 'CSS preview applies to the sample page below.',
    stderr: '',
    exitCode: 0,
    timedOut: false,
    previewHtml,
  };
}
