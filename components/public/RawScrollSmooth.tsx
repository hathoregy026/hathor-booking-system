"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { bindRawScrollSmooth } from "@/lib/raw-scroll-smooth";

/**
 * Homepage-equivalent Lenis on pages without a custom scroll owner.
 * Layout timing avoids overlapping Lenis instances during route changes.
 */
export function RawScrollSmooth() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    return bindRawScrollSmooth();
  }, [pathname]);

  return null;
}
