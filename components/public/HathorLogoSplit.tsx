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
      style={{ flexGrow: letter.flexGrow }}
    >
      {/* Native img — Next/Image width/height attrs fight full-bleed flex sizing */}
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
 * Full-bleed HATHOR: left half HAT · center gap (fixed Book Now) · right half HOR.
 * Letters scale to the side width so they read edge-to-edge from a distance.
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
      <span className="hathor-logo-split__gap" aria-hidden="true" />
      <div className="hathor-logo-split__side hathor-logo-split__side--right">
        <LetterImages letters={RIGHT_LETTERS} />
      </div>
    </div>
  );
}
