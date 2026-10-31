import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { ItalianNotFoundScreen } from "@/components/public/ItalianSystemScreens";
import { NOT_FOUND_METADATA_IT } from "@/lib/i18n/not-found-it";
import "../hathor-fonts.css";
import "../public.css";
import "../site-nav.css";
import "../night-mode.css";
import "../site-footer.css";
import "../button-system.css";
import "../nav-controls.css";
import "../it-not-found.css";

export const metadata: Metadata = NOT_FOUND_METADATA_IT;

/** A missing address under the standalone Italian pages, e.g. an unknown room. */
export default function ItalianStandaloneNotFound() {
  return (
    <PublicThemeProvider>
      <div className="public-site hathor-site">
        <PublicNavbar />
        <ItalianNotFoundScreen />
        <Footer />
      </div>
    </PublicThemeProvider>
  );
}
