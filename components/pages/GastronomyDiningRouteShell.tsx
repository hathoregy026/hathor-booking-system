"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

type GastronomyDiningRouteShellProps = {
  children: ReactNode;
};

/** Enables native sticky scroll runway for the GPT dining clone on /gastronomy. */
export function GastronomyDiningRouteShell({
  children,
}: GastronomyDiningRouteShellProps) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.gastronomyDining = "true";
    ensurePublicScrollController();

    return () => {
      delete root.dataset.gastronomyDining;
      ensurePublicScrollController();
    };
  }, []);

  return children;
}
