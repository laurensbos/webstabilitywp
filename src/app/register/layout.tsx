import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registreren - Gratis account aanmaken',
  description: 'Maak gratis een webstability account aan. Start direct met het monitoren van je websites. Geen creditcard nodig.',
  openGraph: {
    title: 'Registreren - webstability',
    description: 'Start gratis met website monitoring. 2 sites gratis, setup in 2 minuten.',
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
