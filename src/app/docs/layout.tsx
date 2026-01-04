import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentatie - API Docs & Handleidingen',
  description: 'Leer hoe je webstability kunt gebruiken. API documentatie, integratie handleidingen en best practices voor website monitoring.',
  openGraph: {
    title: 'Documentatie - webstability',
    description: 'API docs, handleidingen en best practices voor website monitoring.',
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
