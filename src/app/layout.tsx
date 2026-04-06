import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'One Night Werewolf',
  description: 'The classic social deduction game with AI opponents',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
