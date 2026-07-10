"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Keeps cruises scroll-reveal document flags in sync on client navigations
 * and removes them on leave so other routes never inherit cruises-only styles.
 */
export function CruisesScrollBoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute("data-cruises-experience", "");
    root.classList.add("has-page-scroll-transition");
    body.classList.add("has-page-scroll-transition");
    body.style.backgroundColor = "#f4f1ea";

    return () => {
      root.removeAttribute("data-cruises-experience");
      root.classList.remove("has-page-scroll-transition", "cruises-scroll-ready");
      body.classList.remove("has-page-scroll-transition");
      body.style.backgroundColor = "";
    };
  }, []);

  return children;
}
