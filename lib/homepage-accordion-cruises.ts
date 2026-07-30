import { cache } from "react";
import { unstable_cache } from "next/cache";
import pg from "pg";
import { logDbError } from "@/lib/db-safe";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import type { SiteImageName } from "@/lib/site-image-slots";

export type HomepageAccordionCruise = {
  id: string;
  name: string;
  description: string;
  /** Dedicated Site Images CMS slot — not shared with other pages. */
  imageName: SiteImageName;
  ports: string;
  basePriceCents: number;
  roomCount: number;
  slug: string;
  romanNumeral: string;
  meta: string;
  href: string;
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

/** Accordion-only CMS slots — editable under Admin → Site Images → Homepage. */
export const VOYAGE_ACCORDION_IMAGE_SLOTS = [
  "home-voyage-3n-aswan-luxor",
  "home-voyage-4n-luxor-aswan",
  "home-voyage-7n-roundtrip",
  "home-voyage-nile-majesty",
] as const satisfies readonly SiteImageName[];

const IMAGE_SLOT_BY_SLUG: Partial<Record<string, SiteImageName>> = {
  "3-nights-aswan-luxor": "home-voyage-3n-aswan-luxor",
  "4-nights-luxor-aswan": "home-voyage-4n-luxor-aswan",
  "7-nights-luxor-aswan-luxor": "home-voyage-7n-roundtrip",
  "nile-majesty": "home-voyage-nile-majesty",
};

const QUERY_TIMEOUT_MS = 5_000;

function formatBasePrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function resolveImageSlot(slug: string, index: number): SiteImageName {
  return (
    IMAGE_SLOT_BY_SLUG[slug] ??
    VOYAGE_ACCORDION_IMAGE_SLOTS[index % VOYAGE_ACCORDION_IMAGE_SLOTS.length]!
  );
}

type CruiseRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ports: string | null;
  basePriceCents: number;
  roomCount: number;
};

function createReadClient(): pg.Client {
  const connectionString = resolveDatabaseUrl();
  return new pg.Client({
    connectionString,
    connectionTimeoutMillis: QUERY_TIMEOUT_MS,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
    query_timeout: QUERY_TIMEOUT_MS,
  } as pg.ClientConfig);
}

/**
 * Active cruises for the homepage luxury accordion.
 * Dedicated short-lived client — does not use the shared Prisma/pg Pool.
 */
const getHomepageAccordionCruisesCached = unstable_cache(
  async (): Promise<HomepageAccordionCruise[]> => {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return [];
    }
    const client = createReadClient();
    try {
      await client.connect();
      const result = await client.query<CruiseRow>(
        `SELECT
           c.id,
           c.name,
           c.slug,
           c.description,
           c.ports,
           c."basePriceCents",
           (
             SELECT COUNT(*)::int
             FROM "Room" r
             WHERE r."cruiseId" = c.id AND r."deletedAt" IS NULL
           ) AS "roomCount"
         FROM "Cruise" c
         WHERE c."deletedAt" IS NULL
         ORDER BY c.name ASC`,
      );
      return result.rows.map((cruise, index) => {
        const roomLabel =
          cruise.roomCount === 1 ? "1 cabin" : `${cruise.roomCount} cabins`;
        return {
          id: cruise.id,
          name: cruise.name,
          description: cruise.description ?? "",
          imageName: resolveImageSlot(cruise.slug, index),
          ports: cruise.ports ?? "",
          basePriceCents: cruise.basePriceCents,
          roomCount: cruise.roomCount,
          slug: cruise.slug,
          romanNumeral: ROMAN[index] ?? String(index + 1),
          meta: `${roomLabel} · Base ${formatBasePrice(cruise.basePriceCents)}`,
          href: "/cruises",
        };
      });
    } finally {
      await client.end().catch(() => {});
    }
  },
  ["homepage-accordion-cruises-v1"],
  { revalidate: 300, tags: [PUBLIC_CMS_CACHE_TAG] },
);

export const getHomepageAccordionCruises = cache(async (): Promise<
  HomepageAccordionCruise[]
> => {
  return getHomepageAccordionCruisesCached();
});

export const getHomepageAccordionCruisesSafe = cache(async (): Promise<
  HomepageAccordionCruise[]
> => {
  try {
    return await getHomepageAccordionCruises();
  } catch (error) {
    logDbError("homepage-accordion-cruises.get", error);
    return [];
  }
});
