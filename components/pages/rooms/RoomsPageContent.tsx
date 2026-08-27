"use client";

import { ResidenceScrollPage } from "@/components/pages/rooms/ResidenceScrollPage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";
import {
  resolveCmsText,
  resolveOverviewIntroParagraphs,
} from "@/lib/website-text-shared";

/** /rooms — Cabins & Suites content from hathorcruise.com/rooms */
export function RoomsPageContent() {
  const { pages } = useWebsiteText();
  const rooms = pages.rooms;
  const introParagraphs = resolveOverviewIntroParagraphs(
    rooms.overviewIntro,
    LUXURY_SUITES_PAGE.copyPlacement.afterHero,
    LUXURY_SUITES_PAGE.overview.body,
  );

  return (
    <ResidenceScrollPage
      heroTitle={LUXURY_SUITES_PAGE.hero.title}
      heroSecondTitle={LUXURY_SUITES_PAGE.hero.secondTitle}
      heroSubtitle={LUXURY_SUITES_PAGE.hero.subtitle}
      heroPage="suites"
      breadcrumb="Cabins & Suites"
      heroImageName="room-suite"
      heroImageAlt="Cabins and suites aboard Hathor Dahabiya"
      intro={{
        eyebrow: "Cabins & Suites",
        title: rooms.overviewTitle,
        copy: introParagraphs,
      }}
      copyPlacement={{
        ...LUXURY_SUITES_PAGE.copyPlacement,
        afterHero: introParagraphs,
      }}
      chapters={[
        ...LUXURY_SUITES_PAGE.categories.map((category, index) => ({
          id: `cat-${index + 1}`,
          label: `Suite ${String(index + 1).padStart(2, "0")}`,
          title: category.title,
          meta: category.meta,
          desc: category.desc,
          slides: category.slides,
          ctaHref: category.href,
          ctaLabel: "Read More",
        })),
        ...LUXURY_SUITES_PAGE.listings.map((listing, index) => ({
          id: `list-${index + 1}`,
          label: `Itinerary ${String(index + 1).padStart(2, "0")}`,
          title: listing.title,
          meta: listing.meta,
          desc: listing.desc,
          slides: listing.slides,
          ctaHref: listing.href,
          ctaLabel: "Read More",
        })),
      ]}
      amenities={{
        title: resolveCmsText(
          rooms.amenitiesTitle,
          LUXURY_SUITES_PAGE.amenities.title,
        ),
        body: resolveCmsText(
          rooms.amenitiesIntro,
          LUXURY_SUITES_PAGE.overview.body,
        ),
        features: LUXURY_SUITES_PAGE.amenities.features,
      }}
      cta={{
        title: LUXURY_SUITES_PAGE.cruisesCta.title,
        body: LUXURY_SUITES_PAGE.cruisesCta.body,
        href: LUXURY_SUITES_PAGE.cruisesCta.href,
        hrefLabel: LUXURY_SUITES_PAGE.cruisesCta.hrefLabel,
      }}
    />
  );
}
