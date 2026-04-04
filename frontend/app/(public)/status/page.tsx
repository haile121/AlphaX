import type { Metadata } from 'next';
import StatusPageClient from './StatusPageClient';

export const metadata: Metadata = {
  title: 'Status',
  description: 'AlphaX Programming platform and service status.',
};

export default function StatusPage() {
  return <StatusPageClient />;
}
