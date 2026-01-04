import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Toegang tot je dashboard',
  description: 'Log in op je webstability account om je website monitoring dashboard te bekijken.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
