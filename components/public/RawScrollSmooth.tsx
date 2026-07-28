"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { bindRawScrollSmooth } from "@/lib/raw-scroll-smooth";

/**
 * Site-wide slowed raw document scroll (wheel hijack).
 * Skips automatically while page-owned Lenis is active (home, rooms, etc.).
 */
export function RawScrollSmooth() {
  const pathname = usePathname();

  useEffect(() => {
    return bindRawScrollSmooth();
  }, [pathname]);

  return null;
}
