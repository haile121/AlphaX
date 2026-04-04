import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About',
  description:
    'AlphaX Programming exists to remove the language barrier between Ethiopian learners and serious programming—bilingual lessons, a live compiler, and an AI tutor.',
};

export default function AboutPage() {
  return <AboutPageClient />;
}
