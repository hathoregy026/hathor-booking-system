"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, Pause, Play } from "lucide-react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useHeroLogoSettings } from "@/components/public/HeroLogoSettingsProvider";
import { HathorLogoSplit } from "@/components/public/HathorLogoSplit";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  HATHOR_HERO_VIDEO_SRC,
  HATHOR_HERO_VIDEO_PHONE_SRC,
} from "@/lib/branding";
import {
  applyPhoneViewportAttr,
  isPhoneHeroVideoViewport,
  logPhonePerfDev,
  PHONE_VIEWPORT_MQ,
} from "@/lib/touch-device";
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
import { heroPosterDelivery } from "@/lib/local-optimized-site-images";

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
  /**
   * Opt-in phone/tablet film chrome for the live homepage: fine side rules,
   * a next-section control, and an accessible play/pause control.
   */
  responsiveVideoFrame?: boolean;
  responsiveVideoFrameTarget?: string;
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
  responsiveVideoFrame = false,
  responsiveVideoFrameTarget = "#main-content",
}: PublicSiteHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const manuallyPausedRef = useRef(false);
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(false);
  /**
   * Start on poster. After mount, attach exactly one reel: the 720×720 phone
   * file at ≤480px, the 1920×1080 desktop file on tablet and desktop.
   * Never list both as <source media> siblings — that is how the square phone
   * encode leaked onto landscape screens.
   */
  const [heroVideoSrc, setHeroVideoSrc] = useState<string | null>(null);
  const heroImage = useSiteImage(posterImageName ?? "home-hero-poster");
  const heroPoster = heroPosterDelivery(heroImage.src);
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
    if (!playVideo) {
      return;
    }

    const apply = () => {
      applyPhoneViewportAttr();
      const phone = isPhoneHeroVideoViewport();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        setHeroVideoSrc(null);
        setHeroVideoPlaying(false);
        logPhonePerfDev({
          surface: "public-site-hero",
          phone,
          videoSource: "poster-only",
          reason: "reduced-motion",
        });
        return;
      }

      if (phone) {
        if (!HATHOR_HERO_VIDEO_PHONE_SRC) {
          setHeroVideoSrc(null);
          logPhonePerfDev({
            surface: "public-site-hero",
            phone: true,
            videoSource: "poster-only",
            reason: "no-mobile-mp4",
          });
          return;
        }
        setHeroVideoSrc(HATHOR_HERO_VIDEO_PHONE_SRC);
        logPhonePerfDev({
          surface: "public-site-hero",
          phone: true,
          videoSource: "mobile-mp4",
        });
        return;
      }

      setHeroVideoSrc(HATHOR_HERO_VIDEO_SRC);
      logPhonePerfDev({
        surface: "public-site-hero",
        phone: false,
        videoSource: "desktop-mp4",
      });
    };

    apply();
    const phoneMq = window.matchMedia(PHONE_VIEWPORT_MQ);
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    phoneMq.addEventListener("change", apply);
    reducedMq.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      phoneMq.removeEventListener("change", apply);
      reducedMq.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, [playVideo]);

  useLayoutEffect(() => {
    if (!playVideo || !heroVideoSrc) return;
    const video = heroVideoRef.current;
    if (!video) return;

    let started = false;
    let idleId = 0;
    let delayId = 0;
    const cleanups: Array<() => void> = [];
    const source = heroVideoSrc;

    const pauseVideo = () => {
      if (!video.paused) video.pause();
    };

    const tryPlay = () => {
      if (document.hidden || manuallyPausedRef.current) return;
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      void video.play().catch(() => {});
    };

    const isPhoneReel = source === HATHOR_HERO_VIDEO_PHONE_SRC;

    const forcePhoneReelIfDesktopLeaked = () => {
      if (!isPhoneHeroVideoViewport()) return;
      const attr = video.getAttribute("src") || "";
      const current = video.currentSrc || attr;
      if (attr.includes("phone") || current.includes("phone")) return;
      video.src = HATHOR_HERO_VIDEO_PHONE_SRC;
      video.load();
      tryPlay();
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
      /* Phone reel is ~4MB — never leave the temple poster up on save-data. */
      if (slow && !isPhoneReel) return;

      /*
       * Never reassign `src` after <source>/autoPlay has already selected a
       * stream — that reloads the MP4 mid-play and flashes the poster.
       */
      if (video.getAttribute("src") !== source) {
        video.src = source;
      }
      tryPlay();
    };

    video.addEventListener("loadedmetadata", forcePhoneReelIfDesktopLeaked);
    cleanups.push(() => {
      video.removeEventListener("loadedmetadata", forcePhoneReelIfDesktopLeaked);
    });

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
    /*
     * Phone uses the dedicated 720×960 reel and must start as soon as the
     * source is attached. Poster is the desktop CMS still.
     * Desktop keeps the deferred idle start so the 26MB promo does not fight LCP.
     */
    if (source === HATHOR_HERO_VIDEO_PHONE_SRC) {
      startVideo();
    } else if (root.classList.contains("ex-scroll-ready")) {
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
  }, [playVideo, heroVideoSrc]);

  const toggleHeroVideo = () => {
    const video = heroVideoRef.current;
    if (!video) return;

    if (video.paused) {
      manuallyPausedRef.current = false;
      video.muted = true;
      video.defaultMuted = true;
      void video.play().catch(() => {});
      return;
    }

    manuallyPausedRef.current = true;
    video.pause();
  };

  return (
    <section
      ref={heroRef}
      id={posterImageName ? siteImageAnchorId(posterImageName) : undefined}
      data-site-image={posterImageName}
      className={`home-hero-container${applyGoldTint ? " hero-gold-tint" : ""}${
        playVideo ? " home-hero--clear-video" : ""
      }${responsiveVideoFrame ? " home-hero--responsive-video-frame" : ""}${
        heroVideoPlaying ? " is-hero-video-playing" : ""
      }`}
      aria-label="Hero"
    >
      <div className="hero-media">
        <picture>
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS hero still / video poster */}
          <img
            src={heroPoster.src}
            srcSet={playVideo ? undefined : heroPoster.srcSet}
            sizes={heroPoster.sizes}
            alt={heroImage.alt}
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        {playVideo && heroVideoSrc ? (
          <video
            key={heroVideoSrc}
            ref={heroVideoRef}
            src={heroVideoSrc}
            poster={heroPoster.src}
            autoPlay
            loop
            muted
            playsInline
            preload={heroVideoSrc === HATHOR_HERO_VIDEO_PHONE_SRC ? "auto" : "none"}
            data-hathor-phone-hero={
              heroVideoSrc === HATHOR_HERO_VIDEO_PHONE_SRC ? "locked" : undefined
            }
            aria-label={heroImage.alt || "Hathor Dahabiya sailing on the Nile"}
            onPlay={() => setHeroVideoPlaying(true)}
            onPause={() => setHeroVideoPlaying(false)}
          />
        ) : null}
      </div>
      {showMediaWash ? (
        <div className="hero-overlay" aria-hidden="true" />
      ) : null}

      <div className="home-hero-cover" aria-hidden="true" />

      {responsiveVideoFrame ? (
        <div className="hero-responsive-video-chrome">
          <div className="hero-one-shade" aria-hidden="true" />
          <div className="hero-responsive-video-frame" aria-hidden="true" />
          <div className="hero-one-stage">
            <div className="hero-one-copy">
              <h1 className="hero-one-title">
                <span className="hero-line hero-line--right"><span>A world</span></span>
                <span className="hero-line hero-line--left hero-line--plain"><span>beyond</span></span>
                <span className="hero-line hero-line--right"><span>time.</span></span>
              </h1>
            </div>
            <p className="hero-one-location">
              LUXOR <span /> ASWAN
            </p>
          </div>
          <a
            className="hero-responsive-video-control hero-responsive-video-control--next"
            href={responsiveVideoFrameTarget}
            aria-label="Enter the extraordinary"
          >
            <span className="hero-responsive-video-control__mark">
              <ArrowDown aria-hidden="true" />
            </span>
            <span className="hero-one-discover-label">Enter the extraordinary</span>
          </a>
          {heroVideoSrc ? (
            <button
              className="hero-responsive-video-control hero-responsive-video-control--playback"
              type="button"
              onClick={toggleHeroVideo}
              aria-label={heroVideoPlaying ? "Pause background film" : "Play background film"}
            >
              {heroVideoPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </button>
          ) : null}
        </div>
      ) : null}

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
