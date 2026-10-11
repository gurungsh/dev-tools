import { describe, expect, it } from 'vitest';
import { decodeJwt } from '../src/lib/jwt';

// header {"alg":"HS256","typ":"JWT"}, payload {"sub":"1234567890","name":"John Doe","iat":1516239022}
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('jwt', () => {
  it('decodes header and payload', () => {
    const d = decodeJwt(TOKEN);
    expect(d.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(d.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
  });
  it('accepts a Bearer prefix', () => {
    expect(decodeJwt(`Bearer ${TOKEN}`).signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  });
  it('rejects malformed tokens', () => {
    expect(() => decodeJwt('abc')).toThrow();
    expect(() => decodeJwt('a.b.c')).toThrow();
  });
});
