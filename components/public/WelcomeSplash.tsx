"use client";

import { useEffect } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";
import type { WelcomeSplashSettings } from "@/lib/welcome-splash-settings-shared";

type WelcomeSplashProps = Pick<WelcomeSplashSettings, "enabled" | "imageUrl">;

/**
 * Boot overlay + 700ms dismiss live in the blocking head/body script
 * (`getWelcomeSplashBlockingScript`) so they never wait on React hydrate.
 * This component only syncs scroll once the boot script marks ready/skip.
 */
export function WelcomeSplash({ enabled }: WelcomeSplashProps) {
  useEffect(() => {
    const root = document.documentElement;

    const release = () => {
      root.classList.add("hathor-welcome-ready");
      root.classList.remove("hathor-welcome-lock");
      const scroll = ensurePublicScrollController();
      scroll.start();
      scroll.syncToCurrentScroll();
    };

    if (
      !enabled ||
      root.classList.contains("hathor-welcome-skip") ||
      root.classList.contains("hathor-welcome-ready")
    ) {
      if (!enabled) {
        root.classList.add("hathor-welcome-skip");
      }
      release();
      return;
    }

    const onReady = () => {
      if (
        root.classList.contains("hathor-welcome-ready") ||
        root.classList.contains("hathor-welcome-skip")
      ) {
        const scroll = ensurePublicScrollController();
        scroll.start();
        scroll.syncToCurrentScroll();
        return true;
      }
      return false;
    };

    if (onReady()) return;

    const obs = new MutationObserver(() => {
      if (onReady()) obs.disconnect();
    });
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });

    /* Belt-and-suspenders if boot script failed. */
    const failsafe = window.setTimeout(release, 1200);

    return () => {
      obs.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [enabled]);

  return null;
}
