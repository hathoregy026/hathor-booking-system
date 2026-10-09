/**
 * Edge-safe half of the dashboard sign-in (middleware runs on the edge runtime
 * and cannot reach the database).
 *
 * Cookie format, shared with lib/admin-auth-tokens.ts:
 *
 *     v2.<base64url(payload)>.<base64url(hmac-sha256)>
 *     payload = { k: kind, x: expiresAt, t: 32 random bytes }
 *
 * This file only answers "is this a well-formed, correctly signed, unexpired
 * token of the right kind?". That is a cheap first gate that keeps forged and
 * stale cookies away from every admin page. It does NOT prove the session is
 * still live: logout, revocation, idle timeout and disabled accounts are
 * checked against the database by lib/admin-server-auth.ts, which every admin
 * API route and the panel layout call. Never treat a `true` from here as
 * authorisation on its own.
 */

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/*
 * `__Host-` cookies must be Secure, Path=/ and host-only, so the browser
 * refuses one planted by a sibling subdomain or set over plain HTTP. Local
 * `next dev` serves plain HTTP, where Safari would drop such a cookie, so dev
 * uses an unprefixed name instead.
 */
export const ADMIN_SESSION_COOKIE = IS_PRODUCTION
  ? "__Host-hathor_admin_session"
  : "hathor_admin_session";

/** Short-lived cookie that only carries a sign-in through the code step. */
export const ADMIN_CHALLENGE_COOKIE = IS_PRODUCTION
  ? "__Host-hathor_admin_challenge"
  : "hathor_admin_challenge";

export const ADMIN_TOKEN_VERSION = "v2";
export const ADMIN_TOKEN_SIGNING_CONTEXT = "hathor-admin-token";
export const ADMIN_SESSION_SECRET_MIN_LENGTH = 32;

/** `s` is a signed-in session, `c` is a half-finished sign-in. */
export type AdminTokenKind = "s" | "c";

export function adminSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < ADMIN_SESSION_SECRET_MIN_LENGTH) return null;
  return secret;
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const suffix = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + suffix);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${ADMIN_TOKEN_SIGNING_CONTEXT}.${data}`),
  );
  return toBase64Url(signature);
}

/** Compare without an early return on length. */
function constantTimeEqual(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

/**
 * Signature, kind and expiry check only — see the file comment. Fails closed
 * when ADMIN_SESSION_SECRET is missing or too short.
 */
export async function hasSignedAdminToken(
  token: string | undefined,
  kind: AdminTokenKind = "s",
): Promise<boolean> {
  const secret = adminSessionSecret();
  if (!token || !secret || token.length > 512) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [version, payloadPart, signaturePart] = parts;
    if (version !== ADMIN_TOKEN_VERSION) return false;

    const expected = await sign(`${version}.${payloadPart}`, secret);
    if (!constantTimeEqual(expected, signaturePart!)) return false;

    const payload = JSON.parse(fromBase64Url(payloadPart!)) as {
      k?: unknown;
      x?: unknown;
    };
    if (payload.k !== kind) return false;

    const now = Math.floor(Date.now() / 1000);
    return typeof payload.x === "number" && payload.x > now;
  } catch {
    return false;
  }
}
