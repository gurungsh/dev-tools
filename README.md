# Dev Tools

An offline-first developer toolbox that runs entirely in the browser. It is a React + Vite + TypeScript single page application with no backend and no network calls at runtime. Everything is bundled, so you can open it from `localhost`, a static file server, or (in single-file build mode) straight from disk.

## Features

| # | Tool | What it does |
|---|------|--------------|
| 1 | **Formatter** | Pretty-print, minify and validate JSON, YAML, XML, Mermaid (and later HTML, CSS, SQL, Markdown) |
| 2 | **Request Generator** | Generate dummy request bodies from a sample JSON or a Swagger/OpenAPI schema |
| 3 | **Diff Checker** | Side-by-side and inline diff between two texts or files |
| 4 | **GUID Generator** | Generate one or many GUIDs/UUIDs, with format options |
| 5 | **Mermaid Renderer** | Live-render Mermaid diagrams, export as SVG/PNG |
| 6 | **Base64** | Encode and decode Base64 text |
| 7 | **Hash Generator** | Compute SHA hashes of text |
| 8 | **JWT Decoder** | Decode and inspect JSON Web Tokens |

## Offline principles

These rules keep the app usable with no internet:

- **No CDN assets.** Every script, stylesheet, font and icon comes from `node_modules` and is bundled by Vite. No Google Fonts, no `<script src="https://...">`.
- **No runtime network calls.** No analytics, telemetry or remote APIs. Files are read with the File API and never uploaded.
- **Everything runs client-side.** Formatting, diffing, schema sampling and Mermaid rendering all happen in the browser.
- **Lazy-load the heavy parts.** Mermaid is several MB, so it is loaded with a dynamic `import()` the first time the tool is opened. This is still local and still works offline.
- **Optional single-file build.** `vite-plugin-singlefile` inlines all JS/CSS into one `index.html` that can be opened by double-click or shared by copy.
- **Persist state locally.** Last inputs and settings are stored in `localStorage`.
- **Verify offline.** CI/manual check: build, disconnect the network, and run every tool.

## Tech stack

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | React 18 + TypeScript | |
| Build | Vite | `base: './'` so it works from any path |
| Routing | `react-router-dom` with `HashRouter` | Works on static hosting and `file://` |
| Editor | CodeMirror 6 | Lightweight, no web workers or CDN loading (Monaco is harder to run offline) |
| Formatting | `prettier` (standalone) + `@prettier/plugin-xml`, `sql-formatter` | XML, HTML, CSS, Markdown, SQL (JSON uses `JSON.stringify`, YAML uses `yaml`) |
| YAML parsing | `yaml` | Validation and JSON <-> YAML conversion |
| Mermaid | `mermaid` | Rendering. Formatting is a small custom indenter since Prettier has no Mermaid support |
| Diff | `diff` (jsdiff) and `@codemirror/merge` | Line and word level, side-by-side view |
| Sample data | Own seeded generator (`src/lib/sampleGen.ts`) | Schema/OpenAPI to dummy values, repeatable via seed |
| GUID | `crypto.randomUUID()` with a `crypto.getRandomValues` fallback | No extra dependency |
| UI | Mantine 8 | Theming via `createTheme`; fonts bundled with `@fontsource` (no CDN) |
| Tests | Vitest | Unit tests for all `src/lib` logic |

## Themes

Pick a theme and light/dark/system mode from the bottom of the sidebar; choices are remembered. The theme picker only appears when a build has more than one theme.

| Theme | Look |
|-------|------|
| Mono | Black and white, hairline borders (default) |

Each theme lives in `src/themes/defs/<id>.ts` (palette for light and dark, fonts, radius, logo). To add one, create a def, list it in `src/themes/index.ts` and `scripts/make-icon.ts`, add its id to `ThemeId` in `src/themes/types.ts` and to `config/themes.json` (which drives the `__THEME_<ID>__` flags in `vite.config.ts`), and declare the flag in `src/themes/globals.d.ts`. Contrast of every palette is checked by `tests/themes.test.ts`.

## Desktop app (macOS and Windows)

The same app can be packaged with Electron. The desktop build serves the bundled app from disk and blocks every network request, so it stays fully offline.

```bash
npm run package                                   # all themes, for the OS you're on
npm run package -- --theme=mono                   # Mono only (light + dark), no theme picker
npm run package -- --theme=mono --platform=win
npm run package -- --platform=all --arch=all      # mac + windows, arm64 + x64
npm run package -- --dir                          # fast unpacked build for testing
npm run package -- --list-themes
npm run desktop                                   # build and run the desktop app locally
```

| Flag | Values | Default |
|------|--------|---------|
| `--theme` | one theme, a comma list, or `all` | `all` |
| `--platform` | `mac`, `win`, `all` | current OS |
| `--arch` | `arm64`, `x64`, `all` | mac: this machine's CPU, win: `x64` |
| `--dir` | unpacked app only | off |
| `--out` | output folder | `release` |

What a `--theme` choice does:
- Only the chosen themes (and their fonts) are included in the app, so single-theme installers are smaller.
- A single theme hides the theme picker; the light/dark/system toggle stays. Several themes show a picker limited to those themes.
- The app icon is generated from that theme's logo (`all` uses the default theme from `config/themes.json`).

