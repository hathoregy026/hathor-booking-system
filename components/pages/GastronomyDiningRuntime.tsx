"use client";

import { useLayoutEffect, useRef } from "react";
import { useGastronomyDiningScroll } from "@/hooks/useGastronomyDiningScroll";

/**
 * Dining is mounted outside the ordinary public layout. Resolve the scroll root
 * after commit so direct loads and soft navigations initialize identically.
 */
export function GastronomyDiningRuntime() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const html = document.documentElement;
    rootRef.current = document.querySelector<HTMLDivElement>(
      ".gastronomy-dining-shell",
    );
    html.setAttribute("data-gastronomy-dining", "");

    return () => {
      html.removeAttribute("data-gastronomy-dining");
      rootRef.current = null;
    };
  }, []);

  useGastronomyDiningScroll(rootRef);
  return null;
}
