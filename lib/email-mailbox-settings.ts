import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { EMAIL_MAILBOXES, mailboxSettingsSchema, type MailboxId } from "@/lib/email-mailboxes";

const keyOf = (id: MailboxId) => `email-mailbox-handler/${id}`;

export async function fetchMailboxHandlers(query = bookingQuery): Promise<Record<MailboxId, string>> {
  const rows = await query<{ key: string; value: string }>(`SELECT key, value FROM "SiteSetting" WHERE key = ANY($1::text[])`, [EMAIL_MAILBOXES.map(mailbox => keyOf(mailbox.id))]);
  return Object.fromEntries(EMAIL_MAILBOXES.map(mailbox => {
    const parsed = mailboxSettingsSchema.shape.handlerName.safeParse(rows.find(row => row.key === keyOf(mailbox.id))?.value ?? "");
    return [mailbox.id, parsed.success ? parsed.data : ""];
  })) as Record<MailboxId, string>;
}

export async function saveMailboxHandler(input: z.infer<typeof mailboxSettingsSchema>, query = bookingQuery): Promise<void> {
  const parsed = mailboxSettingsSchema.parse(input);
  await query(`INSERT INTO "SiteSetting" (key, value, "updatedAt") VALUES ($1, $2, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()`, [keyOf(parsed.mailboxId), parsed.handlerName]);
}
