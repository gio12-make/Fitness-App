import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavShell } from '@/components/layout/NavShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Abs by August',
  description: 'Personal performance dashboard — abs challenge tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-[#080808] text-[#F5F5F5] antialiased`}>
        <NavShell>{children}</NavShell>
      </body>
    </html>
  );
}
