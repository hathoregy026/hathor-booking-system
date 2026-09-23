import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/lib/api";
import { bookingQuery } from "@/lib/booking-database";
import { bookingHorizonYear } from "@/lib/booking-horizon";
import { PHYSICAL_ROOM_TYPES } from "@/lib/physical-inventory";
import { PublicRequestError } from "@/lib/public-api-security";

export const dynamic = "force-dynamic";

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const querySchema = z.object({
  cruiseId: z.string().min(1).max(64),
  roomType: z.enum(PHYSICAL_ROOM_TYPES),
  month: monthSchema,
});
const saveSchema = querySchema.extend({
  changes: z.array(z.object({
    scheduleId: z.string().min(1).max(64),
    priceCents: z.number().int().min(100).max(100_000_000).nullable(),
  })).min(1).max(31),
}).superRefine((value, context) => {
  const seen = new Set<string>();
  value.changes.forEach((change, index) => {
    if (seen.has(change.scheduleId)) {
      context.addIssue({ code: "custom", path: ["changes", index], message: "Duplicate sailing" });
    }
    seen.add(change.scheduleId);
  });
});

type DateRateRow = {
  scheduleId: string;
  date: string;
  basePriceCents: number;
  overridePriceCents: number | null;
  availableCabins: number;
};

function handleDatePriceError(error: unknown) {
  if (error && typeof error === "object" && "code" in error && error.code === "42P01") {
    return NextResponse.json({
      code: "DATE_PRICING_NOT_READY",
      error: "Date pricing is not set up on this database yet.",
    }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
  return handleRouteError(error);
}

function monthBounds(month: string): [string, string] {
  const [year, monthNumber] = month.split("-").map(Number);
  const next = new Date(Date.UTC(year, monthNumber, 1)).toISOString().slice(0, 10);
  return [`${month}-01`, next];
}

function checkMonth(month: string) {
  const year = Number(month.slice(0, 4));
  const now = new Date();
  if (year < now.getUTCFullYear() || year > bookingHorizonYear(now)) {
    throw new PublicRequestError("Month is outside the booking calendar", 400);
  }
}

async function readDateRates(input: z.infer<typeof querySchema>) {
  checkMonth(input.month);
  const [from, to] = monthBounds(input.month);
  const dates = await bookingQuery<DateRateRow>(`
    SELECT s.id AS "scheduleId", to_char(s."departureTime", 'YYYY-MM-DD') AS date,
      t."priceCents" AS "basePriceCents", p."priceCents" AS "overridePriceCents",
      (SELECT count(*)::int FROM "_CruiseRooms" cr
       JOIN "Room" r ON r.id = cr."B" AND r."deletedAt" IS NULL AND r."roomType" = $2
       WHERE cr."A" = c.id AND NOT EXISTS (
         SELECT 1 FROM "InventoryAllocation" a WHERE a."roomId" = r.id AND a.active
           AND a."startsAt" < s."arrivalTime" AND a."endsAt" > s."departureTime"
           AND (a."expiresAt" IS NULL OR a."expiresAt" > clock_timestamp())
       )) AS "availableCabins"
    FROM "CruiseSchedule" s
    JOIN "Cruise" c ON c.id = s."cruiseId" AND c."deletedAt" IS NULL
    JOIN "TicketType" t ON t."cruiseId" = c.id AND t."roomType" = $2
    LEFT JOIN "SailingPrice" p ON p."cruiseScheduleId" = s.id AND p."ticketTypeId" = t.id
    WHERE c.id = $1 AND s."isBookable" AND s."departureTime" > clock_timestamp()
      AND s."departureTime" >= $3::timestamp AND s."departureTime" < $4::timestamp
    ORDER BY s."departureTime"
  `, [input.cruiseId, input.roomType, from, to]);
  return { ...input, dates };
}

export async function GET(request: NextRequest) {
  try {
    const input = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return NextResponse.json(await readDateRates(input), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return handleDatePriceError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const input = saveSchema.parse(await request.json());
    checkMonth(input.month);
    const [from, to] = monthBounds(input.month);
    const [result] = await bookingQuery<{ valid: boolean }>(`
      WITH requested AS (
        SELECT * FROM jsonb_to_recordset($1::jsonb)
          AS value("scheduleId" text, "priceCents" integer)
      ), matching AS (
        SELECT value."scheduleId", value."priceCents", t.id AS "ticketTypeId"
        FROM requested value
        JOIN "CruiseSchedule" s ON s.id = value."scheduleId"
        JOIN "Cruise" c ON c.id = s."cruiseId"
        JOIN "TicketType" t ON t."cruiseId" = c.id AND t."roomType" = $3
        WHERE c.id = $2 AND c."deletedAt" IS NULL AND s."isBookable"
          AND s."departureTime" > clock_timestamp()
          AND s."departureTime" >= $4::timestamp AND s."departureTime" < $5::timestamp
          AND EXISTS (
            SELECT 1 FROM "_CruiseRooms" cr
            JOIN "Room" r ON r.id = cr."B" AND r."deletedAt" IS NULL AND r."roomType" = $3
            WHERE cr."A" = c.id AND NOT EXISTS (
              SELECT 1 FROM "InventoryAllocation" a WHERE a."roomId" = r.id AND a.active
                AND a."startsAt" < s."arrivalTime" AND a."endsAt" > s."departureTime"
                AND (a."expiresAt" IS NULL OR a."expiresAt" > clock_timestamp())
            )
          )
      ), validity AS (
        SELECT (SELECT count(*) FROM requested) = (SELECT count(*) FROM matching) AS valid
      ), saved AS (
        INSERT INTO "SailingPrice" ("cruiseScheduleId", "ticketTypeId", "priceCents", "updatedAt")
        SELECT m."scheduleId", m."ticketTypeId", m."priceCents", clock_timestamp()
        FROM matching m, validity v WHERE v.valid AND m."priceCents" IS NOT NULL
        ON CONFLICT ("cruiseScheduleId", "ticketTypeId") DO UPDATE
          SET "priceCents" = EXCLUDED."priceCents", "updatedAt" = clock_timestamp()
        RETURNING "cruiseScheduleId"
      ), cleared AS (
        DELETE FROM "SailingPrice" p USING matching m, validity v
        WHERE v.valid AND m."priceCents" IS NULL
          AND p."cruiseScheduleId" = m."scheduleId" AND p."ticketTypeId" = m."ticketTypeId"
        RETURNING p."cruiseScheduleId"
      )
      SELECT valid FROM validity
    `, [JSON.stringify(input.changes), input.cruiseId, input.roomType, from, to]);
    if (!result?.valid) {
      throw new PublicRequestError("A selected sailing is no longer open. Reload its month and try again.", 409);
    }
    return NextResponse.json(await readDateRates(input), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return handleDatePriceError(error);
  }
}
