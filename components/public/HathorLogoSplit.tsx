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
      {/* Native img — height from band; width shrinks to stay inside screen edges */}
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
 * Edge-locked HATHOR: H at left screen edge · R at right · Book Now viewport-centered.
 * Extra letter gaps push inward; sides never paint past the viewport.
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
        <span className="hathor-logo-split__side-spacer" aria-hidden="true" />
      </div>
      <span className="hathor-logo-split__gap-t-btn" aria-hidden="true" />
      <span className="hathor-logo-split__btn-slot" aria-hidden="true" />
      <span className="hathor-logo-split__gap-btn-h" aria-hidden="true" />
      <div className="hathor-logo-split__side hathor-logo-split__side--right">
        <span className="hathor-logo-split__side-spacer" aria-hidden="true" />
        <LetterImages letters={RIGHT_LETTERS} />
      </div>
    </div>
  );
}
