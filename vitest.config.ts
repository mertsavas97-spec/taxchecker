import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'src/lib/tax-engine/tests/**/*.test.ts',
      'src/lib/og/**/*.test.ts',
      'src/lib/seo/**/*.test.ts',
      'src/lib/admin/content/**/*.test.ts',
      'src/lib/cms/**/*.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(__dirname, './src/test-utils/server-only-stub.ts'),
    },
  },
});
