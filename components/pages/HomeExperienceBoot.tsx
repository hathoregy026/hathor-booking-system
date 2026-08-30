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
    root.classList.add("ex-home");
    root.classList.remove("ex-scroll-ready");
    /* Soft nav lands at top — never full-page veil. */
    root.classList.remove("ex-pending");
    root.classList.remove("ex-pending-deep");
    /*
     * Blocking font script only runs on hard loads. Soft nav to Home/Home2 must
     * still clear the title FOUC gate or both hero titles stay visibility:hidden.
     */
    if (!root.classList.contains("hathor-hero-type-ready")) {
      root.classList.add("hathor-hero-type-ready");
    }
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
      root.classList.remove("ex-scroll-ready");
      root.classList.remove("ex-home");
      root.classList.remove("ex-pending");
      root.classList.remove("ex-pending-deep");
      document.body.classList.remove("has-ex-scroll-motion");
    };
  }, []);

  return children;
}
