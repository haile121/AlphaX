import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the AlphaX Programming team.',
};

export default function ContactPage() {
  return <ContactPageClient />;
}
