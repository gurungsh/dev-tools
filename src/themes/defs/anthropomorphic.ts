import type { ThemeDef } from '../types';
import { flameLogo } from '../flame';
import { burst, face, rays, scene, svg, type Motif } from '../art';

const motifs: Motif[] = [
  (p) => `<g opacity='.24'><polygon points='${burst(0, 0, 50, 38, 12)}' fill='${p.flame.core}' stroke='${p.border}' stroke-width='2'/>${face(0, 0, 28, p.flame.core, p.border)}</g>`,
  (p) => `<g opacity='.24'><g fill='#fff' stroke='${p.border}' stroke-width='2'><circle cx='-24' cy='6' r='20'/><circle cx='0' cy='-8' r='26'/><circle cx='26' cy='6' r='20'/><rect x='-24' y='6' width='50' height='20' stroke='none'/></g>${face(0, 4, 14, '#fff', p.border)}</g>`,
  (p) => `<g opacity='.24'><path d='M-2 -28 q8 -22 22 -26 q-2 14 -10 24' fill='#6fbf4a' stroke='${p.border}' stroke-width='2'/>${face(0, 6, 34, p.flame.outer, p.border)}</g>`,
  (p) => `<g opacity='.28'><polygon points='${burst(0, 0, 36, 10, 4)}' fill='${p.flame.core}' stroke='${p.border}' stroke-width='1.5'/></g>`,
  (p) => `<g opacity='.24'><polygon points='${burst(0, 0, 50, 34, 5)}' fill='${p.accent}' fill-opacity='.7' stroke='${p.border}' stroke-width='2'/>${face(0, 2, 20, p.flame.core, p.border)}</g>`,
];

export const anthropomorphic: ThemeDef = {
  id: 'anthropomorphic',
  label: 'Anthropomorphic',
  description: 'Retro cartoon mascots: everything has a face. Flat tomato, mustard and teal on cream (navy at night), Chewy headings, bold outlines and awning scallops.',
  fonts: { sans: "'Fredoka', system-ui, sans-serif", mono: "'JetBrains Mono', ui-monospace, monospace", heading: "'Chewy', 'Fredoka', cursive" },
  loadFonts: () => Promise.all([import('@fontsource/fredoka/latin-400.css'), import('@fontsource/fredoka/latin-500.css'), import('@fontsource/fredoka/latin-600.css'), import('@fontsource/fredoka/latin-700.css'), import('@fontsource/chewy/latin-400.css'), import('@fontsource/jetbrains-mono/latin-400.css')]),
  radius: 16,
  logo: flameLogo,
  toolNames: { guid: 'Name Tag', request: 'Carrier Pigeon', formatter: 'Mr. Tidy', diff: 'Spot the Twins', mermaid: 'Doodle Pal', base64: 'Secret Handshake', jwt: 'Bouncer Badge', hash: 'Blender' },
  art: {
    // Retro mascot poster: sunburst rays plus smiling suns, clouds, tomatoes and stars, laid out differently on every page.
    main: (p, variant) => scene(p, motifs, variant, {
      count: 18,
      rotate: 18,
      // Retro rays fanning out from the bottom of the page.
      base: (q, rnd) => rays(400 + rnd() * 800, 1150, 22, q.flame.core, 0.08),
    }),
    nav: (p) => svg(56, 56, `<g opacity='.3'>${face(14, 14, 8, p.flame.core, p.border)}${face(42, 42, 8, p.flame.outer, p.border)}</g>`),
    // Awning scallops hanging along the bottom edge of the header.
    header: (p) => svg(36, 52, `<g stroke='${p.border}' stroke-width='2' stroke-linejoin='round' opacity='.85'><path d='M0 30 H18 V38 A9 9 0 0 1 0 38Z' fill='${p.flame.outer}'/><path d='M18 30 H36 V38 A9 9 0 0 1 18 38Z' fill='${p.flame.core}'/></g>`),
    card: (p) => svg(76, 76, `<g opacity='.8'><polygon points='${burst(48, 28, 30, 22, 10)}' fill='${p.flame.outer}' fill-opacity='.6'/>${face(48, 28, 17, p.flame.core, p.border)}</g>`),
  },
  light: {
    bg: '#fdf1d8', panel: '#fffaf0', border: '#2a1a14', text: '#2a1a14', dimmed: '#6a4e40', accent: '#d9412b', hover: '#f7d58a',
    flame: { outer: '#e8553a', core: '#f5b82e' },
    syntax: { key: '#0e6e8c', string: '#2f7d32', number: '#b4540f', keyword: '#a3245f', comment: '#7a6458' },
  },
  dark: {
    bg: '#1f2a3a', panel: '#28364a', border: '#f5b82e', text: '#fdf1d8', dimmed: '#b8c3d6', accent: '#ff7a5c', hover: '#3a4d6b',
    flame: { outer: '#ff7a5c', core: '#ffd166' },
    syntax: { key: '#6fd0f0', string: '#8fdc8a', number: '#ffb36b', keyword: '#ff8fc0', comment: '#93a3bd' },
  },
};
