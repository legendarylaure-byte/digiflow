import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Providers } from '@/components/layout/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'DigiFlow - Document Approval Workflow',
    template: '%s | DigiFlow',
  },
  description: 'AI-Powered Document Approval Workflow System by VyomAi Cloud Pvt. Ltd.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'DigiFlow - Document Approval Workflow',
    description: 'AI-Powered Document Approval Workflow System',
    images: ['/og-image.png'],
  },
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as 'en' | 'ne')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
