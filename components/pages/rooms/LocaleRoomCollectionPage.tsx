import { GuestReviews } from "@/components/public/GuestReviews";
import { RoomCollectionEditorialPage } from "@/components/pages/rooms/RoomCollectionEditorialPage";
import { PublicCmsTextRuntime } from "@/components/public/PublicCmsTextRuntime";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { PageStructuredData, hotelRoomNode } from "@/components/seo/PageStructuredData";
import type { TranslatedLocale } from "@/lib/i18n/locale";
import { LOCALE_CRUMBS, LOCALE_ROOM_COLLECTIONS } from "@/lib/i18n/locale-pages";
import { localizeWebsiteText } from "@/lib/i18n/website-text";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import type { RoomCollectionVariant } from "@/lib/room-collection-editorial";
import { ROOM_SHOWCASES } from "@/lib/room-showcase";

const ROOMS_FOR: Record<RoomCollectionVariant, (slug: string) => boolean> = {
  cabins: (slug) => slug.includes("room"),
  suites: (slug) => slug === "luxury-suite",
  royal: (slug) => slug === "royal-suite",
};

/**
 * A translated room collection page: the English page's stage and rooms, with
 * this language's search settings, structured data and dashboard text. The
 * dashboard page switch is the English page's, so one switch shows or hides all.
 */
export async function LocaleRoomCollectionPage({
  locale,
  variant,
}: {
  locale: TranslatedLocale;
  variant: RoomCollectionVariant;
}) {
  const page = LOCALE_ROOM_COLLECTIONS[locale][variant];
  const cms = await loadPublicCmsBundle();
  const description =
    typeof page.metadata.description === "string" ? page.metadata.description : "";

  return (
    <StandalonePageVisibilityShell
      path={page.englishPath}
      pageLabel={page.pageLabel}
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <PageStructuredData
        path={page.path}
        name={page.name}
        description={description}
        breadcrumbs={[
          { name: LOCALE_CRUMBS[locale].home, path: `/${locale}` },
          { name: page.crumb, path: page.path },
        ]}
        image={page.image}
        extra={[hotelRoomNode({ path: page.path, ...page.room })]}
      />
      <SiteImagesProvider images={cms.siteImages}>
        <PublicCmsTextRuntime
          websiteText={localizeWebsiteText(cms.websiteText, locale)}
          websiteTextMobile={localizeWebsiteText(cms.websiteTextMobile, locale)}
          typography={cms.typography}
          typographyMobile={cms.typographyMobile}
        >
          <RoomCollectionEditorialPage
            variant={variant}
            rooms={ROOM_SHOWCASES.filter((room) => ROOMS_FOR[variant](room.slug))}
            reviews={<GuestReviews placement="room" locale={locale} />}
          />
        </PublicCmsTextRuntime>
      </SiteImagesProvider>
    </StandalonePageVisibilityShell>
  );
}
