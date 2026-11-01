import type { Metadata } from "next";
import type { TranslatedLocale } from "@/lib/i18n/locale";
import { buildPageMetadata } from "@/lib/seo/metadata";

/** Shared shape of a translated room collection page's search settings. Server-only. */
export type LocaleRoomCollection = {
  /** The English address: same page switch in the dashboard, same rooms. */
  englishPath: string;
  path: string;
  pageLabel: string;
  metadata: Metadata;
  name: string;
  crumb: string;
  image: string;
  room: { name: string; description: string; occupancy: number; floorSizeSqm: number };
};

export const roomCollection = (locale: TranslatedLocale, input: {
  englishPath: string;
  title: string;
  description: string;
  pageLabel: string;
  name: string;
  crumb: string;
  image: { url: string; alt: string };
  room: LocaleRoomCollection["room"];
}): LocaleRoomCollection => {
  const path = `/${locale}${input.englishPath}`;
  return {
    englishPath: input.englishPath,
    path,
    pageLabel: input.pageLabel,
    name: input.name,
    crumb: input.crumb,
    image: input.image.url,
    room: input.room,
    metadata: buildPageMetadata({
      title: input.title,
      description: input.description,
      path,
      image: { ...input.image, width: 1920, height: 1280 },
    }),
  };
};
