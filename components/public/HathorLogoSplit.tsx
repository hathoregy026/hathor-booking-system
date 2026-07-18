"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { HATHOR_BRAND_NAME } from "@/lib/branding";
import {
  HATHOR_LOGO_LETTERS,
  type HathorLogoLetter,
} from "@/lib/hathor-logo-letters";

type HathorLogoSplitProps = {
  className?: string;
  /** Placed between HAT and HOR — typically the Book Now CTA */
  cta?: ReactNode;
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
      sizes="(max-width: 768px) 12vw, 10vw"
      className={`logo-letter ${letter.className}`}
    />
  ));
}

/**
 * HATHOR wordmark as 6 letter images in one row: H A T · CTA · H O R
 * Outer `.hero-logo-mark` remains the GSAP scroll-stage target.
 */
export function HathorLogoSplit({ className, cta }: HathorLogoSplitProps) {
  return (
    <div
      className={`hathor-logo-split hero-logo-img${className ? ` ${className}` : ""}`}
      role={cta ? undefined : "img"}
      aria-label={cta ? undefined : HATHOR_BRAND_NAME}
    >
      <LetterImages letters={LEFT_LETTERS} />
      {cta ? <div className="hathor-logo-split__cta">{cta}</div> : null}
      <LetterImages letters={RIGHT_LETTERS} />
    </div>
  );
}
