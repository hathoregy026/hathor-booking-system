"use client";

import "./occasions.css";
import { useEffect, useRef } from "react";
import { usePublicLocale } from "@/hooks/usePublicLocale";
import { CHROME_COPY } from "@/lib/i18n/chrome-copy";
import { countdownParts, padCountdownUnit } from "@/lib/occasions";

type Unit = "days" | "hours" | "minutes" | "seconds";

const LEFT_OF_LOGO: readonly Unit[] = ["days", "hours"];
const RIGHT_OF_LOGO: readonly Unit[] = ["minutes", "seconds"];

/**
 * Days and hours left of the menu-bar logo, minutes and seconds right of it,
 * with what the count is for on one line beneath them. Laid out around the
 * logo's measured box (--occ-logo-*), so it follows the logo as the nav compacts
 * on scroll. The line is centred on the logo and spaced out to the farther of
 * the count's two ends (--occ-cd-reach). The count's edges go to the header as
 * --occ-cd-l / --occ-cd-r, where the nav effect dims behind the digits.
 */
export function OccasionNavCountdown({ ms, caption }: { ms: number; caption: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const copy = CHROME_COPY[usePublicLocale()].occasion;

  useEffect(() => {
    const root = ref.current;
    const header = root?.closest<HTMLElement>(".hathor-header");
    const logo = header?.querySelector(".hathor-header__logo");
    if (!root || !header || !logo) return;
    const pieces = root.querySelectorAll(".occasion-nav-cd__cell");
    const ink = root.querySelectorAll(".occasion-nav-cd__num, .occasion-nav-cd__unit");
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
      const centre = box.left + box.width / 2;
      let reach = 0;
      for (const piece of ink) {
        const edge = piece.getBoundingClientRect();
        reach = Math.max(reach, centre - edge.left, edge.right - centre);
      }
      root.style.setProperty("--occ-cd-reach", `${reach}px`);
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
  const cell = (key: Unit) => (
    <span key={key} className="occasion-nav-cd__cell">
      <span className="occasion-nav-cd__num">{padCountdownUnit(parts[key])}</span>
      <span className="occasion-nav-cd__unit">
        <span className="occasion-nav-cd__long">{copy.units[key][0]}</span>
        <span className="occasion-nav-cd__short">{copy.units[key][1]}</span>
      </span>
    </span>
  );

  return (
    <div
      ref={ref}
      className="occasion-nav-cd"
      role="timer"
      aria-label={copy.timer(caption, parts.days, parts.hours, parts.minutes)}
    >
      <div className="occasion-nav-cd__side occasion-nav-cd__side--start" aria-hidden="true">
        {LEFT_OF_LOGO.map(cell)}
      </div>
      <div className="occasion-nav-cd__side occasion-nav-cd__side--end" aria-hidden="true">
        {RIGHT_OF_LOGO.map(cell)}
      </div>
      <div className="occasion-nav-cd__caption" aria-hidden="true">
        {Array.from(caption, (letter, index) => (
          <span key={index}>{letter === " " ? " " : letter}</span>
        ))}
      </div>
    </div>
  );
}
