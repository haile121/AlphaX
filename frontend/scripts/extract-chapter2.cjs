/**
 * study content/ch2/ch2part1.docx → frontend/content/chapter2/part1.txt
 * Run: npm run extract:chapter2 (from frontend/)
 */
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, '..', 'study content', 'ch2', 'ch2part1.docx');
const outDir = path.join(root, 'content', 'chapter2');
const out = path.join(outDir, 'part1.txt');

(async () => {
  if (!fs.existsSync(src)) {
    console.error('Missing:', src);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  const r = await mammoth.extractRawText({ path: src });
  const text = r.value.replace(/\r\n/g, '\n').trim() + '\n';
  fs.writeFileSync(out, text, 'utf8');
  console.log('Wrote', out, `(${text.length} chars)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
