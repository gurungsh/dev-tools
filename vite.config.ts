/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const single = process.env.SINGLE_FILE === '1';

const ALL_THEMES = ['slate', 'paper', 'terminal', 'editor', 'repo', 'mono', 'workspace', 'macos'];
const enabledThemes = ALL_THEMES;
const themeFlags = Object.fromEntries(ALL_THEMES.map((id) => [`__THEME_${id.toUpperCase()}__`, JSON.stringify(enabledThemes.includes(id))]));

export default defineConfig({
  base: './',
  define: themeFlags,
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: {
    chunkSizeWarningLimit: 4000,
    // Dynamic imports must be inlined for the single-file build.
    ...(single ? { assetsInlineLimit: Infinity, cssCodeSplit: false } : {}),
  },
  test: { environment: 'node' },
});
