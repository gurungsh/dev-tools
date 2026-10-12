# Themes

Every theme has a light and a dark palette. Light, dark or system is chosen under the theme picker in the sidebar and remembered. The picker is hidden when a build includes only one theme.

## The themes

| Theme | Look |
|-------|------|
| Mono | Black and white, hairline borders (default) |
| Terminal | Retro green-screen: phosphor green on black (pale green "paper" in light mode), VT323 pixel font for the UI and IBM Plex Mono in code, square corners |
| Comic | Pop-art comic book: yellow page with blue accents and red bursts (night-sky navy with yellow in dark mode), Comic Neue text, Bangers headings, heavy outlines, a big ragged explosion with speed lines and halftone dots behind each page |
| Synthwave | 1980s neon: hot pink and cyan on midnight purple (pastel lavender in light mode), Chakra Petch text, Audiowide headings, a neon sunset grid behind the page |
| Brutalism | Raw and stark: black and white with electric blue (yellow in dark mode), Space Mono text, Bungee headings, crude oversized shapes, thick borders and hard shadows |
| Anthropomorphic | Retro cartoon mascots: flat tomato, mustard and teal on cream (navy at night), Fredoka text, Chewy headings, smiling suns, clouds and tomatoes |
| Medieval | Illuminated manuscript: parchment, crimson and gold (a torch-lit stone hall in dark mode), EB Garamond text, Pirata One headings, a castle skyline with a shield, crossed swords or rose window |
| Memphis | 1980s Milan: hot pink, teal and yellow with black outlines on cream (deep purple at night), Poppins text, Righteous headings, squiggles, triangles and confetti |

## Type scale

Three sizes everywhere: 12px for body and UI text, 16px for headings, 22px for page titles. Code is a fixed 12px. A theme can set `fontScale` to enlarge text for fonts that render small (Terminal 1.3, Medieval 1.1, Brutalism 0.95).

## Adding a theme

1. Create `src/themes/defs/<id>.ts` with the palette (light and dark), fonts, radius and logo.
2. Import it in `src/themes/index.ts` and `scripts/make-icon.ts`.
3. Add the id to `config/themes.json`, which drives the `__THEME_<ID>__` build flags in `vite.config.ts`.
4. Declare the flag in `src/themes/globals.d.ts`.

Palette contrast (text, accent, syntax colors) is checked for every theme by `tests/themes.test.ts`.

## Optional parts of a theme

- **`toolNames`**: renames tools in the sidebar, home cards and page titles, keyed by tool id from `src/app/registry.ts`. Unlisted tools keep their default name.
- **`art`**: SVG backgrounds built from the palette, so they follow light and dark. The sidebar, header and home cards get small tiles or corner pieces. The page gets one large scene (`main`), built with `scene()` from `src/themes/art.ts`, whose layout changes per page. Sizing and placement live in `src/themes/theme.css`.

## Shipping themes

The desktop installer includes only the core themes (`"core"` in `config/themes.json`). The rest are built as theme packs; see [Desktop app](desktop-app.md).
