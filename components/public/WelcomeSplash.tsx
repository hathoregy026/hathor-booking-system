"use client";

import { useEffect, useState } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";
import type { WelcomeSplashSettings } from "@/lib/welcome-splash-settings-shared";

const HOLD_MS = 4000;
const FADE_MS = 400;

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

function releaseWelcomeScrollLock() {
  document.documentElement.classList.remove("hathor-welcome-lock");
  const scroll = ensurePublicScrollController();
  scroll.start();
  scroll.syncToCurrentScroll();
}

/**
 * Full-screen welcome on every hard land of the public site.
 * Holds a full 4s from mount, then fades out.
 * Skipped when disabled in CMS or when prefers-reduced-motion is set.
 */
export function WelcomeSplash({ enabled, imageUrl }: WelcomeSplashProps) {
  const [phase, setPhase] = useState<"hold" | "fade" | "gone">(() =>
    shouldSkipWelcomeSplash(enabled) ? "gone" : "hold",
  );

  useEffect(() => {
    if (shouldSkipWelcomeSplash(enabled)) {
      document.documentElement.classList.remove("hathor-welcome-lock");
      document.documentElement.classList.add("hathor-welcome-skip");
      return;
    }

    document.documentElement.classList.add("hathor-welcome-lock");
    const scroll = ensurePublicScrollController();
    scroll.stop();

    const fadeTimer = window.setTimeout(() => setPhase("fade"), HOLD_MS);
    const goneTimer = window.setTimeout(() => {
      setPhase("gone");
      releaseWelcomeScrollLock();
    }, HOLD_MS + FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(goneTimer);
      releaseWelcomeScrollLock();
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
        src={imageUrl}
        alt=""
        className="hathor-welcome-splash__img"
        decoding="async"
        fetchPriority="high"
      />
    </div>
  );
}
