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

function Space({ kind }: { kind: string }) {
  return (
    <span
      className={`hathor-logo-split__space hathor-logo-split__space--${kind}`}
      aria-hidden="true"
    />
  );
}

function Grow() {
  return <span className="hathor-logo-split__grow" aria-hidden="true" />;
}

/**
 * Natural letter proportions (no stretch).
 * Left:  edge → H · ha · A · at · T · grow · t→btn → Book Now
 * Right: Book Now → btn→H · grow · H · ho · O · or · R → edge
 * Gap spacers = exact px (same values as dashboard). Grow eats leftover room.
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
        <Space kind="ha" />
        <Letter letter={a} />
        <Space kind="at" />
        <Letter letter={t} />
        <Grow />
        <Space kind="t-btn" />
      </div>

      <span className="hathor-logo-split__gap" aria-hidden="true" />

      <div className="hathor-logo-split__side hathor-logo-split__side--right">
        <Space kind="btn-h" />
        <Grow />
        <Letter letter={h2} />
        <Space kind="ho" />
        <Letter letter={o} />
        <Space kind="or" />
        <Letter letter={r} />
      </div>
    </div>
  );
}
