import nodemailer from 'nodemailer';
import { query } from '../../db/connection';
import type { User } from '../../db/types';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Runs daily at 08:00 UTC.
 * Finds users inactive for 3+ days and sends a re-engagement email.
 */
export async function runReEngagementCron(): Promise<void> {
  const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0, 10);

  const inactiveUsers = await query<Pick<User, 'id' | 'email' | 'display_name' | 'streak'>[]>(
    `SELECT id, email, display_name, streak FROM users
     WHERE (last_active_date <= ? OR last_active_date IS NULL)
     AND is_active = true`,
    [threeDaysAgo]
  );

  if (inactiveUsers.length === 0) return;

  const transporter = getTransporter();
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  for (const user of inactiveUsers) {
    try {
      await transporter.sendMail({
        from: `"C++ Learning Platform" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "We miss you! Come back and keep learning 🚀",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Hey ${user.display_name},</h2>
            <p>It's been a few days since you last visited. Your learning journey is waiting for you!</p>
            ${user.streak > 0 ? `<p>You had a <strong>${user.streak}-day streak</strong> going — don't let it slip away.</p>` : ''}
            <a href="${frontendUrl}/dashboard"
               style="display:inline-block;background:#2563EB;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">
              Resume Learning
            </a>
            <p style="margin-top:24px;color:#6b7280;font-size:12px;">
              You're receiving this because you have an account on the AlphaX Programming Learning Platform.
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error(`[re-engagement-cron] Failed to email ${user.email}:`, err);
    }
  }

  console.log(`[re-engagement-cron] Sent re-engagement emails to ${inactiveUsers.length} users`);
}
