"use client";

import { EditorialSection } from "@/components/pages/EditorialSection";
import { PageHero } from "@/components/pages/PageHero";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ROOMS_PAGE } from "@/lib/page-content";

export function RoomsPageContent() {
  return (
    <>
      <PageHero
        title={ROOMS_PAGE.hero.title}
        subtitle={ROOMS_PAGE.hero.subtitle}
        breadcrumb="Accommodations"
        imageName="room-luxury"
        imageAlt="Luxury cabin aboard Hathor Dahabiya"
      />

      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {ROOMS_PAGE.intro.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="hathor-body-text mt-6 first:mt-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="hathor-section hathor-section--surface">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="hathor-section-header">
              <h2 className="hathor-section-title">
                {ROOMS_PAGE.accommodations.title}
              </h2>
              <div className="hathor-gold-line" />
              <p className="hathor-body-text mx-auto mt-6 max-w-2xl text-center">
                {ROOMS_PAGE.accommodations.intro}
              </p>
            </div>
          </ScrollReveal>

          <div className="hathor-stats-grid mt-12">
            {ROOMS_PAGE.accommodations.stats.map((stat, index) => (
              <ScrollReveal key={stat} delay={index * 80}>
                <div className="hathor-stat hathor-stat--light">
                  <p className="hathor-stat__value text-[var(--hathor-gold)]">
                    {stat.match(/^\d+/)?.[0]}
                  </p>
                  <p className="hathor-stat__label text-[var(--public-muted)]">
                    {stat.replace(/^\d+\s*/, "")}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={120}>
            <p className="hathor-body-text mx-auto mt-12 max-w-3xl text-center">
              {ROOMS_PAGE.accommodations.outro}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {ROOMS_PAGE.categories.map((category, index) => (
        <EditorialSection
          key={category.title}
          chapter="Accommodation"
          title={category.title}
          body={category.body}
          href={"href" in category ? category.href : undefined}
          hrefLabel={"hrefLabel" in category ? category.hrefLabel : undefined}
          imageName={category.imageName}
          imageAlt={`${category.title} aboard Hathor Dahabiya`}
          imageLeft={index % 2 === 1}
          dark={index % 2 === 0}
        />
      ))}

      <section className="hathor-section hathor-section--dark-2">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl">
              <p className="hathor-section-eyebrow">Suites</p>
              <h2 className="hathor-section-title">{ROOMS_PAGE.suites.title}</h2>
              <div className="hathor-gold-line hathor-gold-line--left" />
              <p className="hathor-body-text mt-6">{ROOMS_PAGE.suites.body}</p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {ROOMS_PAGE.suites.features.map((feature) => (
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
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="hathor-section-title">{ROOMS_PAGE.welcome.title}</h2>
              <p className="hathor-section-subtitle mt-4">
                {ROOMS_PAGE.welcome.subtitle}
              </p>
              <div className="hathor-gold-line" />
              <p className="hathor-body-text mt-6">{ROOMS_PAGE.welcome.body}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <EditorialSection
        chapter="Itineraries"
        title={ROOMS_PAGE.cruisesCta.title}
        body={ROOMS_PAGE.cruisesCta.body}
        href="/cruises"
        hrefLabel={ROOMS_PAGE.cruisesCta.hrefLabel}
        imageName="highlights-lifestyle"
        imageAlt="Nile sailing aboard Hathor Dahabiya"
        imageLeft
        fullBleed
      />
    </>
  );
}
