"use client";

import { useLayoutEffect, useRef } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_VIDEO_SRC,
} from "@/lib/branding";
import { EX_GOLD_LOGO_SRC, EX_HERO } from "@/lib/ex-page-content";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";
import { usePublicSiteHeroMotion } from "@/hooks/usePublicSiteHeroMotion";

export type PublicSiteHeroProps = {
  lineRight: string;
  lineLeft: string;
  /** When set, replaces lineLeft text with this image (same scroll animation). */
  lineLeftImageSrc?: string;
  subtitle?: string;
  sideLeft?: string;
  sideRight?: string;
  showCta?: boolean;
  ctaLabel?: string;
  /** When false, parent hook (e.g. useExScrollMotion) drives animation. */
  animate?: boolean;
};

export function PublicSiteHero({
  lineRight,
  lineLeft,
  lineLeftImageSrc,
  subtitle,
  sideLeft = EX_HERO.sideLeft,
  sideRight = EX_HERO.sideRight,
  showCta = true,
  ctaLabel = HOMEPAGE_HERO.cta,
  animate = true,
}: PublicSiteHeroProps) {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  usePublicSiteHeroMotion(animate);

  useLayoutEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    void video.play().catch(() => {});
  }, []);

  return (
    <section className="home-hero-container" aria-label="Hero">
      <div className="hero-media">
        <video
          ref={heroVideoRef}
          src={HATHOR_HERO_VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label="Hathor Dahabiya sailing on the Nile"
        />
      </div>
      <div className="hero-overlay" aria-hidden="true" />

      <div className="home-hero-cover" aria-hidden="true" />

      <div className="hero-logo-mark" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hero-logo-img"
          src={EX_GOLD_LOGO_SRC}
          alt={HATHOR_BRAND_NAME}
          width={1600}
          height={560}
        />
      </div>

      <div className="hero-content">
        <h1 className="hero-heading">
          <span className="hero-line hero-line--right">{lineRight}</span>
          {lineLeftImageSrc ? (
            <span className="hero-line hero-line--left hero-line--wordmark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hero-line-wordmark-img"
                src={lineLeftImageSrc}
                alt={lineLeft || "Dahabiya Cruise"}
                width={1600}
                height={302}
                draggable={false}
              />
            </span>
          ) : lineLeft ? (
            <span
              className="hero-line hero-line--left"
              data-text={lineLeft}
            >
              {lineLeft}
            </span>
          ) : null}
        </h1>
        {subtitle ? <p className="hero-sub">{subtitle}</p> : null}
      </div>

      {showCta ? (
        <div className="hero-button">
          <BookNowTrigger className="btn btn-light hero-cta">
            <span className="hero-cta-text">{ctaLabel}</span>
          </BookNowTrigger>
        </div>
      ) : (
        <div className="hero-button" aria-hidden="true">
          <div className="hero-cta" />
        </div>
      )}

      <div className="hero-side hero-side--left" aria-hidden="true">
        <span>{sideLeft}</span>
      </div>
      <div className="hero-side hero-side--right" aria-hidden="true">
        <span>{sideRight}</span>
      </div>

      <div className="hero-scroll-hint" aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}
