import { VoyagesPageContent } from "@/components/pages/voyages/VoyagesPageContent";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import {
  PageStructuredData,
  boatTripNode,
} from "@/components/seo/PageStructuredData";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import { ITALIAN_VOYAGE_PAGES, type VoyagePageKey } from "@/lib/i18n/voyages-pages-it";
import { buildVoyagesPageItems } from "@/lib/voyages-page-content";

/**
 * One Italian Voyages page (`/it/voyages` and the three route pages): the same
 * page as its English address, with Italian dashboard text, hero and search data.
 */
export async function ItalianVoyagesPage({ page }: { page: VoyagePageKey }) {
  const config = ITALIAN_VOYAGE_PAGES[page];
  const cruises = await getHomepageAccordionCruisesSafe();
  const voyages = buildVoyagesPageItems(cruises);
  const description =
    typeof config.metadata.description === "string" ? config.metadata.description : "";
  const breadcrumbs = [
    { name: "Home", path: "/it" },
    { name: ITALIAN_VOYAGE_PAGES.voyages.crumb, path: "/it/voyages" },
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
      <LocaleWebsiteText locale="it">
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
