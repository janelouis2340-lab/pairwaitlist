// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

// Configure Syne font
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-syne',
});

// Configure DM Sans font
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-dm-sans',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Pair — Commute Differently',
  description: 'Shared, safe, and predictable commutes across Lagos at a fraction of the cost.',
  keywords: 'Lagos commute, carpool, shared mobility, Pair, Nigeria transport',
  authors: [{ name: 'Pair Mobility' }],
  openGraph: {
    title: 'Pair — Commute Differently',
    description: 'Join your ride from a café, not a bus stop. Track your driver in real time. 25% off your first 3 trips.',
    type: 'website',
    locale: 'en_NG',
  },
};

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
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        {/* 
          2. USE THE SCRIPT COMPONENT - This is safe and will be executed correctly.
          The strategy="afterInteractive" is a good default for chat widgets.
        */}
        <Script
          id="livechat-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.__lc = window.__lc || {};
              window.__lc.license = 19612539;
              window.__lc.integration_name = "manual_channels";
              window.__lc.product_name = "livechat";
            `,
          }}
        />
        <Script
          id="livechat-tracking"
          strategy="afterInteractive"
          src="https://cdn.livechatinc.com/tracking.js"
          async
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}