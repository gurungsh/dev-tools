import { describe, expect, it } from 'vitest';
import { formatGuid, generateGuids, inspectGuid, NIL_UUID, uuidV4, uuidV7 } from './guid';

const opts = { uppercase: false, hyphens: true, braces: false, quotes: false };

describe('guid', () => {
  it('generates valid v4', () => {
    const g = uuidV4();
    expect(g).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it('generates v7 with timestamp prefix', () => {
    const g = uuidV7(0x0123456789ab);
    expect(g.replace(/-/g, '').slice(0, 12)).toBe('0123456789ab');
    expect(g[14]).toBe('7');
  });
  it('v7 ids sort by time', () => {
    expect(uuidV7(1000) < uuidV7(2000)).toBe(true);
  });
  it('formats options', () => {
    expect(formatGuid(NIL_UUID, { uppercase: true, hyphens: false, braces: true, quotes: true })).toBe('"{00000000000000000000000000000000}"');
  });
  it('generates requested count', () => {
    expect(new Set(generateGuids(50, 'v4', opts)).size).toBe(50);
  });
  it('inspects', () => {
    expect(inspectGuid(uuidV4())).toMatchObject({ version: 4, variantRfc: true });
    expect(inspectGuid(uuidV7())).toMatchObject({ version: 7 });
    expect(inspectGuid(NIL_UUID)?.nil).toBe(true);
    expect(inspectGuid('nope')).toBeNull();
  });
});
