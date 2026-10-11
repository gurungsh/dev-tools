export function encodeBase64(text: string, urlSafe = false): string {
  const bin = String.fromCharCode(...new TextEncoder().encode(text));
  const b64 = btoa(bin);
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
}

/** Accepts standard and URL-safe alphabets, with or without padding. Throws if the input is not valid base64 or not UTF-8 text. */
export function decodeBase64(b64: string): string {
  const s = b64.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(s.padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
