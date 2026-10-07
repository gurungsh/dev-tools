import type { ThemeDef } from '../types';

export const workspace: ThemeDef = {
  id: 'workspace',
  label: 'Workspace',
  description: 'Soft and quiet, like a notes app.',
  fonts: { sans: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', ui-monospace, monospace" },
  loadFonts: () => Promise.all([import('@fontsource/inter/latin-400.css'), import('@fontsource/inter/latin-500.css'), import('@fontsource/jetbrains-mono/latin-400.css')]),
  radius: 4,
  logo: '<rect x="4" y="4" width="24" height="24" rx="4" fill="var(--app-bg)" stroke="var(--app-text)" stroke-width="2.2"/><path d="M11 22V10l10 12V10" fill="none" stroke="var(--app-text)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>',
  light: {
    bg: '#ffffff', panel: '#f7f7f5', border: '#e3e2de', text: '#37352f', dimmed: '#6f6e69', accent: '#1d73c9', hover: '#efefed',
    syntax: { key: '#0b6e99', string: '#0f7b6c', number: '#a84f08', keyword: '#7f52a3', comment: '#8a8984' },
  },
  dark: {
    bg: '#191919', panel: '#202020', border: '#373737', text: '#e6e6e6', dimmed: '#a0a0a0', accent: '#4a9be8', hover: '#2b2b2b',
    syntax: { key: '#6bb3e0', string: '#4dab9a', number: '#ffa344', keyword: '#b58ad6', comment: '#808080' },
  },
};
