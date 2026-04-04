import { ReactNode } from 'react';
import { ClientLayoutWrapper } from '@/components/layout/ClientLayoutWrapper';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ClientLayoutWrapper variant="auth">
      {children}
    </ClientLayoutWrapper>
  );
}
