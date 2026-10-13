import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.{ts,mjs}'],
    exclude: ['legacy/**', 'node_modules/**', 'e2e/**'],
    setupFiles: ['src/test/setup.ts'],
    // next/link drops the trailing slash unless Next tells it the site uses them
    env: { __NEXT_TRAILING_SLASH: 'true' },
  },
});
