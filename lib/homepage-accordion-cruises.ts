import { cache } from "react";
import { unstable_cache } from "next/cache";
import { logDbError } from "@/lib/db-safe";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import {
  CMS_QUERY_TIMEOUT_MS,
  withPublicCmsClient,
  withTimeout,
} from "@/lib/public-cms-client";
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

/** Closed-row taglines — match the itinerary list design language. */
const TAGLINE_BY_SLUG: Partial<Record<string, string>> = {
  "3-nights-aswan-luxor": "Intimate & Immersive",
  "4-nights-luxor-aswan": "Classic Voyage",
  "7-nights-luxor-aswan-luxor": "The Complete Experience",
  "nile-majesty": "Private Charter",
};

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

function formatAccordionMeta(
  roomCount: number,
  basePriceCents: number,
  slug: string,
): string {
  const roomLabel = roomCount === 1 ? "1 Cabin" : `${roomCount} Cabins`;
  const base = `Base ${formatBasePrice(basePriceCents)}`;
  const tagline = TAGLINE_BY_SLUG[slug];
  const parts = tagline
    ? [roomLabel, base, tagline]
    : [roomLabel, base];
  return parts.join(" · ").toUpperCase();
}

function toAccordionCruise(
  cruise: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    ports: string | null;
    basePriceCents: number;
    roomCount: number;
  },
  index: number,
): HomepageAccordionCruise {
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
    meta: formatAccordionMeta(
      cruise.roomCount,
      cruise.basePriceCents,
      cruise.slug,
    ),
    href: "/cruises",
  };
}

/** Catalog seed — keeps Our Voyages visible when CMS/build cannot load cruises. */
function accordionFromCatalog(): HomepageAccordionCruise[] {
  return HATHOR_CRUISES.map((cruise, index) =>
    toAccordionCruise(
      {
        id: `catalog-${cruise.slug}`,
        name: cruise.name,
        slug: cruise.slug,
        description: cruise.description,
        ports: cruise.ports,
        basePriceCents: cruise.basePriceCents,
        roomCount: cruise.rooms.length,
      },
      index,
    ),
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

type AccordionGlobal = {
  accordionInflight?: Promise<HomepageAccordionCruise[]>;
  accordionLastGood?: HomepageAccordionCruise[];
};

const accordionGlobal = globalThis as unknown as AccordionGlobal;

async function fetchAccordionFromDb(): Promise<HomepageAccordionCruise[]> {
  return withPublicCmsClient(async (client) => {
    const result = await withTimeout(
      client.query<CruiseRow>(
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
      ),
      "accordion",
      CMS_QUERY_TIMEOUT_MS,
    );
    return result.rows.map((cruise, index) => toAccordionCruise(cruise, index));
  });
}

const getHomepageAccordionCruisesCached = unstable_cache(
  async (): Promise<HomepageAccordionCruise[]> => {
    /* Build must not return [] — that baked an empty Our Voyages into ISR HTML. */
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return accordionGlobal.accordionLastGood?.length
        ? accordionGlobal.accordionLastGood
        : accordionFromCatalog();
    }

    if (accordionGlobal.accordionInflight) {
      return accordionGlobal.accordionInflight;
    }

    const pending = (async () => {
      try {
        const rows = await fetchAccordionFromDb();
        if (rows.length === 0) {
          const fallback = accordionFromCatalog();
          accordionGlobal.accordionLastGood = fallback;
          return fallback;
        }
        accordionGlobal.accordionLastGood = rows;
        return rows;
      } catch (error) {
        logDbError("homepage-accordion-cruises.fetch", error);
        return accordionGlobal.accordionLastGood?.length
          ? accordionGlobal.accordionLastGood
          : accordionFromCatalog();
      } finally {
        accordionGlobal.accordionInflight = undefined;
      }
    })();

    accordionGlobal.accordionInflight = pending;
    return pending;
  },
  ["homepage-accordion-cruises-v4"],
  { revalidate: 300, tags: [PUBLIC_CMS_CACHE_TAG] },
);

/**
 * Active cruises for the homepage luxury accordion.
 * Hardened short-lived client + catalog fallback (never blank Our Voyages).
 */
export const getHomepageAccordionCruises = cache(async (): Promise<
  HomepageAccordionCruise[]
> => {
  return getHomepageAccordionCruisesCached();
});

export const getHomepageAccordionCruisesSafe = cache(async (): Promise<
  HomepageAccordionCruise[]
> => {
  try {
    const rows = await getHomepageAccordionCruises();
    return rows.length > 0 ? rows : accordionFromCatalog();
  } catch (error) {
    logDbError("homepage-accordion-cruises.get", error);
    return accordionGlobal.accordionLastGood?.length
      ? accordionGlobal.accordionLastGood
      : accordionFromCatalog();
  }
});
