"use client";

import { useEffect, useState } from "react";
import { HATHOR_WELCOME_ABOARD_SRC } from "@/lib/branding";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

const HOLD_MS = 4000;
const FADE_MS = 400;

function shouldSkipWelcomeSplash(): boolean {
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
 * Skipped entirely when prefers-reduced-motion is set.
 */
export function WelcomeSplash() {
  const [phase, setPhase] = useState<"hold" | "fade" | "gone">(() =>
    shouldSkipWelcomeSplash() ? "gone" : "hold",
  );

  useEffect(() => {
    if (shouldSkipWelcomeSplash()) {
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
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={`hathor-welcome-splash${phase === "fade" ? " hathor-welcome-splash--out" : ""}`}
      aria-hidden="true"
      role="presentation"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HATHOR_WELCOME_ABOARD_SRC}
        alt=""
        className="hathor-welcome-splash__img"
        decoding="async"
        fetchPriority="high"
      />
    </div>
  );
}
