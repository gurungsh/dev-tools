import type { ThemeDef } from '../types';
import { flameLogo } from '../flame';
import { svg } from '../art';

export const synthwave: ThemeDef = {
  id: 'synthwave',
  label: 'Synthwave',
  description: '1980s neon: hot pink and cyan on a midnight purple night, Audiowide headings, a neon sunset grid backdrop and glowing edges.',
  fonts: { sans: "'Chakra Petch', system-ui, sans-serif", mono: "'JetBrains Mono', ui-monospace, monospace", heading: "'Audiowide', 'Chakra Petch', sans-serif" },
  loadFonts: () => Promise.all([import('@fontsource/chakra-petch/latin-400.css'), import('@fontsource/chakra-petch/latin-500.css'), import('@fontsource/chakra-petch/latin-600.css'), import('@fontsource/audiowide/latin-400.css'), import('@fontsource/jetbrains-mono/latin-400.css')]),
  art: {
    // Sunset over a perspective grid with stars; drawn on the page background, scaled to cover.
    main: (p, variant) => {
      const hy = 600;
      const sx = 450 + ((variant * 137) % 700);
      const stars = Array.from({ length: 22 }, (_, i) => `<circle cx='${(i * 173) % 1600}' cy='${(i * 97) % 380}' r='${1 + (i % 3) * 0.7}' fill='${p.flame.core}'/>`).join('');
      const stripes = [500, 528, 556, 584].map((y, i) => `<rect x='${sx - 180}' y='${y}' width='360' height='${3 + i * 2.5}' fill='${p.bg}'/>`).join('');
      const rays = Array.from({ length: 25 }, (_, i) => `<line x1='${sx}' y1='${hy}' x2='${sx + (i - 12) * 170}' y2='900'/>`).join('');
      const rows = Array.from({ length: 8 }, (_, k) => `<line x1='0' x2='1600' y1='${hy + 300 * ((k + 1) / 8) ** 2}' y2='${hy + 300 * ((k + 1) / 8) ** 2}'/>`).join('');
      return svg(1600, 900, `<defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${p.flame.core}'/><stop offset='1' stop-color='${p.flame.outer}'/></linearGradient></defs>`
        + `<g opacity='.3'>${stars}<circle cx='${sx}' cy='470' r='170' fill='url(#s)'/>${stripes}<rect y='${hy}' width='1600' height='300' fill='${p.bg}'/>`
        + `<g stroke='${p.accent}' stroke-width='2'>${rays}${rows}</g></g>`);
    },
    nav: (p) => svg(40, 40, `<g stroke-width='2' fill='none' opacity='.35'><path d='M0 40 L40 0' stroke='${p.accent}'/><path d='M-4 4 L4 -4 M36 44 L44 36' stroke='${p.accent}'/><path d='M20 34 L28 26 L36 34Z' stroke='${p.flame.core}'/></g>`),
    header: (p) => svg(72, 52, `<g fill='none' stroke-width='2' opacity='.4'><path d='M0 36 L18 26 L36 36 L54 26 L72 36' stroke='${p.flame.outer}'/><path d='M0 44 L18 34 L36 44 L54 34 L72 44' stroke='${p.flame.core}'/></g>`),
    card: (p) => svg(96, 96, `<g fill='none' stroke-width='2' opacity='.55'><path d='M96 0 V96 M96 0 H0' stroke='${p.flame.core}'/><circle cx='96' cy='0' r='36' stroke='${p.accent}'/><circle cx='96' cy='0' r='58' stroke='${p.flame.outer}'/></g>`),
  },
  radius: 4,
  logo: flameLogo,
  toolNames: { guid: 'Neon ID', request: 'Signal', formatter: 'Grid Align', diff: 'Split Screen', mermaid: 'Wireframe', base64: 'Cipher Wave', jwt: 'Access Pass', hash: 'Chrome Digest' },
  light: {
    bg: '#f4ecff', panel: '#ffffff', border: '#b58bf0', text: '#1d0b3a', dimmed: '#5b3f8a', accent: '#c4147f', hover: '#e6d6ff',
    flame: { outer: '#ff2e97', core: '#00b8e6' },
    syntax: { key: '#6a1fd0', string: '#006b73', number: '#b3261e', keyword: '#c4147f', comment: '#7a5fa8' },
  },
  dark: {
    bg: '#120826', panel: '#1b0f3a', border: '#5b2ea6', text: '#f6e9ff', dimmed: '#b8a2e0', accent: '#ff3fb4', hover: '#2d1a5e',
    flame: { outer: '#ff3fb4', core: '#2ee6ff' },
    syntax: { key: '#2ee6ff', string: '#ffe45e', number: '#ff9f5a', keyword: '#ff6ec7', comment: '#9a82c8' },
  },
};
