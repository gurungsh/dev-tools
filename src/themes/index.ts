import type { ThemeDef, ThemeId } from './types';
import { slate } from './defs/slate';
import { paper } from './defs/paper';
import { terminal } from './defs/terminal';
import { editor } from './defs/editor';
import { repo } from './defs/repo';
import { mono } from './defs/mono';
import { workspace } from './defs/workspace';
import { macos } from './defs/macos';

/**
 * Themes included in this build. The __THEME_*__ flags are constants injected by Vite,
 * so themes (and their fonts) that are switched off are removed from the bundle.
 */
export const THEMES: ThemeDef[] = [
  ...(__THEME_SLATE__ ? [slate] : []),
  ...(__THEME_PAPER__ ? [paper] : []),
  ...(__THEME_TERMINAL__ ? [terminal] : []),
  ...(__THEME_EDITOR__ ? [editor] : []),
  ...(__THEME_REPO__ ? [repo] : []),
  ...(__THEME_MONO__ ? [mono] : []),
  ...(__THEME_WORKSPACE__ ? [workspace] : []),
  ...(__THEME_MACOS__ ? [macos] : []),
];

export const DEFAULT_THEME_ID: ThemeId = (THEMES.find((t) => t.id === 'slate') ?? THEMES[0]).id;

export function getTheme(id: string | null | undefined): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}
