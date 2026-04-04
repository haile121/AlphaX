import type { Metadata } from 'next';
import CareersPageClient from './CareersPageClient';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the team building bilingual C++ education for Ethiopian learners.',
};

export default function CareersPage() {
  return <CareersPageClient />;
}
