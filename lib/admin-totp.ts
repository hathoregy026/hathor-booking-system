import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/*
 * Time-based one-time passwords (RFC 6238 over RFC 4226 HOTP), the format
 * every authenticator app understands: HMAC-SHA1, 6 digits, 30-second steps.
 * Verified against the RFC test vectors in scripts/verify-admin-auth.ts.
 */

export const TOTP_PERIOD_SECONDS = 30;
export const TOTP_DIGITS = 6;
/** Accept one step either side of now to absorb phone clock drift. */
const TOTP_WINDOW_STEPS = 1;

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[\s=-]/g, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error("Invalid base32 secret");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

/** 160-bit secret, the length RFC 4226 recommends for HMAC-SHA1. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpStep(atMs = Date.now()): number {
  return Math.floor(atMs / 1000 / TOTP_PERIOD_SECONDS);
}

export function hotp(key: Buffer, counter: number, digits = TOTP_DIGITS): string {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(message).digest();
  const offset = digest[digest.length - 1]! & 0x0f;
  const binary =
    ((digest[offset]! & 0x7f) << 24) |
    (digest[offset + 1]! << 16) |
    (digest[offset + 2]! << 8) |
    digest[offset + 3]!;
  return String(binary % 10 ** digits).padStart(digits, "0");
}

/**
 * Returns the matching time step, or null. Every candidate in the window is
 * checked with a constant-time compare, so response timing does not reveal
 * which step (if any) matched. Callers must reject a step that is not newer
 * than the last one accepted for the account (replay protection).
 */
export function verifyTotp(
  secretBase32: string,
  code: string,
  atMs = Date.now(),
): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const key = base32Decode(secretBase32);
  const current = totpStep(atMs);
  const supplied = Buffer.from(code, "utf8");
  let matched: number | null = null;

  for (let drift = -TOTP_WINDOW_STEPS; drift <= TOTP_WINDOW_STEPS; drift += 1) {
    const step = current + drift;
    const expected = Buffer.from(hotp(key, step), "utf8");
    if (timingSafeEqual(expected, supplied) && matched === null) {
      matched = step;
    }
  }
  return matched;
}

export const TOTP_ISSUER = "Hathor Dashboard";

/** Key URI understood by Google Authenticator, 1Password, Authy, etc. */
export function totpKeyUri(secretBase32: string, accountName: string): string {
  const label = `${encodeURIComponent(TOTP_ISSUER)}:${encodeURIComponent(accountName)}`;
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer: TOTP_ISSUER,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Groups of four make the manual-entry key easier to type. */
export function formatSecretForDisplay(secretBase32: string): string {
  return secretBase32.replace(/(.{4})/g, "$1 ").trim();
}
