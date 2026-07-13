import { Header } from "@/components/layout/Header";
import { SiteNavLogoBar } from "@/components/layout/SiteNavLogoBar";

/**
 * Canonical public navbar — same on every public route (EX style).
 * Centered logo bar + primary nav links. No per-page nav forks.
 */
export function PublicNavbar() {
  return (
    <>
      <SiteNavLogoBar />
      <Header />
    </>
  );
}
