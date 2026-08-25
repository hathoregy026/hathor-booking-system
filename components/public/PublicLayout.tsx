import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { DeployFreshness } from "@/components/public/DeployFreshness";
import { AnimaTitleScroll } from "@/components/public/AnimaTitleScroll";
import { LuxuryTextAnimations } from "@/components/public/LuxuryTextAnimations";
import { PageVisibilityChrome } from "@/components/public/PageVisibilityChrome";
import { PublicScrollGuardian } from "@/components/public/PublicScrollGuardian";
import { PublicScrollInfrastructure } from "@/components/public/PublicScrollInfrastructure";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { ScrollPositionRestore } from "@/components/public/ScrollPositionRestore";
import { SiteComingSoon } from "@/components/public/SiteComingSoon";
import { SiteImagePreviewScroll } from "@/components/public/SiteImagePreviewScroll";
import { PageTransition } from "@/components/ui/PageTransition";
import { getServiceWorkerKillBootScript } from "@/lib/browser-cache-reset";
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
  /** True only on custom-domain requests when Live Site is off. */
  comingSoonActive?: boolean;
};

function resolveDeployId(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha) return sha.slice(0, 12);
  const deployment = process.env.VERCEL_DEPLOYMENT_ID?.trim();
  if (deployment) return deployment.slice(0, 12);
  return "dev";
}

export function PublicLayout({
  children,
  welcomeSplash: _welcomeSplash = DEFAULT_WELCOME_SPLASH_SETTINGS,
  liveSite = DEFAULT_LIVE_SITE_SETTINGS,
  comingSoonActive = false,
}: PublicLayoutProps) {
  const deployId = resolveDeployId();

  /* Custom domain only — Vercel / localhost keep the real site. */
  if (comingSoonActive) {
    return (
      <PublicThemeProvider>
        <SiteComingSoon backgroundImageUrl={liveSite.backgroundImageUrl} />
      </PublicThemeProvider>
    );
  }

  /* Runs before React hydrate so even a soft-cached tab can self-heal. */
  const swKill = getServiceWorkerKillBootScript();
  const bootScript = `${swKill}(function(){try{var pageId=${JSON.stringify(deployId)};if(!pageId||pageId==="dev")return;var guard="hathor-reload-guard-"+pageId;try{if(sessionStorage.getItem(guard)==="1"){/* allow boot after successful load */}}catch(e){}fetch("/api/deploy-id?t="+Date.now(),{cache:"no-store",headers:{"x-hathor-page-deploy":pageId,"Accept":"application/json"}}).then(function(res){return res.json();}).then(function(data){if(!data||!data.id||data.id==="dev"||data.id===pageId)return;try{var g="hathor-reload-guard-"+data.id;if(sessionStorage.getItem(g)==="1")return;sessionStorage.setItem(g,"1");}catch(e){}var u=new URL(location.href);u.searchParams.set("_d",data.id);location.replace(u.toString());}).catch(function(){});}catch(e){}})();`;

  return (
    <PublicThemeProvider>
      <BookingModalProvider>
        {/*
          Welcome splash removed from public land — no preload overlay.
          Floating BOOK NOW / chat mount from GlobalSiteChrome (root sibling).
        */}
        <div className="public-site hathor-site">
          <script dangerouslySetInnerHTML={{ __html: bootScript }} />
          <DeployFreshness deployId={deployId} />
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
      </BookingModalProvider>
    </PublicThemeProvider>
  );
}
