import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavShell } from '@/components/layout/NavShell';
import { ProfileGate } from '@/components/layout/ProfileGate';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Abs by August',
  description: 'Personal performance dashboard — abs challenge tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AbsApp',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-[#080808] text-[#F5F5F5] antialiased`}>
        <ProfileGate>
          <NavShell>{children}</NavShell>
        </ProfileGate>
      </body>
    </html>
  );
}
