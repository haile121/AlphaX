import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Geist } from 'next/font/google';
import { DialogProvider } from '@/components/ui/DialogProvider';
import { SITE_LOGO_PATH } from '@/lib/siteAssets';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'AlphaX Programming Learning Platform',
  description: 'Learn C++, HTML, CSS, JavaScript, and more in Amharic and English',
  icons: {
    icon: SITE_LOGO_PATH,
    apple: SITE_LOGO_PATH,
    shortcut: SITE_LOGO_PATH,
  },
  openGraph: {
    title: 'AlphaX Programming Learning Platform',
    description: 'Learn C++, HTML, CSS, JavaScript, and more in Amharic and English',
    images: [{ url: SITE_LOGO_PATH, alt: 'AlphaX Programming' }],
  },
  twitter: {
    card: 'summary',
    title: 'AlphaX Programming Learning Platform',
    description: 'Learn C++, HTML, CSS, JavaScript, and more in Amharic and English',
    images: [SITE_LOGO_PATH],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeInit = `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geist.variable}`} suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
