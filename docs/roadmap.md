# Roadmap

## Phase 0 - Scaffold
- [x] Vite + React + TypeScript project, ESLint, Prettier, Vitest
- [x] App shell: sidebar navigation, hash routing, light/dark theme
- [x] Shared `CodeEditor` (CodeMirror), copy/download/upload helpers
- [x] Tool registry and lazy-loaded routes
- [x] Offline guard: lint rule or CI check that fails on `http(s)://` asset references in the build output

## Phase 1 - GUID generator (quick win)
- [x] Generate v4 UUIDs, with count (1 to 1000)
- [x] Options: uppercase, no hyphens, braces, quotes, comma separated
- [x] Copy one or copy all
- [x] Optional: v7 (time-ordered), nil UUID, validator

## Phase 2 - Formatter
- [x] JSON: format, minify, validate with line/column errors, sort keys
- [x] YAML: format and validate, YAML <-> JSON conversion
- [x] XML: format and validate, configurable indent
- [x] Mermaid: basic indentation normaliser
- [x] Auto-detect input type, indent size setting, file open
- [x] HTML, CSS, Markdown, SQL

## Phase 3 - Diff checker
- [x] Two-pane input with paste or file open
- [x] Side-by-side and inline views
- [x] Options: ignore whitespace, ignore case, word vs line diff
- [x] Format both sides before diffing (reuses the Formatter), useful for JSON/YAML
- [x] Stats (added, removed, changed) and copy as unified diff

## Phase 4 - Mermaid renderer
- [x] Editor with live preview, debounced
- [x] Syntax error display
- [x] Export SVG and PNG
- [x] Sample diagram gallery (flowchart, sequence, ER, class, Gantt)

## Phase 5 - Request generator
- [x] Two input modes, switchable in the UI:
  - **From sample JSON:** infer a schema from the pasted payload (types, nesting, arrays), then generate new dummy values with the same shape
  - **From OpenAPI/Swagger (JSON or YAML, v2 and v3):** pick an endpoint and method, then generate the request body, plus query/path/header parameters, from its schema
- [x] Generate realistic dummy bodies from schema types, formats (date-time, email, uuid), enums and constraints
- [x] Options: seed for repeatable output, include optional fields, array length
- [x] Output: JSON body, plus `curl` and `fetch` snippets
- [x] Bulk generation (N variations)
- [x] Support local `$ref` resolution, `allOf`/`oneOf`/`anyOf`

## Phase 6 - Polish and distribution
- [x] Single-file build (`npm run build:single`) producing one portable `index.html`
- [x] Persist per-tool state across sessions (localStorage)

## Phase 7 - Themes and desktop app
- [x] Multi-theme support with light and dark per theme (only Mono ships now; the other themes were removed)
- [x] Theme picker and light/dark/system toggle at the bottom of the sidebar
- [x] Fonts bundled locally via `@fontsource` (no network); themes and fonts not selected for a build are tree-shaken out
- [x] Desktop app (Electron) for macOS and Windows with a `--theme` packaging option
- [x] Installer ships the core themes (Mono, Terminal); other themes are `.devtheme` packs users install from the app's Themes menu

## Phase 8 - Base64 encode/decode
- [x] Encode and decode text (UTF-8)
- [x] URL-safe option
- [x] Error display for invalid input
- [x] Copy output

## Phase 9 - Hash generator
- [x] SHA-1, SHA-256, SHA-384, SHA-512 (Web Crypto)
- [x] Lowercase or uppercase hex output
- [x] Copy digest

## Phase 10 - JWT decoder
- [x] Decode header and payload locally (no signature verification)
- [x] Error display for malformed tokens
- [x] Copy payload

## Ideas / backlog
- URL encode/decode
- JSON path / JMESPath query, JSON to TypeScript types
- Timestamp converter, regex tester
- Cron expression explainer
- Drag-and-drop file open (Formatter, Diff)
- Mermaid preview pan (zoom already works)
- Verify Mermaid makes no network requests (`check:offline` only scans HTML/CSS, not JS)
- Keyboard shortcuts and a command palette to jump between tools
- Accessibility audit and responsive layout check
- Playwright offline smoke tests for every tool
