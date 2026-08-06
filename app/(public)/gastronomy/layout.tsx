import type { ReactNode } from "react";
import { GastronomyDiningRouteShell } from "@/components/pages/GastronomyDiningRouteShell";

export default function GastronomyLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <GastronomyDiningRouteShell>{children}</GastronomyDiningRouteShell>;
}
