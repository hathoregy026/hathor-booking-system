"use client";

import { CtaBand } from "@/components/pages/CtaBand";
import { EditorialSection } from "@/components/pages/EditorialSection";
import { PageHero } from "@/components/pages/PageHero";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WELLNESS_PAGE } from "@/lib/page-content";

export function WellnessPageContent() {
  return (
    <>
      <PageHero
        title={WELLNESS_PAGE.hero.title}
        subtitle={WELLNESS_PAGE.hero.subtitle}
        breadcrumb="Wellness"
        imageName="wellness-hero"
      />

      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="hathor-section-title">{WELLNESS_PAGE.spa.title}</h2>
              <div className="hathor-gold-line" />
              {WELLNESS_PAGE.spa.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="hathor-body-text mt-6">
                  {paragraph}
                </p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <EditorialSection
        chapter="Historia Fitness"
        title={WELLNESS_PAGE.fitness.title}
        body={WELLNESS_PAGE.fitness.body}
        imageName="wellness-fitness"
        imageAlt="Historia Fitness Center with panoramic Nile views"
        imageLeft
        fullBleed
      />

      <CtaBand
        title="Renew Your Soul on the Nile"
        body="Book your journey and discover Seneb Spa — where ancient Egyptian wellness meets modern tranquility."
      />
    </>
  );
}
