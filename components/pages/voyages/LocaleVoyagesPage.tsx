import { VoyagesPageContent } from "@/components/pages/voyages/VoyagesPageContent";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import {
  PageStructuredData,
  boatTripNode,
} from "@/components/seo/PageStructuredData";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import type { TranslatedLocale } from "@/lib/i18n/locale";
import { LOCALE_CRUMBS, LOCALE_VOYAGE_PAGES } from "@/lib/i18n/locale-pages";
import type { VoyagePageKey } from "@/lib/i18n/voyages-pages";
import { buildVoyagesPageItems } from "@/lib/voyages-page-content";

/**
 * One translated Voyages page (the hub and the three route pages): the same
 * page as its English address, with this language's dashboard text, hero and
 * search data.
 */
export async function LocaleVoyagesPage({
  locale,
  page,
}: {
  locale: TranslatedLocale;
  page: VoyagePageKey;
}) {
  const pages = LOCALE_VOYAGE_PAGES[locale];
  const config = pages[page];
  const cruises = await getHomepageAccordionCruisesSafe();
  const voyages = buildVoyagesPageItems(cruises);
  const description =
    typeof config.metadata.description === "string" ? config.metadata.description : "";
  const breadcrumbs = [
    { name: LOCALE_CRUMBS[locale].home, path: `/${locale}` },
    { name: pages.voyages.crumb, path: `/${locale}/voyages` },
    ...(page === "voyages" ? [] : [{ name: config.crumb, path: config.path }]),
  ];

  return (
    <>
      <PageStructuredData
        path={config.path}
        name={config.name}
        description={description}
        breadcrumbs={breadcrumbs}
        extra={[boatTripNode({ path: config.path, ...config.trip })]}
      />
      <LocaleWebsiteText locale={locale}>
        <VoyagesPageContent
          voyages={voyages}
          heroTitleLinesOverride={config.heroLines}
          nonCharterDetailsHref={config.detailsHref}
          openingStatementOverride={config.statement}
        />
      </LocaleWebsiteText>
    </>
  );
}
