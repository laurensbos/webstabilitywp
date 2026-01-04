import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://webstability.nl'),
  title: {
    default: 'webstability - Website Monitoring & Uptime Monitoring Nederland',
    template: '%s | webstability',
  },
  description: 'Professionele website monitoring voor Nederlandse bedrijven. Detecteer downtime binnen 30 seconden, SSL monitoring, performance tracking. Gratis starten met 2 sites.',
  keywords: ['website monitoring', 'uptime monitoring', 'downtime detectie', 'SSL monitoring', 'website performance', 'Nederland', 'server monitoring', 'website beschikbaarheid', 'site monitoring', 'uptime checker'],
  authors: [{ name: 'webstability' }],
  creator: 'webstability',
  publisher: 'webstability',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'webstability - Website Monitoring & Uptime Monitoring',
    description: 'Professionele website monitoring voor Nederlandse bedrijven. Detecteer downtime binnen 30 seconden.',
    type: 'website',
    locale: 'nl_NL',
    siteName: 'webstability',
    url: 'https://webstability.nl',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'webstability - Website Monitoring Nederland',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'webstability - Website Monitoring Nederland',
    description: 'Detecteer downtime binnen 30 seconden. Gratis starten met 2 sites.',
    creator: '@webstability',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://webstability.nl',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}