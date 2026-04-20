import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Werewolf: Midnight Hunt',
  description: 'The classic social deduction game with AI opponents',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
