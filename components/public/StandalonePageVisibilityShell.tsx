import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { PageUnderConstruction } from "@/components/public/PageUnderConstruction";
import { SiteComingSoon } from "@/components/public/SiteComingSoon";
import {
  resolveComingSoonForRequest,
  resolvePageVisibilityForRequest,
} from "@/lib/live-site-gate";
import {
  DEFAULT_LIVE_SITE_SETTINGS,
  type LiveSiteSettings,
} from "@/lib/live-site-settings-shared";
import {
  isPageLive,
  type PageVisibilitySettings,
} from "@/lib/page-visibility-shared";

type StandalonePageVisibilityShellProps = {
  path: string;
  pageLabel: string;
  settings: PageVisibilitySettings;
  liveSite?: LiveSiteSettings;
  children: ReactNode;
};

/** For routes outside `(public)` that still need CMS page visibility. */
export async function StandalonePageVisibilityShell({
  path,
  settings,
  liveSite = DEFAULT_LIVE_SITE_SETTINGS,
  children,
}: StandalonePageVisibilityShellProps) {
  const comingSoonActive = await resolveComingSoonForRequest(liveSite);
  if (comingSoonActive) {
    return (
      <SiteComingSoon backgroundImageUrl={liveSite.backgroundImageUrl} />
    );
  }

  const effectiveVisibility = await resolvePageVisibilityForRequest(settings);
  if (!isPageLive(path, effectiveVisibility)) {
    return (
      <>
        <div className="hathor-page-construction--standalone">
          <PageUnderConstruction />
        </div>
        <Footer />
      </>
    );
  }

  return <>{children}</>;
}
