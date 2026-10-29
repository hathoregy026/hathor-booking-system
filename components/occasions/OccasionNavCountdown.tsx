"use client";

import "./occasions.css";
import { useEffect, useRef } from "react";
import { countdownParts, padCountdownUnit } from "@/lib/occasions";

type Unit = readonly ["days" | "hours" | "minutes" | "seconds", string, string];

/* [part, label, phone label] */
const LEFT_OF_LOGO: readonly Unit[] = [
  ["days", "Days", "Days"],
  ["hours", "Hours", "Hrs"],
];
const RIGHT_OF_LOGO: readonly Unit[] = [
  ["minutes", "Minutes", "Min"],
  ["seconds", "Seconds", "Sec"],
];

/**
 * Days and hours left of the menu-bar logo, minutes and seconds right of it,
 * captioned with what the count is for. Laid out around the logo's measured
 * box (--occ-logo-*), so it follows the logo as the nav compacts on scroll.
 * Its own edges go to the header as --occ-cd-l / --occ-cd-r, where the nav
 * effect dims behind the digits.
 */
export function OccasionNavCountdown({ ms, caption }: { ms: number; caption: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const header = root?.closest<HTMLElement>(".hathor-header");
    const logo = header?.querySelector(".hathor-header__logo");
    if (!root || !header || !logo) return;
    const pieces = root.querySelectorAll(".occasion-nav-cd__cell, .occasion-nav-cd__caption");
    const place = () => {
      const bar = header.getBoundingClientRect();
      const box = logo.getBoundingClientRect();
      root.style.setProperty("--occ-logo-x", `${box.left - bar.left}px`);
      root.style.setProperty("--occ-logo-y", `${box.top - bar.top}px`);
      root.style.setProperty("--occ-logo-w", `${box.width}px`);
      root.style.setProperty("--occ-logo-h", `${box.height}px`);
      let left = Infinity;
      let right = -Infinity;
      for (const piece of pieces) {
        const edge = piece.getBoundingClientRect();
        left = Math.min(left, edge.left);
        right = Math.max(right, edge.right);
      }
      header.style.setProperty("--occ-cd-l", `${left - bar.left}px`);
      header.style.setProperty("--occ-cd-r", `${right - bar.left}px`);
    };
    const observer = new ResizeObserver(place);
    observer.observe(header);
    observer.observe(logo);
    pieces.forEach((piece) => observer.observe(piece));
    place();
    return () => {
      observer.disconnect();
      header.style.removeProperty("--occ-cd-l");
      header.style.removeProperty("--occ-cd-r");
    };
  }, []);

  const parts = countdownParts(ms);
  const cell = ([key, label, short]: Unit) => (
    <span key={key} className="occasion-nav-cd__cell">
      <span className="occasion-nav-cd__num">{padCountdownUnit(parts[key])}</span>
      <span className="occasion-nav-cd__unit">
        <span className="occasion-nav-cd__long">{label}</span>
        <span className="occasion-nav-cd__short">{short}</span>
      </span>
    </span>
  );

  return (
    <div
      ref={ref}
      className="occasion-nav-cd"
      role="timer"
      aria-label={`${caption}: ${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes`}
    >
      <div className="occasion-nav-cd__side occasion-nav-cd__side--start" aria-hidden="true">
        <span className="occasion-nav-cd__caption">{caption}</span>
        {LEFT_OF_LOGO.map(cell)}
      </div>
      <div className="occasion-nav-cd__side occasion-nav-cd__side--end" aria-hidden="true">
        {RIGHT_OF_LOGO.map(cell)}
      </div>
    </div>
  );
}
