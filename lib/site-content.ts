import { cache } from "react";
import { ContentSection } from "@/app/generated/prisma/enums";
import { HATHOR_SITE_CONTENT } from "@/lib/hathor-catalog";
import { prisma } from "@/lib/prisma";
import { siteContentSelect } from "@/lib/query-selects";

export type SiteContentItem = {
  section: ContentSection;
  title: string;
  subtitle: string | null;
  bodyText: string | null;
  imageUrl: string | null;
};

const DEFAULT_CONTENT: Record<ContentSection, SiteContentItem> = {
  [ContentSection.HERO]: {
    section: ContentSection.HERO,
    ...HATHOR_SITE_CONTENT.HERO,
  },
  [ContentSection.ABOUT]: {
    section: ContentSection.ABOUT,
    ...HATHOR_SITE_CONTENT.ABOUT,
  },
  [ContentSection.ITINERARIES]: {
    section: ContentSection.ITINERARIES,
    ...HATHOR_SITE_CONTENT.ITINERARIES,
  },
  [ContentSection.ROOMS]: {
    section: ContentSection.ROOMS,
    ...HATHOR_SITE_CONTENT.ROOMS,
  },
  [ContentSection.WELLNESS]: {
    section: ContentSection.WELLNESS,
    ...HATHOR_SITE_CONTENT.WELLNESS,
  },
  [ContentSection.GASTRONOMY]: {
    section: ContentSection.GASTRONOMY,
    ...HATHOR_SITE_CONTENT.GASTRONOMY,
  },
  [ContentSection.CHARTER]: {
    section: ContentSection.CHARTER,
    title: "Charter Dahabiya Cruise",
    subtitle: null,
    bodyText: null,
    imageUrl: null,
  },
  [ContentSection.CONTACT]: {
    section: ContentSection.CONTACT,
    title: "Contact Us",
    subtitle: "We would love to hear from you",
    bodyText:
      "Reach our reservations team for cruise availability, charter inquiries, or special requests. We are here to help plan your Nile journey.",
    imageUrl: null,
  },
};

export const SITE_CONTENT_SECTIONS: ContentSection[] = [
  ContentSection.HERO,
  ContentSection.ABOUT,
  ContentSection.ITINERARIES,
  ContentSection.ROOMS,
  ContentSection.WELLNESS,
  ContentSection.GASTRONOMY,
];

export function getDefaultSiteContent(): SiteContentItem[] {
  return SITE_CONTENT_SECTIONS.map((section) => DEFAULT_CONTENT[section]);
}

function mapRecordToItem(record: {
  section: ContentSection;
  title: string;
  subtitle: string | null;
  bodyText: string | null;
  imageUrl: string | null;
}): SiteContentItem {
  return {
    section: record.section,
    title: record.title,
    subtitle: record.subtitle,
    bodyText: record.bodyText,
    imageUrl: record.imageUrl,
  };
}

export const getSiteContent = cache(async (): Promise<SiteContentItem[]> => {
  const defaults = getDefaultSiteContent();

  try {
    const records = await prisma.siteContent.findMany({
      where: { section: { in: SITE_CONTENT_SECTIONS } },
      select: siteContentSelect,
    });

    const bySection = new Map(
      records.map((record) => [record.section, mapRecordToItem(record)]),
    );

    return SITE_CONTENT_SECTIONS.map(
      (section, index) => bySection.get(section) ?? defaults[index],
    );
  } catch (error) {
    console.error("getSiteContent failed, using defaults:", error);
    return defaults;
  }
});

export async function getHeroContent(): Promise<SiteContentItem> {
  const content = await getSiteContent();
  const defaults = getDefaultSiteContent();
  return (
    content.find((item) => item.section === ContentSection.HERO) ?? defaults[0]
  );
}

export const getSiteContentSection = cache(
  async (section: ContentSection): Promise<SiteContentItem> => {
    try {
      const record = await prisma.siteContent.findUnique({
        where: { section },
        select: siteContentSelect,
      });

      if (record) {
        return mapRecordToItem(record);
      }
    } catch (error) {
      console.error(`getSiteContentSection(${section}) failed:`, error);
    }

    return DEFAULT_CONTENT[section];
  },
);

export function getContentBySection(
  content: SiteContentItem[],
  section: ContentSection,
): SiteContentItem {
  const defaults = getDefaultSiteContent();
  return (
    content.find((item) => item.section === section) ??
    defaults.find((item) => item.section === section) ??
    defaults[0]
  );
}
