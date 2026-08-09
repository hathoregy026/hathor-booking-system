"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { PageUnderConstruction } from "@/components/public/PageUnderConstruction";
import { usePageVisibilitySettings } from "@/components/public/PageVisibilityProvider";
import { isLiveSiteWorkHost } from "@/lib/live-site-gate-shared";
import {
  isPageLive,
  resolveManagedPublicPage,
} from "@/lib/page-visibility-shared";

type PageVisibilityGateProps = {
  children: ReactNode;
};

const subscribeNoop = () => () => {};

function useIsWorkHost(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () =>
      typeof window !== "undefined" &&
      isLiveSiteWorkHost(window.location.hostname),
    () => false,
  );
}

export function PageVisibilityGate({ children }: PageVisibilityGateProps) {
  const pathname = usePathname() ?? "/";
  const settings = usePageVisibilitySettings();
  const workHost = useIsWorkHost();
  const managed = resolveManagedPublicPage(pathname);
  const live = workHost || isPageLive(pathname, settings);

  if (!live && managed) {
    return <PageUnderConstruction />;
  }

  return <>{children}</>;
}
