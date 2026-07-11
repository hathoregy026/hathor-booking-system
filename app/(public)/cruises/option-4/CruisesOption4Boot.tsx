"use client";

import { useEffect, type ReactNode } from "react";

export function CruisesOption4Boot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute("data-cruises-option-4-experience", "");
    body.style.backgroundColor = "#f4f1ea";
    return () => {
      root.removeAttribute("data-cruises-option-4-experience");
      body.style.backgroundColor = "";
    };
  }, []);

  return children;
}
