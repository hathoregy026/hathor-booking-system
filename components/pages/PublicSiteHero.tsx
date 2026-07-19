"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HathorLogoSplit } from "@/components/public/HathorLogoSplit";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_VIDEO_SRC,
} from "@/lib/branding";
import { EX_GOLD_LOGO_SRC, EX_HERO } from "@/lib/ex-page-content";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";
import { useTypographyInlineStyle } from "@/components/public/TypographySettingsProvider";
import { usePublicSiteHeroMotion } from "@/hooks/usePublicSiteHeroMotion";
import { siteImageAnchorId } from "@/lib/site-image-preview";

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
  /**
   * CMS image slot used as the video poster and as the “View on Live Site”
   * scroll target for this page’s hero.
   */
  posterImageName?: string;
  /** Homepage: split HATHOR into per-letter WebPs for individual GSAP targets. */
  splitLetterLogo?: boolean;
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
  posterImageName,
  splitLetterLogo = false,
}: PublicSiteHeroProps) {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const posterImage = useSiteImage(posterImageName ?? "home-hero-poster");
  const posterSrc = posterImageName ? posterImage.src : undefined;
  const heroTitleStyle = useTypographyInlineStyle("hero_title");
  const heroSubtitleStyle = useTypographyInlineStyle("hero_subtitle");
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
    <section
      id={posterImageName ? siteImageAnchorId(posterImageName) : undefined}
      data-site-image={posterImageName}
      className="home-hero-container"
      aria-label="Hero"
    >
      <div className="hero-media">
        <video
          ref={heroVideoRef}
          src={HATHOR_HERO_VIDEO_SRC}
          poster={posterSrc}
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

      <div
        className={`hero-logo-mark${splitLetterLogo ? " hero-logo-mark--split" : ""}`}
        aria-hidden="true"
      >
        {splitLetterLogo ? (
          <HathorLogoSplit />
        ) : (
          <Image
            className="hero-logo-img"
            src={EX_GOLD_LOGO_SRC}
            alt={HATHOR_BRAND_NAME}
            width={1600}
            height={560}
            sizes="(max-width: 768px) 80vw, 720px"
          />
        )}
      </div>

      <div className="hero-content">
        <h1 className="hero-heading" style={heroTitleStyle}>
          <span className="hero-line hero-line--right" style={heroTitleStyle}>
            {lineRight}
          </span>
          {lineLeftImageSrc ? (
            <span className="hero-line hero-line--left hero-line--wordmark">
              <Image
                className="hero-line-wordmark-img"
                src={lineLeftImageSrc}
                alt={lineLeft || "Dahabiya Cruise"}
                width={1600}
                height={302}
                draggable={false}
                sizes="(max-width: 768px) 70vw, 640px"
              />
            </span>
          ) : lineLeft ? (
            <span
              className="hero-line hero-line--left"
              data-text={lineLeft}
              style={heroTitleStyle}
            >
              {lineLeft}
            </span>
          ) : null}
        </h1>
        {subtitle ? (
          <p className="hero-sub" style={heroSubtitleStyle}>
            {subtitle}
          </p>
        ) : null}
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
