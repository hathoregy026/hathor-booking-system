"use client";

import { useEffect } from "react";
import {
  destroyPublicScrollController,
  ensurePublicScrollController,
} from "@/lib/public-scroll-controller";
import {
  initScrollRefreshCoordinator,
  requestScrollRefresh,
} from "@/lib/scroll-refresh-coordinator";

export function PublicScrollInfrastructure() {
  useEffect(() => {
    const teardownRefresh = initScrollRefreshCoordinator();
    ensurePublicScrollController();
    requestScrollRefresh("public-layout-mount");

    const onResize = () => {
      ensurePublicScrollController();
      requestScrollRefresh("viewport-change");
    };
    const onOrientation = () => {
      ensurePublicScrollController();
      requestScrollRefresh("orientation-change");
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onOrientation, {
      passive: true,
    });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
      teardownRefresh();
      destroyPublicScrollController();
    };
  }, []);

  return null;
}
