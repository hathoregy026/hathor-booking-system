import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";

export function createSessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }

  return createHmac("sha256", secret)
    .update("hathor-admin-session")
    .digest("hex");
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  try {
    const expected = createSessionToken();
    const actual = Buffer.from(token);
    const reference = Buffer.from(expected);

    if (actual.length !== reference.length) return false;
    return timingSafeEqual(actual, reference);
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  try {
    const actual = Buffer.from(password);
    const reference = Buffer.from(expected);

    if (actual.length !== reference.length) return false;
    return timingSafeEqual(actual, reference);
  } catch {
    return false;
  }
}
