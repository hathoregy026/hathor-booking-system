"use client";

import { usePathname } from "next/navigation";
import { COMING_SOON_COPY } from "@/lib/i18n/system-pages-copy";
import { splitLocalePath } from "@/lib/i18n/locale";

export function PageUnderConstruction() {
  const label = COMING_SOON_COPY[splitLocalePath(usePathname()).locale];
  return (
    <section
      className="hathor-page-construction"
      aria-label={label}
    >
      <p className="hathor-page-construction__text">{label}</p>
    </section>
  );
}
