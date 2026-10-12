import { onColor } from './colors';
import type { Mode, ThemeDef } from './types';

/** Logo markup with the --app-* variables replaced by real colors, for use outside the DOM (favicon, app icon). */
export function resolveLogo(def: ThemeDef, mode: Mode): string {
  const p = def[mode];
  const map: Record<string, string> = {
    'var(--app-accent)': p.accent,
    'var(--app-on-accent)': onColor(p.accent),
    'var(--app-bg)': p.bg,
    'var(--app-text)': p.text,
    'var(--app-flame-outer)': p.flame.outer,
    'var(--app-flame-core)': p.flame.core,
  };
  return def.logo.replace(/var\(--app-[a-z-]+\)/g, (m) => map[m] ?? m);
}

/** Full 1024px app icon: the logo centred on a rounded tile in the theme's dark background. */
export function appIconSvg(def: ThemeDef): string {
  const p = def.dark;
  const scale = 20; // 32 * 20 = 640px logo on a 1024px tile
  const offset = (1024 - 32 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect x="40" y="40" width="944" height="944" rx="210" fill="${p.bg}" stroke="${p.border}" stroke-width="8"/><g transform="translate(${offset} ${offset}) scale(${scale})">${resolveLogo(def, 'dark')}</g></svg>`;
}
