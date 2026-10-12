import type { ThemeDef } from '../types';
import { flameLogo } from '../flame';

export const mono: ThemeDef = {
  id: 'mono',
  label: 'Mono',
  description: 'Black and white with hairline borders.',
  fonts: { sans: "'Geist', 'Inter', system-ui, sans-serif", mono: "'Geist Mono', ui-monospace, monospace" },
  loadFonts: () => Promise.all([import('@fontsource/geist/latin-400.css'), import('@fontsource/geist/latin-500.css'), import('@fontsource/geist/latin-600.css'), import('@fontsource/geist/latin-700.css'), import('@fontsource/geist-mono/latin-400.css')]),
  radius: 6,
  logo: flameLogo,
  light: {
    bg: '#fafafa', panel: '#ffffff', border: '#e1e1e1', text: '#000000', dimmed: '#5c5c5c', accent: '#000000', hover: '#f0f0f0',
    flame: { outer: '#7a7a7a', core: '#000000' },
    syntax: { key: '#0060d6', string: '#107c41', number: '#b8460a', keyword: '#8e24aa', comment: '#6b6b6b' },
  },
  dark: {
    bg: '#000000', panel: '#0a0a0a', border: '#2e2e2e', text: '#ededed', dimmed: '#a1a1a1', accent: '#ffffff', hover: '#1a1a1a',
    flame: { outer: '#6e6e6e', core: '#ededed' },
    syntax: { key: '#52a8ff', string: '#62c073', number: '#f5a623', keyword: '#d28cf0', comment: '#8f8f8f' },
  },
};
