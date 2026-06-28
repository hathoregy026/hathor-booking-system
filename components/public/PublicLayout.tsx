import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { FloatingActions } from "@/components/public/FloatingActions";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { LuxuryCursor } from "@/components/ui/LuxuryCursor";
import { PageTransition } from "@/components/ui/PageTransition";
import type { ReactNode } from "react";

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <BookingModalProvider>
      <div className="public-site hathor-site">
        <LuxuryCursor />
        <Header />
        <main className="public-main public-main--with-fab public-main--hero">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <FloatingActions />
      </div>
    </BookingModalProvider>
  );
}
