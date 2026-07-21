"use client";

import { ResidenceScrollPage } from "@/components/pages/rooms/ResidenceScrollPage";
import { ROYAL_SUITES_PAGE } from "@/lib/page-content";

export function RoyalSuitesPageContent() {
  return (
    <ResidenceScrollPage
      heroTitle={ROYAL_SUITES_PAGE.hero.title}
      heroSecondTitle={ROYAL_SUITES_PAGE.hero.secondTitle}
      heroSubtitle={ROYAL_SUITES_PAGE.hero.subtitle}
      breadcrumb="Royal Suites"
      heroImageName="room-royal"
      heroImageAlt="Royal suite with panoramic Nile view aboard Hathor Dahabiya"
      intro={{
        eyebrow: "Luxury Royal Suites",
        title: ROYAL_SUITES_PAGE.overview.title,
        copy: ROYAL_SUITES_PAGE.copyPlacement.afterHero,
        stats: ["2 Luxury Suites & 2 Royal Suites", "56 Square Meters", "Panoramic Nile view"],
      }}
      copyPlacement={ROYAL_SUITES_PAGE.copyPlacement}
      chapters={ROYAL_SUITES_PAGE.listings.map((listing, index) => ({
        id: String(index + 1),
        label: `Royal ${String(index + 1).padStart(2, "0")}`,
        title: listing.title,
        meta: listing.meta,
        desc: listing.desc,
        slides: listing.slides,
        ctaHref: listing.href,
        ctaLabel: "Read More",
      }))}
      amenities={{
        title: ROYAL_SUITES_PAGE.amenities.title,
        body: ROYAL_SUITES_PAGE.bookCta.body,
        features: ROYAL_SUITES_PAGE.amenities.features,
      }}
      cta={{
        title: ROYAL_SUITES_PAGE.bookCta.title,
        body: ROYAL_SUITES_PAGE.cruisesCta.body,
        href: ROYAL_SUITES_PAGE.cruisesCta.href,
        hrefLabel: ROYAL_SUITES_PAGE.cruisesCta.hrefLabel,
      }}
    />
  );
}
