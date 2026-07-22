import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { DeployFreshness } from "@/components/public/DeployFreshness";
import { FloatingActions } from "@/components/public/FloatingActions";
import { LuxuryTextAnimations } from "@/components/public/LuxuryTextAnimations";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { ScrollPositionRestore } from "@/components/public/ScrollPositionRestore";
import { SiteImagePreviewScroll } from "@/components/public/SiteImagePreviewScroll";
import { SpecularButtons } from "@/components/public/SpecularButtons";
import { PageTransition } from "@/components/ui/PageTransition";
import type { ReactNode } from "react";

type PublicLayoutProps = {
  children: ReactNode;
};

function resolveDeployId(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha) return sha.slice(0, 12);
  const deployment = process.env.VERCEL_DEPLOYMENT_ID?.trim();
  if (deployment) return deployment.slice(0, 12);
  return "dev";
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const deployId = resolveDeployId();

  /* Runs before React hydrate so even a soft-cached tab can self-heal. */
  const bootScript = `(function(){try{var pageId=${JSON.stringify(deployId)};if(!pageId||pageId==="dev")return;var guard="hathor-reload-guard-"+pageId;try{if(sessionStorage.getItem(guard)==="1"){/* allow boot after successful load */}}catch(e){}if("serviceWorker"in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister();});}).catch(function(){});}fetch("/api/deploy-id?t="+Date.now(),{cache:"no-store",headers:{"x-hathor-page-deploy":pageId,"Accept":"application/json"}}).then(function(res){return res.json();}).then(function(data){if(!data||!data.id||data.id==="dev"||data.id===pageId)return;try{var g="hathor-reload-guard-"+data.id;if(sessionStorage.getItem(g)==="1")return;sessionStorage.setItem(g,"1");}catch(e){}var u=new URL(location.href);u.searchParams.set("_d",data.id);location.replace(u.toString());}).catch(function(){});}catch(e){}})();`;

  return (
    <PublicThemeProvider>
      <BookingModalProvider>
        <div className="public-site hathor-site">
          <script dangerouslySetInnerHTML={{ __html: bootScript }} />
          <DeployFreshness deployId={deployId} />
          <ScrollPositionRestore />
          <LuxuryTextAnimations />
          <SpecularButtons />
          <SiteImagePreviewScroll />
          <PublicNavbar />
          <main className="public-main public-main--hero">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <FloatingActions />
        </div>
      </BookingModalProvider>
    </PublicThemeProvider>
  );
}
