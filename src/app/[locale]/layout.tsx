import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/providers/AuthProvider';
import QueryProvider from '@/providers/QueryProvider';
import '../globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm',
  display: 'swap',
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-ar',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MOUQAWEL AI — Construction Marketplace',
  description: 'Premium construction marketplace for Saudi Arabia',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${ibmPlexSans.variable} ${ibmPlexSansArabic.variable}`}
    >
      <body className="min-h-screen font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
