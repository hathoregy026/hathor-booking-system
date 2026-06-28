"use client";

import Link from "next/link";
import { ParallaxHeroVideo } from "@/components/ui/ParallaxHeroVideo";
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_POSTER_SRC,
  HATHOR_HERO_VIDEO_SOURCES,
  HATHOR_LOGO_DAY_SRC,
  HATHOR_LOGO_SRC,
} from "@/lib/branding";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";

export function Hero() {
  return (
    <section className="owo-hero" aria-label="Hero">
      <ParallaxHeroVideo
        sources={[...HATHOR_HERO_VIDEO_SOURCES]}
        poster={HATHOR_HERO_POSTER_SRC}
        ariaLabel="Hathor Dahabiya sailing on the Nile"
        className="owo-hero__media"
      />
      <div className="owo-hero__cream" aria-hidden />
      <div className="owo-hero__overlay" aria-hidden />

      <div className="owo-hero__content">
        <h1 className="owo-hero__title">{HOMEPAGE_HERO.title}</h1>
        <p className="owo-hero__subtitle">{HOMEPAGE_HERO.subtitle}</p>
      </div>

      <Link href="/" className="owo-hero__logo-bottom cursor-hover" aria-label={HATHOR_BRAND_NAME}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HATHOR_LOGO_SRC}
          alt=""
          aria-hidden
          className="owo-hero__logo-bottom-img hathor-brand-logo hathor-brand-logo--night"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HATHOR_LOGO_DAY_SRC}
          alt=""
          aria-hidden
          className="owo-hero__logo-bottom-img hathor-brand-logo hathor-brand-logo--day"
        />
      </Link>
    </section>
  );
}
