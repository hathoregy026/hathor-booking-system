"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { SiteComingSoon } from "@/components/public/SiteComingSoon";
import { isLiveSiteWorkHost } from "@/lib/live-site-gate-shared";
import type { LiveSiteSettings } from "@/lib/live-site-settings-shared";

type ComingSoonGateProps = {
  liveSite: LiveSiteSettings;
  children: ReactNode;
};

const subscribeNoop = () => () => {};

/**
 * Host-aware Coming Soon without forcing the public layout dynamic via headers().
 * SSR assumes a visitor host (gates apply). Work hosts unlock after hydrate.
 */
export function ComingSoonGate({ liveSite, children }: ComingSoonGateProps) {
  const workHost = useSyncExternalStore(
    subscribeNoop,
    () =>
      typeof window !== "undefined" &&
      isLiveSiteWorkHost(window.location.hostname),
    () => false,
  );

  if (!liveSite.enabled && !workHost) {
    return <SiteComingSoon backgroundImageUrl={liveSite.backgroundImageUrl} />;
  }

  return children;
}
