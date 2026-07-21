"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  bindScrollPositionPersistence,
  restoreScrollPositionIfReload,
  setScrollRestorationManual,
} from "@/lib/scroll-position-restore";

/**
 * On hard refresh, land at the last scroll position instead of the hero.
 * Saves continuously; restores only when navigation type is reload.
 */
export function ScrollPositionRestore() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    setScrollRestorationManual();
    const unbind = bindScrollPositionPersistence(pathname);

    const restore = () => {
      if (restoreScrollPositionIfReload(pathname)) {
        try {
          ScrollTrigger.refresh();
        } catch {
          /* ignore */
        }
      }
    };

    // Lenis / GSAP mount across a few frames — retry until settled
    const timers = [0, 60, 180, 400, 900, 1600].map((ms) =>
      window.setTimeout(restore, ms),
    );

    const onLoad = () => {
      restore();
      window.setTimeout(restore, 50);
    };
    window.addEventListener("load", onLoad);

    return () => {
      unbind();
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("load", onLoad);
    };
  }, [pathname]);

  return null;
}
