import type { Palette, ThemeDef } from './types';

const HEX = /^#[0-9a-f]{6}$/i;

const isPalette = (p: unknown): p is Palette => {
  const v = p as Palette | undefined;
  return !!v && [v.bg, v.panel, v.border, v.text, v.dimmed, v.accent, v.hover, v.flame?.outer, v.flame?.core, ...Object.values(v.syntax ?? {})].every((c) => typeof c === 'string' && HEX.test(c));
};

/** Shape check for code loaded from a pack, so a broken pack is skipped instead of crashing the app. */
export function isThemeDef(d: unknown, id: string): d is ThemeDef {
  const v = d as ThemeDef | undefined;
  return !!v && v.id === id && typeof v.fonts?.sans === 'string' && typeof v.fonts?.mono === 'string' && typeof v.radius === 'number' && typeof v.logo === 'string' && isPalette(v.light) && isPalette(v.dark);
}

function loadStylesheet(href: string): Promise<void> {
  const existing = document.querySelector<HTMLLinkElement>(`link[data-theme-pack][href="${href}"]`);
  if (existing) return Promise.resolve();
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.themePack = '';
    link.onload = () => resolve();
    link.onerror = () => resolve(); // fall back to system fonts
    document.head.appendChild(link);
  });
}

/** Loads an installed theme pack from the desktop app. Returns null when the pack is broken. */
export async function loadPackTheme(info: ThemePackInfo): Promise<ThemeDef | null> {
  const base = `app://dev-tools/packs/${info.id}`;
  const stamp = `?t=${info.installedAt}`;
  try {
    const mod = await import(/* @vite-ignore */ `${base}/theme.js${stamp}`);
    if (!isThemeDef(mod.default, info.id)) return null;
    return { ...mod.default, loadFonts: () => loadStylesheet(`${base}/fonts.css${stamp}`) };
  } catch {
    return null;
  }
}
