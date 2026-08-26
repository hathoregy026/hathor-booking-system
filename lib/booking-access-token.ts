import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_VERSION = "v1";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 400;

type BookingAccessPayload = {
  b: string;
  x: number;
};

function accessSecret(): string {
  const secret =
    process.env.BOOKING_ACCESS_SECRET?.trim() ||
    process.env.BOOKING_HOLD_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim();

  if (!secret) {
    throw new Error("BOOKING_ACCESS_SECRET or another server signing secret is required");
  }
  return secret;
}

/** Fail before confirming a booking if its private lookup token cannot be signed. */
export function assertBookingAccessTokenConfiguration(): void {
  accessSecret();
}

function sign(value: string): string {
  return createHmac("sha256", accessSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createBookingAccessToken(bookingId: string): string {
  const payload: BookingAccessPayload = {
    b: bookingId,
    x: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const body = `${TOKEN_VERSION}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
  return `${body}.${sign(body)}`;
}

export function verifyBookingAccessToken(
  bookingId: string,
  token: string | null | undefined,
): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== TOKEN_VERSION) return false;
    const body = `${parts[0]}.${parts[1]}`;
    if (!safeEqual(sign(body), parts[2]!)) return false;
    const payload = JSON.parse(
      Buffer.from(parts[1]!, "base64url").toString("utf8"),
    ) as Partial<BookingAccessPayload>;
    return (
      payload.b === bookingId &&
      typeof payload.x === "number" &&
      payload.x > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}
