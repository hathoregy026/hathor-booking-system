import { randomUUID } from "node:crypto";
import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { bookingReplyToken, mailboxAddress } from "@/lib/booking-email-routing";
import { EMAIL_MAILBOXES } from "@/lib/email-mailboxes";
import { mailboxDisplayName } from "@/lib/email-correspondent";
import { incomingBodyText, incomingEmailSchema, processReceivedBookingEmail, receivedEmailEventSchema, resendApiRequest } from "@/lib/resend-inbound";

export async function processReceivedDashboardEmail(
  event: z.infer<typeof receivedEmailEventSchema>,
  dependencies: { query?: typeof bookingQuery; request?: typeof resendApiRequest } = {},
): Promise<void> {
  if (bookingReplyToken(event.data.to)) {
    await processReceivedBookingEmail(event, dependencies);
  }
  const destinations = new Set(event.data.to.map(mailboxAddress));
  const mailboxes = EMAIL_MAILBOXES.filter(mailbox => destinations.has(mailbox.forwardingAddress));
  if (!mailboxes.length) return;
  const query = dependencies.query ?? bookingQuery;
  const request = dependencies.request ?? resendApiRequest;
  const existing = await query<{ mailboxId: string }>(`SELECT "mailboxId" FROM "InboxMessage" WHERE "resendEmailId" = $1`, [event.data.email_id]);
  const pending = mailboxes.filter(mailbox => !existing.some(row => row.mailboxId === mailbox.id));
  if (!pending.length) return;
  const email = incomingEmailSchema.parse(await request(`/emails/receiving/${event.data.email_id}?html_format=cid`));
  const recipients = email.to.map(mailboxAddress).filter((address): address is string => Boolean(address));
  if (email.id !== event.data.email_id) {
    throw new Error("Incoming email routing mismatch");
  }
  const sender = mailboxAddress(email.from);
  if (!sender) return;
  const attachments = email.attachments.map(file => ({ id: file.id, filename: file.filename || "Attachment", contentType: file.content_type }));
  for (const mailbox of pending) await query(
    `INSERT INTO "InboxMessage" (id, "resendEmailId", sender, recipient, subject, "bodyText", attachments, "createdAt", "correspondentName", "mailboxId")
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10) ON CONFLICT ("resendEmailId", "mailboxId") DO NOTHING`,
    [randomUUID(), email.id, sender, recipients.join(", "), email.subject.replace(/[\r\n\u0000]/g, " "),
      incomingBodyText(email.text, email.html), JSON.stringify(attachments), new Date(email.created_at), mailboxDisplayName(email.from), mailbox.id],
  );
}
