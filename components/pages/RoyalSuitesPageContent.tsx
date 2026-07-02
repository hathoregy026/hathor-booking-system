"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { EditorialSection } from "@/components/pages/EditorialSection";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ROYAL_SUITES_PAGE } from "@/lib/page-content";

export function RoyalSuitesPageContent() {
  return (
    <PageScrollTransition
      title={ROYAL_SUITES_PAGE.hero.title}
      subtitle={ROYAL_SUITES_PAGE.hero.subtitle}
      breadcrumb="Royal Suites"
      parentBreadcrumb={{ label: "Rooms", href: "/rooms" }}
      imageName="room-royal"
      imageAlt="Royal suite with panoramic Nile view aboard Hathor Dahabiya"
    >

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
              {ROYAL_SUITES_PAGE.intro}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <EditorialSection
        chapter="Accommodation"
        title={ROYAL_SUITES_PAGE.overview.title}
        subtitle={ROYAL_SUITES_PAGE.overview.subtitle}
        body={ROYAL_SUITES_PAGE.overview.body}
        imageName="room-royal"
        imageAlt="Royal suite interior aboard Hathor Dahabiya"
        imageLeft
        dark={false}
      />

      <section className="hathor-section hathor-section--surface">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="hathor-section-header">
              <h2 className="hathor-section-title">
                {ROYAL_SUITES_PAGE.itineraries.title}
              </h2>
              <div className="hathor-gold-line" />
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {ROYAL_SUITES_PAGE.itineraries.options.map((option, index) => (
              <ScrollReveal key={option.slice(0, 48)} delay={index * 80}>
                <div className="hathor-feature-card h-full">
                  <p className="hathor-body-text">{option}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="hathor-section hathor-section--dark-2">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl">
              <p className="hathor-section-eyebrow">Amenities</p>
              <h2 className="hathor-section-title">
                {ROYAL_SUITES_PAGE.amenities.title}
              </h2>
              <div className="hathor-gold-line hathor-gold-line--left" />
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ROYAL_SUITES_PAGE.amenities.features.map((feature) => (
                  <li key={feature} className="hathor-feature-card">
                    <p className="hathor-body-text">{feature}</p>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="hathor-section hathor-section--cream">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="hathor-section-title">{ROYAL_SUITES_PAGE.bookCta.title}</h2>
              <div className="hathor-gold-line" />
              <p className="hathor-body-text mt-6">{ROYAL_SUITES_PAGE.bookCta.body}</p>
              <BookNowTrigger className="public-btn-gold mt-8 px-10 py-3.5 text-xs tracking-[0.2em] uppercase">
                Book Now
              </BookNowTrigger>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <EditorialSection
        chapter="Itineraries"
        title={ROYAL_SUITES_PAGE.cruisesCta.title}
        body={ROYAL_SUITES_PAGE.cruisesCta.body}
        href="/cruises"
        hrefLabel={ROYAL_SUITES_PAGE.cruisesCta.hrefLabel}
        imageName="highlights-lifestyle"
        imageAlt="Nile sailing aboard Hathor Dahabiya"
        fullBleed
      />
    </PageScrollTransition>
  );
}
