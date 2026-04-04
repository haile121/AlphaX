import type { Metadata } from 'next';
import PressPageClient from './PressPageClient';

export const metadata: Metadata = {
  title: 'Press',
  description: 'Press and media resources for AlphaX Programming.',
};

export default function PressPage() {
  return <PressPageClient />;
}
