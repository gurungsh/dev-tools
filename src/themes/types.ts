export type ThemeId = 'mono';
export type Mode = 'light' | 'dark';
export type ModePreference = Mode | 'system';

export interface Palette {
  /** Page canvas. */
  bg: string;
  /** Header, navbar, cards, inputs and editors. */
  panel: string;
  border: string;
  text: string;
  /** Secondary text. */
  dimmed: string;
  accent: string;
  /** Hover / selected background. */
  hover: string;
  /** Syntax colors for the code editors. */
  syntax: { key: string; string: string; number: string; keyword: string; comment: string };
}

export interface ThemeDef {
  id: ThemeId;
  label: string;
  description: string;
  fonts: { sans: string; mono: string; heading?: string };
  /** Lazily imports the bundled font files for this theme (no network). */
  loadFonts: () => Promise<unknown>;
  /** Corner radius in px. */
  radius: number;
  /** Inner markup of a 32x32 SVG. Colors use --app-* CSS variables so it follows the mode. */
  logo: string;
  light: Palette;
  dark: Palette;
}
