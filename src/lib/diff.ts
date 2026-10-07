import { createTwoFilesPatch, diffArrays, diffWordsWithSpace } from 'diff';

export interface DiffOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
}

export interface Part {
  text: string;
  changed: boolean;
}

export interface Cell {
  no: number;
  text: string;
  /** Word-level parts, present on modified lines. */
  parts?: Part[];
}

export interface Row {
  kind: 'equal' | 'add' | 'remove' | 'change';
  left?: Cell;
  right?: Cell;
}

export interface DiffResult {
  rows: Row[];
  added: number;
  removed: number;
  changed: number;
  identical: boolean;
}

function splitLines(value: string): string[] {
  const lines = value.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function wordParts(a: string, b: string, opts: DiffOptions): { left: Part[]; right: Part[] } {
  const left: Part[] = [];
  const right: Part[] = [];
  for (const c of diffWordsWithSpace(a, b, { ignoreCase: opts.ignoreCase })) {
    if (c.added) right.push({ text: c.value, changed: true });
    else if (c.removed) left.push({ text: c.value, changed: true });
    else {
      left.push({ text: c.value, changed: false });
      right.push({ text: c.value, changed: false });
    }
  }
  return { left, right };
}

export function computeDiff(a: string, b: string, opts: DiffOptions): DiffResult {
  const A = splitLines(a.replace(/\r\n?/g, '\n'));
  const B = splitLines(b.replace(/\r\n?/g, '\n'));
  const norm = (s: string) => {
    let t = s;
    if (opts.ignoreWhitespace) t = t.replace(/\s+/g, ' ').trim();
    if (opts.ignoreCase) t = t.toLowerCase();
    return t;
  };
  // Diff normalised lines, then map back to the original text for display.
  const changes = diffArrays(A.map(norm), B.map(norm));

  const rows: Row[] = [];
  let i = 0; // index into A
  let j = 0; // index into B
  let added = 0;
  let removed = 0;
  let changed = 0;

  for (let c = 0; c < changes.length; c++) {
    const ch = changes[c];
    const n = ch.value.length;
    if (!ch.added && !ch.removed) {
      for (let k = 0; k < n; k++, i++, j++) {
        rows.push({ kind: 'equal', left: { no: i + 1, text: A[i] }, right: { no: j + 1, text: B[j] } });
      }
      continue;
    }
    const next = changes[c + 1];
    if (ch.removed && next?.added) {
      const m = next.value.length;
      const count = Math.max(n, m);
      for (let k = 0; k < count; k++) {
        const lt = k < n ? A[i + k] : undefined;
        const rt = k < m ? B[j + k] : undefined;
        if (lt !== undefined && rt !== undefined) {
          const p = wordParts(lt, rt, opts);
          rows.push({ kind: 'change', left: { no: i + k + 1, text: lt, parts: p.left }, right: { no: j + k + 1, text: rt, parts: p.right } });
          changed++;
        } else if (lt !== undefined) {
          rows.push({ kind: 'remove', left: { no: i + k + 1, text: lt } });
          removed++;
        } else {
          rows.push({ kind: 'add', right: { no: j + k + 1, text: rt! } });
          added++;
        }
      }
      i += n;
      j += m;
      c++;
    } else if (ch.removed) {
      for (let k = 0; k < n; k++, i++) {
        rows.push({ kind: 'remove', left: { no: i + 1, text: A[i] } });
        removed++;
      }
    } else {
      for (let k = 0; k < n; k++, j++) {
        rows.push({ kind: 'add', right: { no: j + 1, text: B[j] } });
        added++;
      }
    }
  }

  return { rows, added, removed, changed, identical: added + removed + changed === 0 };
}

export function unifiedPatch(a: string, b: string, nameA = 'original', nameB = 'modified'): string {
  return createTwoFilesPatch(nameA, nameB, a, b, '', '', { context: 3 });
}
