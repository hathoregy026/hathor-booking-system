"use client";

import { useLayoutEffect, useRef } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HathorLogoSplit } from "@/components/public/HathorLogoSplit";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { HATHOR_HERO_VIDEO_SRC } from "@/lib/branding";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";
import { useTypographyInlineStyle, useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { usePublicSiteHeroMotion } from "@/hooks/usePublicSiteHeroMotion";
import { GoldDustParticles } from "@/components/ui/GoldDustParticles";
import { siteImageAnchorId } from "@/lib/site-image-preview";
import type { HathorLogoPartsVariant } from "@/lib/hathor-logo-letters";
import {
  heroSecondShimmerInlineStyle,
  resolveHeroPageCopy,
  type HeroPageKey,
} from "@/lib/typography-settings-shared";

function optimizedVideoPoster(src: string): string {
  const trimmed = src.trim();
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;

  const params = new URLSearchParams({
    url: trimmed,
    w: "1920",
    q: "75",
  });
  return `/_next/image?${params.toString()}`;
}

export type PublicSiteHeroProps = {
  lineRight: string;
  lineLeft: string;
  /**
   * When set, live typography dashboard copy for this page overrides lineRight / lineLeft.
   */
  heroPage?: HeroPageKey;
  /** When set, replaces lineLeft text with this image (same scroll animation). */
  lineLeftImageSrc?: string;
  /** @deprecated Heroes show two titles only — not rendered. */
  subtitle?: string;
  /** @deprecated Heroes show two titles only — not rendered. */
  sideLeft?: string;
  /** @deprecated Heroes show two titles only — not rendered. */
  sideRight?: string;
  showCta?: boolean;
  ctaLabel?: string;
  /** When false, parent hook (e.g. useExScrollMotion) drives animation. */
  animate?: boolean;
  /**
   * CMS image slot for still-image heroes (cruises, highlights, etc.)
   * and as the “View on Live Site” scroll target. Not used for homepage video.
   */
  posterImageName?: string;
  /**
   * Kept for callers (homepage). All public heroes use the split letter logo;
   * the old single gold.svg mark is removed.
   */
  splitLetterLogo?: boolean;
  /**
   * Warm gold media tint (see app/hero-tint.css). On for every public hero.
   */
  goldTint?: boolean;
  /** Floating gold dust over the hero (delete tag + GoldDustParticles.tsx to remove). */
  goldDust?: boolean;
  /**
   * When true, play the homepage hero video. Poster frame uses `posterImageName`
   * CMS slot (falls back to about-hero if omitted).
   */
  playVideo?: boolean;
  /** Letter colour set from Hero Logo Tune — default keeps live gold WebPs. */
  logoPartsVariant?: HathorLogoPartsVariant;
};

export function PublicSiteHero({
  lineRight,
  lineLeft,
  heroPage,
  lineLeftImageSrc,
  showCta = true,
  ctaLabel = HOMEPAGE_HERO.cta,
  animate = true,
  posterImageName,
  goldTint = true,
  goldDust = true,
  playVideo = false,
  logoPartsVariant = "current",
}: PublicSiteHeroProps) {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroImage = useSiteImage(posterImageName ?? "about-hero");
  const videoPoster = playVideo
    ? optimizedVideoPoster(heroImage.src)
    : heroImage.src;
  const typography = useTypographySettings();
  const heroTitleStyle = useTypographyInlineStyle("hero_title");
  const heroSubtitleStyle = useTypographyInlineStyle("hero_subtitle");
  usePublicSiteHeroMotion(animate);

  const resolved = heroPage
    ? resolveHeroPageCopy(typography, heroPage, {
        main: lineRight,
        second: lineLeft,
      })
    : { main: lineRight, second: lineLeft };
  const displayRight = resolved.main;
  const displayLeft = resolved.second;
  const shimmer = typography.hero_second_shimmer;
  const secondTitleStyle = {
    ...heroSubtitleStyle,
    ...(shimmer.enabled
      ? {
          ...heroSecondShimmerInlineStyle(shimmer),
          /* Kill solid fill from typography inline so shimmer gradient shows */
          color: "transparent",
          WebkitTextFillColor: "transparent",
        }
      : {}),
  };
  const secondTitleClass = shimmer.enabled
    ? "hero-line hero-line--left hero-line--shimmer"
    : "hero-line hero-line--left";

  useLayoutEffect(() => {
    if (!playVideo) return;
    const video = heroVideoRef.current;
    if (!video) return;

    let started = false;
    let idleId = 0;
    let delayId = 0;
    const cleanups: Array<() => void> = [];

    const startVideo = () => {
      if (started) return;
      started = true;

      const connection = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      const slow =
        connection?.saveData === true ||
        connection?.effectiveType === "slow-2g" ||
        connection?.effectiveType === "2g";
      if (slow) return;

      if (!video.getAttribute("src")) {
        video.src = HATHOR_HERO_VIDEO_SRC;
      }
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      void video.play().catch(() => {});
    };

    /** After motion is ready, wait for idle + buffer — or first real user intent. */
    const armDeferredStart = () => {
      const onIntent = () => startVideo();
      window.addEventListener("scroll", onIntent, { once: true, passive: true });
      window.addEventListener("pointerdown", onIntent, { once: true });
      window.addEventListener("keydown", onIntent, { once: true });
      cleanups.push(() => {
        window.removeEventListener("scroll", onIntent);
        window.removeEventListener("pointerdown", onIntent);
        window.removeEventListener("keydown", onIntent);
      });

      const scheduleIdle = (cb: () => void) => {
        const ric = (
          window as Window & {
            requestIdleCallback?: (
              callback: IdleRequestCallback,
              options?: IdleRequestOptions,
            ) => number;
            cancelIdleCallback?: (id: number) => void;
          }
        ).requestIdleCallback;
        if (typeof ric === "function") {
          idleId = ric(() => cb(), { timeout: 10_000 });
          cleanups.push(() => {
            window.cancelIdleCallback?.(idleId);
          });
          return;
        }
        delayId = window.setTimeout(cb, 4500);
      };

      scheduleIdle(() => {
        delayId = window.setTimeout(startVideo, 2800);
      });
    };

    const root = document.documentElement;
    if (root.classList.contains("ex-scroll-ready")) {
      armDeferredStart();
    } else {
      const observer = new MutationObserver(() => {
        if (!root.classList.contains("ex-scroll-ready")) return;
        observer.disconnect();
        armDeferredStart();
      });
      observer.observe(root, { attributes: true, attributeFilter: ["class"] });
      cleanups.push(() => observer.disconnect());

      /* Last resort: still defer — never yank 26MB mid-LCP. */
      delayId = window.setTimeout(() => {
        observer.disconnect();
        armDeferredStart();
      }, 6000);
    }

    return () => {
      cleanups.forEach((fn) => fn());
      window.clearTimeout(delayId);
      window.cancelIdleCallback?.(idleId);
    };
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
            poster={videoPoster}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            aria-label={heroImage.alt || "Hathor Dahabiya sailing on the Nile"}
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
        <HathorLogoSplit partsVariant={logoPartsVariant} />
      </div>

      <div className="hero-content">
        <h1 className="hero-heading" style={heroTitleStyle}>
          <span className="hero-line hero-line--right" style={heroTitleStyle}>
            {displayRight}
          </span>
          {lineLeftImageSrc ? (
            <span className="hero-line hero-line--left hero-line--wordmark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hero-line-wordmark-img"
                src={lineLeftImageSrc}
                alt={displayLeft || "Dahabiya Cruise"}
                width={1600}
                height={302}
                draggable={false}
              />
            </span>
          ) : displayLeft ? (
            <span className={secondTitleClass} style={secondTitleStyle}>
              {displayLeft}
            </span>
          ) : null}
        </h1>
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

      <div className="hero-scroll-hint" aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}
