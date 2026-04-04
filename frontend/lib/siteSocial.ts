/**
 * Public social profile URLs for the contact page.
 * Set NEXT_PUBLIC_SOCIAL_* to your real profiles; defaults point to each platform’s home until you do.
 */
export const CONTACT_SOCIAL_LINKS = [
  { id: 'github' as const, label: 'GitHub', href: process.env.NEXT_PUBLIC_SOCIAL_GITHUB ?? 'https://github.com' },
  { id: 'x' as const, label: 'X', href: process.env.NEXT_PUBLIC_SOCIAL_X ?? 'https://x.com' },
  { id: 'linkedin' as const, label: 'LinkedIn', href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? 'https://www.linkedin.com' },
  { id: 'youtube' as const, label: 'YouTube', href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE ?? 'https://www.youtube.com' },
  { id: 'instagram' as const, label: 'Instagram', href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? 'https://www.instagram.com' },
];
