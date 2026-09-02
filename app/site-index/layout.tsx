import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import "../public.css";
import "../site-nav.css";
import "../night-mode.css";
import "../nav-controls.css";

export default function SiteIndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicThemeProvider>
      <div className="public-site hathor-site">
        <PublicNavbar />
        {children}
        <Footer />
      </div>
    </PublicThemeProvider>
  );
}
