import type { ThemeDef } from '../types';

export const terminal: ThemeDef = {
  id: 'terminal',
  label: 'Terminal',
  description: 'All monospace, phosphor green, square corners.',
  fonts: { sans: "'IBM Plex Mono', ui-monospace, monospace", mono: "'IBM Plex Mono', ui-monospace, monospace" },
  loadFonts: () => Promise.all([import('@fontsource/ibm-plex-mono/latin-400.css'), import('@fontsource/ibm-plex-mono/latin-500.css')]),
  radius: 0,
  logo: '<rect x="2" y="2" width="28" height="28" fill="none" stroke="var(--app-accent)" stroke-width="2"/><rect x="8" y="9" width="9" height="14" fill="var(--app-accent)"/><rect x="19" y="21" width="6" height="2.4" fill="var(--app-accent)"/>',
  light: {
    bg: '#f1f6f0', panel: '#fbfefb', border: '#bfd6bd', text: '#12361a', dimmed: '#456a4a', accent: '#15803d', hover: '#dfeedd',
    syntax: { key: '#15803d', string: '#4d6f0c', number: '#a64b06', keyword: '#0f5f2e', comment: '#5f8564' },
  },
  dark: {
    bg: '#0a0d0a', panel: '#0f140f', border: '#1f2e1f', text: '#c9f2c7', dimmed: '#7fa87c', accent: '#4ade80', hover: '#162416',
    syntax: { key: '#4ade80', string: '#a3e635', number: '#fcd34d', keyword: '#86efac', comment: '#5f8a5c' },
  },
};
