import type { ReactNode } from "react";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import "../hathor-fonts.css";
import "../public.css";
import "../site-nav.css";
import "../night-mode.css";
import "../mobile-touch.css";
import "../lux-footer.css";
import "../anima-title-split.css";
import "../rooms-editorial.css";
import "../editorial-chrome.css";

export default function RoomsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <PublicThemeProvider>{children}</PublicThemeProvider>;
}
