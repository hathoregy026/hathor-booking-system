"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TestimonialsCarousel } from "@/components/public/TestimonialsCarousel";
import { AccommodationsBento } from "@/components/home/AccommodationsBento";
import { EditorialChapter } from "@/components/home/EditorialChapter";
import { FullBleedMedia } from "@/components/home/FullBleedMedia";
import { Hero } from "@/components/home/Hero";
import { LayeredCollageSection } from "@/components/home/LayeredCollageSection";
import { PostHeroIntro } from "@/components/home/PostHeroIntro";
import { PostHeroMedia } from "@/components/home/PostHeroMedia";
import { LegacyScrollSection } from "@/components/home/LegacyScrollSection";
import { ScrollPinnedSection } from "@/components/home/ScrollPinnedSection";
import { SketchSection } from "@/components/home/SketchSection";
import { TextBridge } from "@/components/home/TextBridge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  HOMEPAGE_ITINERARIES,
  HOMEPAGE_PARTNERS,
  HOMEPAGE_REVIEWS,
} from "@/lib/homepage-content";
import {
  HOMEPAGE_ALTERNATING_CHAPTERS,
  HOMEPAGE_CINEMATIC_BRIDGE,
  HOMEPAGE_RESIDENCES_CHAPTERS,
  HOMEPAGE_SPLIT_CHAPTERS,
} from "@/lib/homepage-sections";

const ITINERARY_PILLARS = HOMEPAGE_ITINERARIES.cards.map((card) => ({
  title: card.title,
  body: `${card.duration}. Sailing ${card.schedule}.`,
}));

const STATS = [
  { value: "8", label: "Luxury Cabins" },
  { value: "2", label: "Suites" },
  { value: "2", label: "Royal Suites" },
  { value: "12", label: "Guest Capacity" },
] as const;

export function HomePageContent() {
  return (
    <>
      <Hero />
      <PostHeroIntro />
      <PostHeroMedia />

      <EditorialChapter
        id="itineraries"
        eyebrow="Journeys"
        title={HOMEPAGE_ITINERARIES.title}
        intro={`${HOMEPAGE_ITINERARIES.subtitle}. ${HOMEPAGE_ITINERARIES.intro}`}
        pillars={ITINERARY_PILLARS}
        discoverHref="/cruises"
        discoverLabel="Discover itineraries"
        variant="dark"
      />

      <LegacyScrollSection />

      <FullBleedMedia imageName="home-cinematic-video" showCta={false} />
      <TextBridge
        headline={HOMEPAGE_CINEMATIC_BRIDGE.headline}
        body={HOMEPAGE_CINEMATIC_BRIDGE.body}
      />
      <FullBleedMedia imageName="home-cinematic-still" showCta={false} />

      <ScrollPinnedSection chapters={HOMEPAGE_SPLIT_CHAPTERS} variant="split" />
      <FullBleedMedia imageName="home-split-courtyard" showCta={false} />

      <LayeredCollageSection />
      <FullBleedMedia imageName="home-collage-living" showCta={false} />

      <ScrollPinnedSection
        chapters={HOMEPAGE_RESIDENCES_CHAPTERS}
        variant="split"
        id="residences"
      />
      <FullBleedMedia imageName="home-residences-rooftop" showCta={false} />
      <SketchSection />

      <AccommodationsBento />

      <section className="hathor-stats-band">
        <div className="hathor-container">
          <div className="hathor-stats-grid">
            {STATS.map((stat, index) => (
              <ScrollReveal key={stat.label} delay={index * 80}>
                <div className="hathor-stat">
                  <p className="hathor-stat__value">{stat.value}</p>
                  <p className="hathor-stat__label">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <ScrollPinnedSection
        chapters={HOMEPAGE_ALTERNATING_CHAPTERS}
        variant="alternating"
      />

      <section id="partners" className="owo-chapter owo-chapter--dark">
        <div className="hathor-container">
          <ScrollReveal>
            <header className="owo-chapter__header owo-chapter__header--center">
              <h2 className="owo-chapter__title">{HOMEPAGE_PARTNERS.title}</h2>
            </header>
          </ScrollReveal>
          <div className="owo-partners">
            {HOMEPAGE_PARTNERS.partners.map((partner, index) => (
              <ScrollReveal key={partner} delay={index * 60}>
                <div className="owo-partner">
                  <p className="owo-partner__name">{partner}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="owo-chapter owo-chapter--dark-2">
        <div className="hathor-container">
          <ScrollReveal>
            <header className="owo-chapter__header owo-chapter__header--center">
              <h2 className="owo-chapter__title">{HOMEPAGE_REVIEWS.title}</h2>
              <p className="owo-eyebrow">Guest Reviews</p>
              <p className="owo-chapter__intro">{HOMEPAGE_REVIEWS.body}</p>
            </header>
          </ScrollReveal>
        </div>
      </section>

      <TestimonialsCarousel backgroundImageName="home-testimonials-bg" />

      <section className="lux-cta-band">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="lux-cta-band__decor" aria-hidden />
            <h2 className="lux-cta-band__title">Ready to Embark on Your Journey?</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-light text-[var(--lux-text-grey)]">
              Reserve your place aboard Hathor Dahabiya and discover the Nile as
              it was meant to be experienced.
            </p>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
