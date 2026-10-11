import { decodeBase64 } from './base64';

export interface DecodedJwt {
  header: unknown;
  payload: unknown;
  signature: string;
}

const decodePart = (part: string): unknown => JSON.parse(decodeBase64(part));

/** Decodes only; the signature is not verified. Throws on malformed tokens. */
export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().replace(/^Bearer\s+/i, '').split('.');
  if (parts.length !== 3) throw new Error('A JWT has three dot-separated parts.');
  try {
    return { header: decodePart(parts[0]), payload: decodePart(parts[1]), signature: parts[2] };
  } catch {
    throw new Error('Header or payload is not valid base64url-encoded JSON.');
  }
}
