import { unstable_cache } from "next/cache";
import { bookingQuery } from "@/lib/booking-database";
import { logDbError } from "@/lib/db-safe";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import { isPhysicalRoomType, type CabinPriceTable } from "@/lib/cabin-prices-shared";

/** Cleared with the rest of the public catalog when prices are saved in the dashboard. */
export const CABIN_PRICES_TAG = "cabin-prices";
const PUBLIC_READ_TIMEOUT_MS = 4000;

type PriceRow = { slug: string; roomType: string; priceCents: number };

export async function readCabinPriceTable(): Promise<CabinPriceTable> {
  const rows = await bookingQuery<PriceRow>(`
    SELECT c.slug, t."roomType", t."priceCents"
    FROM "TicketType" t
    JOIN "Cruise" c ON c.id = t."cruiseId"
    WHERE c."deletedAt" IS NULL AND t."roomType" IS NOT NULL
  `);
  const table: CabinPriceTable = {};
  for (const row of rows) {
    if (!isPhysicalRoomType(row.roomType)) continue;
    (table[row.slug] ??= {})[row.roomType] = Number(row.priceCents);
  }
  return table;
}

const cachedTable = unstable_cache(readCabinPriceTable, ["cabin-price-table-v1"], {
  tags: [PUBLIC_CMS_CACHE_TAG, CABIN_PRICES_TAG],
  revalidate: 300,
});

/**
 * The dashboard's cabin prices for public pages. Null when the database is out
 * of reach, so a page falls back to its published prices instead of waiting.
 */
export async function getCabinPriceTable(): Promise<CabinPriceTable | null> {
  try {
    return await Promise.race([
      cachedTable(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("cabin prices timed out")), PUBLIC_READ_TIMEOUT_MS)),
    ]);
  } catch (error) {
    logDbError("cabin-prices", error);
    return null;
  }
}
