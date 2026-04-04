import type { Metadata } from 'next';
import FaqPageClient from './FaqPageClient';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about AlphaX Programming — lessons, compiler, AI tutor, certificates, and more.',
};

export default function FaqPage() {
  return <FaqPageClient />;
}
