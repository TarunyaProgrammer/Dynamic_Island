import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { buildSync } from 'esbuild';
import path from 'path';

const buildPreload = () => {
  buildSync({
    entryPoints: [path.resolve(__dirname, 'apps/preload/index.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    external: ['electron'],
    outfile: path.resolve(__dirname, 'dist-electron/preload/index.cjs'),
  });
};

// Ensure preload is built immediately as CommonJS
buildPreload();

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: path.resolve(__dirname, 'apps/main/index.ts'),
        onstart(options) {
          options.startup([path.resolve(__dirname, '.')]);
        },
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist-electron/main'),
            rollupOptions: {
              external: ['better-sqlite3'],
            },
          },
          resolve: {
            alias: {
              '@shared': path.resolve(__dirname, 'shared'),
              '@core': path.resolve(__dirname, 'packages/core'),
              '@database': path.resolve(__dirname, 'packages/database'),
            },
          },
        },
      },
    ]),
    {
      name: 'watch-preload',
      handleHotUpdate({ file, server }) {
        if (file.includes('apps/preload')) {
          buildPreload();
          server.ws.send({ type: 'full-reload' });
        }
      },
    },
    renderer(),
  ],
  root: path.resolve(__dirname, 'apps/renderer'),
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
      '@core': path.resolve(__dirname, 'packages/core'),
      '@renderer': path.resolve(__dirname, 'apps/renderer/src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    target: 'chrome120',
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
