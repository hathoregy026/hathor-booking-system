import { createHmac, timingSafeEqual } from "crypto";

function getHoldSigningSecret(): string {
  const secret =
    process.env.BOOKING_HOLD_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim();

  if (!secret) {
    throw new Error(
      "BOOKING_HOLD_SECRET, CRON_SECRET, or ADMIN_PASSWORD must be configured",
    );
  }

  return secret;
}

/** HMAC-signed token proving the caller created the hold. Format: bookingId:expMs:signature */
export function createHoldToken(bookingId: string, expiresAt: Date): string {
  const expMs = String(expiresAt.getTime());
  const signature = createHmac("sha256", getHoldSigningSecret())
    .update(`${bookingId}:${expMs}`)
    .digest("hex");

  return `${bookingId}:${expMs}:${signature}`;
}

export function verifyHoldToken(
  bookingId: string,
  token: string | undefined,
): boolean {
  if (!token?.trim()) return false;

  const parts = token.trim().split(":");
  if (parts.length !== 3) return false;

  const [tokenBookingId, expMs, providedSignature] = parts;

  if (tokenBookingId !== bookingId) return false;

  const expiresAtMs = Number(expMs);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    return false;
  }

  try {
    const expectedSignature = createHmac("sha256", getHoldSigningSecret())
      .update(`${tokenBookingId}:${expMs}`)
      .digest("hex");

    const actual = Buffer.from(providedSignature);
    const expected = Buffer.from(expectedSignature);

    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export class UnauthorizedBookingError extends Error {
  constructor(message = "Invalid or missing hold authorization") {
    super(message);
    this.name = "UnauthorizedBookingError";
  }
}
