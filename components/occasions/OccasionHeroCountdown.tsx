"use client";

import "./occasions.css";
import {
  countdownParts,
  msUntilCountdown,
  padCountdownUnit,
} from "@/lib/occasions";
import { useActiveOccasion } from "@/components/occasions/useActiveOccasion";

const UNITS = [
  ["days", "Days"],
  ["hours", "Hours"],
  ["minutes", "Minutes"],
  ["seconds", "Seconds"],
] as const;

/**
 * Hairline days / hours / minutes / seconds under the homepage title while an
 * occasion with `heroCountdown` runs. Gone once the moment arrives. Hidden from
 * assistive tech: the header stripe carries the same countdown as text.
 */
export function OccasionHeroCountdown() {
  const active = useActiveOccasion();
  if (!active?.occasion.heroCountdown) return null;
  const left = msUntilCountdown(active.occasion, active.now);
  if (left === null || left <= 0) return null;
  const parts = countdownParts(left);

  return (
    <div className="occasion-hero-cd" aria-hidden="true">
      {UNITS.map(([key, label]) => (
        <div key={key} className="occasion-hero-cd__cell">
          <span className="occasion-hero-cd__num">{padCountdownUnit(parts[key])}</span>
          <span className="occasion-hero-cd__label">{label}</span>
        </div>
      ))}
    </div>
  );
}
