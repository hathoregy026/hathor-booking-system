"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { shouldApplyAnimaTitle } from "@/lib/anima-title-path";
import { mountAnimaTitleSplit } from "@/lib/anima-title-split";

/**
 * Applies the Suites clip-letter title animation on allow-listed public routes.
 * Homepage and booking are excluded.
 */
export function AnimaTitleScroll() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (!shouldApplyAnimaTitle(pathname)) return;
    const root =
      document.querySelector(".accom-editorial-shell") ||
      document.querySelector(".gastronomy-dining-shell") ||
      document.querySelector(".mask-reveal-page") ||
      document.querySelector(".public-site") ||
      document.body;
    const handle = mountAnimaTitleSplit(root);
    return () => handle.destroy();
  }, [pathname]);

  return null;
}
