/**
 * Split chapter3-full.txt into part1.txt … part4.txt at section headings.
 * Run after extract:chapter3 (or manually: node scripts/split-chapter3.cjs).
 *
 * Part 1 — intro, sequential, selection, if (through nested if)
 * Part 2 — switch
 * Part 3 — for, while, do-while
 * Part 4 — pitfalls, loop types, continue, break
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'chapter3');
const fullPath = path.join(dir, 'chapter3-full.txt');
const legacyPath = path.join(dir, 'part1.txt');

function normalize(text) {
  return text.replace(/\r\n/g, '\n');
}

function main() {
  let text;
  if (fs.existsSync(fullPath)) {
    text = normalize(fs.readFileSync(fullPath, 'utf8'));
  } else if (fs.existsSync(legacyPath)) {
    text = normalize(fs.readFileSync(legacyPath, 'utf8'));
    fs.writeFileSync(fullPath, text.trim() + '\n', 'utf8');
    console.log('Wrote backup', fullPath);
  } else {
    console.error('Missing', fullPath, 'or', legacyPath);
    process.exit(1);
  }

  const m1 = text.search(/\n4\.1\.1\.\s*The Switch Statement/im);
  const m2 = text.search(/\n4\.2\s+Repetition Statements/im);
  const m3 = text.search(/\n4\.2\.4\.\s*Pitfalls/im);

  if (m1 === -1 || m2 === -1 || m3 === -1) {
    console.error('Could not find section markers. Found:', { m1, m2, m3 });
    process.exit(1);
  }

  const parts = [
    text.slice(0, m1).trim() + '\n',
    text.slice(m1, m2).trim() + '\n',
    text.slice(m2, m3).trim() + '\n',
    text.slice(m3).trim() + '\n',
  ];

  for (let i = 0; i < 4; i++) {
    const out = path.join(dir, `part${i + 1}.txt`);
    fs.writeFileSync(out, parts[i], 'utf8');
    console.log('Wrote', out, `(${parts[i].length} chars)`);
  }
}

main();
