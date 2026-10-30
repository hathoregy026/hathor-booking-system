"use client";

import { usePublicLocale } from "@/hooks/usePublicLocale";
import { CHROME_COPY } from "@/lib/i18n/chrome-copy";

export function PageUnderConstruction() {
  const label = CHROME_COPY[usePublicLocale()].comingSoon;
  return (
    <section
      className="hathor-page-construction"
      aria-label={label}
    >
      <p className="hathor-page-construction__text">{label}</p>
    </section>
  );
}
