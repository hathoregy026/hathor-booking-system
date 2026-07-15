import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { LuxuryTextAnimations } from "@/components/public/LuxuryTextAnimations";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
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
          <LuxuryTextAnimations />
          <SiteImagePreviewScroll />
          <PublicNavbar />
          <main className="public-main public-main--hero">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </div>
      </BookingModalProvider>
    </PublicThemeProvider>
  );
}
