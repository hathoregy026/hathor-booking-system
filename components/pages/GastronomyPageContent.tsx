"use client";

import { MarketingCtaBand } from "@/components/pages/MarketingCtaBand";
import { EditorialSection } from "@/components/pages/EditorialSection";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GASTRONOMY_PAGE } from "@/lib/page-content";
import { ManagedImage } from "@/components/ui/ManagedImage";

export function GastronomyPageContent() {
  return (
    <PageScrollTransition
      title={GASTRONOMY_PAGE.hero.title}
      subtitle={GASTRONOMY_PAGE.hero.subtitle}
      breadcrumb="Gastronomy"
      imageName="gastronomy-hero"
    >

      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {GASTRONOMY_PAGE.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="hathor-body-text mt-6 first:mt-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <EditorialSection
        chapter="Hathor Restaurant"
        title={GASTRONOMY_PAGE.restaurant.title}
        body={[
          GASTRONOMY_PAGE.restaurant.service,
          `${GASTRONOMY_PAGE.restaurant.atmosphereTitle}: ${GASTRONOMY_PAGE.restaurant.atmosphere}`,
          GASTRONOMY_PAGE.restaurant.closing,
        ]}
        imageName="gastronomy-restaurant"
        imageAlt="Hathor Dahabiya restaurant interior"
        imageLeft
        fullBleed
      />

      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="hathor-section-header">
              <p className="hathor-section-eyebrow">Onboard Venues</p>
              <h2 className="hathor-section-title text-[var(--hathor-cream)]">
                Dining &amp; Lounge
              </h2>
              <div className="hathor-gold-line" />
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {GASTRONOMY_PAGE.venues.map((venue, index) => (
              <ScrollReveal key={venue.title} delay={index * 80}>
                <article className="hathor-venue-card">
                  <div className="hathor-venue-card__image">
                    <ManagedImage
                      name={index % 2 === 0 ? "gastronomy-hero" : "gastronomy-restaurant"}
                      alt={venue.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="hathor-venue-card__body">
                    <h3 className="hathor-venue-card__title">{venue.title}</h3>
                    <p className="hathor-body-text text-[var(--hathor-text-light)]">
                      {venue.description}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <MarketingCtaBand
        title="Taste the Nile"
        body="Reserve your voyage and savor every moment — from sunrise breakfasts to candlelit dinners under the stars."
      />
    </PageScrollTransition>
  );
}
