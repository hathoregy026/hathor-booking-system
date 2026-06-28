"use client";

import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";
import { HOMEPAGE_LAYERED_COLLAGE } from "@/lib/homepage-sections";

export function LayeredCollageSection() {
  const { eyebrow, headline, body, images, backgroundName } = HOMEPAGE_LAYERED_COLLAGE;

  return (
    <section className="hathor-collage" aria-label={headline}>
      <div className="hathor-collage__bg" aria-hidden>
        <ManagedImage
          name={backgroundName}
          alt=""
          fill
          className="object-cover hathor-collage__bg-image"
          sizes="100vw"
        />
      </div>

      <div className="hathor-collage__content">
        <ScrollReveal>
          <header className="hathor-collage__header">
            <p className="owo-eyebrow">{eyebrow}</p>
            <h2 className="hathor-collage__title">{headline}</h2>
            <p className="hathor-collage__body">{body}</p>
          </header>
        </ScrollReveal>

        <div className="hathor-collage__images">
          <div className="hathor-collage__image hathor-collage__image--large">
            <ManagedImage
              name={images.large.name}
              alt={images.large.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 70vw, 36vw"
            />
          </div>
          <div className="hathor-collage__image hathor-collage__image--small">
            <ManagedImage
              name={images.small.name}
              alt={images.small.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 45vw, 22vw"
            />
          </div>
        </div>
      </div>

      <BookNowTrigger className="hathor-collage__cta public-btn-gold cursor-hover">
        {HOMEPAGE_HERO.cta}
      </BookNowTrigger>
    </section>
  );
}
