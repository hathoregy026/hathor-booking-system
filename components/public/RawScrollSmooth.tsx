"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { bindRawScrollSmooth } from "@/lib/raw-scroll-smooth";

/**
 * Site-wide slowed raw document scroll (wheel hijack + rAF lerp).
 * Only where Lenis is absent — home/rooms keep their custom scroll engines.
 */
export function RawScrollSmooth() {
  const pathname = usePathname();

  useEffect(() => {
    return bindRawScrollSmooth();
  }, [pathname]);

  return null;
}
