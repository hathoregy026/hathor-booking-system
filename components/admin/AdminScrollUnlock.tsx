"use client";

import { useEffect } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

/**
 * Admin never mounts WelcomeSplash. Clear the public welcome scroll lock on every
 * /admin route (login + panel) so the dashboard can scroll.
 */
export function AdminScrollUnlock() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("admin-app");
    html.classList.remove("hathor-welcome-lock");
    html.classList.add("hathor-welcome-skip");
    html.classList.add("hathor-welcome-ready");
    html.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("height");
    html.style.removeProperty("height");
    ensurePublicScrollController();

    return () => {
      html.classList.remove("admin-app");
    };
  }, []);

  return null;
}
