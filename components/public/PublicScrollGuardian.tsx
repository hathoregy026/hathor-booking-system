"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ensureDocumentScrollUnlocked } from "@/lib/body-scroll-lock";

/**
 * Permanent public-site scroll safety net.
 * Clears stuck body/html locks on every navigation, bfcache restore, and
 * tab re-focus so overlays can never leave the document unscrollable.
 */
export function PublicScrollGuardian() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    ensureDocumentScrollUnlocked({
      force: true,
      reason: "route-change",
    });

    const heal = () =>
      ensureDocumentScrollUnlocked({
        force: true,
        reason: "scroll-heal",
      });

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) heal();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        ensureDocumentScrollUnlocked({
          force: false,
          reason: "visibility-heal",
        });
      }
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);

    /* Catch locks applied after navigation by late-mounting overlays that
       fail to unlock (e.g. aborted modal open). */
    const timers = [0, 120, 400].map((ms) =>
      window.setTimeout(() => {
        ensureDocumentScrollUnlocked({
          force: false,
          reason: "post-nav-heal",
        });
      }, ms),
    );

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [pathname]);

  return null;
}
