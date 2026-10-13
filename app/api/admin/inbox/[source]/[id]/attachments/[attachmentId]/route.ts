import { allowedMailboxIds } from "@/lib/admin-mailbox-access";
import { adminApiGuard } from "@/lib/admin-server-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { resendApiRequest } from "@/lib/resend-inbound";
import type { BookingAttachment } from "@/lib/booking-message-types";
import { attachmentDownloadUrl, privateEmailAttachmentDownloadUrl } from "@/lib/mail-attachments";

export async function GET(request: NextRequest, context: { params: Promise<{ source: string; id: string; attachmentId: string }> }) {
  const denied = await adminApiGuard("inbox.view");
  if (denied) return denied;
  try {
    const identity = await assertInboxAdmin(request);
    const { source, id, attachmentId } = z.object({ source: z.enum(["general", "booking"]), id: z.uuid(), attachmentId: z.uuid() }).parse(await context.params);
    const table = source === "booking" ? '"BookingMessage"' : '"InboxMessage"';
    const originalMailbox = source === "booking" ? "'reservations'" : 'm."mailboxId"';
    const [message] = await bookingQuery<{ direction: string; resendEmailId: string; bookingId: string | null; attachments: BookingAttachment[] }>(`SELECT direction, "resendEmailId", attachments, ${source === "booking" ? '"bookingId"' : 'NULL::text AS "bookingId"'} FROM ${table} m WHERE id = $1 AND (direction = 'OUTBOUND' OR folder = 'inbox')
      AND COALESCE((SELECT p."mailboxId" FROM "DashboardEmailPlacement" p WHERE p.source = $3 AND p."messageId" = m.id), ${originalMailbox}) = ANY($2::text[])
      AND NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = $3 AND d."messageId" = m.id)`, [id, allowedMailboxIds(identity), source]);
    const attachment = message?.attachments.find(file => file.id === attachmentId);
    if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404, headers: inboxHeaders });
    if (message.direction === "OUTBOUND") {
      if (!attachment.storagePath) return NextResponse.json({ error: "Not found" }, { status: 404, headers: inboxHeaders });
      return NextResponse.redirect(await (message.bookingId ? attachmentDownloadUrl(message.bookingId, attachment.storagePath) : privateEmailAttachmentDownloadUrl(attachment.storagePath)), { status: 303, headers: inboxHeaders });
    }
    const emailId = z.uuid().parse(message.resendEmailId);
    const result = z.object({ download_url: z.url() }).parse(await resendApiRequest(`/emails/receiving/${emailId}/attachments/${attachmentId}`));
    const target = new URL(result.download_url);
    if (target.protocol !== "https:" || target.hostname !== "inbound-cdn.resend.com" || target.username || target.password) throw new Error("Invalid attachment destination");
    return NextResponse.redirect(target, { status: 303, headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
