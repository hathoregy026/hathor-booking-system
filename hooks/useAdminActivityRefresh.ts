"use client";

import { useEffect, useRef } from "react";
import { ADMIN_ACTIVITY_EVENT, type AdminActivity } from "@/lib/admin-notification-types";

export function useAdminActivityRefresh(kind: keyof AdminActivity, refresh: () => void, paused = false) {
  const pending = useRef(false);
  useEffect(() => {
    const update = () => {
      if (document.visibilityState !== "visible") return;
      if (paused) { pending.current = true; return; }
      refresh();
    };
    const activity = (event: Event) => {
      if ((event as CustomEvent<AdminActivity>).detail?.[kind]) update();
    };
    window.addEventListener(ADMIN_ACTIVITY_EVENT, activity);
    window.addEventListener("focus", update);
    window.addEventListener("online", update);
    document.addEventListener("visibilitychange", update);
    const timer = !paused && pending.current ? window.setTimeout(() => { pending.current = false; update(); }, 0) : null;
    return () => {
      window.removeEventListener(ADMIN_ACTIVITY_EVENT, activity);
      window.removeEventListener("focus", update);
      window.removeEventListener("online", update);
      document.removeEventListener("visibilitychange", update);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [kind, refresh, paused]);
}
