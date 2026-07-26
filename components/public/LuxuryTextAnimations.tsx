"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { mountAtelierTextSplit } from "@/lib/atelier-text-split";

/**
 * Site-wide atelier letter rise/fall on public marketing copy.
 * Text only — skips nav, forms, marquees, stack-scroll, and engines
 * that already own their own SplitType (rooms kinetic / cruises intro).
 */
export function LuxuryTextAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector(".public-site");
    const handle = mountAtelierTextSplit(root);
    return () => handle.destroy();
  }, [pathname]);

  return null;
}
