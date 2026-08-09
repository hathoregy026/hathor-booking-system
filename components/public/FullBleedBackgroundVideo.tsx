"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isPhoneViewport, logPhonePerfDev } from "@/lib/touch-device";

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

type FullBleedBackgroundVideoProps = {
  /** Desktop (and tablet) MP4. `null` keeps the image fallback. */
  src: string | null;
  /** Optional phone MP4 — when null, phones keep the poster/fallback. */
  mobileSrc?: string | null;
  /** Poster / still from CMS (shown while buffering and when video is off). */
  poster: string;
  alt: string;
  className?: string;
  /** Rendered when video is disabled or unavailable. */
  fallback: ReactNode;
  /** Dev log surface name */
  surface?: string;
};

/**
 * Full-bleed muted loop video — same behaviour as homepage `PublicSiteHero`
 * (`autoPlay` / `muted` / `playsInline`, deferred start, pause off-screen).
 */
export function FullBleedBackgroundVideo({
  src,
  mobileSrc = null,
  poster,
  alt,
  className,
  fallback,
  surface = "full-bleed-background-video",
}: FullBleedBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  /** Viewport/motion gate — only meaningful when `src` is set. */
  const [allowLiveVideo, setAllowLiveVideo] = useState(false);
  const useLiveVideo = Boolean(src) && allowLiveVideo;
  const videoPoster = optimizedVideoPoster(poster);

  useLayoutEffect(() => {
    if (!src) return;

    /* Defer gate decision one frame — same viewport rules as PublicSiteHero. */
    const frame = window.requestAnimationFrame(() => {
      const phone = isPhoneViewport();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      const narrowTablet = window.matchMedia("(max-width: 1024px)").matches;

      if (phone && !mobileSrc) {
        setAllowLiveVideo(false);
        logPhonePerfDev({
          surface,
          phone: true,
          videoSource: "poster-only",
          reason: "no-mobile-mp4-yet",
        });
        return;
      }
      if (reduced || (narrowTablet && !phone)) {
        setAllowLiveVideo(false);
        logPhonePerfDev({
          surface,
          phone,
          videoSource: "poster-only",
          reason: reduced ? "reduced-motion" : "tablet-poster",
        });
        return;
      }

      setAllowLiveVideo(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [src, mobileSrc, surface]);

  useLayoutEffect(() => {
    if (!src || !useLiveVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const phone = isPhoneViewport();
    let started = false;
    let idleId = 0;
    let delayId = 0;
    const cleanups: Array<() => void> = [];
    const source = phone && mobileSrc ? mobileSrc : src;

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

      if (!video.currentSrc && !video.getAttribute("src")) {
        video.src = source;
        logPhonePerfDev({
          surface,
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
    const rootEl = rootRef.current;
    if (rootEl) io.observe(rootEl);
    cleanups.push(() => io.disconnect());

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
        idleId = ric(() => {
          delayId = window.setTimeout(startVideo, 1200);
        }, { timeout: 8_000 });
        cleanups.push(() => {
          window.cancelIdleCallback?.(idleId);
        });
      } else {
        delayId = window.setTimeout(startVideo, 2800);
      }
    };

    armDeferredStart();

    return () => {
      cleanups.forEach((fn) => fn());
      window.clearTimeout(delayId);
      window.cancelIdleCallback?.(idleId);
    };
  }, [src, mobileSrc, useLiveVideo, surface]);

  if (!src || !useLiveVideo) {
    return <>{fallback}</>;
  }

  return (
    <div ref={rootRef} className={className} data-full-bleed-video>
      <video
        ref={videoRef}
        poster={videoPoster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={alt}
      >
        {mobileSrc ? (
          <source
            src={mobileSrc}
            type="video/mp4"
            media="(max-width: 480px)"
          />
        ) : null}
        <source src={src} type="video/mp4" media="(min-width: 481px)" />
      </video>
    </div>
  );
}
