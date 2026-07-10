import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteBookBar } from "@/components/layout/SiteBookBar";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { LuxuryTextAnimations } from "@/components/public/LuxuryTextAnimations";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
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
          <SiteBookBar />
          <Header />
          <main className="public-main public-main--hero">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </div>
      </BookingModalProvider>
    </PublicThemeProvider>
  );
}
