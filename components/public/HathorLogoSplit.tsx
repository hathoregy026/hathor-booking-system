"use client";

import { HATHOR_BRAND_NAME } from "@/lib/branding";
import {
  HATHOR_LOGO_LETTERS,
  type HathorLogoLetter,
} from "@/lib/hathor-logo-letters";

type HathorLogoSplitProps = {
  className?: string;
};

const LEFT_LETTERS: readonly HathorLogoLetter[] = HATHOR_LOGO_LETTERS.slice(
  0,
  3,
);
const RIGHT_LETTERS: readonly HathorLogoLetter[] = HATHOR_LOGO_LETTERS.slice(3);

function LetterImages({ letters }: { letters: readonly HathorLogoLetter[] }) {
  return letters.map((letter) => (
    <span
      key={letter.key}
      className={`logo-letter-wrap ${letter.className}`}
      style={{ aspectRatio: `${letter.width} / ${letter.height}` }}
    >
      {/* Native img — height locked by CSS band; width follows aspect-ratio */}
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
  ));
}

/**
 * HAT | T→btn gap | Book Now slot (centered) | btn→H gap | HOR.
 * Book Now stays in .hero-button; the middle slot only reserves space.
 */
export function HathorLogoSplit({ className }: HathorLogoSplitProps) {
  return (
    <div
      className={`hathor-logo-split hero-logo-img${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={HATHOR_BRAND_NAME}
    >
      <div className="hathor-logo-split__side hathor-logo-split__side--left">
        <LetterImages letters={LEFT_LETTERS} />
      </div>
      <span className="hathor-logo-split__gap-t-btn" aria-hidden="true" />
      <span className="hathor-logo-split__btn-slot" aria-hidden="true" />
      <span className="hathor-logo-split__gap-btn-h" aria-hidden="true" />
      <div className="hathor-logo-split__side hathor-logo-split__side--right">
        <LetterImages letters={RIGHT_LETTERS} />
      </div>
    </div>
  );
}
