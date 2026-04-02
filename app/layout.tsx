// app/layout.tsx
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Pair — Commute Differently',
  description: 'Shared, safe, and predictable commutes across Lagos at a fraction of the cost. No danfo scramble. No surge pricing.',
  keywords: 'Lagos commute, carpool, shared mobility, Pair, Nigeria transport',
  authors: [{ name: 'Pair Mobility' }],
  openGraph: {
    title: 'Pair — Commute Differently',
    description: 'Join your ride from a café, not a bus stop. Track your driver in real time. 25% off your first 3 trips.',
    type: 'website',
    locale: 'en_NG',
  },
};

// Move viewport to a separate export (required in Next.js 15+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a5c3a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}