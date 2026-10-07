/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const single = process.env.SINGLE_FILE === '1';

export default defineConfig({
  base: './',
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: {
    chunkSizeWarningLimit: 4000,
    // Dynamic imports must be inlined for the single-file build.
    ...(single ? { assetsInlineLimit: Infinity, cssCodeSplit: false } : {}),
  },
  test: { environment: 'node' },
});
