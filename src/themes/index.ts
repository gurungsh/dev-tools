import type { ThemeDef, ThemeId } from './types';
import { mono } from './defs/mono';
import { terminal } from './defs/terminal';
import { comic } from './defs/comic';
import { synthwave } from './defs/synthwave';
import { brutalism } from './defs/brutalism';
import { anthropomorphic } from './defs/anthropomorphic';
import { medieval } from './defs/medieval';
import { memphis } from './defs/memphis';

/**
 * Themes included in this build. The __THEME_*__ flags are constants injected by Vite,
 * so themes (and their fonts) that are switched off are removed from the bundle.
 */
export const THEMES: ThemeDef[] = [
  ...(__THEME_MONO__ ? [mono] : []),
  ...(__THEME_TERMINAL__ ? [terminal] : []),
  ...(__THEME_COMIC__ ? [comic] : []),
  ...(__THEME_SYNTHWAVE__ ? [synthwave] : []),
  ...(__THEME_BRUTALISM__ ? [brutalism] : []),
  ...(__THEME_ANTHROPOMORPHIC__ ? [anthropomorphic] : []),
  ...(__THEME_MEDIEVAL__ ? [medieval] : []),
  ...(__THEME_MEMPHIS__ ? [memphis] : []),
];

export const DEFAULT_THEME_ID: ThemeId = (THEMES.find((t) => t.id === 'mono') ?? THEMES[0]).id;

export function getTheme(id: string | null | undefined): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}
