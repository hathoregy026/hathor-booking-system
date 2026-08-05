"use client";

import { useEffect, useState } from "react";
import { HATHOR_WELCOME_ABOARD_SRC } from "@/lib/branding";

const HOLD_MS = 4000;
const FADE_MS = 400;
const SESSION_KEY = "hathor:welcome-splash-seen";

declare global {
  interface Window {
    __hathorWelcomeT?: number;
  }
}

function alreadySeenThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Full-screen welcome on first hard land (once per tab session).
 * Hold is measured from early HTML parse so hydrate lag does not add extra wait.
 * Splash image uses low fetch priority so the real page keeps loading underneath.
 */
export function WelcomeSplash() {
  const [phase, setPhase] = useState<"hold" | "fade" | "gone">("hold");

  useEffect(() => {
    if (
      alreadySeenThisSession() ||
      document.documentElement.classList.contains("hathor-welcome-skip")
    ) {
      setPhase("gone");
      return;
    }

    markSeen();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const started =
      typeof window.__hathorWelcomeT === "number"
        ? window.__hathorWelcomeT
        : performance.now();
    const elapsed = Math.max(0, performance.now() - started);
    const holdLeft = Math.max(0, HOLD_MS - elapsed);

    const fadeTimer = window.setTimeout(() => setPhase("fade"), holdLeft);
    const goneTimer = window.setTimeout(() => {
      setPhase("gone");
      document.body.style.overflow = previousOverflow;
    }, holdLeft + FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(goneTimer);
      document.body.style.overflow = previousOverflow;
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
        fetchPriority="low"
      />
    </div>
  );
}
