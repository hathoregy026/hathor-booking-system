import type { ReactNode } from "react";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import "../public.css";
import "../site-nav.css";

export default function GastronomyLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <PublicThemeProvider>{children}</PublicThemeProvider>;
}
