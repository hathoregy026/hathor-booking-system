import { createHash } from "node:crypto";
import { render } from "@react-email/render";
import { z } from "zod";
import PrivateMessageEmail from "@/emails/PrivateMessage";
import { bookingQuery } from "@/lib/booking-database";
import { getEmailTemplateForSend } from "@/lib/email-template-send";
import { buildEmailSendTheme } from "@/lib/email-templates";
import { PublicRequestError } from "@/lib/public-api-security";
import { getResendFromAddress } from "@/lib/resend-config";
import { mailboxAddress } from "@/lib/booking-email-routing";
import { mailboxDisplayName } from "@/lib/email-correspondent";
import { emailMailbox, mailboxIdSchema } from "@/lib/email-mailboxes";
import { fetchMailboxHandlers } from "@/lib/email-mailbox-settings";
import { EmailBodyTooLargeError, readLimitedEmailBody } from "@/lib/resend-inbound";

export const PRIVATE_EMAIL_REPLY_TO = "reservations@hathorcruise.com";
const singleLine = z.string().trim().refine(value => !/[\u0000-\u001f\u007f]/.test(value), "Use a single line without control characters");
export const privateEmailContentSchema = z.object({
  mailboxId: mailboxIdSchema.default("reservations"),
  to: z.email().max(254).transform(value => value.toLowerCase()),
  recipientName: singleLine.max(160).default(""),
  subject: singleLine.min(1).max(180),
  message: z.string().trim().min(1).max(6000).refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value), "Invalid message characters"),
}).strict();
export const privateEmailSendSchema = privateEmailContentSchema.extend({ requestId: z.uuid() });
export type PrivateEmailContent = z.infer<typeof privateEmailContentSchema>;
export type PrivateEmailResult = { id: string; status: "SENT" | "PENDING" | "FAILED" };

type DeliveryPayload = { from: string; to: string[]; subject: string; html: string; text: string; reply_to: string };
type StoredEmail = { id: string; mailboxId: string; status: PrivateEmailResult["status"]; sender: string; recipient: string; subject: string; bodyText: string; bodyHtml: string; correspondentName: string | null; requestFingerprint: string; recordedBySession: string; createdAt: Date };

export class PrivateEmailDeliveryError extends Error {
  constructor(readonly definitive: boolean) { super("Email delivery could not be confirmed"); }
}

export async function readPrivateEmailJson(request: Request): Promise<unknown> {
  try { return JSON.parse(await readLimitedEmailBody(request, 32 * 1024)); }
  catch (error) { throw new PublicRequestError(error instanceof EmailBodyTooLargeError ? "Request body is too large" : "Invalid request body", error instanceof EmailBodyTooLargeError ? 413 : 400); }
}

export async function renderPrivateEmail(input: PrivateEmailContent, handlerName = ""): Promise<string> {
  const template = await getEmailTemplateForSend("BookingMessage");
  const mailbox = emailMailbox(input.mailboxId);
  return render(PrivateMessageEmail({ recipientName: input.recipientName, subject: input.subject, message: input.message,
    contactEmail: mailbox.address, signatureName: handlerName || `The Hathor ${mailbox.label} team`, ...buildEmailSendTheme(template) }));
}

export async function deliverPrivateEmail(payload: DeliveryPayload, requestId: string): Promise<string> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new PrivateEmailDeliveryError(true);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `dashboard-private/${requestId}` },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(15000), redirect: "error", cache: "no-store",
  });
  if (!response.ok) throw new PrivateEmailDeliveryError(response.status >= 400 && response.status < 500 && ![408, 409, 429].includes(response.status));
  return z.object({ id: z.uuid() }).parse(JSON.parse(await readLimitedEmailBody(response, 64 * 1024))).id;
}

