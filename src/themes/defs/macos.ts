import type { ThemeDef } from '../types';

export const macos: ThemeDef = {
  id: 'macos',
  label: 'macOS style',
  description: 'System fonts, rounded controls and a blue selection.',
  fonts: {
    sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', sans-serif",
    mono: "ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace",
  },
  loadFonts: async () => undefined,
  radius: 10,
  logo: '<rect x="1" y="1" width="30" height="30" rx="8" fill="var(--app-accent)"/><path d="M12 8c-3 0-3 2-3 4v2c0 1-1 2-2 2 1 0 2 1 2 2v2c0 2 0 4 3 4M20 8c3 0 3 2 3 4v2c0 1 1 2 2 2-1 0-2 1-2 2v2c0 2 0 4-3 4" fill="none" stroke="var(--app-on-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  light: {
    bg: '#ffffff', panel: '#f2f2f4', border: '#d6d6d9', text: '#1d1d1f', dimmed: '#6e6e73', accent: '#0071e3', hover: '#e3eefc',
    syntax: { key: '#0b5fd0', string: '#1c7c3c', number: '#a84a14', keyword: '#a3329b', comment: '#86868b' },
  },
  dark: {
    bg: '#1e1e1e', panel: '#2a2a2c', border: '#3d3d3f', text: '#f5f5f7', dimmed: '#a1a1a6', accent: '#0a84ff', hover: '#3a3a3c',
    syntax: { key: '#64d2ff', string: '#30d158', number: '#ff9f0a', keyword: '#ff7ab2', comment: '#8e8e93' },
  },
};
