import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { THEMES } from '../src/themes';
import { isThemeDef } from '../src/themes/packs';

const { validatePack, parsePackText, createStore } = createRequire(import.meta.url)('../electron/packs.cjs');

const pack = (over: object = {}) => ({ schema: 1, id: 'sample', label: 'Sample', description: 'A sample.', version: '1.0.0', js: 'export default {}', css: '', ...over });

describe('validatePack', () => {
  it('accepts a well-formed pack', () => expect(validatePack(pack())).toBeNull());
  it.each([
    ['wrong schema', { schema: 2 }],
    ['path-like id', { id: '../evil' }],
    ['uppercase id', { id: 'Sample' }],
    ['empty label', { label: '' }],
    ['missing code', { js: '' }],
    ['non-string css', { css: 5 }],
  ])('rejects %s', (_name, over) => expect(validatePack(pack(over))).toBeTruthy());
  it('rejects non-objects', () => expect(validatePack(null)).toBeTruthy());
});

describe('parsePackText', () => {
  it('reports invalid JSON', () => expect(parsePackText('{nope').error).toBeTruthy());
  it('returns the parsed pack', () => expect(parsePackText(JSON.stringify(pack())).pack.id).toBe('sample'));
});

describe('theme pack store', () => {
  let dir: string;
  let src: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'packs-'));
    src = mkdtempSync(join(tmpdir(), 'packsrc-'));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    rmSync(src, { recursive: true, force: true });
  });

  it('installs, lists, reads and removes packs, skipping bad files', () => {
    const good = join(src, 'good.devtheme');
    const bad = join(src, 'bad.devtheme');
    writeFileSync(good, JSON.stringify(pack()));
    writeFileSync(bad, JSON.stringify(pack({ id: '../x' })));
    const store = createStore(join(dir, 'theme-packs'));

    expect(store.list()).toEqual([]);
    const result = store.install([good, bad, join(src, 'missing.devtheme')]);
    expect(result.installed).toEqual(['Sample']);
    expect(result.errors).toHaveLength(2);
    expect(store.list().map((p: { id: string }) => p.id)).toEqual(['sample']);
    expect(store.read('sample').js).toBe('export default {}');
    expect(store.read('../sample')).toBeNull();

    store.remove('sample');
    expect(store.list()).toEqual([]);
  });

  it('ignores corrupt files already in the folder', () => {
    const store = createStore(dir);
    writeFileSync(join(dir, 'broken.devtheme'), 'not json');
    expect(store.list()).toEqual([]);
  });
});

describe('isThemeDef', () => {
  it('accepts a real theme and rejects broken ones', () => {
    const mono = THEMES.find((t) => t.id === 'mono')!;
    expect(isThemeDef(mono, 'mono')).toBe(true);
    expect(isThemeDef(mono, 'other')).toBe(false);
    expect(isThemeDef({ ...mono, light: { ...mono.light, bg: 'red' } }, 'mono')).toBe(false);
    expect(isThemeDef(null, 'mono')).toBe(false);
  });
});

describe('core themes', () => {
  it('are a subset of all themes with the default among them', () => {
    const cfg = JSON.parse(readFileSync(new URL('../config/themes.json', import.meta.url), 'utf8'));
    expect(cfg.core.every((id: string) => cfg.ids.includes(id))).toBe(true);
    expect(cfg.core).toContain(cfg.default);
  });
});
