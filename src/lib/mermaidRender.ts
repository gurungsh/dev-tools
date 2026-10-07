import type { Mermaid } from 'mermaid';

let instance: Promise<Mermaid> | null = null;
let currentTheme: string | null = null;
let counter = 0;

/** Mermaid is large, so it is loaded on first use. It is still bundled locally. */
async function load(theme: 'default' | 'dark'): Promise<Mermaid> {
  instance ??= import('mermaid').then((m) => m.default);
  const mermaid = await instance;
  if (currentTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme,
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      // SVG-native labels keep PNG export working (foreignObject taints the canvas).
      flowchart: { htmlLabels: false },
    });
    currentTheme = theme;
  }
  return mermaid;
}

export type RenderResult = { ok: true; svg: string } | { ok: false; error: string };

export async function renderMermaid(code: string, theme: 'default' | 'dark'): Promise<RenderResult> {
  const mermaid = await load(theme);
  try {
    await mermaid.parse(code);
    const { svg } = await mermaid.render(`mmd-${++counter}`, code);
    return { ok: true, svg };
  } catch (e) {
    // Mermaid can leave a stray error node in the body after a failed render.
    document.querySelectorAll('[id^="dmmd-"]').forEach((n) => n.remove());
    return { ok: false, error: String((e as Error).message ?? e).replace(/^\s+/, '') };
  }
}

function svgSize(svg: string): { width: number; height: number } {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const el = doc.documentElement;
  const vb = el.getAttribute('viewBox')?.split(/[\s,]+/).map(Number);
  if (vb && vb.length === 4) return { width: vb[2], height: vb[3] };
  return { width: parseFloat(el.getAttribute('width') ?? '800'), height: parseFloat(el.getAttribute('height') ?? '600') };
}

/** Rasterises an SVG string to a PNG blob, entirely in the browser. */
export async function svgToPng(svg: string, scale = 2, background = '#ffffff'): Promise<Blob> {
  const { width, height } = svgSize(svg);
  // Fix explicit pixel size so the image renders at the viewBox dimensions.
  const sized = svg.replace(/<svg([^>]*?)>/, (_m, attrs: string) => {
    const cleaned = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    return `<svg${cleaned} width="${width}" height="${height}">`;
  });
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Could not rasterise SVG'));
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png'));
}
