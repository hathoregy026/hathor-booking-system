import { randomUUID } from "node:crypto";
import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { bookingReplyToken, mailboxAddress } from "@/lib/booking-email-routing";
import { DASHBOARD_INBOX_ADDRESS } from "@/lib/inbox-types";
import { incomingBodyText, incomingEmailSchema, isAutomaticEmail, processReceivedBookingEmail, receivedEmailEventSchema, resendApiRequest } from "@/lib/resend-inbound";

export async function processReceivedDashboardEmail(
  event: z.infer<typeof receivedEmailEventSchema>,
  dependencies: { query?: typeof bookingQuery; request?: typeof resendApiRequest } = {},
): Promise<void> {
  if (bookingReplyToken(event.data.to)) {
    await processReceivedBookingEmail(event, dependencies);
    return;
  }
  if (!event.data.to.some(address => mailboxAddress(address) === DASHBOARD_INBOX_ADDRESS)) return;
  const query = dependencies.query ?? bookingQuery;
  const request = dependencies.request ?? resendApiRequest;
  const existing = await query<{ id: string }>(`SELECT id FROM "InboxMessage" WHERE "resendEmailId" = $1`, [event.data.email_id]);
  if (existing.length) return;
  const email = incomingEmailSchema.parse(await request(`/emails/receiving/${event.data.email_id}?html_format=cid`));
  const recipients = email.to.map(mailboxAddress).filter((address): address is string => Boolean(address));
  if (email.id !== event.data.email_id || !recipients.some(address => address === DASHBOARD_INBOX_ADDRESS || address === "reservations@hathorcruise.com")) {
    throw new Error("Incoming email routing mismatch");
  }
  if (isAutomaticEmail(email.headers)) return;
  const sender = mailboxAddress(email.from);
  if (!sender) return;
  const attachments = email.attachments.map(file => ({ id: file.id, filename: file.filename || "Attachment", contentType: file.content_type }));
  await query(
    `INSERT INTO "InboxMessage" (id, "resendEmailId", sender, recipient, subject, "bodyText", attachments, "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8) ON CONFLICT ("resendEmailId") DO NOTHING`,
    [randomUUID(), email.id, sender, recipients.join(", "), email.subject.replace(/[\r\n\u0000]/g, " "),
      incomingBodyText(email.text, email.html), JSON.stringify(attachments), new Date(email.created_at)],
  );
}
