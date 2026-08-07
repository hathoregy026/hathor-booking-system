/**
 * DEVELOPMENT-ONLY motion validation harness.
 * Minimal shell — reuses production scroll infra + HomePageClient.
 */
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { PublicScrollInfrastructure } from "@/components/public/PublicScrollInfrastructure";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { TypographySettingsProvider } from "@/components/public/TypographySettingsProvider";
import { WebsiteTextProvider } from "@/components/public/WebsiteTextProvider";
import { HeroLogoSettingsProvider } from "@/components/public/HeroLogoSettingsProvider";
import { getDefaultSiteImageMap } from "@/lib/default-site-image-map";
import {
  DEFAULT_HERO_LOGO_TUNE,
  DEFAULT_HERO_LOGO_TUNE_MOBILE,
} from "@/lib/hero-logo-tune-shared";
import "../../(public)/home-experience.css";
import "../../public.css";
import "../../site-nav.css";
import "../../public-site-hero.css";
import "../../specular-button.css";
import "../../mobile-touch.css";
import "../../night-mode.css";
import "../../hathor-fonts.css";

export const dynamic = "force-dynamic";

export default function MotionLabLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div data-hathor-motion-lab="">
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 99999,
          padding: "4px 8px",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          background: "#8b6914",
          color: "#ece8df",
          pointerEvents: "none",
        }}
      >
        DEV MOTION LAB — not production
      </div>
      <PublicThemeProvider>
        <BookingModalProvider>
          <HeroLogoSettingsProvider
            desktopPartsVariant={DEFAULT_HERO_LOGO_TUNE.partsVariant}
            mobilePartsVariant={DEFAULT_HERO_LOGO_TUNE_MOBILE.partsVariant}
          >
            <SiteImagesProvider images={getDefaultSiteImageMap()}>
              <TypographySettingsProvider>
                <WebsiteTextProvider>
                  <div className="public-site hathor-site">
                    <PublicScrollInfrastructure />
                    <PublicNavbar />
                    <main className="public-main public-main--hero">{children}</main>
                  </div>
                </WebsiteTextProvider>
              </TypographySettingsProvider>
            </SiteImagesProvider>
          </HeroLogoSettingsProvider>
        </BookingModalProvider>
      </PublicThemeProvider>
    </div>
  );
}
