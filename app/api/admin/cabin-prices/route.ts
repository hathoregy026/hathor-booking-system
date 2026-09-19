import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { handleRouteError } from "@/lib/api";
import { bookingQuery } from "@/lib/booking-database";
import { CABIN_PRICES_TAG } from "@/lib/cabin-prices";
import { PHYSICAL_ROOM_TYPES } from "@/lib/physical-inventory";
import { PublicRequestError } from "@/lib/public-api-security";
import { revalidatePublicCatalog } from "@/lib/revalidate-public-catalog";

export const dynamic = "force-dynamic";

type VoyageRow = { cruiseId: string; slug: string; name: string; roomType: string; priceCents: number; updatedAt: Date };
type CabinRow = { roomType: string; cabins: number; sizeSqm: number | null; capacity: number };

/** Every voyage's price per cabin type (what the booking charges) and each cabin type's details. */
async function readPrices() {
  const [priceRows, cabinRows] = await Promise.all([
    bookingQuery<VoyageRow>(`
      SELECT c.id AS "cruiseId", c.slug, c.name, t."roomType", t."priceCents", t."updatedAt"
      FROM "TicketType" t
      JOIN "Cruise" c ON c.id = t."cruiseId"
      WHERE c."deletedAt" IS NULL AND t."roomType" = ANY($1::text[])
      ORDER BY c.slug
    `, [PHYSICAL_ROOM_TYPES]),
    bookingQuery<CabinRow>(`
      SELECT r."roomType", count(*)::int AS cabins, max(r."sizeSqm")::int AS "sizeSqm", max(r.capacity)::int AS capacity
      FROM "Room" r
      WHERE r."deletedAt" IS NULL AND r."roomType" = ANY($1::text[])
      GROUP BY r."roomType"
    `, [PHYSICAL_ROOM_TYPES]),
  ]);

  const voyages = new Map<string, { cruiseId: string; slug: string; name: string; prices: Record<string, number>; updatedAt: string | null }>();
  for (const row of priceRows) {
    const voyage = voyages.get(row.cruiseId) ?? { cruiseId: row.cruiseId, slug: row.slug, name: row.name, prices: {}, updatedAt: null };
    voyage.prices[row.roomType] = Number(row.priceCents);
    const stamp = new Date(row.updatedAt).toISOString();
    if (!voyage.updatedAt || stamp > voyage.updatedAt) voyage.updatedAt = stamp;
    voyages.set(row.cruiseId, voyage);
  }
  const order = (slug: string) => Number.parseInt(slug, 10) || 99;
  return {
    voyages: [...voyages.values()].sort((a, b) => order(a.slug) - order(b.slug)),
    cabins: PHYSICAL_ROOM_TYPES.map(type => {
      const row = cabinRows.find(entry => entry.roomType === type);
      return { roomType: type, cabins: row?.cabins ?? 0, sizeSqm: row?.sizeSqm ?? null, capacity: row?.capacity ?? 0 };
    }),
  };
}

