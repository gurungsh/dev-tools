import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64 } from '../src/lib/base64';

describe('base64', () => {
  it('encodes known values', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
    expect(encodeBase64('')).toBe('');
  });
  it('round-trips UTF-8', () => {
    expect(decodeBase64(encodeBase64('héllo ✓ 日本'))).toBe('héllo ✓ 日本');
  });
  it('URL-safe output drops padding and unsafe characters', () => {
    expect(encodeBase64('??>>', true)).toBe('Pz8-Pg');
    expect(encodeBase64('??>>')).toBe('Pz8+Pg==');
  });
  it('decodes either alphabet, padded or not, with whitespace', () => {
    expect(decodeBase64('Pz8-Pg')).toBe('??>>');
    expect(decodeBase64('Pz8+\nPg==')).toBe('??>>');
  });
  it('rejects invalid input', () => {
    expect(() => decodeBase64('!!!')).toThrow();
    expect(() => decodeBase64('/w==')).toThrow(); // 0xFF is not valid UTF-8
  });
});
