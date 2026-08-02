import { createHash, randomBytes, timingSafeEqual } from "crypto";

/** Generate a URL-safe random token (raw — return to client once). */
export function generateRawToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** SHA-256 hex digest for storing tokens at rest. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Timing-safe equality for hex digests or utf8 strings of equal length. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function hashTokenMatches(rawToken: string, storedHash: string): boolean {
  return safeEqual(hashToken(rawToken), storedHash);
}
