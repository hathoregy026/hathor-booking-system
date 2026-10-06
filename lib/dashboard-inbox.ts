import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import type { InboxDetail, InboxPage, InboxSource } from "@/lib/inbox-types";
import { emailDisplayPreview } from "@/lib/email-display";
import { EMAIL_MAILBOXES, mailboxIdSchema, type MailboxId } from "@/lib/email-mailboxes";
import { fetchMailboxHandlers } from "@/lib/email-mailbox-settings";
import { PublicRequestError } from "@/lib/public-api-security";
import { mailFolderSchema } from "@/lib/mail-screening";
import type { MailFolder } from "@/lib/mail-folders";

export const inboxIdentitySchema = z.object({ source: z.enum(["booking", "general"]), id: z.uuid() });
export const inboxMutationSchema = z.union([z.object({ read: z.boolean() }).strict(), z.object({ folder: mailFolderSchema }).strict()]);
export const inboxQuerySchema = z.object({
  q: z.string().trim().max(120).default(""),
  filter: z.enum(["all", "unread", "received", "sent"]).default("all"),
  mailbox: z.union([z.literal("all"), mailboxIdSchema]).default("all"),
  folder: mailFolderSchema.default("inbox"),
  before: z.iso.datetime().optional(),
  cursorId: z.uuid().optional(),
  cursorSource: z.enum(["booking", "general"]).optional(),
}).refine(value => [value.before, value.cursorId, value.cursorSource].filter(Boolean).length % 3 === 0, { message: "Invalid cursor" });

const receivedMessages = `
  SELECT m.id, 'booking'::text AS source, COALESCE(p."mailboxId", 'reservations') AS "mailboxId", m."bookingId", m.sender, m.recipient, m.subject, m."bodyText", m.attachments,
    m."senderMatchesGuest", m."readAt", m."createdAt", m.direction, m.status, m.folder, m."screeningReasons",
    CASE WHEN m.direction = 'OUTBOUND' OR m."senderMatchesGuest" THEN
      COALESCE(NULLIF(TRIM(b."customerName"), ''), NULLIF(TRIM(CONCAT_WS(' ', b."firstName", b."lastName")), ''))
      ELSE NULL END AS "correspondentName"
    FROM "BookingMessage" m JOIN "Booking" b ON b.id = m."bookingId"
    LEFT JOIN "DashboardEmailPlacement" p ON p.source = 'booking' AND p."messageId" = m.id
    WHERE NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = 'booking' AND d."messageId" = m.id)
  UNION ALL
  SELECT m.id, 'general'::text AS source, COALESCE(p."mailboxId", m."mailboxId") AS "mailboxId", NULL::text AS "bookingId", m.sender, m.recipient, m.subject, m."bodyText", m.attachments,
    TRUE AS "senderMatchesGuest", m."readAt", m."createdAt", m.direction, m.status, m.folder, m."screeningReasons", m."correspondentName" FROM "InboxMessage" m
    LEFT JOIN "DashboardEmailPlacement" p ON p.source = 'general' AND p."messageId" = m.id
    WHERE NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = 'general' AND d."messageId" = m.id)`;

type InboxRow = Omit<InboxDetail, "createdAt" | "readAt"> & { createdAt: Date; readAt: Date | null };
function dates(row: InboxRow): InboxDetail {
  return { ...row, createdAt: row.createdAt.toISOString(), readAt: row.readAt?.toISOString() ?? null };
}

