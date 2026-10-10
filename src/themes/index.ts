import type { ThemeDef, ThemeId } from './types';
import { mono } from './defs/mono';

/**
 * Themes included in this build. The __THEME_*__ flags are constants injected by Vite,
 * so themes (and their fonts) that are switched off are removed from the bundle.
 */
export const THEMES: ThemeDef[] = [
  ...(__THEME_MONO__ ? [mono] : []),
];

export const DEFAULT_THEME_ID: ThemeId = (THEMES.find((t) => t.id === 'mono') ?? THEMES[0]).id;

export function getTheme(id: string | null | undefined): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}
