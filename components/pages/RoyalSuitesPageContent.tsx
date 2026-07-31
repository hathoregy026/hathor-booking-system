"use client";

import { ResidenceScrollPage } from "@/components/pages/rooms/ResidenceScrollPage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { ROYAL_SUITES_PAGE } from "@/lib/page-content";
import {
  resolveCmsText,
  resolveOverviewIntroParagraphs,
} from "@/lib/website-text-shared";

export function RoyalSuitesPageContent() {
  const { pages } = useWebsiteText();
  const royal = pages.royal;
  const introParagraphs = resolveOverviewIntroParagraphs(
    royal.overviewIntro,
    ROYAL_SUITES_PAGE.copyPlacement.afterHero,
    ROYAL_SUITES_PAGE.overview.body,
  );

  return (
    <ResidenceScrollPage
      heroTitle={ROYAL_SUITES_PAGE.hero.title}
      heroSecondTitle={ROYAL_SUITES_PAGE.hero.secondTitle}
      heroSubtitle={ROYAL_SUITES_PAGE.hero.subtitle}
      heroPage="royal_suites"
      breadcrumb="Royal Suites"
      heroImageName="room-royal"
      heroImageAlt="Royal suite with panoramic Nile view aboard Hathor Dahabiya"
      intro={{
        eyebrow: "Luxury Royal Suites",
        title: royal.overviewTitle,
        copy: introParagraphs,
        stats: [
          "2 Luxury Suites & 2 Royal Suites",
          "56 Square Meters",
          "Panoramic Nile View",
        ],
      }}
      copyPlacement={{
        ...ROYAL_SUITES_PAGE.copyPlacement,
        afterHero: introParagraphs,
      }}
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
        title: resolveCmsText(
          royal.amenitiesTitle,
          ROYAL_SUITES_PAGE.amenities.title,
        ),
        body: resolveCmsText(
          royal.amenitiesIntro,
          ROYAL_SUITES_PAGE.overview.body,
        ),
        features: ROYAL_SUITES_PAGE.amenities.features,
      }}
      cta={{
        title: ROYAL_SUITES_PAGE.bookCta.title,
        body: ROYAL_SUITES_PAGE.bookCta.body,
        href: ROYAL_SUITES_PAGE.cruisesCta.href,
        hrefLabel: ROYAL_SUITES_PAGE.cruisesCta.hrefLabel,
      }}
    />
  );
}
