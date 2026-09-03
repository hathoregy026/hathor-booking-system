import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { AnimaTitleScroll } from "@/components/public/AnimaTitleScroll";
import { LuxuryTextAnimations } from "@/components/public/LuxuryTextAnimations";
import { PageVisibilityChrome } from "@/components/public/PageVisibilityChrome";
import { PublicScrollGuardian } from "@/components/public/PublicScrollGuardian";
import { PublicScrollInfrastructure } from "@/components/public/PublicScrollInfrastructure";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { ScrollPositionRestore } from "@/components/public/ScrollPositionRestore";
import { SiteImagePreviewScroll } from "@/components/public/SiteImagePreviewScroll";
import { PageTransition } from "@/components/ui/PageTransition";
import {
  DEFAULT_LIVE_SITE_SETTINGS,
  type LiveSiteSettings,
} from "@/lib/live-site-settings-shared";
import {
  DEFAULT_WELCOME_SPLASH_SETTINGS,
  type WelcomeSplashSettings,
} from "@/lib/welcome-splash-settings-shared";
import type { ReactNode } from "react";

type PublicLayoutProps = {
  children: ReactNode;
  welcomeSplash?: WelcomeSplashSettings;
  liveSite?: LiveSiteSettings;
};

export function PublicLayout({
  children,
  welcomeSplash: _welcomeSplash = DEFAULT_WELCOME_SPLASH_SETTINGS,
  liveSite: _liveSite = DEFAULT_LIVE_SITE_SETTINGS,
}: PublicLayoutProps) {
  /*
   * Coming Soon is owned by ComingSoonGate (client, host-aware) so this
   * layout stays cacheable — no headers()-gated early return.
   */
  return (
    <PublicThemeProvider>
      {/*
        Welcome splash removed from public land — no preload overlay.
        Booking modal + FAB come from root SiteBookingChrome (one host only).
        Deploy freshness runs from root app/layout.tsx DeployBoot.
      */}
      <div className="public-site hathor-site">
        <PublicScrollInfrastructure />
        <PublicScrollGuardian />
        <ScrollPositionRestore />
        <LuxuryTextAnimations />
        <AnimaTitleScroll />
        <SiteImagePreviewScroll />
        <PublicNavbar />
        <PageVisibilityChrome>
          <PageTransition>{children}</PageTransition>
        </PageVisibilityChrome>
      </div>
    </PublicThemeProvider>
  );
}
