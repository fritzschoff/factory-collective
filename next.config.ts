import type { NextConfig } from 'next';
import { soonRedirects } from './src/content/soon';
import { contentSecurityPolicy } from './src/lib/csp';

/** The old server's security headers (Ruling P50). The CSP stays report-only: a nonce policy cannot prerender with cache components. */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy() },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // product pictures of this project's bucket only — the optimizer must not resize any other bucket's files
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: `/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '*'}/o/**` },
      ...(process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === '1'
        ? [{ protocol: 'http', hostname: '127.0.0.1', port: '9199' } as const, { protocol: 'http', hostname: 'localhost', port: '9199' } as const]
        : []),
    ],
  },
  trailingSlash: true,
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  /** printed in the title blocks of every page (DD.MM.YYYY) */
  env: { NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10) },
  /** pages that are "coming soon" send visitors to their parent (307) */
  async redirects() {
    return soonRedirects();
  },
  /** on every page, every file of public/ and _next/, and the 404s (not on the empty 307s of redirects() above) */
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
