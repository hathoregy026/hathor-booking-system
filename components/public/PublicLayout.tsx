import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { PublicThemeInit } from "@/components/public/PublicThemeInit";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { PageTransition } from "@/components/ui/PageTransition";
import type { ReactNode } from "react";

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <PublicThemeProvider>
      <PublicThemeInit />
      <BookingModalProvider>
        <div className="public-site hathor-site">
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
