# Dev Tools

An offline developer toolbox for the browser and the desktop. No backend, no network calls, nothing is uploaded.

## Tools

- **GUID generator**: v4, v7 and nil UUIDs in bulk
- **Request generator**: dummy request bodies from sample JSON or an OpenAPI/Swagger spec, with cURL and fetch snippets
- **Formatter**: format, validate and minify JSON, YAML, XML, HTML, CSS, Markdown, SQL and Mermaid
- **Diff checker**: side-by-side or inline, with word-level highlights
- **Mermaid renderer**: live diagrams, exported as SVG or PNG
- **Base64**, **JWT decoder** and **hash generator**

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev            # http://localhost:5173
npm test
```

Also: `npm run build` (static site in `dist/`), `npm run build:single` (one self-contained `index.html`), `npm run lint` and `npm run check:offline`.

## Themes

Eight themes, each with light and dark modes. Pick one in the sidebar; the choice is remembered. A theme can also rename the tools (Comic calls the request generator "Zap").

| Theme | Look |
|-------|------|
| Mono | Black and white, hairline borders (default) |
| Terminal | Green-screen phosphor |
| Comic | Pop-art yellow, red and blue with halftone and explosions |
| Synthwave | 1980s neon sunset |
| Brutalism | Stark black and white, thick borders |
| Anthropomorphic | Retro cartoon mascots with faces |
| Medieval | Parchment, crimson and gold, castle scenes |
| Memphis | 1980s pink, teal and yellow squiggles |

See [Themes](docs/themes.md) for how they work and how to add one.

## Desktop app

Packaged with Electron for macOS and Windows. It serves the app from disk and blocks all network requests.

```bash
npm run package    # installer with Mono and Terminal, plus the other themes as packs in release/theme-packs/
npm run desktop    # build and run locally
```

Users add the other themes from the app under **Themes > Install Theme Pack…**. Flags, theme packs and signing notes are in [Desktop app](docs/desktop-app.md).

## Documentation

- [Architecture](docs/architecture.md): tools, offline rules, tech stack, project structure, known constraints
- [Themes](docs/themes.md)
- [Desktop app](docs/desktop-app.md)
- [Roadmap](docs/roadmap.md)

## Contributing

- `main`: stable. Updated by merging `development`.
- `development`: integration branch.
- `feature/<name>`: one per feature, branched from `development` and merged back with a merge commit.
