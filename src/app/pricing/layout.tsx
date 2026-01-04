import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Transparante prijzen voor website monitoring',
  description: 'Bekijk onze prijzen. Start gratis met 2 websites. Pro vanaf €9/maand voor 10 sites met 3-minuut checks. Geen verborgen kosten.',
  openGraph: {
    title: 'Pricing - webstability',
    description: 'Website monitoring vanaf €0. Gratis starten, upgraden wanneer je wilt.',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
