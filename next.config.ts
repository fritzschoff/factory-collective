import type { NextConfig } from 'next';
import { soonRedirects } from './src/content/soon';

const nextConfig: NextConfig = {
  trailingSlash: true,
  cacheComponents: true,
  partialPrefetching: true,
  /** printed in the title blocks of every page (DD.MM.YYYY) */
  env: { NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10) },
  /** pages that are "coming soon" send visitors to their parent (307) */
  async redirects() {
    return soonRedirects();
  },
};

export default nextConfig;
