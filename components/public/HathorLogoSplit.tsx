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
  /** Phone colour set supplied by the global hero tune. */
  mobilePartsVariant?: HathorLogoPartsVariant;
};

function Letter({
  letter,
  mobileLetter,
}: {
  letter: HathorLogoLetter;
  mobileLetter: HathorLogoLetter;
}) {
  return (
    <span
      className={`logo-letter-wrap ${letter.className}`}
      style={{ aspectRatio: `${letter.width} / ${letter.height}` }}
    >
      <picture>
        <source media="(max-width: 767px)" srcSet={mobileLetter.src} />
        <img
          src={letter.src}
          alt={letter.alt}
          width={letter.width}
          height={letter.height}
          draggable={false}
          decoding="async"
          fetchPriority="low"
          className="logo-letter"
        />
      </picture>
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
  mobilePartsVariant = partsVariant,
}: HathorLogoSplitProps) {
  const [h1, a, t, h2, o, r] = getHathorLogoLetters(partsVariant);
  const [mh1, ma, mt, mh2, mo, mr] =
    getHathorLogoLetters(mobilePartsVariant);

  return (
    <div
      className={`hathor-logo-split hero-logo-img${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={HATHOR_BRAND_NAME}
      data-hathor-logo-parts={partsVariant}
      data-hathor-logo-parts-mobile={mobilePartsVariant}
    >
      <div className="hathor-logo-split__side hathor-logo-split__side--left">
        <Letter letter={h1} mobileLetter={mh1} />
        <Letter letter={a} mobileLetter={ma} />
        <Letter letter={t} mobileLetter={mt} />
      </div>

      <span className="hathor-logo-split__gap" aria-hidden="true" />

      <div className="hathor-logo-split__side hathor-logo-split__side--right">
        <Letter letter={h2} mobileLetter={mh2} />
        <Letter letter={o} mobileLetter={mo} />
        <Letter letter={r} mobileLetter={mr} />
      </div>
    </div>
  );
}
