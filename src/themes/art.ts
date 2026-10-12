import type { Palette } from './types';

/** Wraps SVG shapes in a sized, namespaced <svg> so it can be used as a CSS background image. */
export const svg = (w: number, h: number, body: string) =>
  `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>${body}</svg>`;

/** Points attribute for a starburst (the "POW" shape): `spikes` tips alternating between outer and inner radius. `jitter` (0 to 1) randomizes each radius for a ragged explosion. */
export function burst(cx: number, cy: number, outer: number, inner: number, spikes: number, jitter = 0, rnd: () => number = Math.random): string {
  return Array.from({ length: spikes * 2 }, (_, i) => {
    const a = (i * Math.PI) / spikes;
    const r = (i % 2 ? inner : outer) * (1 + (rnd() * 2 - 1) * jitter);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

/** A friendly cartoon face: round head, two eyes with pupils and a smile. */
export function face(cx: number, cy: number, r: number, fill: string, ink: string): string {
  const n = (v: number) => v.toFixed(1);
  const eye = (dx: number) => `<ellipse cx='${n(cx + dx * r)}' cy='${n(cy - 0.15 * r)}' rx='${n(r * 0.17)}' ry='${n(r * 0.23)}' fill='#fff' stroke='${ink}' stroke-width='1.5'/><circle cx='${n(cx + dx * r)}' cy='${n(cy - 0.1 * r)}' r='${n(r * 0.08)}' fill='${ink}'/>`;
  return `<circle cx='${cx}' cy='${cy}' r='${r}' fill='${fill}' stroke='${ink}' stroke-width='2'/>${eye(-0.33)}${eye(0.33)}`
    + `<path d='M${n(cx - 0.4 * r)} ${n(cy + 0.25 * r)} Q${cx} ${n(cy + 0.8 * r)} ${n(cx + 0.4 * r)} ${n(cy + 0.25 * r)}' fill='none' stroke='${ink}' stroke-width='2' stroke-linecap='round'/>`;
}

/** A spray-paint splat: a disc with a ring of small satellite droplets. */
export function splat(cx: number, cy: number, r: number, fill: string): string {
  const drops = Array.from({ length: 8 }, (_, i) => {
    const a = i * 0.785 + 0.3;
    const d = r * (1.3 + (i % 3) * 0.35);
    return `<circle cx='${(cx + d * Math.cos(a)).toFixed(1)}' cy='${(cy + d * Math.sin(a)).toFixed(1)}' r='${(r * (0.12 + (i % 2) * 0.1)).toFixed(1)}'/>`;
  }).join('');
  return `<g fill='${fill}'><circle cx='${cx}' cy='${cy}' r='${r}'/>${drops}</g>`;
}

/** Deterministic PRNG so a given page always gets the same layout. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}

/** A motif is drawn around (0,0) within roughly +-50 units; `scene` scales, rotates and places it. */
export type Motif = (p: Palette) => string;

export interface SceneOptions {
  count?: number;
  /** Max rotation in degrees either way. */
  rotate?: number;
  /** Min and max motif scale. */
  scale?: [number, number];
  /** Large shapes drawn first (panels, rays, texture). */
  base?: (p: Palette, rnd: () => number) => string;
}

export const SCENE_W = 1600;
export const SCENE_H = 1000;

/**
 * A full-page, non-repeating backdrop: an optional base layer plus motifs scattered at varied sizes
 * and angles without overlapping. Each `variant` (one per page) gives a different layout.
 */
export function scene(p: Palette, motifs: Motif[], variant: number, o: SceneOptions = {}): string {
  const rnd = rng(variant * 7919 + 101);
  const [smin, smax] = o.scale ?? [0.7, 2];
  const placed: [number, number, number][] = [];
  let out = o.base?.(p, rnd) ?? '';
  for (let i = 0; i < (o.count ?? 20); i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const s = smin + rnd() * (smax - smin);
      const x = 60 + rnd() * (SCENE_W - 120);
      const y = 60 + rnd() * (SCENE_H - 120);
      const r = s * 55;
      if (placed.some(([px, py, pr]) => Math.hypot(px - x, py - y) < pr + r)) continue;
      placed.push([x, y, r]);
      const motif = motifs[(i + variant) % motifs.length];
      out += `<g transform='translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${((rnd() * 2 - 1) * (o.rotate ?? 20)).toFixed(0)}) scale(${s.toFixed(2)})'>${motif(p)}</g>`;
      break;
    }
  }
  return svg(SCENE_W, SCENE_H, out);
}

/** Evenly spaced wedges fanning out from a point, for retro sunburst backgrounds. */
export function rays(cx: number, cy: number, n: number, fill: string, opacity: number): string {
  const R = 2400;
  return Array.from({ length: n }, (_, i) => {
    const a0 = (i * 2 * Math.PI) / n, a1 = a0 + Math.PI / n;
    return `<polygon points='${cx},${cy} ${(cx + R * Math.cos(a0)).toFixed(0)},${(cy + R * Math.sin(a0)).toFixed(0)} ${(cx + R * Math.cos(a1)).toFixed(0)},${(cy + R * Math.sin(a1)).toFixed(0)}' fill='${fill}' fill-opacity='${opacity}'/>`;
  }).join('');
}

export type ArtFn = (p: Palette) => string;
