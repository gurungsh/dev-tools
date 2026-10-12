export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
}

/** Linear mix: 0 returns a, 1 returns b. */
export function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex([0, 1, 2].map((i) => ca[i] + (cb[i] - ca[i]) * t) as [number, number, number]);
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors (1 to 21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Text color to place on top of `bg`. */
export function onColor(bg: string): string {
  return contrast(bg, '#ffffff') >= contrast(bg, '#000000') ? '#ffffff' : '#000000';
}

export type Scale10 = [string, string, string, string, string, string, string, string, string, string];

/** 10 shades with the accent at index 6 (lighter below, darker above). */
export function shades(accent: string): Scale10 {
  const light = [0.92, 0.82, 0.7, 0.55, 0.35, 0.15].map((t) => mix(accent, '#ffffff', t));
  const dark = [0.12, 0.25, 0.4].map((t) => mix(accent, '#000000', t));
  return [...light, accent, ...dark] as Scale10;
}

/** Mantine's `dark` scale: 0 is text, 4 is border, 6 is panel, 7 is page background. */
export function darkScale(p: { bg: string; panel: string; border: string; text: string; dimmed: string }): Scale10 {
  return [
    p.text,
    mix(p.text, p.dimmed, 0.4),
    p.dimmed,
    mix(p.dimmed, p.border, 0.5),
    p.border,
    mix(p.border, p.panel, 0.5),
    p.panel,
    p.bg,
    mix(p.bg, '#000000', 0.3),
    mix(p.bg, '#000000', 0.5),
  ];
}
