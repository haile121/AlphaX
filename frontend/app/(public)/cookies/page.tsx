import type { Metadata } from 'next';
import CookiesPageClient from './CookiesPageClient';

export const metadata: Metadata = {
  title: 'Cookies',
  description: 'How AlphaX Programming uses cookies and similar technologies.',
};

export default function CookiesPage() {
  return <CookiesPageClient />;
}
