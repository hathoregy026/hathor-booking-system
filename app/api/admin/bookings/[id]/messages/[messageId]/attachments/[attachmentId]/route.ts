import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { bookingQuery } from "@/lib/booking-database";
import { enforcePublicRateLimit } from "@/lib/public-api-security";
import { resendApiRequest } from "@/lib/resend-inbound";
import type { BookingAttachment } from "@/lib/booking-message-types";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string; messageId: string; attachmentId: string }> }) {
  const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
  if (!verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }
  try {
    await enforcePublicRateLimit({ request, scope: "booking-attachment-read", limit: 30, windowMs: 60000 });
    const params = z.object({ id: z.string().min(1).max(128), messageId: z.uuid(), attachmentId: z.uuid() }).parse(await context.params);
    const [message] = await bookingQuery<{ resendEmailId: string; attachments: BookingAttachment[] }>(
      `SELECT "resendEmailId", attachments FROM "BookingMessage"
       WHERE id = $1 AND "bookingId" = $2 AND direction = 'INBOUND'`, [params.messageId, params.id]);
    if (!message || !message.attachments.some(attachment => attachment.id === params.attachmentId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers });
    }
    const emailId = z.uuid().parse(message.resendEmailId);
    const result = z.object({ download_url: z.url() }).parse(await resendApiRequest(`/emails/receiving/${emailId}/attachments/${params.attachmentId}`));
    const target = new URL(result.download_url);
    if (target.protocol !== "https:" || target.hostname !== "inbound-cdn.resend.com" || target.username || target.password) {
      throw new Error("Invalid attachment destination");
    }
    return NextResponse.redirect(target, { status: 303, headers });
  } catch {
    console.error("[booking-inbound] attachment could not be opened");
    return NextResponse.json({ error: "Attachment is unavailable. Please try again or check Resend Receiving." }, { status: 503, headers });
  }
}
