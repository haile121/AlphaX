import type { ReactNode } from 'react';
import { ClientLayoutWrapper } from '@/components/layout/ClientLayoutWrapper';
import { AdminGate } from './AdminGate';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      <ClientLayoutWrapper variant="admin">{children}</ClientLayoutWrapper>
    </AdminGate>
  );
}
