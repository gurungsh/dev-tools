import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { createTheme, MantineProvider, type CSSVariablesResolver, type MantineColorsTuple } from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { darkScale, onColor, shades } from './colors';
import { DEFAULT_THEME_ID, getTheme, THEMES } from './index';
import type { Mode, ModePreference, Palette, ThemeDef, ThemeId } from './types';

interface AppThemeContext {
  def: ThemeDef;
  palette: Palette;
  themes: ThemeDef[];
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  preference: ModePreference;
  setPreference: (p: ModePreference) => void;
  mode: Mode;
}

const Ctx = createContext<AppThemeContext | null>(null);

export function useAppTheme(): AppThemeContext {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return v;
}

function cssVars(p: Palette): Record<string, string> {
  return {
    '--mantine-color-body': p.bg,
    '--mantine-color-text': p.text,
    '--mantine-color-dimmed': p.dimmed,
    '--mantine-color-default': p.panel,
    '--mantine-color-default-hover': p.hover,
    '--mantine-color-default-color': p.text,
    '--mantine-color-default-border': p.border,
    '--mantine-color-anchor': p.accent,
    '--app-bg': p.bg,
    '--app-panel': p.panel,
    '--app-border': p.border,
    '--app-text': p.text,
    '--app-dimmed': p.dimmed,
    '--app-accent': p.accent,
    '--app-on-accent': onColor(p.accent),
    '--app-hover': p.hover,
  };
}

const resolver = (def: ThemeDef): CSSVariablesResolver => () => ({
  variables: {},
  light: cssVars(def.light),
  dark: cssVars(def.dark),
});

function mantineTheme(def: ThemeDef, mode: Mode) {
  const p = def[mode];
  return createTheme({
    primaryColor: 'brand',
    primaryShade: 6,
    autoContrast: true,
    colors: { brand: shades(p.accent) as unknown as MantineColorsTuple, dark: darkScale(p) as unknown as MantineColorsTuple },
    fontFamily: def.fonts.sans,
    fontFamilyMonospace: def.fonts.mono,
    headings: { fontFamily: def.fonts.heading ?? def.fonts.sans, fontWeight: '500' },
    defaultRadius: def.radius,
  });
}

/** Logo markup with --app-* variables replaced, for use outside the DOM (favicon). */
export function resolveLogo(def: ThemeDef, mode: Mode): string {
  const p = def[mode];
  const map: Record<string, string> = {
    'var(--app-accent)': p.accent,
    'var(--app-on-accent)': onColor(p.accent),
    'var(--app-bg)': p.bg,
    'var(--app-text)': p.text,
  };
  return def.logo.replace(/var\(--app-[a-z-]+\)/g, (m) => map[m] ?? m);
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [storedTheme, setThemeId] = useLocalStorage<string>({ key: 'devtools:theme', defaultValue: DEFAULT_THEME_ID });
  const [preference, setPreference] = useLocalStorage<ModePreference>({ key: 'devtools:mode', defaultValue: 'system' });
  const system = useColorScheme();

  const def = getTheme(storedTheme);
  const mode: Mode = preference === 'system' ? system : preference;

  useEffect(() => {
    def.loadFonts();
    document.documentElement.dataset.theme = def.id;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>${resolveLogo(def, mode)}</svg>`;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, [def, mode]);

  const theme = useMemo(() => mantineTheme(def, mode), [def, mode]);
  const cssResolver = useMemo(() => resolver(def), [def]);
  const value = useMemo<AppThemeContext>(
    () => ({ def, palette: def[mode], themes: THEMES, themeId: def.id, setThemeId: (id) => setThemeId(id), preference, setPreference, mode }),
    [def, mode, preference, setPreference, setThemeId],
  );

  return (
    <Ctx.Provider value={value}>
      <MantineProvider theme={theme} forceColorScheme={mode} cssVariablesResolver={cssResolver}>
        {children}
      </MantineProvider>
    </Ctx.Provider>
  );
}

