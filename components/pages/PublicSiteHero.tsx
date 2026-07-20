"use client";

import { useLayoutEffect, useRef } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HathorLogoSplit } from "@/components/public/HathorLogoSplit";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { HATHOR_HERO_VIDEO_SRC } from "@/lib/branding";
import { EX_HERO } from "@/lib/ex-page-content";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";
import { useTypographyInlineStyle } from "@/components/public/TypographySettingsProvider";
import { usePublicSiteHeroMotion } from "@/hooks/usePublicSiteHeroMotion";
import { GoldDustParticles } from "@/components/ui/GoldDustParticles";
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
  /**
   * Kept for callers (homepage). All public heroes use the split letter logo;
   * the old single gold.svg mark is removed.
   */
  splitLetterLogo?: boolean;
  /** Homepage-only warm gold video tint (see app/hero-tint.css). */
  goldTint?: boolean;
  /** Homepage-only floating gold dust (delete tag + GoldDustParticles.tsx to remove). */
  goldDust?: boolean;
  /**
   * When true, play the homepage hero video.
   * Other pages should leave this false and use `posterImageName` as a still image.
   */
  playVideo?: boolean;
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
  goldTint = false,
  goldDust = false,
  playVideo = false,
}: PublicSiteHeroProps) {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroImageName = posterImageName ?? "home-hero-poster";
  const heroImage = useSiteImage(heroImageName);
  const heroTitleStyle = useTypographyInlineStyle("hero_title");
  const heroSubtitleStyle = useTypographyInlineStyle("hero_subtitle");
  usePublicSiteHeroMotion(animate);

  useLayoutEffect(() => {
    if (!playVideo) return;
    const video = heroVideoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    void video.play().catch(() => {});
  }, [playVideo]);

  return (
    <section
      id={posterImageName ? siteImageAnchorId(posterImageName) : undefined}
      data-site-image={posterImageName}
      className={`home-hero-container${goldTint ? " hero-gold-tint" : ""}`}
      aria-label="Hero"
    >
      <div className="hero-media">
        {playVideo ? (
          <video
            ref={heroVideoRef}
            src={HATHOR_HERO_VIDEO_SRC}
            poster={heroImage.src}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label="Hathor Dahabiya sailing on the Nile"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- CMS hero still; next/image fill not needed here
          <img
            src={heroImage.src}
            alt={heroImage.alt}
            decoding="async"
            fetchPriority="high"
          />
        )}
      </div>
      <div className="hero-overlay" aria-hidden="true" />

      <div className="home-hero-cover" aria-hidden="true" />

      {goldDust ? <GoldDustParticles /> : null}

      <div className="hero-logo-mark hero-logo-mark--split" aria-hidden="true">
        <HathorLogoSplit />
      </div>

      <div className="hero-content">
        <h1 className="hero-heading" style={heroTitleStyle}>
          <span className="hero-line hero-line--right" style={heroTitleStyle}>
            {lineRight}
          </span>
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
              style={heroSubtitleStyle}
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
