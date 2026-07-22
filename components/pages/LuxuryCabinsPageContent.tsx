"use client";

import { ResidenceScrollPage } from "@/components/pages/rooms/ResidenceScrollPage";
import { LUXURY_CABINS_PAGE } from "@/lib/page-content";

export function LuxuryCabinsPageContent() {
  return (
    <ResidenceScrollPage
      heroTitle={LUXURY_CABINS_PAGE.hero.title}
      heroSecondTitle={LUXURY_CABINS_PAGE.hero.secondTitle}
      heroSubtitle={LUXURY_CABINS_PAGE.hero.subtitle}
      heroPage="luxury_cabins"
      breadcrumb="Luxury Rooms"
      heroImageName="room-luxury"
      heroImageAlt="Luxury cabin with Nile view aboard Hathor Dahabiya"
      intro={{
        eyebrow: "Luxury Rooms",
        title: LUXURY_CABINS_PAGE.overview.title,
        copy: LUXURY_CABINS_PAGE.copyPlacement.afterHero,
        stats: ["12 Luxury Cabins & Suites", "22 Square Meters", "Nile View"],
      }}
      copyPlacement={LUXURY_CABINS_PAGE.copyPlacement}
      chapters={LUXURY_CABINS_PAGE.listings.map((listing, index) => ({
        id: String(index + 1),
        label: `Cabin ${String(index + 1).padStart(2, "0")}`,
        title: listing.title,
        meta: listing.meta,
        desc: listing.desc,
        slides: listing.slides,
        ctaHref: listing.href,
        ctaLabel: "Read More",
      }))}
      amenities={{
        title: LUXURY_CABINS_PAGE.amenities.title,
        body: LUXURY_CABINS_PAGE.overview.body,
        features: LUXURY_CABINS_PAGE.amenities.features,
      }}
      cta={{
        title: LUXURY_CABINS_PAGE.cruisesCta.title,
        body: LUXURY_CABINS_PAGE.cruisesCta.body,
        href: LUXURY_CABINS_PAGE.cruisesCta.href,
        hrefLabel: LUXURY_CABINS_PAGE.cruisesCta.hrefLabel,
      }}
    />
  );
}
