"use client";

import { useEffect, type ReactNode } from "react";

export function CruisesOption1Boot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute("data-cruises-option-1-experience", "");
    root.classList.add("has-page-scroll-transition");
    body.classList.add("has-page-scroll-transition");
    body.style.backgroundColor = "#f4f1ea";

    return () => {
      root.removeAttribute("data-cruises-option-1-experience");
      root.removeAttribute("data-cruises-option-1");
      body.style.backgroundColor = "";
    };
  }, []);

  return children;
}
