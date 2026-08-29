import type { ReactNode } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PageUnderConstruction } from "@/components/public/PageUnderConstruction";
import { PageVisibilityProvider } from "@/components/public/PageVisibilityProvider";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { SiteComingSoon } from "@/components/public/SiteComingSoon";
import {
  getRequestHostname,
  isLiveSiteWorkHost,
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

  const hostname = await getRequestHostname();
  const workHost = isLiveSiteWorkHost(hostname);
  const effectiveVisibility = await resolvePageVisibilityForRequest(settings);
  const gated = (
    <PageVisibilityProvider settings={effectiveVisibility} workHost={workHost}>
      {!workHost && !isPageLive(path, effectiveVisibility) ? (
        <PublicThemeProvider>
          <div className="public-site hathor-site hathor-page-construction--shell">
            <PublicNavbar />
            <main className="public-main public-main--hero">
              <PageUnderConstruction />
            </main>
          </div>
        </PublicThemeProvider>
      ) : (
        children
      )}
    </PageVisibilityProvider>
  );

  return gated;
}
