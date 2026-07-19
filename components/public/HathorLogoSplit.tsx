"use client";

import { HATHOR_BRAND_NAME } from "@/lib/branding";
import {
  HATHOR_LOGO_LETTERS,
  type HathorLogoLetter,
} from "@/lib/hathor-logo-letters";

type HathorLogoSplitProps = {
  className?: string;
};

function Letter({ letter }: { letter: HathorLogoLetter }) {
  return (
    <span
      className={`logo-letter-wrap ${letter.className}`}
      style={{ aspectRatio: `${letter.width} / ${letter.height}` }}
    >
      <img
        src={letter.src}
        alt={letter.alt}
        width={letter.width}
        height={letter.height}
        draggable={false}
        decoding="async"
        fetchPriority="high"
        className="logo-letter"
      />
    </span>
  );
}

/**
 * Each letter is positioned on its own in the free zone (edge ↔ Book Now).
 * Outer edges hard-clip. Gap controls move individual letters — not HAT/HOR as a block.
 */
export function HathorLogoSplit({ className }: HathorLogoSplitProps) {
  const [h1, a, t, h2, o, r] = HATHOR_LOGO_LETTERS;

  return (
    <div
      className={`hathor-logo-split hero-logo-img${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={HATHOR_BRAND_NAME}
    >
      <div className="hathor-logo-split__side hathor-logo-split__side--left">
        <Letter letter={h1} />
        <Letter letter={a} />
        <Letter letter={t} />
      </div>

      <span className="hathor-logo-split__gap" aria-hidden="true" />

      <div className="hathor-logo-split__side hathor-logo-split__side--right">
        <Letter letter={h2} />
        <Letter letter={o} />
        <Letter letter={r} />
      </div>
    </div>
  );
}
