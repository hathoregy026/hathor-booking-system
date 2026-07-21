"use client";

import { ResidenceScrollPage } from "@/components/pages/rooms/ResidenceScrollPage";
import { ROYAL_SUITES_PAGE } from "@/lib/page-content";

const SLIDES = [
  "room-royal",
  "room-suite",
  "room-royal",
  "room-luxury",
] as const;

export function RoyalSuitesPageContent() {
  return (
    <ResidenceScrollPage
      heroTitle={ROYAL_SUITES_PAGE.hero.title}
      heroSubtitle={ROYAL_SUITES_PAGE.hero.subtitle}
      breadcrumb="Royal Suites"
      heroImageName="room-royal"
      heroImageAlt="Royal suite with panoramic Nile view aboard Hathor Dahabiya"
      intro={{
        eyebrow: "Luxury Royal Suites",
        title: ROYAL_SUITES_PAGE.overview.title,
        copy: [ROYAL_SUITES_PAGE.intro],
        stats: ["2 Royal Suites", "56 Square Meters", "Main Deck"],
      }}
      chapters={[
        {
          id: "1",
          label: "Royal 01",
          title: "Luxury Royal Suites",
          meta: ROYAL_SUITES_PAGE.overview.subtitle,
          desc: ROYAL_SUITES_PAGE.overview.body,
          slides: SLIDES,
          ctaHref: "/cruises",
          ctaLabel: "View cruises",
        },
        {
          id: "2",
          label: "Royal 02",
          title: "Panoramic Nile View",
          meta: "Private balcony · Main Deck crown",
          desc: ROYAL_SUITES_PAGE.itineraries.options[0]!,
          slides: ["room-royal", "room-luxury", "room-suite", "room-royal"],
        },
        {
          id: "3",
          label: "Royal 03",
          title: "Royal Itineraries",
          meta: "3 · 4 · 7 night sailings",
          desc: ROYAL_SUITES_PAGE.itineraries.options[1]!,
          slides: ["room-suite", "room-royal", "room-luxury", "room-royal"],
        },
        {
          id: "4",
          label: "Royal 04",
          title: "Reserve Your Suite",
          meta: "Privacy · Jacuzzi · Signature palette",
          desc: ROYAL_SUITES_PAGE.itineraries.options[2]!,
          slides: ["room-royal", "room-royal", "room-suite", "room-luxury"],
          ctaHref: "/cruises",
          ctaLabel: ROYAL_SUITES_PAGE.cruisesCta.hrefLabel,
        },
      ]}
      amenities={{
        title: ROYAL_SUITES_PAGE.amenities.title,
        body: ROYAL_SUITES_PAGE.bookCta.body,
        features: ROYAL_SUITES_PAGE.amenities.features,
      }}
      cta={{
        title: ROYAL_SUITES_PAGE.bookCta.title,
        body: ROYAL_SUITES_PAGE.cruisesCta.body,
        href: "/cruises",
        hrefLabel: ROYAL_SUITES_PAGE.cruisesCta.hrefLabel,
      }}
    />
  );
}
