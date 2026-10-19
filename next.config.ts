import type { NextConfig } from 'next';
import { soonRedirects } from './src/content/soon';

/** The old server's security headers (Ruling P50). The Content-Security-Policy follows before launch. */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'http', hostname: '127.0.0.1', port: '9199' },
      { protocol: 'http', hostname: 'localhost', port: '9199' },
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
