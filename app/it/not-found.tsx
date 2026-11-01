import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { LocaleNotFound } from "@/components/pages/locale/LocaleNotFound";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { notFoundMetadata } from "@/lib/i18n/not-found";
import "../hathor-fonts.css";
import "../public.css";
import "../site-nav.css";
import "../night-mode.css";
import "../site-footer.css";
import "../button-system.css";
import "../nav-controls.css";
import "../locale-not-found.css";

export const metadata: Metadata = notFoundMetadata("it");

/** A missing address under the standalone Italian pages, e.g. an unknown room. */
export default function ItalianStandaloneNotFound() {
  return (
    <PublicThemeProvider>
      <div className="public-site hathor-site">
        <PublicNavbar />
        <LocaleNotFound locale="it" />
        <Footer />
      </div>
    </PublicThemeProvider>
  );
}
