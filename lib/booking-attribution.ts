import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";

/*
 * Which ad or link brought a booking request (Google Ads click id, UTM tags,
 * landing page). Sent by the guest's own browser, so it is validated tightly,
 * stored only as data, and never shown as HTML. Saving it is best-effort: a
 * failure here must never affect the booking itself.
 */

const value = z.string().trim().max(200).regex(/^[\p{L}\p{N} _.\-+:|/()&%,!']*$/u);

const touchSchema = z.object({
  gclid: value.optional(),
  gbraid: value.optional(),
  wbraid: value.optional(),
  fbclid: value.optional(),
  msclkid: value.optional(),
  utm_source: value.optional(),
  utm_medium: value.optional(),
  utm_campaign: value.optional(),
  utm_term: value.optional(),
  utm_content: value.optional(),
  landing: value.optional(),
  referrer: value.optional(),
  ts: z.number().int().positive().max(4102444800000),
}).strict();

export const bookingAttributionSchema = z.object({ first: touchSchema, last: touchSchema }).strict();
export type BookingAttribution = z.infer<typeof bookingAttributionSchema>;

/*
 * The "attribution" column is added by the owner with one statement:
 *   ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS attribution jsonb;
 * Until it exists, nothing is written (checked once every 10 minutes).
 */
let columnCheck: { ok: boolean; at: number } | null = null;

async function attributionColumnExists(): Promise<boolean> {
  if (columnCheck && Date.now() - columnCheck.at < 10 * 60_000) return columnCheck.ok;
  try {
    const rows = await bookingQuery<{ ok: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Booking' AND column_name = 'attribution') AS ok",
    );
    columnCheck = { ok: rows[0]?.ok === true, at: Date.now() };
  } catch {
    columnCheck = { ok: false, at: Date.now() };
  }
  return columnCheck.ok;
}

/** Stores the source once; a replayed request never overwrites it. */
export async function recordBookingAttribution(bookingId: string, attribution: BookingAttribution | undefined): Promise<void> {
  if (!attribution) return;
  try {
    if (!(await attributionColumnExists())) return;
    await bookingQuery(
      'UPDATE "Booking" SET attribution = $2::jsonb WHERE id = $1 AND attribution IS NULL',
      [bookingId, JSON.stringify({ ...attribution, recordedAt: new Date().toISOString() })],
    );
  } catch {
    console.error("[booking] attribution not stored");
  }
}
