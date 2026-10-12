# Architecture

## Features

| # | Tool | What it does |
|---|------|--------------|
| 1 | **Formatter** | Pretty-print, minify and validate JSON, YAML, XML, HTML, CSS, Markdown, SQL and Mermaid |
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
- **Everything runs client-side.** Formatting, diffing, schema sampling, Base64, hashing, JWT decoding and Mermaid rendering all happen in the browser.
- **Lazy-load the heavy parts.** Mermaid is several MB, so it is loaded with a dynamic `import()` the first time the tool is opened. This is still local and still works offline.
- **Optional single-file build.** `vite-plugin-singlefile` inlines all JS/CSS into one `index.html` that can be opened by double-click or shared by copy.
- **Persist state locally.** Last inputs and settings are stored in `localStorage`.
- **Verify offline.** CI/manual check: build, disconnect the network, and run every tool.

## Tech stack

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | React 19 + TypeScript | |
| Build | Vite | `base: './'` so it works from any path |
| Routing | `react-router-dom` with `HashRouter` | Works on static hosting and `file://` |
| Editor | CodeMirror 6 | Lightweight, no web workers or CDN loading (Monaco is harder to run offline) |
| Formatting | `prettier` (standalone) + `@prettier/plugin-xml`, `sql-formatter` | XML, HTML, CSS, Markdown, SQL (JSON uses `JSON.stringify`, YAML uses `yaml`) |
| YAML parsing | `yaml` | Validation and JSON <-> YAML conversion |
| Mermaid | `mermaid` | Rendering. Formatting is a small custom indenter since Prettier has no Mermaid support |
| Diff | `diff` (jsdiff) and `@codemirror/merge` | Line and word level, side-by-side view |
| Sample data | Own seeded generator (`src/lib/sampleGen.ts`) | Schema/OpenAPI to dummy values, repeatable via seed |
| GUID | `crypto.randomUUID()` with a `crypto.getRandomValues` fallback | No extra dependency |
| Hash | Web Crypto `crypto.subtle.digest` | SHA family only (no MD5); no extra dependency |
| Base64 / JWT | Own code in `src/lib` | JWTs are decoded only, never verified |
| UI | Mantine 8 | Theming via `createTheme`; fonts bundled with `@fontsource` (no CDN) |
| Tests | Vitest | Unit tests for all `src/lib` logic |

## Project structure

```
dev-tools/
├─ src/
│  ├─ app/              # shell, home, routing, tool registry
│  ├─ tools/
│  │  ├─ formatter/
│  │  ├─ request/
│  │  ├─ diff/
│  │  ├─ guid/
│  │  ├─ mermaid/
│  │  ├─ base64/
│  │  ├─ hash/
│  │  └─ jwt/
│  ├─ themes/           # theme defs, provider, switcher, logo
│  ├─ components/       # CodeEditor, CopyButton, FileButton, Page
│  ├─ lib/              # pure functions (format, sample, diff, base64, hash, jwt)
│  └─ main.tsx
├─ tests/               # Vitest unit tests for src/lib
├─ electron/            # desktop main process, preload, theme pack store (packs.cjs)
├─ scripts/             # package.mjs, build-packs.mjs, make-icon.ts, check-offline.mjs
├─ config/themes.json   # theme ids shared by build tooling
├─ index.html
├─ vite.config.ts
└─ README.md
```

Each tool is a self-contained module registered in one tool registry, so adding a tool means adding a folder and one registry entry. Core logic lives in `lib/` as pure functions so it is easy to test.

## Known constraints

- **Bundle size:** Mermaid and Prettier are large. Lazy loading keeps first paint fast, but the single-file build is several MB.
- **`file://` quirks:** ES module scripts and `localStorage` behave differently across browsers when opened from disk. The single-file build avoids module loading issues, but serving over `localhost` is the most reliable.
- **Mermaid formatting:** There is no official formatter, so "format" is best-effort indentation, not a full AST-based pretty printer.
- **Swagger input:** Dummy data is generated from schemas, so quality depends on how well the spec defines types, formats and examples. Explicit `example` values are preferred when present.
