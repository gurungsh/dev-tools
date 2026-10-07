import type { ThemeDef } from '../types';

export const repo: ThemeDef = {
  id: 'repo',
  label: 'Repo',
  description: 'Code-hosting look with a green primary action.',
  fonts: { sans: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', ui-monospace, monospace" },
  loadFonts: () => Promise.all([import('@fontsource/inter/latin-400.css'), import('@fontsource/inter/latin-500.css'), import('@fontsource/jetbrains-mono/latin-400.css')]),
  radius: 6,
  logo: '<circle cx="16" cy="16" r="14" fill="var(--app-text)"/><circle cx="11" cy="11" r="2.4" fill="var(--app-bg)"/><circle cx="11" cy="21" r="2.4" fill="var(--app-bg)"/><circle cx="21" cy="14" r="2.4" fill="var(--app-bg)"/><path d="M11 13.4v5.2M11 18c0-3 6-1.5 10-1.6" fill="none" stroke="var(--app-bg)" stroke-width="1.8"/>',
  light: {
    bg: '#ffffff', panel: '#f6f8fa', border: '#d0d7de', text: '#1f2328', dimmed: '#59636e', accent: '#1a7f37', hover: '#eaeef2',
    syntax: { key: '#0550ae', string: '#0a3069', number: '#b3361a', keyword: '#cf222e', comment: '#6e7781' },
  },
  dark: {
    bg: '#0d1117', panel: '#161b22', border: '#30363d', text: '#e6edf3', dimmed: '#8d96a0', accent: '#2ea043', hover: '#21262d',
    syntax: { key: '#79c0ff', string: '#a5d6ff', number: '#ffa657', keyword: '#ff7b72', comment: '#7d8590' },
  },
};
