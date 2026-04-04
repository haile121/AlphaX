/**
 * study content/ch3/ch_3 final(1).docx → frontend/content/chapter3/chapter3-full.txt
 * then splits into part1.txt … part4.txt (see split-chapter3.cjs).
 * Run: npm run extract:chapter3 (from frontend/)
 */
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const src = path.join(root, '..', 'study content', 'ch3', 'ch_3 final(1).docx');
const outDir = path.join(root, 'content', 'chapter3');
const fullOut = path.join(outDir, 'chapter3-full.txt');

(async () => {
  if (!fs.existsSync(src)) {
    console.error('Missing:', src);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  const r = await mammoth.extractRawText({ path: src });
  const text = r.value.replace(/\r\n/g, '\n').trim() + '\n';
  fs.writeFileSync(fullOut, text, 'utf8');
  console.log('Wrote', fullOut, `(${text.length} chars)`);

  execFileSync(process.execPath, [path.join(__dirname, 'split-chapter3.cjs')], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
