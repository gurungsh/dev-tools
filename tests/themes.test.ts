import { describe, expect, it } from 'vitest';
import { THEMES, getTheme, DEFAULT_THEME_ID } from '../src/themes';
import { tools } from '../src/app/registry';
import { contrast, darkScale, mix, onColor, shades } from '../src/themes/colors';

const HEX = /^#[0-9a-f]{6}$/i;

describe('theme registry', () => {
  it('contains the configured themes in order', () => {
    expect(THEMES.map((t) => t.id)).toEqual(['mono', 'terminal', 'comic', 'synthwave', 'brutalism', 'anthropomorphic', 'medieval', 'memphis']);
  });
  it('falls back to the default theme for unknown ids', () => {
    expect(getTheme('nope').id).toBe(DEFAULT_THEME_ID);
    expect(getTheme(null).id).toBe('mono');
  });
});

describe.each(THEMES.map((t) => [t.id, t] as const))('%s theme', (_id, def) => {
  it('has fonts, radius and a logo', () => {
    expect(def.fonts.sans).toBeTruthy();
    expect(def.fonts.mono).toBeTruthy();
    expect(def.radius).toBeGreaterThanOrEqual(0);
    expect(def.logo).toContain('<');
    for (const id of Object.keys(def.toolNames ?? {})) expect(tools.map((t) => t.id), `toolNames.${id}`).toContain(id);
    expect(def.logo.match(/var\(--app-[a-z-]+\)/g)?.length ?? 0).toBeGreaterThan(0);
  });

  describe.each(['light', 'dark'] as const)('%s mode', (mode) => {
    const p = def[mode];

    it('uses valid hex colors', () => {
      for (const c of [p.bg, p.panel, p.border, p.text, p.dimmed, p.accent, p.hover, p.flame.outer, p.flame.core, ...Object.values(p.syntax)]) expect(c).toMatch(HEX);
    });
    it('is actually ' + mode, () => {
      const lightBg = contrast(p.bg, '#ffffff') < contrast(p.bg, '#000000');
      expect(lightBg).toBe(mode === 'light');
    });
    it('has readable text (AA) on page and panel', () => {
      expect(contrast(p.text, p.bg)).toBeGreaterThanOrEqual(7);
      expect(contrast(p.text, p.panel)).toBeGreaterThanOrEqual(7);
      expect(contrast(p.dimmed, p.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.dimmed, p.panel)).toBeGreaterThanOrEqual(4.5);
    });
    it('has a readable label on filled accent buttons', () => {
      expect(contrast(p.accent, onColor(p.accent))).toBeGreaterThanOrEqual(4.5);
    });
    it('has an accent visible against the page', () => {
      expect(contrast(p.accent, p.bg)).toBeGreaterThanOrEqual(3);
    });
    it('has syntax colors readable on the editor background', () => {
      const { comment, ...rest } = p.syntax;
      for (const [name, c] of Object.entries(rest)) expect(contrast(c, p.panel), name).toBeGreaterThanOrEqual(4.5);
      expect(contrast(comment, p.panel), 'comment').toBeGreaterThanOrEqual(3);
    });
    it('keeps the selected row distinguishable from the page and text readable on it', () => {
      expect(contrast(p.text, p.hover)).toBeGreaterThanOrEqual(4.5);
      expect(p.hover).not.toBe(p.panel);
    });
  });
});

describe('color helpers', () => {
  it('shades puts the accent at index 6 and gets lighter then darker', () => {
    const s = shades('#2f6fed');
    expect(s[6]).toBe('#2f6fed');
    expect(s[0] > s[5]).toBe(true);
    expect(contrast(s[9], '#ffffff')).toBeGreaterThan(contrast(s[6], '#ffffff'));
  });
  it('darkScale maps panel, bg and border to Mantine slots', () => {
    const d = darkScale({ bg: '#111111', panel: '#222222', border: '#333333', text: '#eeeeee', dimmed: '#999999' });
    expect([d[0], d[4], d[6], d[7]]).toEqual(['#eeeeee', '#333333', '#222222', '#111111']);
  });
  it('mix interpolates', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});
