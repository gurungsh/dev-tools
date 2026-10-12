import type { ThemeDef } from '../types';
import { flameLogo } from '../flame';

export const terminal: ThemeDef = {
  id: 'terminal',
  label: 'Terminal',
  description: 'Retro green-screen: phosphor green on black, pixel font, square corners.',
  fonts: { sans: "'VT323', 'IBM Plex Mono', ui-monospace, monospace", mono: "'IBM Plex Mono', ui-monospace, monospace" },
  loadFonts: () => Promise.all([import('@fontsource/vt323/latin-400.css'), import('@fontsource/ibm-plex-mono/latin-400.css'), import('@fontsource/ibm-plex-mono/latin-500.css')]),
  fontScale: 1.3,
  toolNames: { guid: 'uuidgen', request: 'curl', formatter: 'fmt', diff: 'diff', mermaid: 'mmd', base64: 'base64', jwt: 'jwt', hash: 'shasum' },
  radius: 0,
  logo: flameLogo,
  light: {
    bg: '#e9f0e4', panel: '#f4f8f0', border: '#8fb08a', text: '#0b3d14', dimmed: '#3d6b45', accent: '#0b6b22', hover: '#d3e3cb',
    flame: { outer: '#2f8f4a', core: '#0b3d14' },
    syntax: { key: '#0a6b3a', string: '#4d6b00', number: '#8a4b00', keyword: '#006b6b', comment: '#4f7a56' },
  },
  dark: {
    bg: '#000800', panel: '#041004', border: '#1f5c1f', text: '#33ff66', dimmed: '#29b84c', accent: '#33ff66', hover: '#0d2a0d',
    flame: { outer: '#1fae45', core: '#7dff9b' },
    syntax: { key: '#5fffa0', string: '#c8ff5a', number: '#ffb000', keyword: '#4de0d0', comment: '#2e9e4f' },
  },
};
