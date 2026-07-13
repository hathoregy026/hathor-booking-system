"use client";

import { useEffect, type ReactNode } from "react";

export function CruisesScrollBoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute("data-cruises-experience", "");
    body.style.backgroundColor = "#ece8df";

    return () => {
      root.removeAttribute("data-cruises-experience");
      root.classList.remove("cruises-scroll-ready");
      body.style.backgroundColor = "";
    };
  }, []);

  return children;
}
