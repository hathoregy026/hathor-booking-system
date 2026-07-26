"use client";

import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { HOMEPAGE_PARTNERS } from "@/lib/homepage-content";

export function PartnersPageContent() {
  const { pages } = useWebsiteText();
  const partners = pages.partners;

  return (
    <PageScrollTransition
      title={partners.title}
      secondTitle="Trusted Worldwide"
      subtitle={partners.chapter}
      breadcrumb="Partners"
      imageName="about-hero"
      heroPage="partners"
    >
      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <ScrollReveal>
            <p className="hathor-section-lead mx-auto max-w-2xl text-center">
              {partners.lead}
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
