import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import '@/styles/index.css';

/** Archivo Black — the sign and the titles. `block`: the window is cut for these exact glyphs. */
const display = localFont({ src: '../../public/fonts/archivo-black.woff', weight: '400', style: 'normal', display: 'block', variable: '--font-display', fallback: ['Arial Black', 'Arial', 'sans-serif'] });
/** Arimo — running text (metrically equal to Arial). */
const text = localFont({ src: '../../public/fonts/arimo.woff', weight: '400', style: 'normal', display: 'swap', variable: '--font-text', fallback: ['Arial', 'Helvetica', 'sans-serif'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  // data-scroll-behavior: base.css scrolls smoothly; Next 16 only suspends that during route changes when asked to
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
