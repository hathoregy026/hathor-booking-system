import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
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

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <PublicThemeProvider>
      <BookingModalProvider>
        <div className="public-site hathor-site">
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
