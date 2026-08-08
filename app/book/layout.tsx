import { Inter, Playfair_Display } from "next/font/google";
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

export default async function BookRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const liveSite = await getLiveSiteSettingsSafe();
  const comingSoonActive = await resolveComingSoonForRequest(liveSite);
  if (comingSoonActive) {
    return (
      <SiteComingSoon backgroundImageUrl={liveSite.backgroundImageUrl} />
    );
  }

  return (
    <div className={`${playfair.variable} ${inter.variable}`}>{children}</div>
  );
}
