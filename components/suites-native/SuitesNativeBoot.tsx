"use client";

import { useEffect, type ReactNode } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

/**
 * Boots cream surface + native scroll for Suites native preview
 * (sticky mosaic + comfort stage need native scroll like Cruises).
 */
export function SuitesNativeBoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute("data-suites-native", "");
    body.style.backgroundColor = "#ece8df";
    ensurePublicScrollController();

    return () => {
      root.removeAttribute("data-suites-native");
      body.style.backgroundColor = "";
      queueMicrotask(() => {
        ensurePublicScrollController();
      });
    };
  }, []);

  return children;
}
