import { flameLogo } from '../flame';
import { rng, svg } from '../art';
import type { Palette, ThemeDef } from '../types';

/**
 * Full-page medieval backdrop: a gold sun, a castle skyline on rolling hills, and one big heraldic piece
 * (shield, crossed swords or rose window with bunting). Layout and accent change per page.
 */
function backdrop(p: Palette, variant: number): string {
  const rnd = rng(variant * 6151 + 3);
  const left = variant % 2 === 0;
  const ax = left ? 400 : 1200; // heraldic accent side; the sun takes the other
  const sx = left ? 1250 : 350;
  const sy = variant % 3 === 2 ? 370 : 210; // lower the sun when bunting hangs across the top
  const ink = (o: number, w = 4) => `stroke='${p.border}' stroke-opacity='${o}' stroke-width='${w}' stroke-linejoin='round'`;

  const sun = `<g fill='${p.flame.core}' fill-opacity='.28'>${Array.from({ length: 20 }, (_, i) => {
    const a = (i * Math.PI) / 10, b = a + Math.PI / 20;
    return `<polygon points='${(sx + 128 * Math.cos(a)).toFixed(0)},${(sy + 128 * Math.sin(a)).toFixed(0)} ${(sx + 175 * Math.cos(a + Math.PI / 40)).toFixed(0)},${(sy + 175 * Math.sin(a + Math.PI / 40)).toFixed(0)} ${(sx + 128 * Math.cos(b)).toFixed(0)},${(sy + 128 * Math.sin(b)).toFixed(0)}'/>`;
  }).join('')}<circle cx='${sx}' cy='${sy}' r='112' ${ink(0.3)}/></g>`;

  let castle = '';
  for (let x = -20; x < 1600; ) {
    const w = 90 + rnd() * 80, h = 140 + rnd() * 230, top = 1000 - h;
    castle += `<rect x='${x.toFixed(0)}' y='${top.toFixed(0)}' width='${w.toFixed(0)}' height='${h.toFixed(0)}'/>`;
    for (let m = 0; m < Math.floor(w / 26); m++) castle += `<rect x='${(x + 4 + m * 26).toFixed(0)}' y='${(top - 22).toFixed(0)}' width='14' height='22'/>`;
    if (rnd() > 0.5) castle += `<polygon points='${(x - 6).toFixed(0)},${top.toFixed(0)} ${(x + w / 2).toFixed(0)},${(top - 95).toFixed(0)} ${(x + w + 6).toFixed(0)},${top.toFixed(0)}'/>`;
    x += w;
  }
  const skyline = `<g fill='${p.border}' fill-opacity='.13'>${castle}</g><path d='M0 965 Q400 895 800 950 T1600 925 V1000 H0Z' fill='${p.border}' fill-opacity='.12'/>`;

  const shieldPath = 'M-34 -44 H34 V0 Q34 36 0 52 Q-34 36 -34 0Z';
  const accent = [
    // Quartered heraldic shield.
    `<g transform='translate(${ax} 480) scale(5.2)'><clipPath id='sh'><path d='${shieldPath}'/></clipPath><g clip-path='url(#sh)'><rect x='-40' y='-50' width='40' height='40' fill='${p.flame.outer}' fill-opacity='.3'/><rect x='0' y='-10' width='40' height='70' fill='${p.flame.outer}' fill-opacity='.3'/><rect x='0' y='-50' width='40' height='40' fill='${p.flame.core}' fill-opacity='.35'/><rect x='-40' y='-10' width='40' height='70' fill='${p.flame.core}' fill-opacity='.35'/></g><path d='${shieldPath}' fill='none' ${ink(0.4, 1.5)}/><path d='M0 -44 V52 M-34 -10 H34' ${ink(0.4, 1.5)}/><circle cy='-10' r='8' fill='${p.panel}' fill-opacity='.8' ${ink(0.4, 1.5)}/></g>`,
    // Crossed swords.
    [-38, 38].map((a) => `<g transform='translate(${ax} 470) rotate(${a}) scale(.95)' fill='${p.border}' fill-opacity='.2' ${ink(0.38)}><path d='M-250 -11 L250 -11 L330 0 L250 11 L-250 11Z'/><rect x='-262' y='-52' width='24' height='104' rx='6'/><rect x='-340' y='-9' width='80' height='18' rx='5'/><circle cx='-352' r='16'/></g>`).join(''),
    // Rose window with strung bunting across the top.
    `<g fill='none' ${ink(0.38)}><circle cx='${ax}' cy='500' r='255'/><circle cx='${ax}' cy='500' r='215'/><circle cx='${ax}' cy='500' r='62'/>${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<circle cx='${(ax + 138 * Math.cos(a)).toFixed(0)}' cy='${(500 + 138 * Math.sin(a)).toFixed(0)}' r='56'/>`; }).join('')}</g><circle cx='${ax}' cy='500' r='62' fill='${p.flame.core}' fill-opacity='.3'/>`
      + `<path d='M0 40 Q800 140 1600 40' fill='none' ${ink(0.3, 3)}/>${Array.from({ length: 14 }, (_, i) => { const t = (i + 0.5) / 14, x = t * 1600, y = 40 + 100 * Math.sin(Math.PI * t) * 0.97; return `<polygon points='${(x - 34).toFixed(0)},${y.toFixed(0)} ${(x + 34).toFixed(0)},${y.toFixed(0)} ${x.toFixed(0)},${(y + 78).toFixed(0)}' fill='${i % 2 ? p.flame.core : p.flame.outer}' fill-opacity='.3' ${ink(0.3, 3)}/>`; }).join('')}`,
  ][variant % 3];

  return svg(1600, 1000, `${sun}${skyline}${accent}`);
}

export const medieval: ThemeDef = {
  id: 'medieval',
  label: 'Medieval',
  description: 'Illuminated manuscript: parchment, heraldic crimson and gold (a torch-lit stone hall in dark mode), Pirata One blackletter headings, castle skylines, shields and rose windows.',
  fonts: { sans: "'EB Garamond', Georgia, serif", mono: "'IBM Plex Mono', ui-monospace, monospace", heading: "'Pirata One', 'EB Garamond', serif" },
  loadFonts: () => Promise.all([import('@fontsource/eb-garamond/latin-400.css'), import('@fontsource/eb-garamond/latin-500.css'), import('@fontsource/eb-garamond/latin-600.css'), import('@fontsource/eb-garamond/latin-700.css'), import('@fontsource/pirata-one/latin-400.css'), import('@fontsource/ibm-plex-mono/latin-400.css'), import('@fontsource/ibm-plex-mono/latin-500.css')]),
  fontScale: 1.1,
  radius: 2,
  logo: flameLogo,
  toolNames: { guid: 'Sigil', request: 'Raven Post', formatter: 'Illuminate', diff: 'Palimpsest', mermaid: 'Atlas', base64: 'Runic Cipher', jwt: 'Safe Conduct', hash: 'Wax Seal' },
  art: {
    // A different scene on each page (see backdrop above); small heraldic pieces for the sidebar, header and cards.
    main: backdrop,
    nav: (p) => svg(28, 28, `<g fill='none' stroke='${p.border}' stroke-opacity='.35' stroke-width='1.2'><path d='M14 0 L28 14 L14 28 L0 14Z'/></g><circle cx='14' cy='14' r='2' fill='${p.accent}' fill-opacity='.4'/>`),
    header: (p) => svg(40, 52, `<path d='M0 52 V40 H12 V46 H28 V40 H40 V52Z' fill='${p.border}' fill-opacity='.55'/>`),
    card: (p) => {
      const spokes = Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<line x1='68' y1='12' x2='${(68 + 28 * Math.cos(a)).toFixed(1)}' y2='${(12 + 28 * Math.sin(a)).toFixed(1)}'/>`; }).join('');
      return svg(80, 80, `<g fill='none' stroke='${p.border}' stroke-opacity='.55' stroke-width='1.4'><circle cx='68' cy='12' r='28'/><circle cx='68' cy='12' r='16'/>${spokes}</g><circle cx='68' cy='12' r='3' fill='${p.accent}' fill-opacity='.7'/>`);
    },
  },
  light: {
    bg: '#eadcb5', panel: '#f8f0d8', border: '#5a3b1c', text: '#2a1a0e', dimmed: '#5c4630', accent: '#8a1c2c', hover: '#d9c590',
    flame: { outer: '#a3202f', core: '#d4a017' },
    syntax: { key: '#1d4f7a', string: '#2f5d2a', number: '#8c4a0a', keyword: '#7a1f5a', comment: '#7a6a50' },
  },
  dark: {
    bg: '#17130f', panel: '#231c15', border: '#7a5a2c', text: '#eadcbc', dimmed: '#b3a07c', accent: '#d9a441', hover: '#3a2b18',
    flame: { outer: '#b3262f', core: '#e8b84a' },
    syntax: { key: '#8fb0d8', string: '#9bc27a', number: '#e09a5a', keyword: '#d68aa6', comment: '#8f8268' },
  },
};
