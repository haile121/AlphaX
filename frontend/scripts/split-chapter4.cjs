/**
 * Split chapter4-full.txt into part1.txt … part6.txt (Functions chapter).
 * Markers: 4.4 → 4.5 → 4.7 → 4.9 → exercise block "8 Develop…"
 * Run: npm run split:chapter4 (from frontend/)
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'chapter4');
const fullPath = path.join(dir, 'chapter4-full.txt');

function normalize(text) {
  return text.replace(/\r\n/g, '\n');
}

function main() {
  if (!fs.existsSync(fullPath)) {
    console.error('Missing', fullPath, '— run npm run extract:chapter4 first');
    process.exit(1);
  }
  const t = normalize(fs.readFileSync(fullPath, 'utf8'));

  const m1 = t.indexOf('\n4.4. Function Parameters and arguments');
  const m2 = t.indexOf('\n4.5. Global versus local variables');
  const m3 = t.indexOf('\n4.7. Automatic versus static variables');
  const m4 = t.indexOf('\n4.9. Default arguments and function overloading');
  const m5 = t.indexOf('\n8 Develop a program that uses');

  const markers = { m1, m2, m3, m4, m5 };
  if (Object.values(markers).some((i) => i === -1)) {
    console.error('Missing section marker — check chapter4-full.txt headings.', markers);
    process.exit(1);
  }
  if (!(m1 < m2 && m2 < m3 && m3 < m4 && m4 < m5)) {
    console.error('Section order invalid.', markers);
    process.exit(1);
  }

  const parts = [
    t.slice(0, m1).trim() + '\n',
    t.slice(m1, m2).trim() + '\n',
    t.slice(m2, m3).trim() + '\n',
    t.slice(m3, m4).trim() + '\n',
    t.slice(m4, m5).trim() + '\n',
    t.slice(m5).trim() + '\n',
  ];

  for (let i = 0; i < 6; i++) {
    const out = path.join(dir, `part${i + 1}.txt`);
    fs.writeFileSync(out, parts[i], 'utf8');
    console.log('Wrote', out, `(${parts[i].length} chars)`);
  }
}

main();
