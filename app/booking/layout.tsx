import type { ReactNode } from "react";
import localFont from "next/font/local";
import { Inter, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { BookingPageLayout } from "@/components/booking/BookingPageLayout";
import { SiteComingSoon } from "@/components/public/SiteComingSoon";
import { resolveComingSoonForRequest } from "@/lib/live-site-gate";
import { getLiveSiteSettingsSafe } from "@/lib/live-site-settings";
import "../public.css";
import "../site-nav.css";
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

const gamgote = localFont({
  src: "../../public/fonts/Gamgote-Regular.otf",
  variable: "--font-hathor-gamgote",
  display: "swap",
  weight: "400",
  style: "normal",
  declarations: [{ prop: "font-synthesis", value: "none" }],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-hathor-body",
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
    <div
      className={`${playfair.variable} ${inter.variable} ${gamgote.variable} ${plusJakarta.variable}`}
    >
      <BookingPageLayout>{children}</BookingPageLayout>
    </div>
  );
}
