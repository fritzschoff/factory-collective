import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'packages/shop-core/**/*.test.ts', 'scripts/**/*.test.{ts,mjs}'],
    exclude: ['**/node_modules/**', 'e2e/**'],
    setupFiles: ['src/test/setup.ts'],
    // next/link drops the trailing slash unless Next tells it the site uses them
    env: { __NEXT_TRAILING_SLASH: 'true' },
  },
});
