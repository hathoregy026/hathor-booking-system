"use client";

import { ParallaxHeroVideo } from "@/components/ui/ParallaxHeroVideo";
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_VIDEO_SRC,
  HATHOR_MAIN_LOGO_SRC,
} from "@/lib/branding";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";

export function Hero() {
  return (
    <section className="owo-hero" aria-label="Hero">
      <ParallaxHeroVideo
        src={HATHOR_HERO_VIDEO_SRC}
        ariaLabel="Hathor Dahabiya sailing on the Nile"
        className="owo-hero__media"
      />
      <div className="owo-hero__cream" aria-hidden />
      <div className="owo-hero__overlay" aria-hidden />

      <div className="owo-hero__content">
        <h1 className="owo-hero__title">{HOMEPAGE_HERO.title}</h1>
        <p className="owo-hero__subtitle">{HOMEPAGE_HERO.subtitle}</p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HATHOR_MAIN_LOGO_SRC}
        alt={HATHOR_BRAND_NAME}
        className="owo-hero__logo-main"
      />
    </section>
  );
}
