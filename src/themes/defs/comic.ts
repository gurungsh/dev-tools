import { flameLogo } from '../flame';
import { burst, rays, rng, svg } from '../art';
import type { Palette, ThemeDef } from '../types';

/**
 * Full-page comic backdrop: speed lines converging on a point, a halftone field fading toward the center, one big
 * ragged explosion (a second one on some pages) and a single large accent. The layout changes per page.
 */
function backdrop(p: Palette, variant: number): string {
  const rnd = rng(variant * 104729 + 7);
  const left = variant % 2 === 0;
  const cx = left ? 330 + rnd() * 250 : 1020 + rnd() * 250;
  const cy = 260 + rnd() * 240;
  const ink = (o: number) => `stroke='${p.border}' stroke-opacity='${o}' stroke-linejoin='round'`;
  const dots = `<pattern id='d' width='16' height='16' patternUnits='userSpaceOnUse' patternTransform='rotate(15)'><circle cx='4' cy='4' r='3' fill='${p.flame.outer}'/><circle cx='12' cy='12' r='3' fill='${p.flame.outer}'/></pattern>`
    + `<radialGradient id='f' cx='${cx}' cy='${cy}' r='1100' gradientUnits='userSpaceOnUse'><stop offset='.25' stop-color='#000'/><stop offset='.9' stop-color='#fff'/></radialGradient><mask id='m'><rect width='1600' height='1000' fill='url(#f)'/></mask>`;
  // Each shape gets an opaque page-colored underlay so the speed lines don't show through it.
  const shape = (pts: string, fill: string, opacity: number, width: number) =>
    `<polygon points='${pts}' fill='${p.bg}'/><polygon points='${pts}' fill='${fill}' fill-opacity='${opacity}' ${ink(0.35)} stroke-width='${width}'/>`;
  const explosion = (x: number, y: number, R: number) =>
    shape(burst(x, y, R, R * 0.68, 16, 0.14, rnd), p.flame.outer, 0.3, 9) + shape(burst(x, y, R * 0.72, R * 0.48, 16, 0.14, rnd), p.flame.core, 0.5, 6);
  const kind = variant % 3;
  const accent = [
    // Big speech bubble with a tail aimed at the explosion.
    `<g fill='${p.panel}' fill-opacity='.9' ${ink(0.35)} stroke-width='7'><ellipse cx='${left ? 1180 : 420}' cy='740' rx='230' ry='125'/><path d='M${left ? 1030 : 570} 840 L${left ? 880 : 720} 940 L${left ? 1110 : 480} 860'/></g>`,
    // One huge lightning bolt.
    shape(left ? '1280,60 1050,520 1190,520 1100,940 1450,420 1290,420' : '320,60 150,520 270,520 190,940 520,420 380,420', p.syntax.key, 0.35, 7),
    // A second, smaller explosion.
    explosion(left ? 1250 : 350, 720, 190),
  ][kind];
  return svg(1600, 1000,
    `<defs>${dots}</defs>${rays(cx, cy, 40, p.flame.core, 0.16)}`
    + `<rect width='1600' height='1000' fill='url(#d)' fill-opacity='.3' mask='url(#m)'/>`
    + `${explosion(cx, cy, 300)}${accent}`);
}

export const comic: ThemeDef = {
  id: 'comic',
  label: 'Comic',
  description: 'Pop-art comic book: primary yellow, red and blue with heavy black outlines, big ragged explosions, speed lines and halftone dots, Bangers headings.',
  fonts: { sans: "'Comic Neue', 'Comic Sans MS', 'Chalkboard SE', cursive", mono: "'IBM Plex Mono', ui-monospace, monospace", heading: "'Bangers', 'Comic Neue', cursive" },
  loadFonts: () => Promise.all([import('@fontsource/comic-neue/latin-400.css'), import('@fontsource/comic-neue/latin-700.css'), import('@fontsource/bangers/latin-400.css'), import('@fontsource/ibm-plex-mono/latin-400.css'), import('@fontsource/ibm-plex-mono/latin-500.css')]),
  toolNames: { guid: 'ID Blast', request: 'Zap', formatter: 'Tidy Up', diff: 'Spot the Difference', mermaid: 'Doodle', base64: 'Secret Code', jwt: 'Secret Pass', hash: 'Scramble' },
  art: {
    // Big explosion, speed lines and halftone; one large accent (bubble, bolt or second burst) that changes per page.
    main: backdrop,
    nav: (p) => svg(24, 24, `<g fill='${p.flame.outer}' fill-opacity='.3'><circle cx='6' cy='6' r='3'/><circle cx='18' cy='18' r='3'/></g><g fill='${p.flame.core}' fill-opacity='.45'><circle cx='18' cy='6' r='1.5'/><circle cx='6' cy='18' r='1.5'/></g>`),
    header: (p) => svg(40, 52, `<path d='M0 52 L10 41 L20 52 L30 41 L40 52Z' fill='${p.flame.core}' stroke='${p.border}' stroke-width='2' stroke-linejoin='round'/>`),
    card: (p) => svg(72, 72, `<polygon points='${burst(44, 28, 30, 18, 9)}' fill='${p.flame.core}' fill-opacity='.4' stroke='${p.border}' stroke-opacity='.5' stroke-width='2' stroke-linejoin='round'/>`),
  },
  radius: 8,
  logo: flameLogo,
  light: {
    bg: '#ffeb85', panel: '#ffffff', border: '#111111', text: '#111111', dimmed: '#4a3f1a', accent: '#0057d9', hover: '#ffd24d',
    flame: { outer: '#e4002b', core: '#ffd000' },
    syntax: { key: '#0057d9', string: '#00794a', number: '#c24100', keyword: '#b0006b', comment: '#6b6256' },
  },
  dark: {
    bg: '#0b0f2e', panel: '#161d4a', border: '#ffd000', text: '#fff8d6', dimmed: '#b9c0ee', accent: '#ffd000', hover: '#2a3a9c',
    flame: { outer: '#ff3b3b', core: '#ffd000' },
    syntax: { key: '#5cc8ff', string: '#5fe08a', number: '#ff9f1c', keyword: '#ff6ec7', comment: '#8e96d4' },
  },
};
