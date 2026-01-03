import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'webstability - Website Monitoring & Uptime Monitoring Nederland',
  description: 'Professionele website monitoring voor Nederlandse bedrijven. Detecteer downtime binnen 30 seconden, SSL monitoring, performance tracking. Gratis starten.',
  keywords: 'website monitoring, uptime monitoring, downtime detectie, SSL monitoring, website performance, Nederland, server monitoring, website beschikbaarheid',
  openGraph: {
    title: 'webstability - Website Monitoring & Uptime Monitoring',
    description: 'Professionele website monitoring voor Nederlandse bedrijven. Detecteer downtime binnen 30 seconden.',
    type: 'website',
    locale: 'nl_NL',
    siteName: 'webstability',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'webstability - Website Monitoring Nederland',
    description: 'Detecteer downtime binnen 30 seconden. Gratis starten.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}