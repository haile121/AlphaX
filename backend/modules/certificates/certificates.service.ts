import { randomUUID } from 'crypto';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { query } from '../../db/connection';
import { isMissingTableError, warnMissingMigrationOnce } from '../../db/mysqlErrors';
import type { Certificate, User } from '../../db/types';
import { getTrackCertificateEligibility } from '../course-track-quizzes/course-track-quizzes.service';

export type TrackKind = 'cpp' | 'web';

export interface TrackCompletionCertificate {
  id: string;
  user_id: string;
  track: TrackKind;
  verification_code: string;
  pdf_url: string;
  issued_at?: string | Date;
}

const CERTS_DIR = path.join(process.cwd(), 'public', 'certificates');

function ensureCertsDir() {
  if (!fs.existsSync(CERTS_DIR)) fs.mkdirSync(CERTS_DIR, { recursive: true });
}

async function checkLevelCompletion(userId: string, levelId: string): Promise<boolean> {
  // All lessons completed
  const [lessonCheck] = await query<{ total: number; completed: number }[]>(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN up.completed = true THEN 1 ELSE 0 END) AS completed
     FROM lessons l
     LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = ?
     WHERE l.level_id = ? AND l.is_published = true`,
    [userId, levelId]
  );
  if (lessonCheck.total === 0 || lessonCheck.completed < lessonCheck.total) return false;

  // All quizzes passed
  const [quizCheck] = await query<{ total: number; passed: number }[]>(
    `SELECT COUNT(DISTINCT q.id) AS total,
            COUNT(DISTINCT CASE WHEN qa.passed = true THEN q.id END) AS passed
     FROM quizzes q
     JOIN lessons l ON l.id = q.lesson_id
     LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.user_id = ?
     WHERE l.level_id = ?`,
    [userId, levelId]
  );
  if (quizCheck.total > 0 && quizCheck.passed < quizCheck.total) return false;

  // Exam passed
  const [examCheck] = await query<{ total: number; passed: number }[]>(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN ea.passed = true THEN 1 ELSE 0 END) AS passed
     FROM exams e
     LEFT JOIN exam_attempts ea ON ea.exam_id = e.id AND ea.user_id = ?
     WHERE e.level_id = ?`,
    [userId, levelId]
  );
  if (examCheck.total > 0 && (examCheck.passed ?? 0) < examCheck.total) return false;

  return true;
}

function generatePDF(displayName: string, levelLabel: string, verificationCode: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ensureCertsDir();
    const filename = `${verificationCode}.pdf`;
    const filepath = path.join(CERTS_DIR, filename);
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8fafc');

    // Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(3).stroke('#2563EB');

    // Title
    doc.fillColor('#1e3a5f').fontSize(36).font('Helvetica-Bold')
      .text('Certificate of Completion', 0, 80, { align: 'center' });

    // Subtitle
    doc.fillColor('#64748b').fontSize(16).font('Helvetica')
      .text('AlphaX Programming Learning Platform', 0, 130, { align: 'center' });

    // Divider
    doc.moveTo(100, 165).lineTo(doc.page.width - 100, 165).stroke('#2563EB');

    // Body
    doc.fillColor('#374151').fontSize(18).font('Helvetica')
      .text('This certifies that', 0, 190, { align: 'center' });

    doc.fillColor('#1e3a5f').fontSize(28).font('Helvetica-Bold')
      .text(displayName, 0, 220, { align: 'center' });

    doc.fillColor('#374151').fontSize(18).font('Helvetica')
      .text(`has successfully completed the ${levelLabel} level`, 0, 265, { align: 'center' });

    // Date
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.fillColor('#64748b').fontSize(13)
      .text(`Issued on ${date}`, 0, 320, { align: 'center' });

    // Verification code
    doc.fillColor('#94a3b8').fontSize(10)
      .text(`Verification Code: ${verificationCode}`, 0, doc.page.height - 60, { align: 'center' });

    doc.end();
    stream.on('finish', () => resolve(`/certificates/${filename}`));
    stream.on('error', reject);
  });
}

export async function generateCertificate(userId: string, levelId: string): Promise<Certificate> {
  // Check if already issued
  const existing = await query<Certificate[]>(
    'SELECT * FROM certificates WHERE user_id = ? AND level_id = ?',
    [userId, levelId]
  );
  if (existing.length > 0) return existing[0];

  const completed = await checkLevelCompletion(userId, levelId);
  if (!completed) throw { code: 'LEVEL_NOT_COMPLETED', message: 'Complete all lessons, quizzes, and the exam first.' };

  const userRows = await query<Pick<User, 'display_name'>[]>(
    'SELECT display_name FROM users WHERE id = ?', [userId]
  );
  const levelRows = await query<{ label_en: string }[]>(
    'SELECT label_en FROM levels WHERE id = ?', [levelId]
  );

  if (userRows.length === 0 || levelRows.length === 0) throw { code: 'NOT_FOUND', message: 'User or level not found' };

  const verificationCode = randomUUID();
  const pdfUrl = await generatePDF(userRows[0].display_name, levelRows[0].label_en, verificationCode);

  const id = randomUUID();
  await query(
    `INSERT INTO certificates (id, user_id, level_id, verification_code, pdf_url)
     VALUES (?, ?, ?, ?, ?)`,
    [id, userId, levelId, verificationCode, pdfUrl]
  );

  const rows = await query<Certificate[]>('SELECT * FROM certificates WHERE id = ?', [id]);
  return rows[0];
}

export async function getCertificates(userId: string): Promise<Certificate[]> {
  return query<Certificate[]>(
    'SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC',
    [userId]
  );
}

