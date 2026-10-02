import { NextRequest } from "next/server";
import { z } from "zod";
import { inboxIdentitySchema } from "@/lib/dashboard-inbox";
import { assertInboxAdmin } from "@/lib/inbox-api";
import { buildEmailHtmlDocument, emailFrameHeaders, receivedEmailHtmlDocument } from "@/lib/email-html-view";
import { PublicRequestError, RateLimitExceededError } from "@/lib/public-api-security";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest, context: { params: Promise<{ source: string; id: string }> }) {
  let images = false;
  try {
    await assertInboxAdmin(request);
    const { source, id } = inboxIdentitySchema.parse(await context.params);
    const options = z.object({ images: z.enum(["blocked", "load"]).default("blocked") }).strict().parse(Object.fromEntries(request.nextUrl.searchParams));
    images = options.images === "load";
    return new Response(await receivedEmailHtmlDocument(source, id, images), { headers: emailFrameHeaders(images) });
  } catch (error) {
    const status = error instanceof PublicRequestError ? error.status : error instanceof RateLimitExceededError ? 429 : error instanceof z.ZodError ? 400 : 503;
    const message = error instanceof PublicRequestError ? error.message : "Formatted email is unavailable. Please use the text view or try again.";
    if (status === 503) console.error("[email-view] formatted email unavailable");
    const headers = emailFrameHeaders(false);
    if (error instanceof RateLimitExceededError) headers["Retry-After"] = String(error.retryAfterSeconds);
    return new Response(buildEmailHtmlDocument(`<p>${message}</p>`), { status, headers });
  }
}