export async function GET() {
  try {
    return NextResponse.json(await readPrices(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleRouteError(error);
  }
}

const roomType = z.enum(PHYSICAL_ROOM_TYPES as unknown as [string, ...string[]]);
const saveSchema = z.object({
  prices: z
    .array(z.object({
      cruiseId: z.string().min(1).max(64),
      roomType,
      /** Whole voyage, per cabin: at least $1, at most $1,000,000. */
      priceCents: z.number().int().min(100).max(100_000_000),
    }))
    .max(64),
  sizes: z
    .array(z.object({ roomType, sizeSqm: z.number().int().min(5).max(500) }))
    .max(8)
    .optional(),
}).strict().superRefine((body, context) => {
  const prices = new Set<string>();
  body.prices.forEach((price, index) => {
    const key = `${price.cruiseId}|${price.roomType}`;
    if (prices.has(key)) context.addIssue({ code: "custom", path: ["prices", index], message: "Duplicate voyage and cabin type" });
    prices.add(key);
  });
  const sizes = new Set<string>();
  body.sizes?.forEach((size, index) => {
    if (sizes.has(size.roomType)) context.addIssue({ code: "custom", path: ["sizes", index], message: "Duplicate cabin type" });
    sizes.add(size.roomType);
  });
});

/**
 * Saves the prices the booking engine charges (TicketType, per voyage and
 * cabin type) and the cabin sizes. A request already sent keeps the price it
 * was sent with; new requests use the new price at once.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = saveSchema.parse(await request.json());
    type SaveResult = { pricesValid: boolean; sizesValid: boolean };
    const [saved] = await bookingQuery<SaveResult>(`
      WITH requested_prices AS (
        SELECT * FROM jsonb_to_recordset($1::jsonb)
          AS value("cruiseId" text, "roomType" text, "priceCents" int)
      ), requested_sizes AS (
        SELECT * FROM jsonb_to_recordset($2::jsonb)
          AS value("roomType" text, "sizeSqm" int)
      ), validity AS (
        SELECT
          (SELECT count(*) FROM requested_prices) =
            (SELECT count(*) FROM requested_prices value
             JOIN "TicketType" t ON t."cruiseId" = value."cruiseId" AND t."roomType" = value."roomType"
             JOIN "Cruise" c ON c.id = t."cruiseId" AND c."deletedAt" IS NULL) AS "pricesValid",
          (SELECT count(*) FROM requested_sizes) =
            (SELECT count(*) FROM requested_sizes value
             WHERE EXISTS (SELECT 1 FROM "Room" r WHERE r."roomType" = value."roomType" AND r."deletedAt" IS NULL)) AS "sizesValid"
      ), ticket_updates AS (
        UPDATE "TicketType" t
        SET "priceCents" = value."priceCents", "updatedAt" = now()
        FROM requested_prices value, validity valid
        WHERE valid."pricesValid"
          AND t."cruiseId" = value."cruiseId"
          AND t."roomType" = value."roomType"
          AND t."priceCents" <> value."priceCents"
        RETURNING t.id
      ), minima AS (
        SELECT t."cruiseId", min(COALESCE(value."priceCents", t."priceCents"))::int AS lowest
        FROM "TicketType" t
        LEFT JOIN requested_prices value
          ON value."cruiseId" = t."cruiseId" AND value."roomType" = t."roomType"
        WHERE t."roomType" = ANY($3::text[])
          AND t."cruiseId" IN (SELECT "cruiseId" FROM requested_prices)
        GROUP BY t."cruiseId"
      ), cruise_updates AS (
        UPDATE "Cruise" c
        SET "basePriceCents" = minima.lowest, "updatedAt" = now()
        FROM minima, validity valid
        WHERE valid."pricesValid" AND c.id = minima."cruiseId" AND c."basePriceCents" <> minima.lowest
        RETURNING c.id
      ), room_updates AS (
        UPDATE "Room" r
        SET "sizeSqm" = value."sizeSqm", "updatedAt" = now()
        FROM requested_sizes value, validity valid
        WHERE valid."sizesValid"
          AND r."roomType" = value."roomType"
          AND r."deletedAt" IS NULL
          AND r."sizeSqm" IS DISTINCT FROM value."sizeSqm"
        RETURNING r.id
      )
      SELECT valid."pricesValid", valid."sizesValid"
      FROM validity valid
    `, [JSON.stringify(body.prices), JSON.stringify(body.sizes ?? []), PHYSICAL_ROOM_TYPES]);

    if (!saved?.pricesValid || !saved.sizesValid) {
      throw new PublicRequestError("One or more prices or cabin types no longer exist. Reload and try again.", 409);
    }

    revalidatePublicCatalog();
    revalidateTag(CABIN_PRICES_TAG, "max");
    return NextResponse.json(await readPrices(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleRouteError(error);
  }
}
