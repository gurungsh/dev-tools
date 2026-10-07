import type { ThemeDef } from '../types';

export const slate: ThemeDef = {
  id: 'slate',
  label: 'Slate',
  description: 'Clean and neutral with a blue accent.',
  fonts: { sans: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', ui-monospace, monospace" },
  loadFonts: () => Promise.all([import('@fontsource/inter/latin-400.css'), import('@fontsource/inter/latin-500.css'), import('@fontsource/jetbrains-mono/latin-400.css')]),
  radius: 8,
  logo: '<rect width="32" height="32" rx="8" fill="var(--app-accent)"/><polyline points="12,10 6,16 12,22" fill="none" stroke="var(--app-on-accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><polyline points="20,10 26,16 20,22" fill="none" stroke="var(--app-on-accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  light: {
    bg: '#f6f7f9', panel: '#ffffff', border: '#dde1e7', text: '#1c2230', dimmed: '#5d6679', accent: '#2f6fed', hover: '#e8effd',
    syntax: { key: '#2b62d6', string: '#0f7a55', number: '#b8420b', keyword: '#7a3fc4', comment: '#6b7385' },
  },
  dark: {
    bg: '#12151c', panel: '#1a1f2a', border: '#2a3140', text: '#e6e9f0', dimmed: '#9aa4b8', accent: '#5b8def', hover: '#232b3b',
    syntax: { key: '#7aa7ff', string: '#4ade9a', number: '#fb923c', keyword: '#c4a1ff', comment: '#7e889c' },
  },
};
