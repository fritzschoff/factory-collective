import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { HydrationMark } from '@/components/chrome/HydrationMark';
import { SITE } from '@/content/site';
import { siteUrl } from '@/lib/seo';
import '@/styles/index.css';

/** Archivo Black — the sign and the titles. `block`: the window is cut for these exact glyphs. */
const display = localFont({ src: '../../public/fonts/archivo-black.woff', weight: '400', style: 'normal', display: 'block', variable: '--font-display', fallback: ['Arial Black', 'Arial', 'sans-serif'] });
/** Arimo — running text (metrically equal to Arial). */
const text = localFont({ src: '../../public/fonts/arimo.woff', weight: '400', style: 'normal', display: 'swap', variable: '--font-text', fallback: ['Arial', 'Helvetica', 'sans-serif'] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s — ${SITE.short}` },
  description: SITE.description,
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { themeColor: '#ffffff' };

export default function RootLayout({ children }: { children: ReactNode }) {
  // data-scroll-behavior: base.css scrolls smoothly; Next 16 only suspends that during route changes when asked to
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${text.variable}`}>
      <body>
        <HydrationMark />
        {children}
      </body>
    </html>
  );
}
