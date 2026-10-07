/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import themeConfig from './config/themes.json' with { type: 'json' };

const single = process.env.SINGLE_FILE === '1';

const ALL_THEMES: string[] = themeConfig.ids;

/** DEVTOOLS_THEMES=paper or paper,mono or all (default). Unselected themes and their fonts are left out of the bundle. */
function selectedThemes(): string[] {
  const raw = (process.env.DEVTOOLS_THEMES ?? 'all').trim().toLowerCase();
  if (raw === '' || raw === 'all') return ALL_THEMES;
  const ids = raw.split(',').map((s) => s.trim()).filter(Boolean);
  const unknown = ids.filter((id) => !ALL_THEMES.includes(id));
  if (unknown.length) throw new Error(`Unknown theme(s): ${unknown.join(', ')}. Available: ${ALL_THEMES.join(', ')}`);
  return ALL_THEMES.filter((id) => ids.includes(id));
}

const enabledThemes = selectedThemes();
const themeFlags = Object.fromEntries(ALL_THEMES.map((id) => [`__THEME_${id.toUpperCase()}__`, JSON.stringify(enabledThemes.includes(id))]));

/** Fonts of tree-shaken themes are still emitted by Vite; drop any font file no chunk or stylesheet references. */
function pruneUnusedFonts(): Plugin {
  return {
    name: 'prune-unused-fonts',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const text = Object.values(bundle)
        .map((f) => (f.type === 'chunk' ? f.code : typeof f.source === 'string' ? f.source : ''))
        .join('\n');
      for (const [name, file] of Object.entries(bundle)) {
        if (file.type === 'asset' && /\.(woff2?|ttf|otf)$/.test(name) && !text.includes(name.split('/').pop()!)) delete bundle[name];
      }
    },
  };
}

export default defineConfig({
  base: './',
  define: themeFlags,
  plugins: [react(), pruneUnusedFonts(), ...(single ? [viteSingleFile()] : [])],
  build: {
    chunkSizeWarningLimit: 4000,
    // Dynamic imports must be inlined for the single-file build.
    ...(single ? { assetsInlineLimit: Infinity, cssCodeSplit: false } : {}),
  },
  test: { environment: 'node' },
});
