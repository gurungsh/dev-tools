import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function build(themes: string): { dir: string; fonts: string[]; code: string } {
  const dir = mkdtempSync(join(tmpdir(), 'devtools-build-'));
  execFileSync('npx', ['vite', 'build', '--outDir', dir, '--emptyOutDir'], { env: { ...process.env, DEVTOOLS_THEMES: themes }, stdio: 'pipe' });
  const assets = readdirSync(join(dir, 'assets'));
  const code = assets.filter((f) => f.endsWith('.js') || f.endsWith('.css')).map((f) => readFileSync(join(dir, 'assets', f), 'utf8')).join('\n');
  return { dir, fonts: assets.filter((f) => /\.woff2?$/.test(f)), code };
}

describe('per-theme builds', () => {
  it('a single-theme build contains only that theme and its fonts', () => {
    const { fonts, code } = build('paper');
    expect(code).toContain('Warm and calm'); // Paper description
    expect(code).not.toContain('Black and white with hairline borders'); // Mono description
    expect(code).not.toContain('Code-editor greys'); // Editor description
    expect(fonts.length).toBeGreaterThan(0);
    expect(fonts.every((f) => /fraunces|ibm-plex/.test(f))).toBe(true);
  }, 120_000);

  it('rejects unknown theme names', () => {
    expect(() => build('nope')).toThrow();
  }, 120_000);
});
