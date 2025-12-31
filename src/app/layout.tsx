import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Webstability - WordPress Uptime & Performance Monitoring",
  description: "Real-time monitoring for WordPress agencies. Get instant alerts when client sites go down. Monitor uptime, performance, and SSL across all your WordPress sites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
