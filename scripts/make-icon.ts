// Renders build/icon.png (1024x1024) from a theme's logo. Usage: tsx scripts/make-icon.ts <themeId>
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { appIconSvg } from '../src/themes/logoSvg';
import { mono } from '../src/themes/defs/mono';
import { terminal } from '../src/themes/defs/terminal';
import { comic } from '../src/themes/defs/comic';
import { synthwave } from '../src/themes/defs/synthwave';
import { brutalism } from '../src/themes/defs/brutalism';
import { anthropomorphic } from '../src/themes/defs/anthropomorphic';
import { medieval } from '../src/themes/defs/medieval';
import { memphis } from '../src/themes/defs/memphis';

const defs = Object.fromEntries([mono, terminal, comic, synthwave, brutalism, anthropomorphic, medieval, memphis].map((d) => [d.id, d]));
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
