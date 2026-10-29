import { NextResponse } from "next/server";
import { EmailBodyTooLargeError, readLimitedEmailBody, receivedEmailEventSchema, verifyResendWebhook } from "@/lib/resend-inbound";
import { processReceivedDashboardEmail } from "@/lib/dashboard-inbound";
import { enforcePublicRateLimit, RateLimitExceededError } from "@/lib/public-api-security";
import { inboundBookingEmailEnabled } from "@/lib/booking-email-routing";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!inboundBookingEmailEnabled()) return NextResponse.json({ error: "Receiving is not configured" }, { status: 503, headers });
  let event: unknown;
  try {
    const payload = await readLimitedEmailBody(request, 64 * 1024);
    event = verifyResendWebhook(payload, request.headers, process.env.RESEND_WEBHOOK_SECRET!.trim());
  } catch (error) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: error instanceof EmailBodyTooLargeError ? 413 : 400, headers });
  }
  if ((event as { type?: string }).type !== "email.received") return NextResponse.json({ received: true }, { headers });
  const parsed = receivedEmailEventSchema.safeParse(event);
  if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400, headers });
  try {
    await enforcePublicRateLimit({ request, scope: "booking-email-webhook", limit: 120, windowMs: 60000 });
    await processReceivedDashboardEmail(parsed.data);
    return NextResponse.json({ received: true }, { headers });
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json({ error: "Please retry later" }, { status: 429, headers: { ...headers, "Retry-After": String(error.retryAfterSeconds) } });
    }
    console.error("[booking-inbound] processing failed; webhook retry required");
    return NextResponse.json({ error: "Unable to process email. Please retry." }, { status: 503, headers });
  }
}
