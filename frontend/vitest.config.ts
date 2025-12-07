import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/app/shared/tests/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, './src/app/core'),
      '@features': resolve(__dirname, './src/app/features'),
      '@env': resolve(__dirname, './src/environments'),
      '@shared': resolve(__dirname, './src/app/shared'),
      '@layout': resolve(__dirname, './src/app/layout'),
      '@models': resolve(__dirname, './src/app/models'),
      'app': resolve(__dirname, './src/app'),
    },
  },
});
