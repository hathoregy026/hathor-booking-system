import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { FloatingActions } from "@/components/public/FloatingActions";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import type { ReactNode } from "react";

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <BookingModalProvider>
      <div className="public-site">
        <PublicHeader />
        <main className="public-main public-main--with-fab">{children}</main>
        <PublicFooter />
        <FloatingActions />
      </div>
    </BookingModalProvider>
  );
}
