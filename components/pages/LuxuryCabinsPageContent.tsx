"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditorialSection } from "@/components/pages/EditorialSection";
import { PageHero } from "@/components/pages/PageHero";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { LUXURY_CABINS_PAGE } from "@/lib/page-content";

export function LuxuryCabinsPageContent() {
  return (
    <>
      <PageHero
        title={LUXURY_CABINS_PAGE.hero.title}
        subtitle={LUXURY_CABINS_PAGE.hero.subtitle}
        breadcrumb="Luxury Cabins"
        parentBreadcrumb={{ label: "Rooms", href: "/rooms" }}
        imageName="room-luxury"
        imageAlt="Luxury cabin with Nile view aboard Hathor Dahabiya"
      />

      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <ScrollReveal>
            <Link href="/rooms" className="hathor-discover-link cursor-hover">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Back to Rooms</span>
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <p className="hathor-body-text mx-auto mt-10 max-w-3xl text-center">
              {LUXURY_CABINS_PAGE.intro}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <EditorialSection
        chapter="Accommodation"
        title={LUXURY_CABINS_PAGE.overview.title}
        subtitle={LUXURY_CABINS_PAGE.overview.subtitle}
        body={LUXURY_CABINS_PAGE.overview.body}
        imageName="room-suite"
        imageAlt="Elegant cabin interior aboard Hathor Dahabiya"
        imageLeft
        dark={false}
      />

      <section className="hathor-section hathor-section--dark-2">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl">
              <p className="hathor-section-eyebrow">Amenities</p>
              <h2 className="hathor-section-title">
                {LUXURY_CABINS_PAGE.amenities.title}
              </h2>
              <div className="hathor-gold-line hathor-gold-line--left" />
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {LUXURY_CABINS_PAGE.amenities.features.map((feature) => (
                  <li key={feature} className="hathor-feature-card">
                    <p className="hathor-body-text">{feature}</p>
                  </li>
                ))}
              </ul>
              <p className="hathor-body-text mt-10">
                {LUXURY_CABINS_PAGE.amenities.note}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <EditorialSection
        chapter="Itineraries"
        title={LUXURY_CABINS_PAGE.cruisesCta.title}
        body={LUXURY_CABINS_PAGE.cruisesCta.body}
        href="/cruises"
        hrefLabel={LUXURY_CABINS_PAGE.cruisesCta.hrefLabel}
        imageName="highlights-lifestyle"
        imageAlt="Nile sailing aboard Hathor Dahabiya"
        fullBleed
      />
    </>
  );
}
