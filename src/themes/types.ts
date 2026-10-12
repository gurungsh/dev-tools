export type ThemeId = 'mono' | 'terminal' | 'comic' | 'synthwave' | 'brutalism' | 'anthropomorphic' | 'medieval' | 'memphis';
export type ArtSlot = 'main' | 'nav' | 'header' | 'card';
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
  /** Logo flame: body color and the brighter core. */
  flame: { outer: string; core: string };
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
  /** Multiplies UI font sizes (default 1). For fonts that render small, e.g. pixel fonts. */
  fontScale?: number;
  /** Overrides tool names by tool id (see src/app/registry.ts). Unlisted tools keep their default name. */
  toolNames?: Partial<Record<string, string>>;
  /**
   * SVG backgrounds per app region, built from the active palette. Each returns a full <svg> string that
   * theme.css tiles or positions (see the per-theme rules there). Regions without an entry get no art.
   */
  art?: Partial<Record<Exclude<ArtSlot, 'main'>, (p: Palette) => string>> & {
    /** Page backdrop. `variant` differs per page (0 is the home page) so each page gets its own layout. */
    main?: (p: Palette, variant: number) => string;
  };
  /** Corner radius in px. */
  radius: number;
  /** Inner markup of a 32x32 SVG. Colors use --app-* CSS variables so it follows the mode. */
  logo: string;
  light: Palette;
  dark: Palette;
}
