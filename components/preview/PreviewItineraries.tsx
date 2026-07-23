"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOMEPAGE_ITINERARIES } from "@/lib/homepage-content";

const PILLARS = HOMEPAGE_ITINERARIES.cards.map((card) => ({
  title: card.title,
  body: `${card.duration}. ${card.schedule}.`,
}));

export function PreviewItineraries() {
  return (
    <section id="itineraries" className="preview-chapter" aria-label="Itineraries">
      <div className="preview-container">
        <ScrollReveal>
          <header className="preview-chapter__header">
            <h2 className="preview-chapter__title">{HOMEPAGE_ITINERARIES.title}</h2>
            <p className="preview-eyebrow">Journeys</p>
            <p className="preview-chapter__intro">{HOMEPAGE_ITINERARIES.subtitle}</p>
            <p className="preview-chapter__body">{HOMEPAGE_ITINERARIES.intro}</p>
          </header>
        </ScrollReveal>

        <div className="preview-pillars">
          {PILLARS.map((pillar, index) => (
            <ScrollReveal key={pillar.title} delay={index * 100}>
              <article className="preview-pillar">
                <h3 className="preview-pillar__title">{pillar.title}</h3>
                <p className="preview-pillar__schedule">{pillar.body}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={200}>
          <Link href="/cruises" className="preview-discover cursor-hover">
            <span>Explore More</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
