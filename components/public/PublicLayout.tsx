import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { DeployFreshness } from "@/components/public/DeployFreshness";
import { FloatingActions } from "@/components/public/FloatingActions";
import { LuxuryTextAnimations } from "@/components/public/LuxuryTextAnimations";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { ScrollPositionRestore } from "@/components/public/ScrollPositionRestore";
import { SiteImagePreviewScroll } from "@/components/public/SiteImagePreviewScroll";
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

  return (
    <PublicThemeProvider>
      <BookingModalProvider>
        <div className="public-site hathor-site">
          <DeployFreshness deployId={deployId} />
          <ScrollPositionRestore />
          <LuxuryTextAnimations />
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
