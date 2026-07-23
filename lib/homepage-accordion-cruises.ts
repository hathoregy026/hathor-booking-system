import { withDb, logDbError } from "@/lib/db-safe";
import { HATHOR_MEDIA } from "@/lib/hathor-media";
import { prisma } from "@/lib/prisma";

export type HomepageAccordionCruise = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  ports: string;
  basePriceCents: number;
  roomCount: number;
  slug: string;
  romanNumeral: string;
  meta: string;
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

/** Placeholder backgrounds until a cruise image is set in Admin → Cruises. */
const FALLBACK_BY_SLUG: Record<string, string> = {
  "3-nights-aswan-luxor": HATHOR_MEDIA.heroCruises,
  "4-nights-luxor-aswan": HATHOR_MEDIA.splitCourtyard,
  "7-nights-luxor-aswan-luxor": HATHOR_MEDIA.storyLegacyLarge,
  "nile-majesty": HATHOR_MEDIA.collageLiving,
};

const FALLBACK_BY_INDEX = [
  HATHOR_MEDIA.heroCruises,
  HATHOR_MEDIA.splitCourtyard,
  HATHOR_MEDIA.storyLegacyLarge,
  HATHOR_MEDIA.collageLiving,
] as const;

function formatBasePrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function resolveImageUrl(
  slug: string,
  imageUrl: string | null,
  index: number,
): string {
  const trimmed = imageUrl?.trim();
  if (trimmed) return trimmed;
  return (
    FALLBACK_BY_SLUG[slug] ??
    FALLBACK_BY_INDEX[index % FALLBACK_BY_INDEX.length] ??
    HATHOR_MEDIA.heroCruises
  );
}

/**
 * Active cruises for the homepage luxury accordion.
 * Background images prefer Admin → Cruises `imageUrl` (dashboard CMS upload).
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
        imageUrl: true,
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
      imageUrl: resolveImageUrl(cruise.slug, cruise.imageUrl, index),
      ports,
      basePriceCents: cruise.basePriceCents,
      roomCount,
      slug: cruise.slug,
      romanNumeral: ROMAN[index] ?? String(index + 1),
      meta: `${roomLabel} · Base ${formatBasePrice(cruise.basePriceCents)}`,
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
