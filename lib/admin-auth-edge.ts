export const ADMIN_SESSION_COOKIE = "admin_session";

/**
 * Edge twin of lib/admin-auth.ts — verifies the same token format with
 * WebCrypto so middleware can run on the edge runtime.
 *
 *     v1.<base64url(payload)>.<base64url(hmac-sha256)>
 *     payload = { e: epoch, i: issuedAt, x: expiresAt, j: sessionId }
 *
 * Any change to the token format in lib/admin-auth.ts must be mirrored here,
 * or middleware will start rejecting freshly-issued cookies.
 */

const TOKEN_VERSION = "v1";

function sessionSecret(): string | null {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD ||
    null
  );
}

function sessionEpoch(): string {
  return process.env.ADMIN_SESSION_EPOCH?.trim() || "1";
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
    new TextEncoder().encode(data),
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

export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  const secret = sessionSecret();
  if (!token || !secret) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [version, payloadPart, signaturePart] = parts;
    if (version !== TOKEN_VERSION) return false;

    const expected = await sign(`${version}.${payloadPart}`, secret);
    if (!constantTimeEqual(expected, signaturePart!)) return false;

    const payload = JSON.parse(fromBase64Url(payloadPart!)) as {
      e?: string;
      x?: number;
    };

    if (payload.e !== sessionEpoch()) return false;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.x !== "number" || payload.x <= now) return false;

    return true;
  } catch {
    return false;
  }
}
