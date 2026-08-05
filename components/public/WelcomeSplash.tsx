"use client";

import { useEffect, useState } from "react";
import { HATHOR_WELCOME_ABOARD_SRC } from "@/lib/branding";

const HOLD_MS = 4000;
const FADE_MS = 400;

/**
 * Full-screen welcome on every hard land of the public site.
 * Holds a full 4s from when the splash mounts, then fades out.
 */
export function WelcomeSplash() {
  const [phase, setPhase] = useState<"hold" | "fade" | "gone">("hold");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const fadeTimer = window.setTimeout(() => setPhase("fade"), HOLD_MS);
    const goneTimer = window.setTimeout(() => {
      setPhase("gone");
      document.body.style.overflow = previousOverflow;
    }, HOLD_MS + FADE_MS);

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
        fetchPriority="high"
      />
    </div>
  );
}
