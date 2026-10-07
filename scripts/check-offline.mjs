// Fails if the built app references remote assets (CDN scripts, fonts, stylesheets).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'dist';
const patterns = [
  /<script[^>]+src=["']https?:\/\//i,
  /<link[^>]+href=["']https?:\/\//i,
  /@import\s+(url\()?["']?https?:\/\//i,
  /url\(\s*["']?https?:\/\//i,
];

const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    statSync(p).isDirectory() ? walk(p) : /\.(html|css)$/.test(f) && files.push(p);
  }
})(dir);

let bad = 0;
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const re of patterns) if (re.test(text)) { console.error(`Remote asset reference in ${f}: ${re}`); bad++; }
}
if (bad) process.exit(1);
console.log(`Offline check passed (${files.length} files scanned in ${dir}).`);
