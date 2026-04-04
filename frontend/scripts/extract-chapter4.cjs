/**
 * study content/ch4/ch4p1.docx + ch4p2.docx + ch4p3.docx → chapter4-full.txt, then split → part1…part6
 * Run: npm run extract:chapter4 (from frontend/)
 */
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, '..', 'study content', 'ch4');
const outDir = path.join(root, 'content', 'chapter4');
const fullOut = path.join(outDir, 'chapter4-full.txt');

const SOURCES = ['ch4p1.docx', 'ch4p2.docx', 'ch4p3.docx'];

(async () => {
  const chunks = [];
  for (const name of SOURCES) {
    const src = path.join(srcDir, name);
    if (!fs.existsSync(src)) {
      console.error('Missing:', src);
      process.exit(1);
    }
    const r = await mammoth.extractRawText({ path: src });
    chunks.push(r.value.replace(/\r\n/g, '\n').trim());
  }
  fs.mkdirSync(outDir, { recursive: true });
  const full = chunks.join('\n\n') + '\n';
  fs.writeFileSync(fullOut, full, 'utf8');
  console.log('Wrote', fullOut, `(${full.length} chars)`);

  execFileSync(process.execPath, [path.join(__dirname, 'split-chapter4.cjs')], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
