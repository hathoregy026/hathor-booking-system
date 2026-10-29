import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { resendApiRequest } from "@/lib/resend-inbound";
import { incomingAttachmentResponse } from "@/lib/incoming-attachment-download";
import { incomingAttachmentType, INCOMING_ATTACHMENT_BLOCKED_MESSAGE } from "@/lib/incoming-attachment-policy";
import { PublicRequestError } from "@/lib/public-api-security";

export const attachmentTransferIdentitySchema = z.object({
  source: z.enum(["general", "booking"]), id: z.uuid(), attachmentId: z.uuid(),
}).strict();
export const attachmentRemovalSchema = z.object({
  receiptId: z.uuid(), saved: z.literal(true), saveMethod: z.enum(["file-system", "employee-confirmation"]),
}).strict();
type Identity = z.infer<typeof attachmentTransferIdentitySchema>;
export type AttachmentTransferAccess = { sessionId: string; mailboxIds: readonly string[] };
function mailboxBoundary(source: Identity["source"], parameter: string): string {
  const kind = source === "booking" ? "booking" : "general";
  const original = kind === "booking" ? "'reservations'" : 'message."mailboxId"';
  return ` AND COALESCE((SELECT p."mailboxId" FROM "DashboardEmailPlacement" p
    WHERE p.source = '${kind}' AND p."messageId" = message.id), ${original}) = ANY(${parameter}::text[])
    AND NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = '${kind}' AND d."messageId" = message.id)`;
}
type Dependencies = { query?: typeof bookingQuery; request?: typeof resendApiRequest; download?: typeof incomingAttachmentResponse };

// Identifiers below are fixed application choices, never request-supplied SQL.
function messageLocation(source: Identity["source"]) {
  return source === "booking"
    ? { table: '"BookingMessage"', direction: " AND message.direction = 'INBOUND'" }
    : { table: '"InboxMessage"', direction: " AND message.direction = 'INBOUND'" };
}
function sessionHash(sessionId: string): string {
  return createHash("sha256").update(sessionId).digest("hex");
}

/** A receipt proves preparation of a checked file, not that it reached a disk. */
export async function prepareAttachmentTransfer(identity: Identity, access: AttachmentTransferAccess, dependencies: Dependencies = {}): Promise<Response> {
  const query = dependencies.query ?? bookingQuery;
  const { table, direction } = messageLocation(identity.source);
  const [message] = await query<{ resendEmailId: string; attachments: Array<{ id: string; filename: string; contentType: string }> }>(
    `SELECT message."resendEmailId", message.attachments FROM ${table} AS message
     WHERE message.id = $1 AND message.folder = 'inbox'${direction}${mailboxBoundary(identity.source, '$2')}`, [identity.id, access.mailboxIds]);
  const file = message?.attachments.find(attachment => attachment.id === identity.attachmentId);
  if (!file) throw new PublicRequestError("Attachment is no longer available in the dashboard.", 404);
  if (!incomingAttachmentType(file.filename, file.contentType)) throw new PublicRequestError(INCOMING_ATTACHMENT_BLOCKED_MESSAGE, 403);
  const emailId = z.uuid().parse(message.resendEmailId);
  const provider = z.object({ id: z.uuid(), download_url: z.url() }).parse(
    await (dependencies.request ?? resendApiRequest)(`/emails/receiving/${emailId}/attachments/${identity.attachmentId}`));
  if (provider.id !== identity.attachmentId) throw new Error("Attachment identity mismatch");
  const response = await (dependencies.download ?? incomingAttachmentResponse)(provider.download_url, file);

  // Recheck after fetching/rebuilding: a concurrent removal must not issue a new receipt.
  // Cleanup is bounded; completed rows contain only opaque audit identifiers.
  const receiptId = randomUUID();
  const [receipt] = await query<{ id: string }>(
    `WITH expired AS (
       DELETE FROM "MailAttachmentDownload" WHERE id IN (
         SELECT id FROM "MailAttachmentDownload" WHERE
           ("removedAt" IS NULL AND "expiresAt" < NOW()) OR "removedAt" < NOW() - INTERVAL '90 days'
         ORDER BY "expiresAt" LIMIT 100
       )
     )
     INSERT INTO "MailAttachmentDownload" (id, source, "messageId", "attachmentId", "sessionHash", "expiresAt")
     SELECT $1, $2, message.id, $4, $5, NOW() + INTERVAL '1 hour' FROM ${table} AS message
     WHERE message.id = $3 AND message.folder = 'inbox'${direction}
       AND message.attachments @> $6::jsonb${mailboxBoundary(identity.source, '$7')} RETURNING id`,
    [receiptId, identity.source, identity.id, identity.attachmentId, sessionHash(access.sessionId), JSON.stringify([file]), access.mailboxIds]);
  if (!receipt) throw new PublicRequestError("Attachment is no longer available in the dashboard.", 404);
  response.headers.set("X-Attachment-Receipt", receipt.id);
  return response;
}

/** One statement removes only the reference and records the confirmation atomically. */
export async function removeTransferredAttachment(
  identity: Identity, access: AttachmentTransferAccess, confirmation: z.infer<typeof attachmentRemovalSchema>, query = bookingQuery,
): Promise<void> {
  const { table, direction } = messageLocation(identity.source);
  const [removed] = await query<{ id: string }>(
    `WITH receipt AS MATERIALIZED (
       SELECT id, "removedAt" FROM "MailAttachmentDownload"
       WHERE id = $1 AND source = $2 AND "messageId" = $3 AND "attachmentId" = $4 AND "sessionHash" = $5
         AND ("removedAt" IS NOT NULL OR "expiresAt" > NOW()) FOR UPDATE
     ), changed AS (
       UPDATE ${table} AS message SET attachments = COALESCE((
         SELECT jsonb_agg(file.value ORDER BY file.ordinality)
         FROM jsonb_array_elements(message.attachments) WITH ORDINALITY AS file(value, ordinality)
         WHERE file.value->>'id' IS DISTINCT FROM $4
       ), '[]'::jsonb)
       WHERE message.id = $3 AND message.folder = 'inbox'${direction}
         AND EXISTS (SELECT 1 FROM receipt WHERE "removedAt" IS NULL)${mailboxBoundary(identity.source, '$7')}
       RETURNING message.id
     )
     UPDATE "MailAttachmentDownload" AS download SET
       "removedAt" = COALESCE(download."removedAt", NOW()), "saveMethod" = COALESCE(download."saveMethod", $6)
     WHERE download.id IN (SELECT id FROM receipt WHERE "removedAt" IS NOT NULL OR EXISTS (SELECT 1 FROM changed))
     RETURNING download.id`,
    [confirmation.receiptId, identity.source, identity.id, identity.attachmentId, sessionHash(access.sessionId), confirmation.saveMethod, access.mailboxIds]);
  if (!removed) throw new PublicRequestError("Removal was not confirmed. Keep your saved copy, refresh the email and try again.", 409);
}
