"use client";

import { ResidenceScrollPage } from "@/components/pages/rooms/ResidenceScrollPage";
import { LUXURY_CABINS_PAGE } from "@/lib/page-content";

const SLIDES = [
  "room-luxury",
  "room-suite",
  "room-luxury",
  "room-royal",
] as const;

export function LuxuryCabinsPageContent() {
  return (
    <ResidenceScrollPage
      heroTitle={LUXURY_CABINS_PAGE.hero.title}
      heroSubtitle={LUXURY_CABINS_PAGE.hero.subtitle}
      breadcrumb="Luxury Rooms"
      heroImageName="room-luxury"
      heroImageAlt="Luxury cabin with Nile view aboard Hathor Dahabiya"
      intro={{
        eyebrow: "Luxury Rooms",
        title: LUXURY_CABINS_PAGE.overview.title,
        copy: [LUXURY_CABINS_PAGE.intro],
        stats: ["8 Luxury Cabins", "22 Square Meters", "Nile View"],
      }}
      chapters={[
        {
          id: "1",
          label: "Cabin 01",
          title: "Luxury Rooms",
          meta: LUXURY_CABINS_PAGE.overview.subtitle,
          desc: LUXURY_CABINS_PAGE.overview.body,
          slides: SLIDES,
          ctaHref: "/cruises",
          ctaLabel: "View cruises",
        },
        {
          id: "2",
          label: "Cabin 02",
          title: "Nile River View",
          meta: "Panoramic glass · Smart cabin · Quiet deck",
          desc: "Every cabin in our Small Luxury Nile Cruise Rooms provides guests with a tranquil space to relax while they take in wide-ranging views of the Nile River.",
          slides: ["room-luxury", "room-royal", "room-suite", "room-luxury"],
        },
        {
          id: "3",
          label: "Cabin 03",
          title: "Refined Comfort",
          meta: "22 sqm · Ensuite · Connected options",
          desc: LUXURY_CABINS_PAGE.amenities.note,
          slides: ["room-suite", "room-luxury", "room-royal", "room-luxury"],
        },
        {
          id: "4",
          label: "Cabin 04",
          title: "Sail in Style",
          meta: "Aswan · Luxor · Private Dahabiya",
          desc: LUXURY_CABINS_PAGE.cruisesCta.body,
          slides: ["room-royal", "room-luxury", "room-suite", "room-luxury"],
          ctaHref: "/cruises",
          ctaLabel: LUXURY_CABINS_PAGE.cruisesCta.hrefLabel,
        },
      ]}
      amenities={{
        title: LUXURY_CABINS_PAGE.amenities.title,
        body: LUXURY_CABINS_PAGE.overview.body,
        features: LUXURY_CABINS_PAGE.amenities.features,
      }}
      cta={{
        title: LUXURY_CABINS_PAGE.cruisesCta.title,
        body: LUXURY_CABINS_PAGE.cruisesCta.body,
        href: "/cruises",
        hrefLabel: LUXURY_CABINS_PAGE.cruisesCta.hrefLabel,
      }}
    />
  );
}
