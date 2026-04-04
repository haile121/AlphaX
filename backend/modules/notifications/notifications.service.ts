import { randomUUID } from 'crypto';
import { query } from '../../db/connection';
import type { Notification } from '../../db/types';

type NotificationType = Notification['type'];

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title_en: string;
  title_am: string;
  body_en: string;
  body_am: string;
}

export async function createNotification(payload: NotificationPayload): Promise<void> {
  await query(
    `INSERT INTO notifications (id, user_id, type, title_en, title_am, body_en, body_am, is_read)
     VALUES (?, ?, ?, ?, ?, ?, ?, false)`,
    [
      randomUUID(),
      payload.userId,
      payload.type,
      payload.title_en,
      payload.title_am,
      payload.body_en,
      payload.body_am,
    ]
  );
}

export async function notifyBadgeEarned(userId: string, badgeName: string, badgeNameAm: string): Promise<void> {
  await createNotification({
    userId,
    type: 'badge',
    title_en: 'Badge Earned!',
    title_am: 'ሽልማት ተሰጥቷል!',
    body_en: `You earned the "${badgeName}" badge.`,
    body_am: `"${badgeNameAm}" ሽልማት አግኝተዋል።`,
  });
}

export async function notifyXpMilestone(userId: string, xp: number): Promise<void> {
  await createNotification({
    userId,
    type: 'xp_milestone',
    title_en: 'XP Milestone!',
    title_am: 'XP ደረጃ!',
    body_en: `You've reached ${xp} XP. Keep it up!`,
    body_am: `${xp} XP ደርሰዋል። ቀጥሉ!`,
  });
}

export async function notifyNewLesson(userId: string, lessonTitle: string, lessonTitleAm: string): Promise<void> {
  await createNotification({
    userId,
    type: 'new_lesson',
    title_en: 'New Lesson Available',
    title_am: 'አዲስ ትምህርት',
    body_en: `A new lesson "${lessonTitle}" has been published.`,
    body_am: `አዲስ ትምህርት "${lessonTitleAm}" ታትሟል።`,
  });
}

export async function notifyStreakWarning(userId: string, streak: number): Promise<void> {
  await createNotification({
    userId,
    type: 'streak_warning',
    title_en: 'Streak at Risk!',
    title_am: 'ተከታታይ ቀናት አደጋ ላይ!',
    body_en: `Your ${streak}-day streak will reset at midnight. Log in to keep it!`,
    body_am: `የ${streak} ቀን ተከታታይ ቀናት እኩለ ሌሊት ይጠናቀቃል። ለማቆየት ይግቡ!`,
  });
}
