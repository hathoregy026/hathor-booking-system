"use client";

import { useEffect, type ReactNode } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

export function MaskRevealBoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute("data-mask-reveal", "");
    body.style.backgroundColor = "#ece8df";
    /* Soft-nav onto this route: force native scroll so sticky filters work. */
    ensurePublicScrollController();

    return () => {
      root.removeAttribute("data-mask-reveal");
      body.style.backgroundColor = "";
      /* Leaving the route: restore Lenis on desktop public pages. */
      queueMicrotask(() => {
        ensurePublicScrollController();
      });
    };
  }, []);

  return children;
}
