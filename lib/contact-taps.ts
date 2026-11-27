import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { bookingAttributionSchema, describeAttributionSource } from "@/lib/booking-attribution";

/*
 * WhatsApp, phone and email taps, saved so the team can see which kind of
 * contact each one was, where on the site it happened and which ad or link
 * brought the visitor. Sent by the visitor's browser, so it is validated
 * tightly and stored only as data. Saving is best-effort: it never blocks
 * or slows the tap itself.
 */

export const CONTACT_TAP_KINDS = ["whatsapp", "phone", "email"] as const;
export type ContactTapKind = (typeof CONTACT_TAP_KINDS)[number];

export const contactTapSchema = z.object({
  kind: z.enum(CONTACT_TAP_KINDS),
  page: z.string().trim().min(1).max(100).regex(/^\/[\p{L}\p{N}_.\-/~%]*$/u),
  /* A bad attribution record is dropped, never an error. */
  attribution: bookingAttributionSchema.optional().catch(undefined),
}).strict();

export type ContactTap = z.infer<typeof contactTapSchema>;

/*
 * The table comes from migration 20261127120000_contact_taps. Until it
 * exists nothing is written (checked once every 10 minutes).
 */
let tableCheck: { ok: boolean; at: number } | null = null;

async function contactTapTableExists(): Promise<boolean> {
  if (tableCheck && Date.now() - tableCheck.at < 10 * 60_000) return tableCheck.ok;
  try {
    const rows = await bookingQuery<{ ok: boolean }>(
      "SELECT to_regclass('public.\"ContactTap\"') IS NOT NULL AS ok",
    );
    tableCheck = { ok: rows[0]?.ok === true, at: Date.now() };
  } catch {
    tableCheck = { ok: false, at: Date.now() };
  }
  return tableCheck.ok;
}

export async function recordContactTap(tap: ContactTap): Promise<void> {
  try {
    if (!(await contactTapTableExists())) return;
    await bookingQuery(
      'INSERT INTO "ContactTap" (kind, page, source, attribution) VALUES ($1, $2, $3, $4::jsonb)',
      [
        tap.kind,
        tap.page,
        describeAttributionSource(tap.attribution),
        tap.attribution ? JSON.stringify(tap.attribution) : null,
      ],
    );
  } catch {
    console.error("[contact-tap] not stored");
  }
}
