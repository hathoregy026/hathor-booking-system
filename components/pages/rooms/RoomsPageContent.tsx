"use client";

import { ResidenceScrollPage } from "@/components/pages/rooms/ResidenceScrollPage";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";

/** /rooms — Luxury Suites (RAW_DATA), residence scroll design */
export function RoomsPageContent() {
  return (
    <ResidenceScrollPage
      heroTitle={LUXURY_SUITES_PAGE.hero.title}
      heroSubtitle={LUXURY_SUITES_PAGE.hero.subtitle}
      breadcrumb="Luxury Suites"
      heroImageName="room-suite"
      heroImageAlt="Luxury suite aboard Hathor Dahabiya"
      intro={{
        eyebrow: "Luxury Suites",
        title: LUXURY_SUITES_PAGE.overview.title,
        copy: LUXURY_SUITES_PAGE.intro,
        stats: ["2 Elegant Suites", "46 Square Meters", "Lower Deck"],
      }}
      chapters={[
        {
          id: "1",
          label: "Suite 01",
          title: "Luxury Suites",
          meta: LUXURY_SUITES_PAGE.overview.subtitle,
          desc: LUXURY_SUITES_PAGE.overview.body,
          slides: ["room-suite", "room-luxury", "room-suite", "room-royal"],
          ctaHref: "/cruises",
          ctaLabel: "View cruises",
        },
        {
          id: "2",
          label: "Suite 02",
          title: "Accessible Hathor Suite",
          meta: "Spacious retreat · Panoramic Nile",
          desc: LUXURY_SUITES_PAGE.intro[0]!,
          slides: ["room-suite", "room-royal", "room-luxury", "room-suite"],
        },
        {
          id: "3",
          label: "Suite 03",
          title: "Jacuzzi Sanctuary",
          meta: "Dual baths · Smart entertainment",
          desc: LUXURY_SUITES_PAGE.intro[1]!,
          slides: ["room-royal", "room-suite", "room-luxury", "room-suite"],
        },
        {
          id: "4",
          label: "Suite 04",
          title: "Sail in a Suite",
          meta: "Luxor · Aswan · Private comfort",
          desc: LUXURY_SUITES_PAGE.cruisesCta.body,
          slides: ["room-suite", "room-suite", "room-royal", "room-luxury"],
          ctaHref: "/cruises",
          ctaLabel: LUXURY_SUITES_PAGE.cruisesCta.hrefLabel,
        },
      ]}
      amenities={{
        title: LUXURY_SUITES_PAGE.amenities.title,
        body: LUXURY_SUITES_PAGE.overview.body,
        features: LUXURY_SUITES_PAGE.amenities.features,
      }}
      cta={{
        title: LUXURY_SUITES_PAGE.cruisesCta.title,
        body: LUXURY_SUITES_PAGE.cruisesCta.body,
        href: "/cruises",
        hrefLabel: LUXURY_SUITES_PAGE.cruisesCta.hrefLabel,
      }}
    />
  );
}
