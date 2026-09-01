import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
      '@core': path.resolve(__dirname, 'packages/core'),
      '@database': path.resolve(__dirname, 'packages/database'),
      '@renderer': path.resolve(__dirname, 'apps/renderer/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
