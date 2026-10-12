# Dev Tools

An offline-first developer toolbox that runs entirely in the browser. It is a React + Vite + TypeScript single page application with no backend and no network calls at runtime. Everything is bundled, so you can open it from `localhost`, a static file server, or (in single-file build mode) straight from disk.

## Documentation

- [Architecture](docs/architecture.md): features, offline principles, tech stack, project structure
- [Roadmap](docs/roadmap.md)

## Themes

Pick light/dark/system mode from the bottom of the sidebar; the choice is remembered. The theme picker is hidden when a build includes only one theme.

| Theme | Look |
|-------|------|
| Mono | Black and white, hairline borders (default) |
| Terminal | Retro green-screen: phosphor green on black (pale green "paper" in light mode), VT323 pixel font for the UI and IBM Plex Mono in code, square corners |
| Comic | Pop-art comic book: primary yellow page with blue accents and red bursts (night-sky navy with yellow in dark mode), Comic Neue text, Bangers headings, heavy outlines and hard shadows, a big ragged explosion with speed lines and halftone dots behind each page |
| Synthwave | 1980s neon: hot pink and cyan on midnight purple (pastel lavender in light mode), Chakra Petch text, Audiowide headings, a neon sunset grid behind the page, glowing edges in dark mode |
| Brutalism | Raw and stark: black and white with electric blue (yellow in dark mode), Space Mono text, Bungee headings, crude oversized shapes, thick borders and hard shadows |
| Anthropomorphic | Retro cartoon mascots, everything has a face: flat tomato, mustard and teal on cream (navy at night), Fredoka text, Chewy headings, bold outlines, smiling sun/cloud/tomato backgrounds and awning scallops |
| Medieval | Illuminated manuscript: parchment, heraldic crimson and gold (a torch-lit stone hall in dark mode), EB Garamond text, Pirata One blackletter headings, a castle skyline, gold sun and a big shield, crossed swords or rose window behind each page |
| Memphis | 1980s Milan: hot pink, teal and yellow with black outlines on cream (deep purple at night), Poppins text, Righteous headings, squiggles, triangles, zigzags and terrazzo confetti |

Each theme lives in `src/themes/defs/<id>.ts` (palette for light and dark, fonts, radius, logo). To add one, create a def, list it in `src/themes/index.ts` and `scripts/make-icon.ts`, add its id to `ThemeId` in `src/themes/types.ts` and to `config/themes.json` (which drives the `__THEME_<ID>__` flags in `vite.config.ts`), and declare the flag in `src/themes/globals.d.ts`. A theme can add SVG backgrounds with `art`: the sidebar, header and home cards get small tiles or corner pieces, and the page gets one large non-repeating scene (`main`, built with `scene()` from `src/themes/art.ts`) whose layout differs per page. All are functions of the palette, so they follow light and dark. It can also rename the tools in the sidebar, home cards and page titles with `toolNames` (keyed by tool id from `src/app/registry.ts`); tools it doesn't list keep their default name. Contrast of every palette is checked by `tests/themes.test.ts`.

## Desktop app (macOS and Windows)

The same app can be packaged with Electron. The desktop build serves the bundled app from disk and blocks every network request, so it stays fully offline.

```bash
npm run package                                   # core themes (Mono + Terminal) for the OS you're on, plus theme packs
npm run package -- --theme=all                    # every theme built in, no packs needed
npm run package -- --theme=mono                   # Mono only (light + dark), no theme picker
npm run package -- --theme=mono --platform=win
npm run package -- --platform=all --arch=all      # mac + windows, arm64 + x64
npm run package -- --dir                          # fast unpacked build for testing
npm run package -- --list-themes
npm run desktop                                   # build and run the desktop app locally
```

| Flag | Values | Default |
|------|--------|---------|
| `--theme` | one theme, a comma list, `core` or `all` | `core` |
| `--no-packs` | skip building theme packs | off |
| `--platform` | `mac`, `win`, `all` | current OS |
| `--arch` | `arm64`, `x64`, `all` | mac: this machine's CPU, win: `x64` |
| `--dir` | unpacked app only | off |
| `--out` | output folder | `release` |

What a `--theme` choice does:
- Only the chosen themes (and their fonts) are built into the app, so installers are smaller. `core` is the list in `config/themes.json` (`"core"`: Mono and Terminal, with Mono as `"default"`).
- A single theme hides the theme picker; the light/dark/system toggle stays. Several themes show a picker limited to those themes.
- The app icon is generated from the default theme's logo.

### Theme packs (extra themes)

Themes that are not built in are packaged as one `.devtheme` file each, written to `release/theme-packs/` when you run `npm run package` (or on their own with `npm run packs`, which writes to `dist-packs/`). A pack is a single JSON file holding the theme's code and its fonts, so it works offline.

Users install a pack from the app: **Themes > Install Theme Pack…** in the menu bar, or **Install theme pack…** under the theme picker in the sidebar. The pack is copied into the app's user data folder and appears in the picker straight away; **Themes > Remove Theme Pack** deletes it. Installed packs survive app updates.

```bash
npm run packs                                       # every theme that is not in "core"
npm run packs -- --theme=comic,medieval --out=out   # chosen themes only
```

Packs are code that runs inside the app window (which has no file or network access), so only install packs you trust. A pack whose id matches a built-in theme is ignored.

Installers land in `release/`, named like `DevTools-0.1.0-mono-mac-arm64.dmg`: `.dmg` and `.zip` for macOS, `.exe` (NSIS installer) and `.zip` for Windows. Windows installers can be built from a Mac.

Notes:
- Builds are unsigned. On macOS, right-click the app and choose Open the first time (or sign and notarize with an Apple Developer ID). Windows SmartScreen may warn until the installer is code-signed.
- Unsigned Windows builds also skip embedding the icon in the `.exe` itself (that step needs Wine off Windows); build on Windows to include it.
- The first packaging run downloads Electron (about 100 MB), so it needs internet once. The packaged app never does.
- The same `DEVTOOLS_THEMES=mono npm run build` also works for a themed web build.

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev            # local dev server (http://localhost:5173)
npm run build          # static build in dist/
npm run build:single   # single self-contained dist-single/index.html
npm run check:offline  # fail if dist/ references remote assets
npm run preview        # serve the production build
npm test               # unit tests
npm run lint
```

## Branching

- `main`: stable, only the initial README so far.
- `development`: integration branch.
- `feature/<name>`: one per feature, branched from `development` and squash-merged back.

## Known constraints

- **Bundle size:** Mermaid and Prettier are large. Lazy loading keeps first paint fast, but the single-file build will be several MB.
- **`file://` quirks:** ES module scripts and `localStorage` behave differently across browsers when opened from disk. The single-file build avoids module loading issues, but serving over `localhost` is the most reliable.
- **Mermaid formatting:** There is no official formatter, so "format" is best-effort indentation rather than a full AST-based pretty printer.
- **Swagger input:** Dummy data is generated from schemas, so quality depends on how well the spec defines types, formats and examples. Explicit `example` values are preferred when present.
