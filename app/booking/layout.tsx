import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { BookingPageLayout } from "@/components/booking/BookingPageLayout";
import { SiteComingSoon } from "@/components/public/SiteComingSoon";
import { resolveComingSoonForRequest } from "@/lib/live-site-gate";
import { getLiveSiteSettingsSafe } from "@/lib/live-site-settings";
import "../public.css";
import "../night-mode.css";
import "../site-coming-soon.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-booking-serif",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-booking-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export default async function BookingFlowLayout({
  children,
}: {
  children: ReactNode;
}) {
  const liveSite = await getLiveSiteSettingsSafe();
  const comingSoonActive = await resolveComingSoonForRequest(liveSite);
  if (comingSoonActive) {
    return (
      <SiteComingSoon backgroundImageUrl={liveSite.backgroundImageUrl} />
    );
  }

  return (
    <div className={`${playfair.variable} ${inter.variable}`}>
      <BookingPageLayout>{children}</BookingPageLayout>
    </div>
  );
}
