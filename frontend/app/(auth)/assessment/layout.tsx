import { ReactNode } from 'react';

/** Parent auth layout supplies Navbar; no sidebar on /assessment (see ClientLayoutWrapper). */
export default function AssessmentLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
