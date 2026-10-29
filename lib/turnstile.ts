import { z } from "zod";
import { PublicRequestError } from "@/lib/public-api-security";
import type { TurnstileAction } from "@/lib/turnstile-actions";

const TEST_SECRET = "1x0000000000000000000000000000000AA";
const responseSchema = z.object({
  success: z.boolean(), hostname: z.string().max(253).optional(),
  action: z.string().max(32).optional(), challenge_ts: z.iso.datetime({ offset: true }).optional(),
});
export async function verifyInquiryTurnstile(
  request: Request, token: string | undefined, type: "contact" | "charter",
  fetchVerification: typeof fetch = fetch,
): Promise<void> {
  return verifyTurnstile(request, token, `${type}_inquiry`, fetchVerification);
}

export async function verifyTurnstile(
  request: Request, token: string | undefined, action: TurnstileAction,
  fetchVerification: typeof fetch = fetch,
): Promise<void> {
  const hostname = new URL(request.url).hostname.toLowerCase();
  const local = process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim() || (local ? TEST_SECRET : "");
  const allowed = (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  if (!secret || (!local && (!allowed.includes(hostname) || /^[123]x0+AA$/.test(secret)))) {
    throw new PublicRequestError("Security verification is unavailable. Please contact our reservations team directly.", 503);
  }
  if (!token || token.length > 2048) throw new PublicRequestError("Please complete the security check and try again.", 400);
  let result: z.infer<typeof responseSchema>;
  try {
    const response = await fetchVerification("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(8000), redirect: "error", cache: "no-store",
    });
    if (!response.ok || Number(response.headers.get("content-length")) > 16384) throw new Error();
    // This is a fixed, trusted verification destination. Bound its response too.
    const reader = response.body?.getReader();
    if (!reader) throw new Error();
    const chunks: Uint8Array[] = []; let size = 0;
    try {
      while (true) {
        const part = await reader.read(); if (part.done) break;
        size += part.value.length;
        if (size > 16384) { await reader.cancel(); throw new Error(); }
        chunks.push(part.value);
      }
    } finally { reader.releaseLock(); }
    result = responseSchema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch { throw new PublicRequestError("The security check is temporarily unavailable. Please try again.", 503); }
  const test = local && secret === TEST_SECRET;
  const age = result.challenge_ts ? Date.now() - Date.parse(result.challenge_ts) : Infinity;
  if (!result.success || (!test && (result.hostname?.toLowerCase() !== hostname
    || result.action !== action || age < -60000 || age > 300000))) {
    throw new PublicRequestError("The security check expired or could not be verified. Please try again.", 400);
  }
}