export async function fetchDashboardInbox(input: z.infer<typeof inboxQuerySchema>, query = bookingQuery): Promise<InboxPage> {
  const pattern = `%${input.q.replace(/[\\%_]/g, "\\$&")}%`;
  const rows = await query<InboxRow>(
    `WITH received AS (${receivedMessages})
     SELECT id, source, "mailboxId", "bookingId", sender, recipient, "correspondentName", direction, status, subject, LEFT("bodyText", 160) AS preview,
       jsonb_array_length(attachments) AS "attachmentCount", "createdAt", "readAt", folder, "screeningReasons"
     FROM received WHERE (sender ILIKE $1 OR recipient ILIKE $1 OR "correspondentName" ILIKE $1 OR subject ILIKE $1)
       AND ($2 = 'all' OR ($2 = 'unread' AND direction = 'INBOUND' AND "readAt" IS NULL)
         OR ($2 = 'received' AND direction = 'INBOUND') OR ($2 = 'sent' AND direction = 'OUTBOUND'))
       AND ($3::timestamp IS NULL OR ("createdAt", source, id) < ($3::timestamp, $4::text, $5::text))
       AND ($6 = 'all' OR "mailboxId" = $6)
       AND folder = $7
     ORDER BY "createdAt" DESC, source DESC, id DESC LIMIT 26`,
    [pattern, input.filter, input.before ?? null, input.cursorSource ?? null, input.cursorId ?? null, input.mailbox, input.folder]);
  const [count] = await query<{ all: number; unread: number; received: number; sent: number }>(`WITH received AS (${receivedMessages})
    SELECT COUNT(*)::int AS "all", COUNT(*) FILTER (WHERE direction = 'INBOUND' AND "readAt" IS NULL)::int AS unread,
      COUNT(*) FILTER (WHERE direction = 'INBOUND')::int AS received, COUNT(*) FILTER (WHERE direction = 'OUTBOUND')::int AS sent FROM received
      WHERE ($1 = 'all' OR "mailboxId" = $1) AND folder = $2`, [input.mailbox, input.folder]);
  const counts = count ?? { all: 0, unread: 0, received: 0, sent: 0 };
  const totals = await query<{ mailboxId: MailboxId; total: number; unread: number }>(`WITH received AS (${receivedMessages})
    SELECT "mailboxId", COUNT(*)::int AS total, COUNT(*) FILTER (WHERE direction = 'INBOUND' AND "readAt" IS NULL)::int AS unread
    FROM received WHERE folder = 'inbox' GROUP BY "mailboxId"`);
  const handlers = await fetchMailboxHandlers(query);
  const mailboxes = EMAIL_MAILBOXES.map(mailbox => ({
    ...mailbox, handlerName: handlers[mailbox.id], total: totals.find(row => row.mailboxId === mailbox.id)?.total ?? 0,
    unread: totals.find(row => row.mailboxId === mailbox.id)?.unread ?? 0,
  }));
  return { messages: rows.slice(0, 25).map(row => ({ ...dates(row), preview: emailDisplayPreview(row.preview) })), hasOlder: rows.length > 25, unreadCount: counts.unread, counts, mailboxes };
}

export async function fetchInboxDetail(source: InboxSource, id: string, query = bookingQuery): Promise<InboxDetail | null> {
  const [row] = await query<InboxRow>(
    `WITH received AS (${receivedMessages}) SELECT *, LEFT("bodyText", 160) AS preview,
      jsonb_array_length(attachments) AS "attachmentCount" FROM received WHERE source = $1 AND id = $2`, [source, id]);
  return row ? dates(row) : null;
}

export async function setInboxRead(source: InboxSource, id: string, read: boolean, query = bookingQuery): Promise<boolean> {
  const rows = source === "booking"
    ? await query(`UPDATE "BookingMessage" m SET "readAt" = CASE WHEN $2 THEN NOW() END WHERE id = $1 AND direction = 'INBOUND'
      AND NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = 'booking' AND d."messageId" = m.id) RETURNING id`, [id, read])
    : await query(`UPDATE "InboxMessage" m SET "readAt" = CASE WHEN $2 THEN NOW() END WHERE id = $1 AND direction = 'INBOUND'
      AND NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = 'general' AND d."messageId" = m.id) RETURNING id`, [id, read]);
  return rows.length > 0;
}

export async function setInboxFolder(source: InboxSource, id: string, folder: MailFolder, query = bookingQuery): Promise<boolean> {
  const table = source === "booking" ? '"BookingMessage"' : '"InboxMessage"';
  const reason = folder === "inbox" ? "manual_restore" : folder === "spam" ? "manual_spam" : "manual_security";
  const rows = await query(`UPDATE ${table} m SET folder = $2,
    "screeningReasons" = CASE WHEN "screeningReasons" @> $3::jsonb THEN "screeningReasons" ELSE "screeningReasons" || $3::jsonb END
    ${source === "booking" ? ', "notificationSentAt" = CASE WHEN $2 = \'inbox\' THEN COALESCE("notificationSentAt", NOW()) ELSE "notificationSentAt" END' : ""}
    WHERE id = $1 AND direction = 'INBOUND'
    AND NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = $4 AND d."messageId" = m.id)
    RETURNING id`, [id, folder, JSON.stringify([reason]), source]);
  return rows.length > 0;
}

export async function deleteDashboardEmail(source: InboxSource, id: string, query = bookingQuery): Promise<boolean> {
  const identity = inboxIdentitySchema.parse({ source, id });
  const message = await fetchInboxDetail(identity.source, identity.id, query);
  if (!message) return false;
  if (message.direction === "OUTBOUND" && message.status === "PENDING") {
    throw new PublicRequestError("Check this email's sending status before removing it.", 409);
  }
  const rows = source === "booking"
    ? await query(`INSERT INTO "DashboardEmailDeletion" (source, "messageId") SELECT 'booking', id FROM "BookingMessage"
      WHERE id = $1 AND NOT (direction = 'OUTBOUND' AND status = 'PENDING')
      ON CONFLICT (source, "messageId") DO NOTHING RETURNING "messageId"`, [id])
    : await query(`INSERT INTO "DashboardEmailDeletion" (source, "messageId") SELECT 'general', id FROM "InboxMessage"
      WHERE id = $1 AND NOT (direction = 'OUTBOUND' AND status = 'PENDING')
      ON CONFLICT (source, "messageId") DO NOTHING RETURNING "messageId"`, [id]);
  return rows.length > 0;
}
