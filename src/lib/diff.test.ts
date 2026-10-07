import { describe, expect, it } from 'vitest';
import { computeDiff, unifiedPatch } from './diff';

const o = { ignoreWhitespace: false, ignoreCase: false };

describe('diff', () => {
  it('detects identical', () => {
    expect(computeDiff('a\nb\n', 'a\nb\n', o).identical).toBe(true);
  });
  it('detects add, remove, change', () => {
    const r = computeDiff('a\nb\nc\n', 'a\nB\nc\nd\n', o);
    expect(r.changed).toBe(1);
    expect(r.added).toBe(1);
    expect(r.removed).toBe(0);
    const change = r.rows.find((x) => x.kind === 'change')!;
    expect(change.left?.no).toBe(2);
    expect(change.right?.parts?.some((p) => p.changed)).toBe(true);
  });
  it('handles removals', () => {
    const r = computeDiff('a\nb\nc', 'a\nc', o);
    expect(r.removed).toBe(1);
    expect(r.rows.map((x) => x.kind)).toEqual(['equal', 'remove', 'equal']);
  });
  it('ignores case and whitespace when asked', () => {
    expect(computeDiff('Hello  World', 'hello world', { ignoreCase: true, ignoreWhitespace: true }).identical).toBe(true);
    expect(computeDiff('Hello', 'hello', o).identical).toBe(false);
  });
  it('normalises CRLF', () => {
    expect(computeDiff('a\r\nb', 'a\nb', o).identical).toBe(true);
  });
  it('builds a unified patch', () => {
    expect(unifiedPatch('a\n', 'b\n')).toContain('-a');
  });
});
