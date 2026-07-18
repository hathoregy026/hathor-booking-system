"use client";

import Image from "next/image";
import { HATHOR_BRAND_NAME } from "@/lib/branding";
import { HATHOR_LOGO_LETTERS } from "@/lib/hathor-logo-letters";

type HathorLogoSplitProps = {
  className?: string;
};

/**
 * Giant HATHOR wordmark as 6 letter images — wrapper stays `.hero-logo-mark`
 * so existing scroll-stage GSAP still targets the group; per-letter classes
 * are ready for individual animation.
 */
export function HathorLogoSplit({ className }: HathorLogoSplitProps) {
  return (
    <div
      className={`hathor-logo-split hero-logo-img${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={HATHOR_BRAND_NAME}
    >
      {HATHOR_LOGO_LETTERS.map((letter) => (
        <Image
          key={letter.key}
          src={letter.src}
          alt={letter.alt}
          width={letter.width}
          height={letter.height}
          priority
          draggable={false}
          sizes="(max-width: 768px) 20vw, 18vw"
          className={`logo-letter ${letter.className}`}
        />
      ))}
    </div>
  );
}
