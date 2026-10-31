import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomDetailPage } from "@/components/pages/rooms/RoomDetailPage";
import { GuestReviews } from "@/components/public/GuestReviews";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { PageStructuredData, hotelRoomNode } from "@/components/seo/PageStructuredData";
import type { TranslatedLocale } from "@/lib/i18n/locale";
import { LOCALE_CRUMBS, LOCALE_ROOM_PAGE_WORDS } from "@/lib/i18n/locale-pages";
import { roomShowcaseIn } from "@/lib/i18n/rooms-copy";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { findRoomShowcase } from "@/lib/room-showcase";
import { buildPageMetadata } from "@/lib/seo/metadata";

function roomTitle(locale: TranslatedLocale, room: { slug: string; name: string }) {
  const words = LOCALE_ROOM_PAGE_WORDS[locale];
  return `${room.name}, ${words.kinds[room.slug] ?? words.fallbackKind} | Hathor Dahabiya`;
}

function translatedRoom(locale: TranslatedLocale, slug: string) {
  const room = findRoomShowcase(slug);
  return room ? roomShowcaseIn(room, locale) : undefined;
}

export function localeRoomMetadata(locale: TranslatedLocale, slug: string): Metadata {
  const room = translatedRoom(locale, slug);
  if (!room) return { robots: { index: false, follow: false } };

  return buildPageMetadata({
    title: roomTitle(locale, room),
    description: room.description,
    path: `/${locale}/rooms/${room.slug}`,
    image: {
      url: room.images[0] ?? "/media/hathor/home-hero-poster.webp",
      width: 1600,
      height: 1067,
      alt: LOCALE_ROOM_PAGE_WORDS[locale].imageAlt(room.name),
    },
  });
}

/** One cabin or suite page in a translated language. */
export async function LocaleRoomPage({
  locale,
  slug,
}: {
  locale: TranslatedLocale;
  slug: string;
}) {
  const room = translatedRoom(locale, slug);
  if (!room) notFound();
  const { parents } = LOCALE_ROOM_PAGE_WORDS[locale];
  const parent = parents[room.slug] ?? parents["luxury-suite"];
  const path = `/${locale}/rooms/${room.slug}`;
  const cms = await loadPublicCmsBundle();

  return (
    <>
      <PageStructuredData
        path={path}
        name={roomTitle(locale, room)}
        description={room.description}
        breadcrumbs={[
          { name: LOCALE_CRUMBS[locale].home, path: `/${locale}` },
          parent,
          { name: room.name, path },
        ]}
        image={room.images[0]}
        extra={[
          hotelRoomNode({
            path,
            name: room.name,
            description: room.description,
            occupancy: room.capacity,
            floorSizeSqm: room.sizeSqm,
          }),
        ]}
      />
      <SiteImagesProvider images={cms.siteImages}>
        <RoomDetailPage room={room} reviews={<GuestReviews placement="room" locale={locale} />} />
      </SiteImagesProvider>
    </>
  );
}
