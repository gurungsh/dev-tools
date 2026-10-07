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
| Routing | `react-router` with `HashRouter` | Works on static hosting and `file://` |
| Editor | CodeMirror 6 | Lightweight, no web workers or CDN loading (Monaco is harder to run offline) |
| Formatting | `prettier` (standalone) + `@prettier/plugin-xml` | JSON, YAML, XML, HTML, CSS, Markdown |
| YAML parsing | `yaml` | Validation and JSON <-> YAML conversion |
| Mermaid | `mermaid` | Rendering. Formatting is a small custom indenter since Prettier has no Mermaid support |
| Diff | `diff` (jsdiff) and `@codemirror/merge` | Line and word level, side-by-side view |
| Sample data | `openapi-sampler` or `json-schema-faker` | Schema to example body |
| GUID | `crypto.randomUUID()` with a `crypto.getRandomValues` fallback | No extra dependency |
| Styling | CSS modules or Tailwind (bundled, not CDN) | Light and dark theme |
| Tests | Vitest + Testing Library | Plus Playwright smoke test run offline |

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
│  ├─ components/       # CodeEditor, FileDrop, CopyButton, SplitPane
│  ├─ lib/              # pure functions (format, sample, diff), unit tested
│  └─ main.tsx
├─ index.html
├─ vite.config.ts
└─ README.md
```

Each tool is a self-contained module registered in one tool registry, so adding a tool means adding a folder and one registry entry. Core logic lives in `lib/` as pure functions so it is easy to test.

## Roadmap

### Phase 0 - Scaffold
- [ ] Vite + React + TypeScript project, ESLint, Prettier, Vitest
- [ ] App shell: sidebar navigation, hash routing, light/dark theme
- [ ] Shared `CodeEditor` (CodeMirror), copy/download/upload helpers
- [ ] Tool registry and lazy-loaded routes
- [ ] Offline guard: lint rule or CI check that fails on `http(s)://` asset references in the build output

### Phase 1 - GUID generator (quick win)
- [ ] Generate v4 UUIDs, with count (1 to 1000)
- [ ] Options: uppercase, no hyphens, braces, quotes, comma separated
- [ ] Copy one or copy all
- [ ] Optional: v7 (time-ordered), nil UUID, validator

### Phase 2 - Formatter
- [ ] JSON: format, minify, validate with line/column errors, sort keys
- [ ] YAML: format and validate, YAML <-> JSON conversion
- [ ] XML: format and validate, configurable indent
- [ ] Mermaid: basic indentation normaliser
- [ ] Auto-detect input type, indent size setting, drag-and-drop file open
- [ ] Later: HTML, CSS, Markdown, SQL

### Phase 3 - Diff checker
- [ ] Two-pane input with paste or file open
- [ ] Side-by-side and inline views
- [ ] Options: ignore whitespace, ignore case, word vs line diff
- [ ] Format both sides before diffing (reuses the Formatter), useful for JSON/YAML
- [ ] Stats (added, removed, changed) and copy as unified diff

### Phase 4 - Mermaid renderer
- [ ] Editor with live preview, debounced
- [ ] Syntax error display
- [ ] Theme selection, pan and zoom
- [ ] Export SVG and PNG
- [ ] Sample diagram gallery (flowchart, sequence, ER, class, Gantt)
- [ ] Confirm Mermaid runs with zero network access (no CDN icon packs or fonts)

### Phase 5 - Request generator
- [ ] Two input modes, switchable in the UI:
  - **From sample JSON:** infer a schema from the pasted payload (types, nesting, arrays), then generate new dummy values with the same shape
  - **From OpenAPI/Swagger (JSON or YAML, v2 and v3):** pick an endpoint and method, then generate the request body, plus query/path/header parameters, from its schema
- [ ] Generate realistic dummy bodies from schema types, formats (date-time, email, uuid), enums and constraints
- [ ] Options: seed for repeatable output, include optional fields, array length
- [ ] Output: JSON body, plus `curl` and `fetch` snippets
- [ ] Bulk generation (N variations)
- [ ] Support `$ref` resolution, `allOf`/`oneOf`

### Phase 6 - Polish and distribution
- [ ] Single-file build (`npm run build:single`) producing one portable `index.html`
- [ ] Optional PWA service worker so it can be installed and used offline
- [ ] Keyboard shortcuts and a command palette to jump between tools
- [ ] Persist per-tool state across sessions
- [ ] Accessibility pass and responsive layout
- [ ] Playwright offline smoke tests for every tool

### Ideas / backlog
- Base64, URL encode/decode, JWT decoder
- JSON path / JMESPath query, JSON to TypeScript types
- Hash generator, timestamp converter, regex tester
- Cron expression explainer

## Getting started

Not yet scaffolded. Planned commands:

```bash
npm install
npm run dev            # local dev server
npm run build          # static build in dist/
npm run build:single   # single self-contained index.html
npm run preview        # serve the production build
npm test
```

## Known constraints

- **Bundle size:** Mermaid and Prettier are large. Lazy loading keeps first paint fast, but the single-file build will be several MB.
- **`file://` quirks:** ES module scripts and `localStorage` behave differently across browsers when opened from disk. The single-file build avoids module loading issues, but serving over `localhost` is the most reliable.
- **Mermaid formatting:** There is no official formatter, so "format" is best-effort indentation rather than a full AST-based pretty printer.
- **Swagger input:** Dummy data is generated from schemas, so quality depends on how well the spec defines types, formats and examples. Explicit `example` values are preferred when present.
