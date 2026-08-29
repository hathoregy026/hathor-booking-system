"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { PageUnderConstruction } from "@/components/public/PageUnderConstruction";
import { usePageVisibilitySettings, usePageVisibilityWorkHost } from "@/components/public/PageVisibilityProvider";
import { isLiveSiteWorkHost } from "@/lib/live-site-gate-shared";
import {
  isPageLive,
  resolveManagedPublicPage,
} from "@/lib/page-visibility-shared";

type PageVisibilityChromeProps = {
  children: ReactNode;
};

const subscribeNoop = () => () => {};

function useIsWorkHost(): boolean {
  const fromServer = usePageVisibilityWorkHost();
  const fromClient = useSyncExternalStore(
    subscribeNoop,
    () =>
      typeof window !== "undefined" &&
      isLiveSiteWorkHost(window.location.hostname),
    () => fromServer ?? false,
  );
  if (fromServer !== undefined) return fromServer;
  return fromClient;
}

/**
 * Main content + footer for public routes.
 * Coming Soon: single message, navbar stays in layout, no footer.
 */
export function PageVisibilityChrome({ children }: PageVisibilityChromeProps) {
  const pathname = usePathname() ?? "/";
  const settings = usePageVisibilitySettings();
  const workHost = useIsWorkHost();
  const managed = resolveManagedPublicPage(pathname);
  const underConstruction =
    !workHost && Boolean(managed) && !isPageLive(pathname, settings);

  return (
    <>
      <main className="public-main public-main--hero">
        {underConstruction ? <PageUnderConstruction /> : children}
      </main>
      {underConstruction ? null : (
        <Footer
          showTopCta={!pathname.startsWith("/suites-preview")}
        />
      )}
    </>
  );
}
