"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

type GastronomyMaskRevealBootProps = {
  children: ReactNode;
};

/** Native scroll + overflow unlock for Fixed-Background Mask Reveal on /gastronomy. */
export function GastronomyMaskRevealBoot({
  children,
}: GastronomyMaskRevealBootProps) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-gastronomy-mask", "");
    ensurePublicScrollController();

    return () => {
      root.removeAttribute("data-gastronomy-mask");
      ensurePublicScrollController();
    };
  }, []);

  return children;
}
