import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";

/**
 * Admin session tokens
 * ---------------------------------------------------------------------------
 * The previous scheme was HMAC(ADMIN_PASSWORD, "hathor-admin-session") — a
 * CONSTANT. Every login produced the same cookie value, so tokens never
 * expired, could not be revoked, and a single leaked cookie granted admin
 * access forever unless the password itself was rotated.
 *
 * Tokens are now signed and self-describing:
 *
 *     v1.<base64url(payload)>.<base64url(hmac-sha256)>
 *
 * payload = { e: epoch, i: issuedAt, x: expiresAt, j: sessionId }
 *
 *   · x  — hard expiry, so a stale cookie stops working on its own
 *   · j  — 16 random bytes, so every login is a distinct session
 *   · e  — a revocation epoch read from ADMIN_SESSION_EPOCH. Bump that env var
 *          to invalidate every outstanding session at once, WITHOUT having to
 *          change the admin password.
 *
 * Signing key is ADMIN_SESSION_SECRET, falling back to ADMIN_PASSWORD so the
 * app keeps working before the new variable is set. Set a dedicated secret in
 * production: rotating the password should not be the only kill switch.
 *
 * The edge twin of this file (lib/admin-auth-edge.ts) verifies the identical
 * format with WebCrypto for use in middleware. Any change here must be
 * mirrored there.
 */

export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const TOKEN_VERSION = "v1";

type SessionPayload = {
  e: string;
  i: number;
  x: number;
  j: string;
};

function sessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET / ADMIN_PASSWORD is not configured");
  }
  return secret;
}

function sessionEpoch(): string {
  return process.env.ADMIN_SESSION_EPOCH?.trim() || "1";
}

function sign(data: string): string {
  return createHmac("sha256", sessionSecret()).update(data).digest("base64url");
}

export function createSessionToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    e: sessionEpoch(),
    i: now,
    x: now + ADMIN_SESSION_TTL_SECONDS,
    j: randomBytes(16).toString("hex"),
  };

  const body = `${TOKEN_VERSION}.${Buffer.from(
    JSON.stringify(payload),
    "utf8",
  ).toString("base64url")}`;

  return `${body}.${sign(body)}`;
}

/** Constant-time string compare that does not leak length via early return. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  // Hash to a fixed width first so differing lengths are still compared in
  // constant time (timingSafeEqual throws on a length mismatch).
  const leftHash = createHmac("sha256", "cmp").update(left).digest();
  const rightHash = createHmac("sha256", "cmp").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [version, payloadPart, signaturePart] = parts;
    if (version !== TOKEN_VERSION) return false;

    const body = `${version}.${payloadPart}`;
    if (!safeEqual(sign(body), signaturePart!)) return false;

    const payload = JSON.parse(
      Buffer.from(payloadPart!, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    // Revoked by an epoch bump?
    if (payload.e !== sessionEpoch()) return false;

    // Expired?
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.x !== "number" || payload.x <= now) return false;

    return true;
  } catch {
    return false;
  }
}

/** Seconds of life left on a token, or 0 when it is invalid/expired. */
export function sessionSecondsRemaining(token: string | undefined): number {
  if (!verifySessionToken(token)) return 0;
  try {
    const payloadPart = token!.split(".")[1]!;
    const payload = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, (payload.x ?? 0) - now);
  } catch {
    return 0;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  // Hashing both sides first means the comparison no longer reveals the
  // configured password's length through an early return.
  return safeEqual(password, expected);
}
