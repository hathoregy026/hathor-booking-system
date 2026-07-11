"use client";

import { useEffect, type ReactNode } from "react";

export function CruisesOption3Boot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute("data-cruises-option-3-experience", "");
    root.classList.add("has-page-scroll-transition");
    body.classList.add("has-page-scroll-transition");
    body.style.backgroundColor = "#f4f1ea";

    return () => {
      root.removeAttribute("data-cruises-option-3-experience");
      root.classList.remove(
        "has-page-scroll-transition",
        "cruises-option-3-scroll-ready",
      );
      body.classList.remove("has-page-scroll-transition");
      body.style.backgroundColor = "";
    };
  }, []);

  return children;
}
