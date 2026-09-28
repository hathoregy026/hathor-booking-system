"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOMEPAGE_POST_HERO } from "@/lib/homepage-content";

export function PreviewPostHeroIntro() {
  return (
    <section className="preview-intro" aria-label="Introduction">
      <div className="preview-container">
        <ScrollReveal>
          <div className="preview-intro__inner">
            <h2 className="preview-intro__headline">
              {HOMEPAGE_POST_HERO.headline}
            </h2>
            {HOMEPAGE_POST_HERO.paragraphs.map((paragraph) => (
              <p key={paragraph} className="preview-intro__paragraph">
                {paragraph}
              </p>
            ))}
            <p className="preview-intro__signoff">{HOMEPAGE_POST_HERO.signOff}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
