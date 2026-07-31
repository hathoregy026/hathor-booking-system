"use client";

import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { HOMEPAGE_PARTNERS } from "@/lib/homepage-content";
import { normalizeOptionalText } from "@/lib/website-text-shared";

export function PartnersPageContent() {
  const { pages } = useWebsiteText();
  const partners = pages.partners;
  const title = normalizeOptionalText(partners.title) ?? HOMEPAGE_PARTNERS.title;
  const chapter = normalizeOptionalText(partners.chapter);
  const lead = normalizeOptionalText(partners.lead);

  return (
    <PageScrollTransition
      title={title}
      secondTitle={chapter}
      breadcrumb="Partners"
      imageName="about-hero"
      heroPage="partners"
    >
      <section className="hathor-section hathor-section--dark">
        <div className="page-container">
          {lead ? (
            <ScrollReveal>
              <header className="section-header">
                <p className="section-body typo-body-text mx-auto max-w-2xl text-center">
                  {lead}
                </p>
              </header>
            </ScrollReveal>
          ) : null}

          <ScrollReveal className="mt-12">
            <ul className="hathor-partners-grid" aria-label="Partners">
              {HOMEPAGE_PARTNERS.partners.map((partner) => (
                <li key={partner} className="hathor-partner-card">
                  <p className="hathor-partner-card__name">{partner}</p>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>
    </PageScrollTransition>
  );
}
