// Cloudflare's documented always-pass test widget. Development only; no
// production or hosted-preview build may fall back to a testing credential.
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
export function publicTurnstileSiteKey(): string {
  const configured = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  if (process.env.NODE_ENV !== "development" && /^[123]x0+(AA|AB|BB|FF)$/.test(configured)) return "";
  return configured || (process.env.NODE_ENV === "development" ? TURNSTILE_TEST_SITE_KEY : "");
}
