"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useHeroLogoSettings } from "@/components/public/HeroLogoSettingsProvider";
import { HathorLogoSplit } from "@/components/public/HathorLogoSplit";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { HATHOR_HERO_VIDEO_SRC } from "@/lib/branding";
import { isPhoneViewport, logPhonePerfDev } from "@/lib/touch-device";
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
import { toVercelOptimizedSrc } from "@/lib/local-optimized-site-images";

/** No compressed mobile MP4 yet — phones keep poster until an asset is added. */
const HATHOR_HERO_VIDEO_MOBILE_SRC: string | null = null;

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
   * Warm gold media tint (see app/hero-tint.css). On for image heroes;
   * ignored when `playVideo` so the reel stays clear.
   */
  goldTint?: boolean;
  /** Floating gold dust over the hero (delete tag + GoldDustParticles.tsx to remove). */
  goldDust?: boolean;
  /**
   * When true, play the homepage hero video. Poster frame uses `posterImageName`
   * CMS slot (`home-hero-poster` on the homepage). Skips dark wash + gold tint.
   */
  playVideo?: boolean;
  /** Letter colour set from Hero Logo Tune — default keeps live gold WebPs. */
  logoPartsVariant?: HathorLogoPartsVariant;
  /** Optional phone override; otherwise the global phone Hero Logo Tune applies. */
  mobileLogoPartsVariant?: HathorLogoPartsVariant;
  /** Contact-derived hero typography for selected editorial routes. */
  editorial?: boolean;
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
  logoPartsVariant,
  mobileLogoPartsVariant,
  editorial = false,
}: PublicSiteHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  /**
   * Start on poster; enable `<video>` only after client confirms desktop
   * (or phone when a mobile MP4 exists). Avoids downloading the desktop file on phones.
   */
  const [useLiveVideo, setUseLiveVideo] = useState(false);
  const heroImage = useSiteImage(posterImageName ?? "home-hero-poster");
  const videoPoster = playVideo
    ? toVercelOptimizedSrc(heroImage.src)
    : heroImage.src;
  /** Video hero: no dark wash / gold tint — keep gold dust only. */
  const showMediaWash = !playVideo;
  const applyGoldTint = showMediaWash && goldTint;
  const typography = useTypographySettings();
  const globalLogo = useHeroLogoSettings();
  const desktopLogoParts =
    logoPartsVariant ?? globalLogo.desktopPartsVariant;
  const phoneLogoParts =
    mobileLogoPartsVariant ?? globalLogo.mobilePartsVariant;
  const heroTitleStyle = useTypographyInlineStyle("hero_title");
  const heroSubtitleStyle = useTypographyInlineStyle("hero_subtitle");
  const resolvedHeroTitleStyle: CSSProperties = editorial
    ? {
        ...heroTitleStyle,
        fontFamily: '"Italiana", "Gamgote", Georgia, serif',
        fontWeight: 400,
        letterSpacing: "-0.035em",
        textShadow: "0 4px 40px rgba(0, 0, 0, 0.4)",
        textTransform: "uppercase",
      }
    : heroTitleStyle;
  usePublicSiteHeroMotion(heroRef, animate);

  const resolved = heroPage
    ? resolveHeroPageCopy(typography, heroPage, {
        main: lineRight,
        second: lineLeft,
      })
    : { main: lineRight, second: lineLeft };
  const displayRight = resolved.main;
  const displayLeft = resolved.second;
  const shimmer = typography.hero_second_shimmer;
  /** Text-based second titles share one clean, solid treatment site-wide. */
  const usePlainSecondTitle = !lineLeftImageSrc;
  const secondTitleStyle = usePlainSecondTitle
    ? {
        ...heroSubtitleStyle,
        ...(editorial
          ? {
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: "italic",
              letterSpacing: "-0.02em",
              textShadow: "0 4px 40px rgba(0, 0, 0, 0.4)",
            }
          : {}),
        color: "#B69F64",
        WebkitTextFillColor: "#B69F64",
      }
    : {
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
  const secondTitleClass = usePlainSecondTitle
    ? "hero-line hero-line--left hero-line--plain"
    : shimmer.enabled
      ? "hero-line hero-line--left hero-line--shimmer"
      : "hero-line hero-line--left";

  useLayoutEffect(() => {
    if (!playVideo) return;
    /*
     * Large cinematic asset. Phones ≤480: mobile source if present, else poster.
     * Never download the desktop MP4 on phones. Tablet keeps poster (existing).
     */
    const phone = isPhoneViewport();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrowTablet = window.matchMedia("(max-width: 1024px)").matches;

    if (phone && !HATHOR_HERO_VIDEO_MOBILE_SRC) {
      setUseLiveVideo(false);
      logPhonePerfDev({
        surface: "public-site-hero",
        phone: true,
        videoSource: "poster-only",
        reason: "no-mobile-mp4-yet",
      });
      return;
    }
    if (reduced || (narrowTablet && !phone)) {
      setUseLiveVideo(false);
      logPhonePerfDev({
        surface: "public-site-hero",
        phone,
        videoSource: "poster-only",
        reason: reduced ? "reduced-motion" : "tablet-poster",
      });
      return;
    }

    setUseLiveVideo(true);
  }, [playVideo]);

  useLayoutEffect(() => {
    if (!playVideo || !useLiveVideo) return;
    const video = heroVideoRef.current;
    if (!video) return;

    const phone = isPhoneViewport();
    let started = false;
    let idleId = 0;
    let delayId = 0;
    const cleanups: Array<() => void> = [];
    const source =
      phone && HATHOR_HERO_VIDEO_MOBILE_SRC
        ? HATHOR_HERO_VIDEO_MOBILE_SRC
        : HATHOR_HERO_VIDEO_SRC;

    const pauseVideo = () => {
      if (!video.paused) video.pause();
    };

    const tryPlay = () => {
      if (document.hidden) return;
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      void video.play().catch(() => {});
    };

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

      /*
       * Never reassign `src` after <source>/autoPlay has already selected a
       * stream — that reloads the MP4 mid-play and flashes the poster.
       */
      if (!video.currentSrc && !video.getAttribute("src")) {
        video.src = source;
        logPhonePerfDev({
          surface: "public-site-hero",
          phone,
          videoSource: phone ? "mobile-mp4" : "desktop-mp4",
        });
      }
      tryPlay();
    };

    const onVisibility = () => {
      if (document.hidden) pauseVideo();
      else if (started) tryPlay();
    };
    document.addEventListener("visibilitychange", onVisibility);
    cleanups.push(() =>
      document.removeEventListener("visibilitychange", onVisibility),
    );

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some(
          (e) => e.isIntersecting && e.intersectionRatio > 0.15,
        );
        if (!started) return;
        if (visible) tryPlay();
        else pauseVideo();
      },
      { threshold: [0, 0.15, 0.35] },
    );
    const heroEl = heroRef.current;
    if (heroEl) io.observe(heroEl);
    cleanups.push(() => io.disconnect());

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
  }, [playVideo, useLiveVideo]);

  return (
    <section
      ref={heroRef}
      id={posterImageName ? siteImageAnchorId(posterImageName) : undefined}
      data-site-image={posterImageName}
      className={`home-hero-container${applyGoldTint ? " hero-gold-tint" : ""}${
        playVideo ? " home-hero--clear-video" : ""
      }`}
      aria-label="Hero"
    >
      <div className="hero-media">
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS hero still / video poster */}
        <img
          src={playVideo ? videoPoster : heroImage.src}
          alt={heroImage.alt}
          decoding="async"
          fetchPriority="high"
        />
        {playVideo && useLiveVideo ? (
          <video
            ref={heroVideoRef}
            poster={videoPoster}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            aria-label={heroImage.alt || "Hathor Dahabiya sailing on the Nile"}
          >
            {HATHOR_HERO_VIDEO_MOBILE_SRC ? (
              <source
                src={HATHOR_HERO_VIDEO_MOBILE_SRC}
                type="video/mp4"
                media="(max-width: 480px)"
              />
            ) : null}
            <source
              src={HATHOR_HERO_VIDEO_SRC}
              type="video/mp4"
              media="(min-width: 481px)"
            />
          </video>
        ) : null}
      </div>
      {showMediaWash ? (
        <div className="hero-overlay" aria-hidden="true" />
      ) : null}

      <div className="home-hero-cover" aria-hidden="true" />

      {goldDust ? <GoldDustParticles /> : null}

      <div className="hero-logo-mark hero-logo-mark--split" aria-hidden="true">
        <HathorLogoSplit
          partsVariant={desktopLogoParts}
          mobilePartsVariant={phoneLogoParts}
        />
      </div>

      <div className="hero-content">
        <h1 className="hero-heading" style={resolvedHeroTitleStyle}>
          <span className="hero-line hero-line--right" style={resolvedHeroTitleStyle}>
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
