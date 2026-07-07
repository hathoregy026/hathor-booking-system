"use client";

import { CtaBand } from "@/components/pages/CtaBand";
import { EditorialSection } from "@/components/pages/EditorialSection";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WELLNESS_PAGE } from "@/lib/page-content";

const sectionPad = "!py-20 md:!py-32";
const titleSize =
  "!font-[family-name:var(--font-playfair)] !text-[clamp(2.5rem,5vw,4.5rem)] !leading-[1.05] !tracking-[-0.03em] !font-normal";
const bodySize = "!text-[1.05rem] !leading-[1.8] !text-gray-600 dark:!text-gray-400";
const editorialScope =
  "[&_.hathor-section-title]:!font-[family-name:var(--font-playfair)] [&_.hathor-section-title]:!text-[clamp(2.5rem,5vw,4.5rem)] [&_.hathor-section-title]:!leading-[1.05] [&_.hathor-section-title]:!tracking-[-0.03em] [&_.hathor-section-title]:!font-normal [&_.hathor-body-text]:!text-[1.05rem] [&_.hathor-body-text]:!leading-[1.8] [&_.hathor-body-text]:!text-gray-600 [&_.hathor-body-text]:dark:!text-gray-400 [&_.hathor-editorial]:!py-20 [&_.hathor-editorial]:md:!py-32";
const footerTail =
  "[&_.hathor-editorial]:!pb-0 [&_.hathor-editorial]:!mb-0 [&_.lux-cta-band]:!py-20 [&_.lux-cta-band]:md:!py-32 [&_.lux-cta-band]:!pb-0 [&_.lux-cta-band]:!mb-0 !mb-0 !pb-0";

export function WellnessPageContent() {
  return (
    <PageScrollTransition
      title={WELLNESS_PAGE.hero.title}
      subtitle={WELLNESS_PAGE.hero.subtitle}
      breadcrumb="Wellness"
      imageName="wellness-hero"
    >
      <section className={`hathor-section hathor-section--dark ${sectionPad}`}>
        <div className="hathor-container">
          <ScrollReveal>
            <div className="stagger-children mx-auto max-w-3xl text-center">
              <h2 className={`hathor-section-title ${titleSize}`}>
                {WELLNESS_PAGE.spa.title}
              </h2>
              <div className="hathor-gold-line" />
              {WELLNESS_PAGE.spa.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className={`hathor-body-text mt-6 ${bodySize}`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className={`${editorialScope} ${footerTail}`}>
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
      </div>
    </PageScrollTransition>
  );
}
