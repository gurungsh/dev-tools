// Builds theme packs: one self-contained `.devtheme` file per theme, installable from the desktop app's Themes menu.
//
//   npm run packs                                  (every theme that is not part of the core install)
//   npm run packs -- --theme=comic,medieval --out=release/theme-packs
//
// Each pack is JSON: { schema, id, label, description, version, js, css } (see electron/packs.cjs).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const themeConfig = JSON.parse(readFileSync(join(root, 'config/themes.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const args = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const requested = args.theme ? args.theme.split(',').map((s) => s.trim()).filter(Boolean) : themeConfig.ids.filter((id) => !themeConfig.core.includes(id));
const unknown = requested.filter((id) => !themeConfig.ids.includes(id));
if (unknown.length) {
  console.error(`Unknown theme(s): ${unknown.join(', ')}\nAvailable: ${themeConfig.ids.join(', ')}`);
  process.exit(1);
}
const outDir = resolve(root, args.out ?? 'dist-packs');
mkdirSync(outDir, { recursive: true });

/** Fonts are inlined, so the theme code only needs a no-op for its `import('@fontsource/…css')` calls. */
const stubCss = {
  name: 'stub-css',
  enforce: 'pre',
  resolveId: (id) => (id.endsWith('.css') ? `\0stub:${id}` : null),
  load: (id) => (id.startsWith('\0stub:') ? 'export default {}' : null),
};

/** Concatenates every fontsource stylesheet a theme imports, replacing file URLs with inline woff2 data. */
function fontCss(source) {
  const specs = [...source.matchAll(/import\('(@fontsource\/[^']+\.css)'\)/g)].map((m) => m[1]);
  return [...new Set(specs)]
    .map((spec) => {
      const file = join(root, 'node_modules', spec);
      return readFileSync(file, 'utf8').replace(/src:[^;]*;/g, (src) => {
        const m = /url\(\.\/files\/([^)]+\.woff2)\)/.exec(src);
        if (!m) return src;
        const data = readFileSync(join(dirname(file), 'files', m[1])).toString('base64');
        return `src: url(data:font/woff2;base64,${data}) format('woff2');`;
      });
    })
    .join('\n');
}

for (const id of requested) {
  const defFile = join(root, 'src/themes/defs', `${id}.ts`);
  const source = readFileSync(defFile, 'utf8');
  const cache = join(root, 'node_modules/.cache/devtools-packs');
  mkdirSync(cache, { recursive: true });
  const entry = join(cache, `${id}.ts`);
  writeFileSync(entry, `export { ${id} as default } from ${JSON.stringify(defFile)};\n`);

  const result = await build({
    root,
    configFile: false,
    logLevel: 'warn',
    plugins: [stubCss],
    build: {
      write: false,
      minify: true,
      lib: { entry, formats: ['es'], fileName: 'theme' },
      rollupOptions: { output: { codeSplitting: false } },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output);
  const js = outputs.find((o) => o.type === 'chunk')?.code;
  if (!js) throw new Error(`No code produced for ${id}`);

  const label = /label: '([^']+)'/.exec(source)?.[1] ?? id;
  const description = /description: '((?:[^'\\]|\\.)*)'/.exec(source)?.[1].replace(/\\'/g, "'") ?? '';
  const file = join(outDir, `${id}.devtheme`);
  writeFileSync(file, JSON.stringify({ schema: 1, id, label, description, version: pkg.version, js, css: fontCss(source) }));
  console.log(`  ${id}.devtheme  ${(readFileSync(file).length / 1024).toFixed(0)} KB`);
}
console.log(`\nTheme packs written to ${outDir}`);
