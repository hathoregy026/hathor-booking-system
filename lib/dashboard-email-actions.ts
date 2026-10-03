import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { inboxIdentitySchema } from "@/lib/dashboard-inbox";
import { mailboxIdSchema } from "@/lib/email-mailboxes";
import { PublicRequestError } from "@/lib/public-api-security";

const identities = z.array(inboxIdentitySchema.strict()).min(1).max(100).refine(
  messages => new Set(messages.map(message => `${message.source}/${message.id}`)).size === messages.length,
  "Select each email once",
);
export const dashboardEmailActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("move"), messages: identities, mailboxId: mailboxIdSchema }).strict(),
  z.object({ action: z.literal("delete"), messages: identities, confirm: z.literal(true) }).strict(),
]);

const selectedMessages = `
  requested AS (SELECT source, id FROM jsonb_to_recordset($1::jsonb) AS selected(source text, id text)),
  general AS (SELECT m.id, 'general'::text AS source, m.status FROM "InboxMessage" m
    JOIN requested r ON r.source = 'general' AND r.id = m.id FOR UPDATE OF m),
  booking AS (SELECT m.id, 'booking'::text AS source, m.status FROM "BookingMessage" m
    JOIN requested r ON r.source = 'booking' AND r.id = m.id FOR UPDATE OF m),
  originals AS (SELECT * FROM general UNION ALL SELECT * FROM booking),
  eligible AS (SELECT m.* FROM originals m WHERE m.status <> 'PENDING'
    AND NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = m.source AND d."messageId" = m.id))`;

export async function applyDashboardEmailAction(input: z.infer<typeof dashboardEmailActionSchema>, query = bookingQuery): Promise<{ affected: number }> {
  const parsed = dashboardEmailActionSchema.parse(input);
  const operation = parsed.action === "move"
    ? `INSERT INTO "DashboardEmailPlacement" (source, "messageId", "mailboxId")
       SELECT source, id, $2 FROM eligible WHERE (SELECT COUNT(*) FROM eligible) = (SELECT COUNT(*) FROM requested)
       ON CONFLICT (source, "messageId") DO UPDATE SET "mailboxId" = EXCLUDED."mailboxId", "updatedAt" = NOW()
       RETURNING "messageId"`
    : `INSERT INTO "DashboardEmailDeletion" (source, "messageId")
       SELECT source, id FROM eligible WHERE (SELECT COUNT(*) FROM eligible) = (SELECT COUNT(*) FROM requested)
       ON CONFLICT (source, "messageId") DO UPDATE SET "deletedAt" = "DashboardEmailDeletion"."deletedAt"
       RETURNING "messageId"`;
  const [result] = await query<{ affected: number }>(`WITH ${selectedMessages}, applied AS (${operation}) SELECT COUNT(*)::int AS affected FROM applied`,
    parsed.action === "move" ? [JSON.stringify(parsed.messages), parsed.mailboxId] : [JSON.stringify(parsed.messages)]);
  if (result?.affected !== parsed.messages.length) {
    throw new PublicRequestError("One or more selected emails are unavailable or still sending. Refresh before trying again.", 409);
  }
  return result;
}
