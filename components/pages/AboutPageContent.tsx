"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CtaBand } from "@/components/pages/CtaBand";
import { EditorialSection } from "@/components/pages/EditorialSection";
import { PageHero } from "@/components/pages/PageHero";
import { ABOUT_PAGE } from "@/lib/page-content";
import { UNSPLASH_IMAGES } from "@/lib/unsplash-images";

const ACCOMMODATION_SECTIONS = [
  {
    key: "cabin",
    data: ABOUT_PAGE.cabin,
    image: UNSPLASH_IMAGES.luxuryRoom,
    imageLeft: false,
  },
  {
    key: "suite",
    data: ABOUT_PAGE.suite,
    image: UNSPLASH_IMAGES.luxurySuite,
    imageLeft: true,
  },
  {
    key: "royal",
    data: ABOUT_PAGE.royalSuite,
    image: UNSPLASH_IMAGES.royalSuite,
    imageLeft: false,
  },
] as const;

export function AboutPageContent() {
  return (
    <>
      <PageHero
        title={ABOUT_PAGE.hero.title}
        subtitle={ABOUT_PAGE.hero.subtitle}
        breadcrumb="About"
        imageSrc={UNSPLASH_IMAGES.about}
        imageAlt="Hathor Dahabiya sailing on the Nile"
      />

      <section className="hathor-section hathor-section--cream">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {ABOUT_PAGE.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="hathor-body-text mt-6 first:mt-0">
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
              <h2 className="hathor-section-title">{ABOUT_PAGE.accommodations.title}</h2>
              <div className="hathor-gold-line" />
              <p className="hathor-body-text mx-auto mt-6 max-w-2xl text-center">
                {ABOUT_PAGE.accommodations.intro}
              </p>
            </div>
          </ScrollReveal>

          <div className="hathor-stats-grid mt-12">
            {ABOUT_PAGE.accommodations.stats.map((stat, index) => (
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
              {ABOUT_PAGE.accommodations.outro}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {ACCOMMODATION_SECTIONS.map((section) => (
        <EditorialSection
          key={section.key}
          title={section.data.title}
          subtitle={"size" in section.data ? section.data.size : undefined}
          body={[
            "intro" in section.data && section.data.intro
              ? section.data.intro
              : "",
            `Amenities: ${section.data.features.join(" · ")}`,
          ].filter(Boolean)}
          imageSrc={section.image}
          imageAlt={`${section.data.title} aboard Hathor Dahabiya`}
          imageLeft={section.imageLeft}
          dark={section.imageLeft}
        />
      ))}

      <section className="hathor-section hathor-section--cream">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="hathor-section-header">
              <h2 className="hathor-section-title">{ABOUT_PAGE.dining.title}</h2>
              <div className="hathor-gold-line" />
              <p className="hathor-body-text mx-auto mt-6 max-w-2xl text-center">
                {ABOUT_PAGE.dining.intro}
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {ABOUT_PAGE.dining.venues.map((venue, index) => (
              <ScrollReveal key={venue} delay={index * 80}>
                <div className="hathor-feature-card">
                  <p className="hathor-body-text">{venue}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={160}>
            <p className="hathor-body-text mx-auto mt-12 max-w-3xl text-center">
              {ABOUT_PAGE.dining.outro}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <ScrollReveal>
              <div>
                <h2 className="hathor-section-title text-[var(--hathor-cream)]">
                  {ABOUT_PAGE.diningPromo.title}
                </h2>
                <div className="hathor-gold-line hathor-gold-line--left" />
                <p className="hathor-body-text text-[var(--hathor-text-light)]">
                  {ABOUT_PAGE.diningPromo.body}
                </p>
                <Link href="/gastronomy" className="hathor-discover-link mt-6 inline-flex cursor-hover">
                  <span>Explore Gastronomy</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <div className="hathor-editorial__image-wrap hathor-editorial__image-wrap--tall">
                <Image
                  src={UNSPLASH_IMAGES.dining}
                  alt="Fine dining aboard Hathor Dahabiya"
                  fill
                  className="hathor-editorial__image object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="hathor-section hathor-section--surface">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="hathor-section-title">{ABOUT_PAGE.welcome.title}</h2>
              <div className="hathor-gold-line" />
              <p className="hathor-body-text mt-6">{ABOUT_PAGE.welcome.body}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
