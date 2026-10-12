# Desktop app (macOS and Windows)

The app is packaged with Electron. The desktop build serves the bundled app from disk and blocks every network request, so it stays fully offline.

## Packaging

```bash
npm run package                                   # core themes (Mono and Terminal) for your OS, plus theme packs
npm run package -- --theme=all                    # every theme built in, no packs needed
npm run package -- --theme=mono                   # Mono only, no theme picker
npm run package -- --theme=mono --platform=win
npm run package -- --platform=all --arch=all      # mac and windows, arm64 and x64
npm run package -- --dir                          # fast unpacked build for testing
npm run package -- --list-themes
npm run desktop                                   # build and run locally
```

| Flag | Values | Default |
|------|--------|---------|
| `--theme` | one theme, a comma list, `core` or `all` | `core` |
| `--no-packs` | skip building theme packs | off |
| `--platform` | `mac`, `win`, `all` | current OS |
| `--arch` | `arm64`, `x64`, `all` | mac: this machine's CPU, win: `x64` |
| `--dir` | unpacked app only | off |
| `--out` | output folder | `release` |

What `--theme` does:
- Only the chosen themes and their fonts are built in, so installers stay small. `core` is the `"core"` list in `config/themes.json` (Mono and Terminal), with Mono as the `"default"`.
- A single theme hides the theme picker. Several show a picker limited to those themes.
- The app icon comes from the default theme's logo.

Installers land in `release/`, named like `DevTools-0.1.0-mono-terminal-mac-arm64.dmg`: `.dmg` and `.zip` for macOS, `.exe` (NSIS installer) and `.zip` for Windows. Windows installers can be built from a Mac.

## Theme packs

Themes that are not built in are packaged as one `.devtheme` file each. `npm run package` writes them to `release/theme-packs/`; `npm run packs` builds them on their own into `dist-packs/`. A pack is a single JSON file holding the theme's code and its fonts, so it works offline.

```bash
npm run packs                                       # every theme not in "core"
npm run packs -- --theme=comic,medieval --out=out   # chosen themes only
```

Users install a pack from the app with **Themes > Install Theme Pack…** in the menu bar, or **Install theme pack…** under the theme picker. The pack is copied into the app's user data folder and appears in the picker straight away. **Themes > Remove Theme Pack** deletes it. Installed packs survive app updates.

Packs are code that runs inside the app window, which has no file or network access, so only install packs you trust. A pack whose id matches a built-in theme is ignored.

## Notes

- Builds are unsigned. On macOS, right-click the app and choose Open the first time, or sign and notarize with an Apple Developer ID. Windows SmartScreen may warn until the installer is code-signed.
- Unsigned Windows builds skip embedding the icon in the `.exe` (that step needs Wine off Windows). Build on Windows to include it.
- The first packaging run downloads Electron (about 100 MB), so it needs internet once. The packaged app never does.
- `DEVTOOLS_THEMES=mono npm run build` also works for a themed web build.
