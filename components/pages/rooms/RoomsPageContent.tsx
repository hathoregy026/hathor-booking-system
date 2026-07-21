"use client";

import { ResidenceScrollPage } from "@/components/pages/rooms/ResidenceScrollPage";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";

/** /rooms — Cabins & Suits content from hathorcruise.com/rooms */
export function RoomsPageContent() {
  return (
    <ResidenceScrollPage
      heroTitle={LUXURY_SUITES_PAGE.hero.title}
      heroSubtitle={LUXURY_SUITES_PAGE.hero.subtitle}
      breadcrumb="Cabins & Suits"
      heroImageName="room-suite"
      heroImageAlt="Cabins and suites aboard Hathor Dahabiya"
      intro={{
        eyebrow: "Cabins & Suits",
        title: LUXURY_SUITES_PAGE.overview.title,
        copy: LUXURY_SUITES_PAGE.copyPlacement.afterHero,
      }}
      copyPlacement={LUXURY_SUITES_PAGE.copyPlacement}
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
        title: LUXURY_SUITES_PAGE.amenities.title,
        body: LUXURY_SUITES_PAGE.overview.body,
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
