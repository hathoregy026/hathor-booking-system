import { timingSafeEqual } from "crypto";

/**
 * Verifies `Authorization: Bearer <CRON_SECRET>` for scheduled maintenance routes.
 * Fails closed when CRON_SECRET is unset.
 */
export function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return false;

  try {
    const actual = Buffer.from(token);
    const expected = Buffer.from(secret);

    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function isCronSecretConfigured(): boolean {
  return Boolean(process.env.CRON_SECRET?.trim());
}
