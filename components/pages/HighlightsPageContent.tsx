"use client";

import { CtaBand } from "@/components/pages/CtaBand";
import { EditorialSection } from "@/components/pages/EditorialSection";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";
import { ManagedImage } from "@/components/ui/ManagedImage";

const LANDMARK_IMAGE_NAMES = [
  "landmark-obelisk",
  "landmark-hatshepsut",
  "landmark-valley-kings",
] as const;

const sectionPad = "!py-20 md:!py-32";
const titleSize =
  "!font-[family-name:var(--font-playfair)] !text-[clamp(2.5rem,5vw,4.5rem)] !leading-[1.05] !tracking-[-0.03em] !font-normal";
const bodySize = "!text-[1.05rem] !leading-[1.8] !text-gray-600 dark:!text-gray-400";
const editorialScope =
  "[&_.hathor-section-title]:!font-[family-name:var(--font-playfair)] [&_.hathor-section-title]:!text-[clamp(2.5rem,5vw,4.5rem)] [&_.hathor-section-title]:!leading-[1.05] [&_.hathor-section-title]:!tracking-[-0.03em] [&_.hathor-section-title]:!font-normal [&_.hathor-body-text]:!text-[1.05rem] [&_.hathor-body-text]:!leading-[1.8] [&_.hathor-body-text]:!text-gray-600 [&_.hathor-body-text]:dark:!text-gray-400 [&_.hathor-editorial]:!py-20 [&_.hathor-editorial]:md:!py-32";
const footerTail =
  "[&_.hathor-editorial]:!pb-0 [&_.hathor-editorial]:!mb-0 [&_.lux-cta-band]:!py-20 [&_.lux-cta-band]:md:!py-32 [&_.lux-cta-band]:!pb-0 [&_.lux-cta-band]:!mb-0 !mb-0 !pb-0";

export function HighlightsPageContent() {
  return (
    <PageScrollTransition
      title={HIGHLIGHTS_PAGE.hero.title}
      subtitle={HIGHLIGHTS_PAGE.hero.subtitle}
      breadcrumb="Highlights"
      imageName="highlights-hero"
    >
      <section className={`hathor-section hathor-section--dark ${sectionPad}`}>
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {HIGHLIGHTS_PAGE.intro.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className={`hathor-body-text mt-6 first:mt-0 ${bodySize}`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {HIGHLIGHTS_PAGE.landmarks.map((landmark, index) => (
        <section
          key={landmark.title}
          className={`hathor-section ${index % 2 === 1 ? "hathor-section--dark-2" : "hathor-section--dark"} ${sectionPad}`}
        >
          <div className="hathor-container">
            <ScrollReveal>
              <div
                className={`stagger-children grid items-center gap-10 lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="hathor-editorial__image-wrap">
                  <ManagedImage
                    name={LANDMARK_IMAGE_NAMES[index]}
                    alt={landmark.title}
                    fill
                    className="hathor-editorial__image object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div>
                  <p className="hathor-section-eyebrow">Landmark</p>
                  <h2 className={`hathor-section-title ${titleSize}`}>
                    {landmark.title}
                  </h2>
                  <div className="hathor-gold-line hathor-gold-line--left" />
                  <p className={`hathor-body-text ${bodySize}`}>{landmark.body}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      ))}

      <div className={`${editorialScope} ${footerTail}`}>
        <EditorialSection
          chapter="Explore More"
          title="Explore More Aboard Hathor"
          body="Every bend of the Nile reveals another chapter of Egypt's timeless story. Sail in privacy, comfort, and true elegance."
          href="/cruises"
          hrefLabel="Discover cruises"
          imageName="highlights-lifestyle"
          imageAlt="Scenic Nile views from Hathor Dahabiya"
          imageLeft
          fullBleed
        />

        <CtaBand />
      </div>
    </PageScrollTransition>
  );
}
