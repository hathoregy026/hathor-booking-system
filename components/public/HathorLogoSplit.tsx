"use client";

import Image from "next/image";
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
    <Image
      key={letter.key}
      src={letter.src}
      alt={letter.alt}
      width={letter.width}
      height={letter.height}
      priority
      draggable={false}
      sizes="(max-width: 768px) 30vw, 28vw"
      className={`logo-letter ${letter.className}`}
    />
  ));
}

/**
 * Full-bleed HATHOR: left half HAT · center gap (fixed Book Now) · right half HOR.
 * Each side fills from screen edge to the button.
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
