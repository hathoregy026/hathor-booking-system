"use client";

import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOMEPAGE_PARTNERS } from "@/lib/homepage-content";

export function PartnersPageContent() {
  return (
    <PageScrollTransition
      title={HOMEPAGE_PARTNERS.title}
      secondTitle="Trusted Worldwide"
      subtitle={HOMEPAGE_PARTNERS.chapter}
      breadcrumb="Partners"
      imageName="about-hero"
    >
      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <ScrollReveal>
            <p className="hathor-section-lead mx-auto max-w-2xl text-center">
              We sail with trusted names in travel and hospitality — partners who
              share our care for the Nile and our guests.
            </p>
          </ScrollReveal>

          <ScrollReveal className="mt-12">
            <div className="hathor-partners-grid">
              {HOMEPAGE_PARTNERS.partners.map((partner) => (
                <div key={partner} className="hathor-partner-card">
                  <p className="hathor-partner-card__name">{partner}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageScrollTransition>
  );
}
