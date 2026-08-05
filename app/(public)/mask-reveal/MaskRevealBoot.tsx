"use client";

import { useEffect, type ReactNode } from "react";

export function MaskRevealBoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute("data-mask-reveal", "");
    body.style.backgroundColor = "#1a1612";

    return () => {
      root.removeAttribute("data-mask-reveal");
      body.style.backgroundColor = "";
    };
  }, []);

  return children;
}
