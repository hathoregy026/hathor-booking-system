import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { emailMailbox } from "@/lib/email-mailboxes";
import { mailFolderSchema } from "@/lib/mail-screening";

const inquiryInboxSchema = z.object({
  id: z.uuid(),
  type: z.enum(["contact", "charter"]),
  name: z.string().trim().min(1).max(120).refine(value => !/[\u0000-\u001f\u007f]/.test(value)),
  email: z.email().max(254).transform(value => value.toLowerCase()),
  subject: z.string().min(1).max(500).refine(value => !/[\u0000-\u001f\u007f]/.test(value)),
  text: z.string().min(1).max(20000),
  html: z.string().min(1).max(512 * 1024),
  createdAt: z.date(),
  folder: mailFolderSchema.optional(),
  screeningReasons: z.array(z.string().max(64)).max(20).optional(),
}).strict();

export type InquiryInboxMessage = z.infer<typeof inquiryInboxSchema>;

export async function recordInquiryInbox(input: InquiryInboxMessage, query = bookingQuery): Promise<void> {
  const message = inquiryInboxSchema.parse(input);
  const mailbox = emailMailbox(message.type === "contact" ? "info" : "reservations");
  await query(`INSERT INTO "InboxMessage" (id, "mailboxId", direction, status, sender, recipient, "correspondentName", subject, "bodyText", "bodyHtml", "createdAt", origin, folder, "screeningReasons")
    VALUES ($1, $2, 'INBOUND', 'RECEIVED', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb) ON CONFLICT (id) DO NOTHING`,
  [message.id, mailbox.id, message.email, mailbox.address, message.name, message.subject, message.text, message.html, message.createdAt,
    message.type === "contact" ? "CONTACT_FORM" : "CHARTER_FORM", message.folder ?? "inbox", JSON.stringify(message.screeningReasons ?? [])]);
}
