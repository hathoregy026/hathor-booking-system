import { withDb, logDbError } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";
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

/**
 * Active cruises for the homepage luxury accordion.
 * Background images use dedicated Site Images slots (Admin → Content / Site Images).
 */
export async function getHomepageAccordionCruises(): Promise<
  HomepageAccordionCruise[]
> {
  const rows = await withDb(() =>
    prisma.cruise.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        ports: true,
        basePriceCents: true,
        _count: {
          select: {
            rooms: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  );

  return rows.map((cruise, index) => {
    const roomCount = cruise._count.rooms;
    const roomLabel = roomCount === 1 ? "1 room" : `${roomCount} rooms`;
    const ports = cruise.ports?.trim() || "";
    const description =
      cruise.description?.trim() || ports || cruise.name;
    return {
      id: cruise.id,
      name: cruise.name,
      description,
      imageName: resolveImageSlot(cruise.slug, index),
      ports,
      basePriceCents: cruise.basePriceCents,
      roomCount,
      slug: cruise.slug,
      romanNumeral: ROMAN[index] ?? String(index + 1),
      meta: `${roomLabel} · Base ${formatBasePrice(cruise.basePriceCents)}`,
      href: "/cruises",
    };
  });
}

export async function getHomepageAccordionCruisesSafe(): Promise<
  HomepageAccordionCruise[]
> {
  try {
    return await getHomepageAccordionCruises();
  } catch (error) {
    logDbError("homepage-accordion-cruises.get", error);
    return [];
  }
}
