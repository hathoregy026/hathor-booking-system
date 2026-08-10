import type { ReactNode } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PageUnderConstruction } from "@/components/public/PageUnderConstruction";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
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
      <PublicThemeProvider>
        <div className="public-site hathor-site hathor-page-construction--shell">
          <PublicNavbar />
          <main className="public-main public-main--hero">
            <PageUnderConstruction />
          </main>
        </div>
      </PublicThemeProvider>
    );
  }

  return <>{children}</>;
}
