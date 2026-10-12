import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { Badge, createTheme, MantineProvider, type CSSVariablesResolver, type MantineColorsTuple } from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { darkScale, onColor, shades } from './colors';
import { resolveLogo } from './logoSvg';
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
  /** Tool name under the active theme (falls back to the registry label). */
  toolLabel: (tool: { id: string; label: string }) => string;
  /** Sidebar name under the active theme: the theme's own name, else the tool's short label. */
  navLabel: (tool: { id: string; label: string; shortLabel?: string }) => string;
  /** CSS url() of the page backdrop for a page variant, or undefined when the theme has none. */
  mainArt: (variant: number) => string | undefined;
}

const Ctx = createContext<AppThemeContext | null>(null);

export function useAppTheme(): AppThemeContext {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return v;
}

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

function cssVars(def: ThemeDef, p: Palette): Record<string, string> {
  const art = Object.fromEntries(
    Object.entries(def.art ?? {}).filter(([slot]) => slot !== 'main').map(([slot, fn]) => [`--app-art-${slot}`, svgUrl((fn as (p: Palette) => string)(p))]),
  );
  return {
    ...art,
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
    '--app-flame-outer': p.flame.outer,
    '--app-flame-core': p.flame.core,
  };
}

const resolver = (def: ThemeDef): CSSVariablesResolver => () => ({
  variables: {},
  light: cssVars(def, def.light),
  dark: cssVars(def, def.dark),
});

function mantineTheme(def: ThemeDef, mode: Mode) {
  const p = def[mode];
  const k = def.fontScale ?? 1;
  const rem = (n: number) => `${+(n * k).toFixed(3)}rem`;
  return createTheme({
    primaryColor: 'brand',
    primaryShade: 6,
    autoContrast: true,
    colors: { brand: shades(p.accent) as unknown as MantineColorsTuple, dark: darkScale(p) as unknown as MantineColorsTuple },
    fontFamily: def.fonts.sans,
    fontFamilyMonospace: def.fonts.mono,
    // Three sizes in all (before a theme's fontScale): 12 for all body and UI text, 16 headings, 22 page title. Code is a fixed 12px.
    fontSizes: { xs: rem(0.75), sm: rem(0.75), md: rem(0.75), lg: rem(1), xl: rem(1.375) },
    spacing: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
    headings: {
      fontFamily: def.fonts.heading ?? def.fonts.sans,
      fontWeight: '500',
      sizes: {
        h1: { fontSize: rem(1.375), lineHeight: '1.25' },
        h2: { fontSize: rem(1), lineHeight: '1.4' },
        h3: { fontSize: rem(1), lineHeight: '1.4' },
        h4: { fontSize: rem(1), lineHeight: '1.4' },
      },
    },
    defaultRadius: def.radius,
    // Badges default to a fixed 11px; keep them on the small step of the type scale.
    components: { Badge: Badge.extend({ styles: { root: { fontSize: 'var(--mantine-font-size-xs)' } } }) },
  });
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
    () => ({ def, palette: def[mode], themes: THEMES, themeId: def.id, setThemeId: (id) => setThemeId(id), preference, setPreference, mode, toolLabel: (t) => def.toolNames?.[t.id] ?? t.label, navLabel: (t) => def.toolNames?.[t.id] ?? t.shortLabel ?? t.label, mainArt: (v) => (def.art?.main ? svgUrl(def.art.main(def[mode], v)) : undefined) }),
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

