import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminApiGuard } from "@/lib/admin-server-auth";
import { bookingQuery } from "@/lib/booking-database";
import { bookingCode } from "@/lib/booking-code";
import { logDbError } from "@/lib/db-safe";

/*
 * The header's dashboard-wide search: the few bookings that best match a name,
 * email, phone or booking code. Pages are matched in the browser and emails use
 * the inbox's own search, so each stays behind its own permission.
 */

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "private, no-store" };
const querySchema = z.object({ q: z.string().trim().min(2).max(120) });

type Row = {
  id: string; customerName: string | null; firstName: string | null; lastName: string | null;
  customerEmail: string | null; status: string; departureTime: Date | string | null; cruiseName: string | null;
};

export async function GET(request: NextRequest) {
  const denied = await adminApiGuard("bookings.view");
  if (denied) return denied;
  const parsed = querySchema.safeParse({ q: request.nextUrl.searchParams.get("q") ?? "" });
  if (!parsed.success) return NextResponse.json({ bookings: [] }, { headers: NO_STORE });
  const text = parsed.data.q;
  const like = `%${text.replace(/[\\%_]/g, match => `\\${match}`)}%`;
  const code = /^hb-?([0-9a-z]{4,8})$/i.exec(text)?.[1]?.toLowerCase() ?? null;
  const digits = text.replace(/\D/g, "");
  try {
    const rows = await bookingQuery<Row>(
      `SELECT b.id, b."customerName", b."firstName", b."lastName", b."customerEmail", b.status,
              cs."departureTime", c.name AS "cruiseName"
         FROM "Booking" b
         JOIN "CruiseSchedule" cs ON cs.id = b."cruiseScheduleId"
         JOIN "Cruise" c ON c.id = cs."cruiseId"
        WHERE b."deletedAt" IS NULL
          AND (b."customerName" ILIKE $1 OR CONCAT_WS(' ', b."firstName", b."lastName") ILIKE $1
               OR b."customerEmail" ILIKE $1
               OR ($2::text IS NOT NULL AND REPLACE(b.id, '-', '') LIKE $2 || '%')
               OR (length($3) >= 5 AND regexp_replace(COALESCE(b."customerPhone", ''), '[^0-9]', '', 'g') LIKE '%' || $3 || '%'))
        ORDER BY (b.status IN ('REQUESTED','CONFIRMED','PENDING_HOLD')) DESC, cs."departureTime" DESC
        LIMIT 6`,
      [like, code, digits],
    );
    const bookings = rows.map(row => ({
      id: row.id,
      code: bookingCode(row.id),
      name: row.customerName?.trim() || [row.firstName, row.lastName].filter(Boolean).join(" ") || "Guest",
      email: row.customerEmail,
      status: row.status,
      departure: row.departureTime ? new Date(row.departureTime).toISOString() : null,
      cruiseName: row.cruiseName,
    }));
    return NextResponse.json({ bookings }, { headers: NO_STORE });
  } catch (error) {
    logDbError("admin.search.GET", error);
    return NextResponse.json({ error: "Search is busy. Try again in a moment.", bookings: [] }, { status: 503, headers: NO_STORE });
  }
}
