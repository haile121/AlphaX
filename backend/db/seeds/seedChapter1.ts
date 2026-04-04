import { query } from '../connection';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('Seeding Comprehensive Chapter 1 to the database...');
  try {
    const htmlPath = path.join(__dirname, 'chapter1.html');
    const HTML_CONTENT = fs.readFileSync(htmlPath, 'utf8');

    const checkRs = await query<{ count: number }[]>('SELECT COUNT(*) AS count FROM lessons WHERE level_id = ?', ['beginner']);
    let currentCount = 0;
    if (checkRs && checkRs.length > 0) {
      currentCount = checkRs[0].count;
    }

    const lessonId = uuidv4();
    const titleEn = 'Chapter 1: Full Masterclass';
    const titleAm = 'ምዕራፍ 1: ሙሉ ማብራሪያ';
    
    // Deploying the comprehensive combined content
    const sql = `
      INSERT INTO lessons 
      (id, level_id, title_en, title_am, content_en, content_am, order_index, is_published, is_downloadable)
      VALUES (?, ?, ?, ?, ?, ?, ?, true, false)
    `;

    await query(sql, [
      lessonId,
      'beginner',
      titleEn,
      titleAm,
      HTML_CONTENT,
      HTML_CONTENT,
      currentCount + 1
    ]);

    console.log('[✓] Successfully seeded comprehensive Chapter 1 into the lessons table!');
  } catch (error) {
    console.error('[!] Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seed();
