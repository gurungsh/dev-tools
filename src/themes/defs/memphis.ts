import type { ThemeDef } from '../types';
import { flameLogo } from '../flame';
import { scene, svg, type Motif } from '../art';

const motifs: Motif[] = [
  (p) => `<path d='M-48 0 q12 -22 24 0 t24 0 t24 0 t24 0' fill='none' stroke='${p.flame.outer}' stroke-opacity='.5' stroke-width='7' stroke-linecap='round'/>`,
  (p) => `<path d='M-34 28 L0 -30 L34 28Z' fill='none' stroke='${p.flame.core}' stroke-opacity='.6' stroke-width='7' stroke-linejoin='round'/>`,
  (p) => `<circle r='28' fill='${p.accent}' fill-opacity='.4'/>`,
  (p) => `<path d='M-48 14 l16 -28 l16 28 l16 -28 l16 28 l16 -28 l16 28' fill='none' stroke='${p.text}' stroke-opacity='.5' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/>`,
  (p) => `<path d='M-40 20 a40 40 0 0 1 80 0Z' fill='${p.flame.core}' fill-opacity='.5'/>`,
  (p) => `<path d='M-24 0 h48 M0 -24 v48' stroke='${p.text}' stroke-opacity='.5' stroke-width='7' stroke-linecap='round'/>`,
  (p) => Array.from({ length: 16 }, (_, k) => `<circle cx='${(k % 4) * 16 - 24}' cy='${Math.floor(k / 4) * 16 - 24}' r='3.2' fill='${p.text}' fill-opacity='.5'/>`).join(''),
  (p) => `<rect x='-22' y='-4' width='30' height='9' rx='3' transform='rotate(30)' fill='${p.flame.outer}' fill-opacity='.5'/><rect x='6' y='14' width='22' height='7' rx='3' transform='rotate(-25)' fill='${p.flame.core}' fill-opacity='.55'/><circle cx='-20' cy='26' r='6' fill='${p.accent}' fill-opacity='.45'/>`,
  (p) => `<path d='M-32 40 V-4 a32 32 0 0 1 64 0 V40' fill='none' stroke='${p.flame.outer}' stroke-opacity='.5' stroke-width='10'/>`,
];

export const memphis: ThemeDef = {
  id: 'memphis',
  label: 'Memphis',
  description: '1980s Milan: hot pink, teal and yellow with black outlines on cream (deep purple at night), Righteous headings, squiggles, triangles, zigzags and terrazzo confetti.',
  fonts: { sans: "'Poppins', system-ui, sans-serif", mono: "'JetBrains Mono', ui-monospace, monospace", heading: "'Righteous', 'Poppins', sans-serif" },
  loadFonts: () => Promise.all([import('@fontsource/poppins/latin-400.css'), import('@fontsource/poppins/latin-500.css'), import('@fontsource/poppins/latin-600.css'), import('@fontsource/poppins/latin-700.css'), import('@fontsource/righteous/latin-400.css'), import('@fontsource/jetbrains-mono/latin-400.css')]),
  radius: 14,
  logo: flameLogo,
  toolNames: { guid: 'Squiggle ID', request: 'Zigzag', formatter: 'Terrazzo', diff: 'Clash', mermaid: 'Doodle Grid', base64: 'Pattern Swap', jwt: 'Party Pass', hash: 'Confetti' },
  art: {
    // Memphis confetti: oversized flat shapes plus squiggles, triangles, zigzags, dot grids and terrazzo flecks, laid out differently on every page.
    main: (p, variant) => scene(p, motifs, variant, {
      count: 34,
      rotate: 45,
      scale: [0.5, 1.7],
      // A couple of oversized flat shapes behind the confetti.
      base: (q, rnd) => `<circle cx='${(200 + rnd() * 1200).toFixed(0)}' cy='${(200 + rnd() * 600).toFixed(0)}' r='240' fill='${q.flame.core}' fill-opacity='.09'/><polygon points='${(100 + rnd() * 700).toFixed(0)},960 ${(500 + rnd() * 700).toFixed(0)},420 ${(900 + rnd() * 600).toFixed(0)},960' fill='${q.flame.outer}' fill-opacity='.08'/>`,
    }),
    nav: (p) => svg(30, 30, `<g fill='none' stroke-linecap='round' stroke-linejoin='round' opacity='.4'><path d='M0 22 l7.5 -10 l7.5 10 l7.5 -10 l7.5 10' stroke='${p.flame.outer}' stroke-width='2.5'/><circle cx='22' cy='5' r='3' fill='${p.flame.core}' stroke='none'/></g>`),
    header: (p) => svg(60, 52, `<g fill='none' stroke-linecap='round' stroke-linejoin='round' opacity='.75'><path d='M0 44 q7.5 -8 15 0 t15 0 t15 0 t15 0' stroke='${p.flame.outer}' stroke-width='3'/><path d='M40 28 l5 -8 l5 8Z' stroke='${p.flame.core}' stroke-width='2.5'/><circle cx='12' cy='30' r='3' fill='${p.accent}' stroke='none'/></g>`),
    card: (p) => svg(90, 90, `<g opacity='.8' stroke-linecap='round' stroke-linejoin='round'><circle cx='62' cy='28' r='16' fill='${p.flame.core}' stroke='${p.border}' stroke-width='2'/><path d='M46 62 l12 -18 l12 18Z' fill='${p.flame.outer}' stroke='${p.border}' stroke-width='2'/><path d='M18 20 q8 -12 16 0 t16 0' fill='none' stroke='${p.accent}' stroke-width='4'/></g>`),
  },
  light: {
    bg: '#fff8e1', panel: '#ffffff', border: '#111111', text: '#111111', dimmed: '#4d4d4d', accent: '#d6007a', hover: '#ffe14d',
    flame: { outer: '#ff3e9a', core: '#00c2b8' },
    syntax: { key: '#5a2fc2', string: '#00796b', number: '#c24100', keyword: '#d6007a', comment: '#6b6b6b' },
  },
  dark: {
    bg: '#1b1035', panel: '#26174d', border: '#ff7ad9', text: '#fff4d6', dimmed: '#c9bce8', accent: '#2de2d0', hover: '#4b2a99',
    flame: { outer: '#ff5cc8', core: '#ffe14d' },
    syntax: { key: '#7fd3ff', string: '#8ff0a4', number: '#ffb347', keyword: '#ff8fe0', comment: '#a396cf' },
  },
};
