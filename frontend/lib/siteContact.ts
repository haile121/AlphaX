/** Shown on the public contact page and used for mailto links. Override via env in production. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@alphaxcpp.com';

/** Press & media inquiries; defaults to the main contact address. */
export const PRESS_EMAIL = process.env.NEXT_PUBLIC_PRESS_EMAIL ?? CONTACT_EMAIL;

/** Optional Discord invite for /community — empty hides the Discord CTA until you add one. */
export const COMMUNITY_DISCORD_URL = process.env.NEXT_PUBLIC_COMMUNITY_DISCORD ?? '';
