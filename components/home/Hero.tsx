"use client";

import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { ParallaxHeroVideo } from "@/components/ui/ParallaxHeroVideo";
import { HATHOR_HERO_VIDEO_SRC } from "@/lib/branding";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";

export function Hero() {
  const poster = useSiteImage("home-hero-poster");

  return (
    <section className="owo-hero" aria-label="Hero">
      <ParallaxHeroVideo
        src={HATHOR_HERO_VIDEO_SRC}
        poster={poster.src}
        ariaLabel={poster.alt}
        className="owo-hero__media"
      />
      <div className="owo-hero__overlay" aria-hidden />

      <div className="owo-hero__content">
        <h1 className="owo-hero__title">{HOMEPAGE_HERO.title}</h1>
        <p className="owo-hero__subtitle">{HOMEPAGE_HERO.subtitle}</p>
      </div>

      <BookNowTrigger className="owo-hero__cta public-btn-gold cursor-hover">
        {HOMEPAGE_HERO.cta}
      </BookNowTrigger>
    </section>
  );
}
