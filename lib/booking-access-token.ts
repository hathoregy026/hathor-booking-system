import { createHmac, scryptSync, timingSafeEqual } from "crypto";

const TOKEN_VERSION = "v2";
const LEGACY_TOKEN_VERSION = "v1";
/*
 * This token is a bearer credential mailed straight to the guest (the
 * confirmation email's booking-status link) and returned to the browser, so
 * anyone who ever obtains a copy (a forwarded email, a shared inbox, a leaked
 * log line, browser history) can view/cancel that booking until it expires.
 * 400 days was far longer than any realistic booking-to-departure window;
 * 180 days comfortably covers bookings made well in advance while cutting
 * the exposure window from a leaked token by more than half.
 */
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 180;
/*
 * v1 tokens were signed with the raw base secret. They keep working for links
 * already mailed to guests until this date; guests with an older link can get
 * a fresh one from the email-verified booking lookup.
 */
const LEGACY_ACCEPTED_UNTIL_SECONDS = Date.UTC(2027, 3, 1) / 1000;

type BookingAccessPayload = {
  b: string;
  x: number;
};

function baseSecret(): string {
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

/*
 * Every anonymous hold hands its caller an HMAC of a known message. If the key
 * were the base secret itself, and the base secret fell back to the admin
 * password or admin session secret, each token would be an offline oracle for
 * cracking that secret at hash speed — no login rate limit involved — and
 * guest tokens would share a signing key with admin sessions. Deriving a
 * dedicated key through scrypt separates the two domains and makes every
 * offline guess cost a full memory-hard derivation.
 */
let derivedKey: { base: string; key: Buffer } | null = null;

function signingKey(): Buffer {
  const base = baseSecret();
  if (derivedKey?.base !== base) {
    derivedKey = {
      base,
      key: scryptSync(base, "hathor:booking-access-token:v2", 32, {
        N: 1 << 15,
        r: 8,
        p: 1,
        maxmem: 64 * 1024 * 1024,
      }),
    };
  }
  return derivedKey.key;
}

/** Fail before confirming a booking if its private lookup token cannot be signed. */
export function assertBookingAccessTokenConfiguration(): void {
  signingKey();
}

function sign(value: string): string {
  return createHmac("sha256", signingKey()).update(value).digest("base64url");
}

function signLegacy(value: string): string {
  return createHmac("sha256", baseSecret()).update(value).digest("base64url");
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
    if (parts.length !== 3) return false;
    const now = Math.floor(Date.now() / 1000);
    const body = `${parts[0]}.${parts[1]}`;

    if (parts[0] === TOKEN_VERSION) {
      if (!safeEqual(sign(body), parts[2]!)) return false;
    } else if (parts[0] === LEGACY_TOKEN_VERSION && now < LEGACY_ACCEPTED_UNTIL_SECONDS) {
      if (!safeEqual(signLegacy(body), parts[2]!)) return false;
    } else {
      return false;
    }

    const payload = JSON.parse(
      Buffer.from(parts[1]!, "base64url").toString("utf8"),
    ) as Partial<BookingAccessPayload>;
    return (
      payload.b === bookingId &&
      typeof payload.x === "number" &&
      payload.x > now
    );
  } catch {
    return false;
  }
}
