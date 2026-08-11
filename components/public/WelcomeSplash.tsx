"use client";

import { useEffect, useRef, useState } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";
import type { WelcomeSplashSettings } from "@/lib/welcome-splash-settings-shared";

/** Minimum time the gold preload stays up (feels intentional, not a blink). */
const MIN_HOLD_MS = 650;
/** Hard cap — never leave visitors on the gold screen longer than this. */
const MAX_HOLD_MS = 1200;
const FADE_MS = 280;

type WelcomeSplashProps = Pick<WelcomeSplashSettings, "enabled" | "imageUrl">;

function shouldSkipWelcomeSplash(enabled: boolean): boolean {
  if (!enabled) return true;
  if (typeof document === "undefined") return false;
  if (document.documentElement.classList.contains("hathor-welcome-skip")) {
    return true;
  }
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function revealPublicSiteAfterSplash() {
  const root = document.documentElement;
  root.classList.add("hathor-welcome-ready");
  root.classList.remove("hathor-welcome-lock");
  const scroll = ensurePublicScrollController();
  scroll.start();
  scroll.syncToCurrentScroll();
}

/**
 * Full-screen welcome on every hard land of the public site.
 * Short hold (≤1.2s): dismiss as soon as the image is ready after the min hold.
 * Skipped when disabled in CMS or when prefers-reduced-motion is set.
 */
export function WelcomeSplash({ enabled, imageUrl }: WelcomeSplashProps) {
  const [phase, setPhase] = useState<"hold" | "fade" | "gone">(() =>
    shouldSkipWelcomeSplash(enabled) ? "gone" : "hold",
  );
  const imgRef = useRef<HTMLImageElement>(null);
  const fadingRef = useRef(false);

  useEffect(() => {
    if (shouldSkipWelcomeSplash(enabled)) {
      document.documentElement.classList.remove("hathor-welcome-lock");
      document.documentElement.classList.add("hathor-welcome-skip");
      document.documentElement.classList.add("hathor-welcome-ready");
      return;
    }

    document.documentElement.classList.add("hathor-welcome-lock");
    document.documentElement.classList.remove("hathor-welcome-ready");
    const scroll = ensurePublicScrollController();
    scroll.stop();

    const startedAt = performance.now();
    fadingRef.current = false;
    const timers = new Set<number>();
    let removed = false;

    const clearTimers = () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    };

    const beginFade = () => {
      if (fadingRef.current || removed) return;
      fadingRef.current = true;
      clearTimers();
      setPhase("fade");
      timers.add(
        window.setTimeout(() => {
          setPhase("gone");
          revealPublicSiteAfterSplash();
        }, FADE_MS),
      );
    };

    const scheduleFadeAfterMinHold = () => {
      if (fadingRef.current || removed) return;
      const wait = Math.max(0, MIN_HOLD_MS - (performance.now() - startedAt));
      timers.add(window.setTimeout(beginFade, wait));
    };

    timers.add(window.setTimeout(beginFade, MAX_HOLD_MS));

    const img = imgRef.current;
    const onImageReady = () => scheduleFadeAfterMinHold();

    if (img) {
      if (img.complete && img.naturalWidth > 0) {
        scheduleFadeAfterMinHold();
      } else {
        img.addEventListener("load", onImageReady);
        img.addEventListener("error", onImageReady);
      }
    } else {
      scheduleFadeAfterMinHold();
    }

    return () => {
      removed = true;
      clearTimers();
      if (img) {
        img.removeEventListener("load", onImageReady);
        img.removeEventListener("error", onImageReady);
      }
      /* Keep lock; do not mark ready — remount continues the cover. */
    };
  }, [enabled]);

  if (phase === "gone" || !enabled) return null;

  return (
    <div
      className={`hathor-welcome-splash${phase === "fade" ? " hathor-welcome-splash--out" : ""}`}
      aria-hidden="true"
      role="presentation"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt=""
        className="hathor-welcome-splash__img"
        decoding="async"
        fetchPriority="high"
      />
    </div>
  );
}
