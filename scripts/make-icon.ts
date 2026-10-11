// Renders build/icon.png (1024x1024) from a theme's logo. Usage: tsx scripts/make-icon.ts <themeId>
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { appIconSvg } from '../src/themes/logoSvg';
import { mono } from '../src/themes/defs/mono';

const defs = Object.fromEntries([mono].map((d) => [d.id, d]));
const id = process.argv[2] ?? 'mono';
const def = defs[id];
if (!def) {
  console.error(`Unknown theme "${id}". Available: ${Object.keys(defs).join(', ')}`);
  process.exit(1);
}
const png = new Resvg(appIconSvg(def), { fitTo: { mode: 'width', value: 1024 } }).render().asPng();
mkdirSync('build', { recursive: true });
writeFileSync('build/icon.png', png);
console.log(`Icon written for theme "${id}" (build/icon.png)`);
