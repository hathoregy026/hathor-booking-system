"use client";

import { useLayoutEffect, type ReactNode } from "react";

/**
 * Mirrors CruisesScrollBoot: the inline HOME_BOOT script only runs on hard loads.
 * Soft navigations (e.g. Suites → Home) must set/clear data-ex-experience in React
 * or homepage CSS gated on that attribute never applies / leaks to other routes.
 */
export function HomeExperienceBoot({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-ex-experience", "");
    try {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
    } catch {
      /* ignore */
    }

    return () => {
      root.removeAttribute("data-ex-experience");
      root.classList.remove("has-ex-scroll-motion");
      document.body.classList.remove("has-ex-scroll-motion");
    };
  }, []);

  return children;
}
