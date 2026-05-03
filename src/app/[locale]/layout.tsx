import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Press_Start_2P } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/lib/auth-context';
import DiscordButton from '@/components/ui/DiscordButton';
import '../globals.css';

const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Werewolf: Midnight Hunt',
  description: 'The classic social deduction game with AI opponents',
};

type Locale = (typeof routing.locales)[number];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={pixelFont.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
            <DiscordButton />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
