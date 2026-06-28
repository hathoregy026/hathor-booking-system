"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOMEPAGE_POST_HERO } from "@/lib/homepage-content";

export function PostHeroIntro() {
  return (
    <section className="hathor-intro" aria-label="Introduction">
      <div className="hathor-container">
        <ScrollReveal>
          <div className="hathor-intro__inner">
            <h2 className="hathor-intro__headline">{HOMEPAGE_POST_HERO.headline}</h2>
            {HOMEPAGE_POST_HERO.paragraphs.map((paragraph) => (
              <p key={paragraph} className="hathor-intro__paragraph">
                {paragraph}
              </p>
            ))}
            <p className="hathor-intro__signoff">{HOMEPAGE_POST_HERO.signOff}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