function trackCertificateLabel(track: TrackKind): string {
  return track === 'cpp' ? 'C++ Fundamentals (Reading Module)' : 'Web Fundamentals (Reading Module)';
}

function generateTrackPDF(displayName: string, track: TrackKind, verificationCode: string): Promise<string> {
  const accent = track === 'cpp' ? '#2563EB' : '#7c3aed';
  const moduleLine = trackCertificateLabel(track);
  return new Promise((resolve, reject) => {
    ensureCertsDir();
    const filename = `${verificationCode}.pdf`;
    const filepath = path.join(CERTS_DIR, filename);
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);

    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8fafc');
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(3).stroke(accent);

    doc.fillColor('#1e3a5f').fontSize(36).font('Helvetica-Bold')
      .text('Certificate of Completion', 0, 80, { align: 'center' });

    doc.fillColor('#64748b').fontSize(16).font('Helvetica')
      .text('AlphaX Programming Learning Platform', 0, 130, { align: 'center' });

    doc.moveTo(100, 165).lineTo(doc.page.width - 100, 165).stroke(accent);

    doc.fillColor('#374151').fontSize(18).font('Helvetica')
      .text('This certifies that', 0, 190, { align: 'center' });

    doc.fillColor('#1e3a5f').fontSize(28).font('Helvetica-Bold')
      .text(displayName, 0, 220, { align: 'center' });

    doc.fillColor('#374151').fontSize(16).font('Helvetica')
      .text(`has successfully completed the ${moduleLine}`, 0, 260, { align: 'center', width: doc.page.width });

    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.fillColor('#64748b').fontSize(13)
      .text(`Issued on ${date}`, 0, 320, { align: 'center' });

    doc.fillColor('#94a3b8').fontSize(10)
      .text(`Verification Code: ${verificationCode}`, 0, doc.page.height - 60, { align: 'center' });

    doc.end();
    stream.on('finish', () => resolve(`/certificates/${filename}`));
    stream.on('error', reject);
  });
}

export async function generateTrackCertificate(userId: string, track: TrackKind): Promise<TrackCompletionCertificate> {
  try {
    const existing = await query<TrackCompletionCertificate[]>(
      'SELECT * FROM track_completion_certificates WHERE user_id = ? AND track = ?',
      [userId, track]
    );
    if (existing.length > 0) return existing[0];

    const { eligible, reasons } = await getTrackCertificateEligibility(userId, track);
    if (!eligible) {
      throw {
        code: 'TRACK_NOT_ELIGIBLE',
        message: reasons.join(' ') || 'Reading progress and final exam requirements are not met yet.',
      };
    }

    const userRows = await query<Pick<User, 'display_name'>[]>(
      'SELECT display_name FROM users WHERE id = ?',
      [userId]
    );
    if (userRows.length === 0) throw { code: 'NOT_FOUND', message: 'User not found' };

    const verificationCode = randomUUID();
    const pdfUrl = await generateTrackPDF(userRows[0].display_name, track, verificationCode);

    const id = randomUUID();
    await query(
      `INSERT INTO track_completion_certificates (id, user_id, track, verification_code, pdf_url)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, track, verificationCode, pdfUrl]
    );

    const rows = await query<TrackCompletionCertificate[]>('SELECT * FROM track_completion_certificates WHERE id = ?', [id]);
    return rows[0];
  } catch (err: unknown) {
    if (isMissingTableError(err)) {
      throw {
        code: 'TRACK_CERTS_TABLE_MISSING',
        message: 'Track certificate table is missing. From backend/: npm run migrate:005',
      };
    }
    throw err;
  }
}

export async function getTrackCertificates(userId: string): Promise<TrackCompletionCertificate[]> {
  try {
    return await query<TrackCompletionCertificate[]>(
      'SELECT * FROM track_completion_certificates WHERE user_id = ? ORDER BY issued_at DESC',
      [userId]
    );
  } catch (err: unknown) {
    if (isMissingTableError(err)) {
      warnMissingMigrationOnce(
        'track_completion_certificates',
        '[certificates] track_completion_certificates missing — run: npm run migrate:005 (from backend/)'
      );
      return [];
    }
    throw err;
  }
}

export async function verifyCertificate(code: string): Promise<{
  certificate: Certificate | Pick<TrackCompletionCertificate, 'id' | 'issued_at' | 'verification_code' | 'pdf_url'>;
  display_name: string;
  level_label: string;
  kind: 'level' | 'track';
} | null> {
  const rows = await query<(Certificate & { display_name: string; label_en: string })[]>(
    `SELECT c.*, u.display_name, lv.label_en
     FROM certificates c
     JOIN users u ON u.id = c.user_id
     JOIN levels lv ON lv.id = c.level_id
     WHERE c.verification_code = ?`,
    [code]
  );
  if (rows.length > 0) {
    const r = rows[0];
    return { certificate: r, display_name: r.display_name, level_label: r.label_en, kind: 'level' };
  }

  let trackRows: (TrackCompletionCertificate & { display_name: string })[];
  try {
    trackRows = await query<(TrackCompletionCertificate & { display_name: string })[]>(
      `SELECT t.*, u.display_name
       FROM track_completion_certificates t
       JOIN users u ON u.id = t.user_id
       WHERE t.verification_code = ?`,
      [code]
    );
  } catch (err: unknown) {
    if (isMissingTableError(err)) trackRows = [];
    else throw err;
  }
  if (trackRows.length === 0) return null;
  const t = trackRows[0];
  return {
    certificate: {
      id: t.id,
      issued_at: t.issued_at,
      verification_code: t.verification_code,
      pdf_url: t.pdf_url,
    },
    display_name: t.display_name,
    level_label: trackCertificateLabel(t.track),
    kind: 'track',
  };
}
