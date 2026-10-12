import type { ThemeDef } from '../types';
import { flameLogo } from '../flame';
import { scene, svg, type Motif } from '../art';

const motifs: Motif[] = [
  (p) => `<rect x='-40' y='-40' width='80' height='80' fill='none' stroke='${p.border}' stroke-opacity='.18' stroke-width='8'/>`,
  (p) => `<circle r='38' fill='${p.accent}' fill-opacity='.14'/>`,
  (p) => `<path d='M-44 0 H44 M0 -44 V44' stroke='${p.border}' stroke-opacity='.18' stroke-width='12'/>`,
  (p) => `<path d='M-44 40 L44 40 L0 -36Z' fill='${p.border}' fill-opacity='.14'/>`,
  (p) => `<g stroke='${p.border}' stroke-opacity='.16' stroke-width='10'><path d='M-44 -26 H44 M-44 0 H44 M-44 26 H44'/></g>`,
  (p) => `<path d='M-44 0 H30 M6 -26 L36 0 L6 26' fill='none' stroke='${p.accent}' stroke-opacity='.2' stroke-width='10' stroke-linejoin='miter'/>`,
];

export const brutalism: ThemeDef = {
  id: 'brutalism',
  label: 'Brutalism',
  description: 'Raw and stark: pure black and white with electric blue (yellow in dark mode), Space Mono text, Bungee headings, crude oversized shapes, thick borders and hard shadows.',
  fonts: { sans: "'Space Mono', ui-monospace, monospace", mono: "'Space Mono', ui-monospace, monospace", heading: "'Bungee', 'Space Mono', monospace" },
  loadFonts: () => Promise.all([import('@fontsource/space-mono/latin-400.css'), import('@fontsource/space-mono/latin-700.css'), import('@fontsource/bungee/latin-400.css')]),
  fontScale: 0.95,
  art: {
    // Raw shapes: oversized squares, discs, crosses, triangles, bars and arrows, dropped at different places on every page.
    main: (p, variant) => scene(p, motifs, variant, { count: 13, rotate: 8, scale: [0.9, 2.4] }),
    nav: (p) => svg(16, 16, `<path d='M0 16 L16 0 M-2 2 L2 -2 M14 18 L18 14' stroke='${p.border}' stroke-width='2' opacity='.18'/>`),
    header: (p) => svg(32, 52, `<path d='M0 52 L16 38 L32 52Z' fill='${p.border}'/>`),
    card: (p) => svg(44, 44, `<path d='M0 0 H44 V44Z' fill='${p.accent}'/>`),
  },
  radius: 0,
  logo: flameLogo,
  toolNames: { guid: 'Raw ID', request: 'Request', formatter: 'Format', diff: 'Diff', mermaid: 'Diagram', base64: 'Base64', jwt: 'Token', hash: 'Hash' },
  light: {
    bg: '#e8e8e8', panel: '#ffffff', border: '#000000', text: '#000000', dimmed: '#444444', accent: '#0000ff', hover: '#ffff00',
    flame: { outer: '#ff0000', core: '#000000' },
    syntax: { key: '#0000cc', string: '#006600', number: '#b30000', keyword: '#800080', comment: '#666666' },
  },
  dark: {
    bg: '#000000', panel: '#111111', border: '#ffffff', text: '#ffffff', dimmed: '#bbbbbb', accent: '#ffff00', hover: '#0000cc',
    flame: { outer: '#ffff00', core: '#ffffff' },
    syntax: { key: '#66ccff', string: '#66ff66', number: '#ff9966', keyword: '#ff66ff', comment: '#999999' },
  },
};
