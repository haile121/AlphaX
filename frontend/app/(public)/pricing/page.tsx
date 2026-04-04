import type { Metadata } from 'next';
import PricingPageClient from './PricingPageClient';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'AlphaX Programming is free forever—full lessons, compiler, AI tutor, and certificates.',
};

export default function PricingPage() {
  return <PricingPageClient />;
}
