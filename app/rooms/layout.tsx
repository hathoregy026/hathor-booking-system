import type { ReactNode } from "react";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import "../public.css";
import "../site-nav.css";
import "../night-mode.css";
import "../mobile-touch.css";

export default function RoomsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <PublicThemeProvider>{children}</PublicThemeProvider>;
}
