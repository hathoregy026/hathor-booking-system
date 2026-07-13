import { Header } from "@/components/layout/Header";

/**
 * Canonical public navbar — same on every public route.
 * Logo sits in the middle of the nav row; no per-page nav forks.
 */
export function PublicNavbar() {
  return <Header />;
}
