import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  cacheComponents: true,
  partialPrefetching: true,
  /** printed in the title blocks of every page (DD.MM.YYYY) */
  env: { NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10) },
};

export default nextConfig;
