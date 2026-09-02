import type { ReactNode } from "react";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import "../public.css";
import "../site-nav.css";
import "../night-mode.css";
import "../mobile-touch.css";
import "../lux-footer.css";
import "../gastronomy-dining.css";
import "../editorial-chrome.css";
import "../anima-title-split.css";
import "../button-system.css";
import "../nav-controls.css";

export default function GastronomyLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <PublicThemeProvider>{children}</PublicThemeProvider>;
}
