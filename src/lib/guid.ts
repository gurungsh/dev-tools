export interface GuidOptions {
  uppercase: boolean;
  hyphens: boolean;
  braces: boolean;
  quotes: boolean;
}

export type GuidVersion = 'v4' | 'v7' | 'nil';

function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}

function toHex(bytes: Uint8Array): string {
  const h = Array.from(bytes, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function uuidV4(): string {
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return toHex(b);
}

/** Time-ordered UUID (RFC 9562 v7): 48-bit unix ms timestamp + random. */
export function uuidV7(now: number = Date.now()): string {
  const b = randomBytes(16);
  let t = BigInt(now);
  for (let i = 5; i >= 0; i--) {
    b[i] = Number(t & 0xffn);
    t >>= 8n;
  }
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  return toHex(b);
}

export const NIL_UUID = '00000000-0000-0000-0000-000000000000';

export function formatGuid(guid: string, o: GuidOptions): string {
  let s = o.hyphens ? guid : guid.replace(/-/g, '');
  s = o.uppercase ? s.toUpperCase() : s.toLowerCase();
  if (o.braces) s = `{${s}}`;
  if (o.quotes) s = `"${s}"`;
  return s;
}

export function generateGuids(count: number, version: GuidVersion, options: GuidOptions): string[] {
  const make = version === 'v7' ? () => uuidV7() : version === 'nil' ? () => NIL_UUID : uuidV4;
  return Array.from({ length: count }, () => formatGuid(make(), options));
}

const UUID_RE = /^\{?"?([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})"?\}?$/i;

/** Returns version info if valid, otherwise null. */
export function inspectGuid(input: string): { version: number | null; variantRfc: boolean; nil: boolean } | null {
  const m = UUID_RE.exec(input.trim());
  if (!m) return null;
  const hex = m.slice(1).join('');
  const nil = /^0+$/.test(hex);
  const version = nil ? null : parseInt(hex[12], 16);
  const variantRfc = (parseInt(hex[16], 16) & 0xc) >= 0x8;
  return { version, variantRfc, nil };
}