Installers land in `release/`, named like `DevTools-0.1.0-mono-mac-arm64.dmg`: `.dmg` and `.zip` for macOS, `.exe` (NSIS installer) and `.zip` for Windows. Windows installers can be built from a Mac.

Notes:
- Builds are unsigned. On macOS, right-click the app and choose Open the first time (or sign and notarize with an Apple Developer ID). Windows SmartScreen may warn until the installer is code-signed.
- Unsigned Windows builds also skip embedding the icon in the `.exe` itself (that step needs Wine off Windows); build on Windows to include it.
- The first packaging run downloads Electron (about 100 MB), so it needs internet once. The packaged app never does.
- The same `DEVTOOLS_THEMES=mono npm run build` also works for a themed web build.

## Proposed structure

```
dev-tools/
├─ src/
│  ├─ app/              # shell, layout, routing, theme
│  ├─ tools/
│  │  ├─ formatter/
│  │  ├─ request-generator/
│  │  ├─ diff/
│  │  ├─ guid/
│  │  └─ mermaid/
│  ├─ themes/           # theme defs, provider, switcher, logo
│  ├─ components/       # CodeEditor, CopyButton, OpenFileButton
│  ├─ lib/              # pure functions (format, sample, diff)
│  └─ main.tsx
├─ tests/               # Vitest unit tests for src/lib
├─ electron/            # desktop main process
├─ scripts/             # package.mjs, make-icon.ts, check-offline.mjs
├─ config/themes.json   # theme ids shared by build tooling
├─ index.html
├─ vite.config.ts
└─ README.md
```

Each tool is a self-contained module registered in one tool registry, so adding a tool means adding a folder and one registry entry. Core logic lives in `lib/` as pure functions so it is easy to test.

## Roadmap

### Phase 0 - Scaffold
- [x] Vite + React + TypeScript project, ESLint, Prettier, Vitest
- [x] App shell: sidebar navigation, hash routing, light/dark theme
- [x] Shared `CodeEditor` (CodeMirror), copy/download/upload helpers
- [x] Tool registry and lazy-loaded routes
- [x] Offline guard: lint rule or CI check that fails on `http(s)://` asset references in the build output

### Phase 1 - GUID generator (quick win)
- [x] Generate v4 UUIDs, with count (1 to 1000)
- [x] Options: uppercase, no hyphens, braces, quotes, comma separated
- [x] Copy one or copy all
- [x] Optional: v7 (time-ordered), nil UUID, validator

### Phase 2 - Formatter
- [x] JSON: format, minify, validate with line/column errors, sort keys
- [x] YAML: format and validate, YAML <-> JSON conversion
- [x] XML: format and validate, configurable indent
- [x] Mermaid: basic indentation normaliser
- [x] Auto-detect input type, indent size setting, file open
- [ ] Drag-and-drop file open
- [x] HTML, CSS, Markdown, SQL

### Phase 3 - Diff checker
- [x] Two-pane input with paste or file open
- [x] Side-by-side and inline views
- [x] Options: ignore whitespace, ignore case, word vs line diff
- [x] Format both sides before diffing (reuses the Formatter), useful for JSON/YAML
- [x] Stats (added, removed, changed) and copy as unified diff

### Phase 4 - Mermaid renderer
- [x] Editor with live preview, debounced
- [x] Syntax error display
- [ ] Pan (zoom is done; theme follows the app light/dark setting)
- [x] Export SVG and PNG
- [x] Sample diagram gallery (flowchart, sequence, ER, class, Gantt)
- [ ] Confirm Mermaid runs with zero network access (no CDN icon packs or fonts)

### Phase 5 - Request generator
- [x] Two input modes, switchable in the UI:
  - **From sample JSON:** infer a schema from the pasted payload (types, nesting, arrays), then generate new dummy values with the same shape
  - **From OpenAPI/Swagger (JSON or YAML, v2 and v3):** pick an endpoint and method, then generate the request body, plus query/path/header parameters, from its schema
- [x] Generate realistic dummy bodies from schema types, formats (date-time, email, uuid), enums and constraints
- [x] Options: seed for repeatable output, include optional fields, array length
- [x] Output: JSON body, plus `curl` and `fetch` snippets
- [x] Bulk generation (N variations)
- [x] Support local `$ref` resolution, `allOf`/`oneOf`/`anyOf`

### Phase 6 - Polish and distribution
- [x] Single-file build (`npm run build:single`) producing one portable `index.html`
- [ ] Optional PWA service worker so it can be installed and used offline
- [ ] Keyboard shortcuts and a command palette to jump between tools
- [x] Persist per-tool state across sessions (localStorage)
- [ ] Accessibility pass and responsive layout
- [ ] Playwright offline smoke tests for every tool

### Phase 7 - Themes and desktop app
- [x] Multi-theme support with light and dark per theme (currently Mono only)
- [x] Theme picker and light/dark/system toggle at the bottom of the sidebar
- [x] Fonts bundled locally via `@fontsource` (no network); themes and fonts not selected for a build are tree-shaken out
- [x] Desktop app (Electron) for macOS and Windows with a `--theme` packaging option

### Ideas / backlog
- URL encode/decode
- JSON path / JMESPath query, JSON to TypeScript types
- Timestamp converter, regex tester
- Cron expression explainer

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
