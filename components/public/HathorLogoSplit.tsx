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
      sizes="(max-width: 768px) 14vw, 12vw"
      className={`logo-letter ${letter.className}`}
    />
  ));
}

/**
 * Full-bleed HATHOR letters: H A T · [gap for fixed Book Now] · H O R
 * Book Now stays in `.hero-button` — this only leaves space so it sits in the middle.
 */
export function HathorLogoSplit({ className }: HathorLogoSplitProps) {
  return (
    <div
      className={`hathor-logo-split hero-logo-img${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={HATHOR_BRAND_NAME}
    >
      <LetterImages letters={LEFT_LETTERS} />
      <span className="hathor-logo-split__gap" aria-hidden="true" />
      <LetterImages letters={RIGHT_LETTERS} />
    </div>
  );
}
