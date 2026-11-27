import { after, NextResponse } from "next/server";
import { contactTapSchema, recordContactTap } from "@/lib/contact-taps";
import {
  assertTrustedPublicJsonRequest,
  enforcePublicRateLimit,
  PublicRequestError,
  RateLimitExceededError,
  readPublicJsonBody,
} from "@/lib/public-api-security";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = { "Cache-Control": "no-store" };

/* Saves one WhatsApp, phone or email tap. Always quick: the save runs after the reply. */
export async function POST(request: Request) {
  try {
    assertTrustedPublicJsonRequest(request);
    await enforcePublicRateLimit({
      request,
      scope: "contact-tap",
      limit: 20,
      windowMs: 10 * 60_000,
    });
    const parsed = contactTapSchema.safeParse(await readPublicJsonBody(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tap" }, { status: 400, headers: NO_STORE });
    }
    after(() => recordContactTap(parsed.data));
    return new NextResponse(null, { status: 204, headers: NO_STORE });
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return new NextResponse(null, {
        status: 429,
        headers: { ...NO_STORE, "Retry-After": String(error.retryAfterSeconds) },
      });
    }
    if (error instanceof PublicRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: NO_STORE });
    }
    console.error("[contact-tap] request failed");
    return new NextResponse(null, { status: 503, headers: NO_STORE });
  }
}
