/**
 * Build frontend/content/chapter1/part{1-4}.txt from study content Word files.
 *
 * - ch1part1.docx → split into part1 + part2 at "Chapter 2 part 3", or 50/50
 * - ch1part2.docx OR ch1part2.doc → part3 (lesson 3)
 * - ch1part4.docx → part4
 *
 * Run: npm run extract:chapter1  (from frontend/)
 */
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const studyDir = path.join(root, '..', 'study content');
const outDir = path.join(root, 'content', 'chapter1');

function normalize(text) {
  return text.replace(/\r\n/g, '\n').trim();
}

function hash(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function resolveCh1Part2() {
  const docx = path.join(studyDir, 'ch1part2.docx');
  const doc = path.join(studyDir, 'ch1part2.doc');
  if (fs.existsSync(docx)) return docx;
  if (fs.existsSync(doc)) return doc;
  return null;
}

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.doc') {
    const extractor = new WordExtractor();
    const document = await extractor.extract(filePath);
    return document.getBody();
  }
  const r = await mammoth.extractRawText({ path: filePath });
  return r.value;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const p1path = path.join(studyDir, 'ch1part1.docx');
  const p3path = path.join(studyDir, 'ch1part3.docx');
  const p4path = path.join(studyDir, 'ch1part4.docx');
  const part2src = resolveCh1Part2();

  for (const p of [p1path, p4path]) {
    if (!fs.existsSync(p)) {
      console.error('Missing required file:', p);
      process.exit(1);
    }
  }
  if (!part2src) {
    console.error('Missing ch1part2: need study content/ch1part2.docx or ch1part2.doc');
    process.exit(1);
  }

  const r1 = await mammoth.extractRawText({ path: p1path });
  const big = normalize(r1.value);
  const lines = big.split('\n');

  let splitIdx = lines.findIndex((l) => /^Chapter\s*2\s+part\s*3\s*$/i.test(l.trim()));
  if (splitIdx === -1) {
    splitIdx = Math.floor(lines.length / 2);
    console.warn('[extract] No "Chapter 2 part 3" anchor — splitting ch1part1.docx 50/50 at line', splitIdx);
  }

  const part1 = lines.slice(0, splitIdx).join('\n').trim() + '\n';
  const part2 = lines.slice(splitIdx).join('\n').trim() + '\n';

  fs.writeFileSync(path.join(outDir, 'part1.txt'), part1, 'utf8');
  fs.writeFileSync(path.join(outDir, 'part2.txt'), part2, 'utf8');
  console.log('Wrote part1.txt', part1.length, 'chars, part2.txt', part2.length, 'chars (from ch1part1.docx)');

  const raw2 = await extractText(part2src);
  let body3 = normalize(raw2) + '\n';
  const srcLabel = path.basename(part2src);

  if (fs.existsSync(p3path)) {
    const raw3 = await extractText(p3path);
    const body3alt = normalize(raw3) + '\n';
    if (hash(body3) === hash(body3alt)) {
      console.warn('[extract] ch1part2 and ch1part3.docx are identical — using one for part3.txt');
    } else {
      console.warn('[extract] ch1part2 and ch1part3.docx differ; using ch1part2 for part3.txt');
    }
  }

  fs.writeFileSync(path.join(outDir, 'part3.txt'), body3, 'utf8');
  console.log('Wrote part3.txt', body3.length, 'chars (from', srcLabel + ')');

  const r4 = await mammoth.extractRawText({ path: p4path });
  const body4 = normalize(r4.value) + '\n';
  fs.writeFileSync(path.join(outDir, 'part4.txt'), body4, 'utf8');
  console.log('Wrote part4.txt', body4.length, 'chars (from ch1part4.docx)');

  console.log('Done.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