export async function sendPrivateEmail(input: z.infer<typeof privateEmailSendSchema>, sessionId: string, dependencies: {
  query?: typeof bookingQuery; render?: typeof renderPrivateEmail; deliver?: typeof deliverPrivateEmail;
} = {}): Promise<PrivateEmailResult> {
  const parsed = privateEmailSendSchema.parse(input);
  const query = dependencies.query ?? bookingQuery;
  const configured = getResendFromAddress();
  if (mailboxAddress(configured) !== PRIVATE_EMAIL_REPLY_TO || /[\r\n\u0000]/.test(configured)) throw new PublicRequestError("The Hathor sending address is not configured. Please contact your administrator.", 503);
  const mailbox = emailMailbox(parsed.mailboxId);
  const content = [parsed.to, parsed.recipientName, parsed.subject, parsed.message];
  const fingerprint = createHash("sha256").update(JSON.stringify(parsed.mailboxId === "reservations" ? content : [...content, parsed.mailboxId])).digest("hex");
  let [stored] = await query<StoredEmail>(`SELECT * FROM "InboxMessage" WHERE id = $1 AND direction = 'OUTBOUND'`, [parsed.requestId]);
  if (!stored) {
    const handlers = await fetchMailboxHandlers(query);
    const handlerName = handlers[parsed.mailboxId];
    const displayName = `Hathor ${mailbox.label}${handlerName ? ` · ${handlerName}` : ""}`.replace(/["\\]/g, "");
    const from = `"${displayName}" <${mailbox.address}>`;
    const html = await (dependencies.render ?? renderPrivateEmail)(parsed, handlerName);
    await query(`INSERT INTO "InboxMessage" (id, direction, status, sender, recipient, "correspondentName", subject, "bodyText", "bodyHtml", "requestFingerprint", "recordedBySession", "mailboxId")
      VALUES ($1, 'OUTBOUND', 'PENDING', $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
    [parsed.requestId, from, parsed.to, parsed.recipientName || null, parsed.subject, parsed.message, html, fingerprint, sessionId, parsed.mailboxId]);
    [stored] = await query<StoredEmail>(`SELECT * FROM "InboxMessage" WHERE id = $1 AND direction = 'OUTBOUND'`, [parsed.requestId]);
  }
  if (!stored || stored.requestFingerprint !== fingerprint || stored.recordedBySession !== sessionId) throw new PublicRequestError("This send request does not match the original message.", 409);
  if (stored.status !== "PENDING") return { id: stored.id, status: stored.status };
  const lease = await query(`UPDATE "InboxMessage" SET "sendLeaseUntil" = NOW() + INTERVAL '60 seconds'
    WHERE id = $1 AND status = 'PENDING' AND ("sendLeaseUntil" IS NULL OR "sendLeaseUntil" < NOW())
      AND "createdAt" > NOW() - INTERVAL '23 hours' RETURNING id`, [stored.id]);
  if (!lease.length) return { id: stored.id, status: "PENDING" };
  const senderName = mailboxDisplayName(stored.sender);
  const signatureName = senderName?.startsWith(`Hathor ${mailbox.label}`) ? senderName : "The Hathor team";
  const payload: DeliveryPayload = {
    from: stored.sender, to: [stored.recipient], subject: stored.subject, html: stored.bodyHtml, reply_to: mailbox.address,
    text: `${stored.correspondentName ? `Dear ${stored.correspondentName},` : "Hello,"}\n\n${stored.bodyText}\n\nWarm regards,\n${signatureName}\n${mailbox.address}\n+20 127 049 6896`,
  };
  let emailId: string;
  try { emailId = await (dependencies.deliver ?? deliverPrivateEmail)(payload, stored.id); }
  catch (error) {
    if (error instanceof PrivateEmailDeliveryError && error.definitive) {
      await query(`UPDATE "InboxMessage" SET status = 'FAILED', "sendLeaseUntil" = NULL WHERE id = $1 AND status = 'PENDING'`, [stored.id]);
      return { id: stored.id, status: "FAILED" };
    }
    console.warn("[private-email] delivery status unconfirmed; same request may be checked again");
    return { id: stored.id, status: "PENDING" };
  }
  try { await query(`UPDATE "InboxMessage" SET status = 'SENT', "resendEmailId" = $2, "sendLeaseUntil" = NULL WHERE id = $1`, [stored.id, emailId]); }
  catch { console.error("[private-email] provider accepted email; history update unavailable"); }
  return { id: stored.id, status: "SENT" };
}
