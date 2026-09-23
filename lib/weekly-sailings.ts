import { bookingQuery } from "@/lib/booking-database";
import { bookingHorizonYear } from "@/lib/booking-horizon";

type CreatedRow = { inserted: number; horizonYear: number };

/** Idempotent staff/cron job. Availability reads remain strictly read-only. */
export async function ensureWeeklySailings(now = new Date()): Promise<CreatedRow> {
  const horizonYear = bookingHorizonYear(now);
  const year = now.getUTCFullYear();
  if (year < 2029 || (year - 2029) % 3 !== 0) {
    return { inserted: 0, horizonYear };
  }
  const [result] = await bookingQuery<{ inserted: number }>(`
    SELECT hathor_extend_weekly_sailings($1::date, $2::int, make_date($2::int - 2, 1, 1))::int AS inserted
  `, [now.toISOString().slice(0, 10), horizonYear]);
  return { inserted: result?.inserted ?? 0, horizonYear };
}
