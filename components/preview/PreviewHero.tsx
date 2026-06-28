"use client";

import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { ParallaxHeroVideo } from "@/components/ui/ParallaxHeroVideo";
import { HATHOR_HERO_VIDEO_SRC } from "@/lib/branding";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";

export function PreviewHero() {
  const poster = useSiteImage("home-hero-poster");

  return (
    <section className="preview-hero" aria-label="Hero">
      <ParallaxHeroVideo
        src={HATHOR_HERO_VIDEO_SRC}
        poster={poster.src}
        ariaLabel={poster.alt}
        className="preview-hero__media"
      />
      <div className="preview-hero__overlay" aria-hidden />

      <div className="preview-hero__content">
        <h1 className="preview-hero__title">{HOMEPAGE_HERO.title}</h1>
        <p className="preview-hero__subtitle">{HOMEPAGE_HERO.subtitle}</p>
      </div>

      <BookNowTrigger className="preview-hero__cta public-btn-gold cursor-hover">
        {HOMEPAGE_HERO.cta}
      </BookNowTrigger>
    </section>
  );
}
