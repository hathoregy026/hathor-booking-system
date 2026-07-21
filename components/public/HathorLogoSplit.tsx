"use client";

import { HATHOR_BRAND_NAME } from "@/lib/branding";
import {
  getHathorLogoLetters,
  type HathorLogoLetter,
  type HathorLogoPartsVariant,
} from "@/lib/hathor-logo-letters";

type HathorLogoSplitProps = {
  className?: string;
  /** Colour set — default keeps the locked live WebP letters. */
  partsVariant?: HathorLogoPartsVariant;
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
 * Variant only swaps image sources; seats / animation stay identical.
 */
export function HathorLogoSplit({
  className,
  partsVariant = "current",
}: HathorLogoSplitProps) {
  const [h1, a, t, h2, o, r] = getHathorLogoLetters(partsVariant);

  return (
    <div
      className={`hathor-logo-split hero-logo-img${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={HATHOR_BRAND_NAME}
      data-hathor-logo-parts={partsVariant}
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
