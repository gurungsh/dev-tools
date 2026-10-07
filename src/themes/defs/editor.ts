import type { ThemeDef } from '../types';

export const editor: ThemeDef = {
  id: 'editor',
  label: 'Editor',
  description: 'Code-editor greys with a blue accent and tight corners.',
  fonts: { sans: "'Inter', system-ui, sans-serif", mono: "'Fira Code', ui-monospace, monospace" },
  loadFonts: () => Promise.all([import('@fontsource/inter/latin-400.css'), import('@fontsource/inter/latin-500.css'), import('@fontsource/fira-code/latin-400.css')]),
  radius: 2,
  logo: '<rect width="32" height="32" rx="3" fill="var(--app-accent)"/><path d="M22 6 11 16l11 10V6z" fill="none" stroke="var(--app-on-accent)" stroke-width="2.4" stroke-linejoin="round"/>',
  light: {
    bg: '#ffffff', panel: '#f3f3f3', border: '#d4d4d4', text: '#333333', dimmed: '#616161', accent: '#006ab1', hover: '#e4e6f1',
    syntax: { key: '#0451a5', string: '#a31515', number: '#0b7a52', keyword: '#0000ff', comment: '#6a737d' },
  },
  dark: {
    bg: '#1e1e1e', panel: '#252526', border: '#3c3c3c', text: '#cccccc', dimmed: '#9a9a9a', accent: '#3794ff', hover: '#37373d',
    syntax: { key: '#9cdcfe', string: '#ce9178', number: '#b5cea8', keyword: '#569cd6', comment: '#7a8b6e' },
  },
};
