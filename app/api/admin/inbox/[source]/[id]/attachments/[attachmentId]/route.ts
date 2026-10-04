import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { resendApiRequest } from "@/lib/resend-inbound";
import type { BookingAttachment } from "@/lib/booking-message-types";
import { privateEmailAttachmentDownloadUrl } from "@/lib/mail-attachments";

export async function GET(request: NextRequest, context: { params: Promise<{ source: string; id: string; attachmentId: string }> }) {
  try {
    await assertInboxAdmin(request);
    const { id, attachmentId } = z.object({ source: z.literal("general"), id: z.uuid(), attachmentId: z.uuid() }).parse(await context.params);
    const [message] = await bookingQuery<{ direction: string; resendEmailId: string; attachments: BookingAttachment[] }>(`SELECT direction, "resendEmailId", attachments FROM "InboxMessage" m WHERE id = $1
      AND NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = 'general' AND d."messageId" = m.id)`, [id]);
    const attachment = message?.attachments.find(file => file.id === attachmentId);
    if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404, headers: inboxHeaders });
    if (message.direction === "OUTBOUND") {
      if (!attachment.storagePath) return NextResponse.json({ error: "Not found" }, { status: 404, headers: inboxHeaders });
      return NextResponse.redirect(await privateEmailAttachmentDownloadUrl(attachment.storagePath), { status: 303, headers: inboxHeaders });
    }
    const emailId = z.uuid().parse(message.resendEmailId);
    const result = z.object({ download_url: z.url() }).parse(await resendApiRequest(`/emails/receiving/${emailId}/attachments/${attachmentId}`));
    const target = new URL(result.download_url);
    if (target.protocol !== "https:" || target.hostname !== "inbound-cdn.resend.com" || target.username || target.password) throw new Error("Invalid attachment destination");
    return NextResponse.redirect(target, { status: 303, headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
