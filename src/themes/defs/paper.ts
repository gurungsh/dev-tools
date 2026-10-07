import type { ThemeDef } from '../types';

export const paper: ThemeDef = {
  id: 'paper',
  label: 'Paper',
  description: 'Warm and calm, with serif headings and a terracotta accent.',
  fonts: { sans: "'IBM Plex Sans', system-ui, sans-serif", mono: "'IBM Plex Mono', ui-monospace, monospace", heading: "'Fraunces', Georgia, serif" },
  loadFonts: () => Promise.all([import('@fontsource/ibm-plex-sans/latin-400.css'), import('@fontsource/ibm-plex-sans/latin-500.css'), import('@fontsource/ibm-plex-mono/latin-400.css'), import('@fontsource/fraunces/latin-500.css')]),
  radius: 4,
  logo: '<rect x="3" y="11" width="26" height="17" rx="3" fill="var(--app-accent)"/><path d="M11 11V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" fill="none" stroke="var(--app-accent)" stroke-width="2.4"/><rect x="3" y="17" width="26" height="2.4" fill="var(--app-on-accent)" opacity=".55"/><rect x="14" y="15.5" width="4" height="5.5" rx="1" fill="var(--app-on-accent)"/>',
  light: {
    bg: '#f7f2ea', panel: '#fffdf8', border: '#e0d6c3', text: '#2b2118', dimmed: '#6e5f4d', accent: '#b84a24', hover: '#f1e3d3',
    syntax: { key: '#9a3f1e', string: '#3b6636', number: '#7a4fa0', keyword: '#b84a24', comment: '#7d6e5c' },
  },
  dark: {
    bg: '#1c1814', panel: '#26201a', border: '#3a3128', text: '#efe6d8', dimmed: '#aa9c88', accent: '#e0764a', hover: '#332a21',
    syntax: { key: '#e8946a', string: '#8fbf88', number: '#b995d6', keyword: '#e0764a', comment: '#8c7f6e' },
  },
};
