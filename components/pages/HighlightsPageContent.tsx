"use client";

import { CtaBand } from "@/components/pages/CtaBand";
import { EditorialSection } from "@/components/pages/EditorialSection";
import { PageHero } from "@/components/pages/PageHero";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";
import { ManagedImage } from "@/components/ui/ManagedImage";

const LANDMARK_IMAGE_NAMES = [
  "landmark-obelisk",
  "landmark-hatshepsut",
  "landmark-valley-kings",
] as const;

export function HighlightsPageContent() {
  return (
    <>
      <PageHero
        title={HIGHLIGHTS_PAGE.hero.title}
        subtitle={HIGHLIGHTS_PAGE.hero.subtitle}
        breadcrumb="Highlights"
        imageName="highlights-hero"
      />

      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {HIGHLIGHTS_PAGE.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="hathor-body-text mt-6 first:mt-0">
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
          className={`hathor-section ${index % 2 === 1 ? "hathor-section--dark-2" : "hathor-section--dark"}`}
        >
          <div className="hathor-container">
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <ScrollReveal direction={index % 2 === 1 ? "right" : "left"}>
                <div className="hathor-editorial__image-wrap">
                  <ManagedImage
                    name={LANDMARK_IMAGE_NAMES[index]}
                    alt={landmark.title}
                    fill
                    className="hathor-editorial__image object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </ScrollReveal>
              <ScrollReveal
                direction={index % 2 === 1 ? "left" : "right"}
                delay={100}
              >
                <div>
                  <p className="hathor-section-eyebrow">Landmark</p>
                  <h2 className="hathor-section-title">{landmark.title}</h2>
                  <div className="hathor-gold-line hathor-gold-line--left" />
                  <p className="hathor-body-text">{landmark.body}</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      ))}

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
    </>
  );
}
